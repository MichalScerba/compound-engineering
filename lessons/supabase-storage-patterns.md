# Lesson: Supabase Storage — File Upload Patterns

**Projekt:** DeployMate
**Datum:** 2026-06-11
**Fáze:** Fáze 7 — File Attachments

---

## Co jsme řešili

Nahrávání souborů (PDF, Word, Excel) k úkolům v projektu. Soubory musí být privátní (jen přihlášený uživatel), stažitelné přes dočasné URL a validované před uložením.

---

## Technické lekce

### 1. Server-side upload místo přímého nahrávání z prohlížeče

```typescript
// ✅ Nahrávej přes Next.js API route — ne přímo z klientské komponenty
// app/api/tasks/[id]/attachments/route.ts

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const form = await request.formData()
  const file = form.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  // MIME validace na serveru
  const ALLOWED = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 415 })
  }

  const bytes = await file.arrayBuffer()
  const path = `${user.id}/${id}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from("task-attachments")
    .upload(path, bytes, { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data, error } = await supabase
    .from("task_attachments")
    .insert({ task_id: id, file_name: file.name, storage_path: path, mime_type: file.type, size_bytes: file.size })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
```

**Proč server-side:** Přímý upload z prohlížeče obchází MIME validaci a logiku pojmenování storage path. Server je jediné místo kde máš kontrolu.

---

### 2. Signed URL pro privátní download

```typescript
// app/api/task-attachments/[id]/download/route.ts

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: attachment } = await supabase
    .from("task_attachments")
    .select("storage_path")
    .eq("id", id)
    .single()

  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { data: signed } = await supabase.storage
    .from("task-attachments")
    .createSignedUrl(attachment.storage_path, 60) // 60 sekund platnosti

  return NextResponse.json({ url: signed?.signedUrl })
}
```

**Pravidlo:** Signed URL generuj na požádání (ne předem), s krátkou platností (60s stačí pro přesměrování prohlížeče). Nikdy nevracíš storage path přímo klientovi.

---

### 3. Smazání souboru — vždy oba záznamy

```typescript
// app/api/task-attachments/[id]/route.ts

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: attachment } = await supabase
    .from("task_attachments")
    .select("storage_path")
    .eq("id", id)
    .single()

  if (!attachment) return new NextResponse(null, { status: 204 })

  // Smazat z Storage i z DB
  await supabase.storage.from("task-attachments").remove([attachment.storage_path])
  await supabase.from("task_attachments").delete().eq("id", id)

  return new NextResponse(null, { status: 204 })
}
```

**Pravidlo:** Vždy mažeš oba záznamy — DB row i Storage soubor. Jinak vznikají orphaned soubory bez záznamu v DB (neviditelné, ale platíš za storage).

---

### 4. Supabase Storage bucket — doporučené nastavení

```
Bucket: task-attachments
- Public: NO (private bucket)
- RLS: zapnuto
- Policies:
  - SELECT: auth.uid() = owner nebo přes joined tabulku
  - INSERT: auth.uid() IS NOT NULL (server uploaduje v kontextu přihlášeného uživatele)
  - DELETE: auth.uid() = owner
```

**Pravidlo:** Private bucket + RLS na storage. Signed URL jako mechanismus přístupu — nikdy veřejné URL pro uživatelský obsah.

---

### 5. Struktura storage path

```
{user_id}/{resource_id}/{timestamp}-{original_filename}
```

Příklad: `abc123/task-456/1718000000000-projektova-karta.pdf`

**Proč:** User ID jako prefix zajišťuje izolaci mezi uživateli na storage úrovni. Timestamp zabraňuje kolizím při stejném názvu souboru. Resource ID (task_id) umožňuje smazat všechny soubory resource jedním prefix dotazem.

---

## Souhrn pravidel

| Situace | Pravidlo |
|---------|---------|
| Upload | Vždy přes server route — nikdy přímo z prohlížeče |
| MIME validace | Na serveru, ne na Supabase bucketu |
| Download privátního souboru | Signed URL (60s), generovaná na požádání |
| Smazání | DB row + Storage soubor — vždy oboje |
| Bucket | Private + RLS vždy |
| Storage path | `{user_id}/{resource_id}/{timestamp}-{filename}` |
