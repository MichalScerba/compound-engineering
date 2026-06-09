# Lesson: IQ-Support Phase 1

**Projekt:** IQ-Support — emailová podpora s AI analytikou
**Datum:** 2026-06-08
**Fáze:** MVP + Dashboard + Sidebar + Sledování času + AI asistence

---

## Co jsme postavili

- Auth (Supabase) + správa případů + přizvání kolegy
- Reply form → uložení do `messages` + AI hodnocení (Claude Haiku) → uložení do `qa_archive`
- Dashboard se stats (daily: přijato, vyřešeno, úspěšnost, Ø AI skóre)
- Sidebar navigace s route group `(protected)`
- Deploy na Vercel
- Sledování času: auto-start timer, auto-save při odchodu, ochrana proti souběžným tabům
- AI návrh odpovědi: on-demand button, API route, pre-fill textarea

---

## Technické lekce

### 1. Claude API vrací JSON se špatnými control characters nebo v markdown code blocku

Dva časté problémy při parsování Claude JSON výstupu:
1. Model obalí JSON do ` ```json ``` ` i když instrukce říkají "respond ONLY with valid JSON"
2. Model vloží literální `\n` bajt (0x0A) do JSON string hodnoty místo escapovaného `\\n` — `JSON.parse` selže s "Bad control character in string literal"

**Fix — `parseJSON` helper s fallback sanitizací:**
```typescript
function parseJSON<T>(text: string): T {
  const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(clean) as T;
  } catch {
    // Escape literal control characters inside JSON string values
    const sanitized = clean.replace(/"(?:[^"\\]|\\.)*"/g, (match) =>
      match.replace(/[\x00-\x1f]/g, (c) => {
        if (c === "\n") return "\\n";
        if (c === "\r") return "\\r";
        if (c === "\t") return "\\t";
        return "";
      })
    );
    return JSON.parse(sanitized) as T;
  }
}
```

Regex `"(?:[^"\\]|\\.)*"` správně matchuje JSON string literály (včetně escapovaných znaků jako `\"`) a escapuje v nich control chars. Funguje jako fallback — normální parse se zkouší první.

### 2. Route group `(protected)` — sdílený layout bez změny URL

Sidebar nebo jiný wrapper pro přihlášené stránky: vytvoř `app/(protected)/layout.tsx`.
URL `/cases`, `/dashboard` zůstávají — route group neovlivňuje cestu.

```
app/
  (protected)/
    layout.tsx   ← sidebar + auth check
    cases/
    dashboard/
  login/
  page.tsx
```

Sidebar musí být client component (`"use client"`) kvůli `usePathname` pro aktivní stav.
Layout zůstává server component — fetchuje data (např. count otevřených případů pro badge).

### 3. Supabase `messages` tabulka — NOT NULL sloupce

Při insertu do `messages` musíš vyplnit všechna NOT NULL pole. Schema v `docs/schema.sql` nemusí odpovídat realitě pokud byl upraven přímo v Supabase.

Vždy zkontroluj skutečné schema před insertem — chyba "null value in column X violates not-null constraint" přijde až za runtime.

### 4. Server actions v Next.js 15+ — vracení hodnot

Server action může vracet objekt (ne jen redirect). Použij discriminated union:
```typescript
return { qa: result }    // success
return { error: "msg" }  // failure
```
Client component pak rozliší: `if ("error" in result) { ... }`.

### 5. Sentry `next.config.ts` — deprecated options

`hideSourceMaps` a `disableLogger` jsou deprecated v novějších verzích `@sentry/nextjs`.

**Aktuální správná konfigurace:**
```typescript
withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  sourcemaps: { disable: true },
})
```

### 6. Button asChild — nepodporováno v tomto shadcn setupu

`<Button asChild>` vyhodí TypeScript chybu. Místo toho:
```tsx
// Špatně
<Button asChild><Link href="/login">Text</Link></Button>

// Správně
<Link href="/login"><Button>Text</Button></Link>
```

### 7. Timer — `Date.now()` místo tick counting

`setInterval` v pozadí tab throttluje → timer zpomalí. Vždy měř reálný čas:

```typescript
const startRef = useRef(Date.now());
setInterval(() => {
  setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
}, 1000);
```

### 8. Auto-save při navigaci — `navigator.sendBeacon` + API route

Server actions nelze spolehlivě volat v `useEffect` cleanup (async, component už unmounted).
`sendBeacon` odesílá request na pozadí i při navigaci pryč — funguje pro soft i hard navigation.

Vyžaduje vlastní API route (ne server action):
```typescript
// app/api/cases/time/route.ts
export async function POST(request: NextRequest) { ... }

// cleanup v komponentě
const blob = new Blob([JSON.stringify({ caseId, seconds })], { type: "application/json" });
navigator.sendBeacon("/api/cases/time", blob);
```

### 9. Souběžné taby — `BroadcastChannel`

Při otevření případu ve více tabech by timery běžely paralelně → dvojí počítání.
`BroadcastChannel` umožňuje komunikaci mezi taby stejného originu.

```typescript
const channel = new BroadcastChannel("iq-timer");
channel.postMessage({ type: "timer-started", caseId });

channel.onmessage = (event) => {
  if (event.data.type === "timer-started") {
    stopAndSave(); // zastaví a uloží tento timer
  }
};
```

**Gotcha:** nekontroluj `event.data.caseId !== caseId` — chceš zastavit timer při JAKÉMKOLI jiném aktivním timeru, i pro stejný případ.

### 10. Claude zaměňuje češtinu za polštinu

Claude Haiku při instrukci "reply in the same language" občas identifikuje češtinu jako polštinu. Slavické jazyky jsou si podobné a model se plete.

**Fix — vždy explicitně pojmenuj jazyk:**
```typescript
// Špatně
"Reply in the same language as the question."

// Správně
"You are a Czech customer support agent. Always reply in Czech language."
```

Totéž platí pro hodnocení — pokud chceš improved answer v češtině, řekni to explicitně v promptu.

### 13. Tracking AI suggestion vs. finální odpověď — learning signal

Pokud chceš systém který se učí, musíš zachytit rozdíl mezi tím co AI navrhla a co uživatel skutečně odeslal.

Pattern:
1. AI návrh se načte do textarea → uloží se do `ref` (ne state — nevyvolává re-render)
2. Při odeslání formuláře se přidá do `FormData` jako extra pole
3. Server action ho uloží do DB podmíněně (jen pokud existuje)

```typescript
// Client: ref místo state pro tracking bez re-renderu
const aiSuggestionRef = useRef<string | null>(null);

// Při načtení návrhu
aiSuggestionRef.current = suggestion;

// Při submit
if (aiSuggestionRef.current) {
  formData.set("aiSuggestion", aiSuggestionRef.current);
}

// Server action
const aiSuggestion = formData.get("aiSuggestion") as string | null;
await supabase.from("qa_archive").insert({
  answer_sent: reply,
  ...(aiSuggestion ? { ai_suggested_answer: aiSuggestion } : {}),
});
```

Výsledek: `ai_suggested_answer` vs `answer_sent` = training signal. Kde se liší, tam uživatel opravil AI — to jsou nejcennější příklady pro budoucí fine-tuning nebo prompt engineering.

### 12. Semantic similarity check přes Claude — bez vector DB

Pro porovnání nového dotazu s archivem (Q&A matching) lze použít Claude přímo — bez embeddings, bez vector DB.

Pošli nový dotaz + archiv jako text, Claude vrátí index nejbližší shody a score:

```typescript
const archiveText = archive
  .map((e, i) => `[${i}] Q: ${e.question}\nA: ${e.answer_sent}`)
  .join("\n\n");

// Claude vrátí: { index: number, score: number }
// index === -1 nebo score < 85 → žádná shoda
```

**Trade-off:** jednoduché, žádná infrastruktura, ale pomalejší a dražší než embeddings. Vhodné pro malé archivy (< 100 záznamů). Pro větší objemy přejít na pgvector nebo jiný vector store.

**Kde spustit:** server-side při načtení page (synchronní, přidá ~500ms latency) nebo on-demand po kliku. Pro případ detailu je server-side vhodné — výsledek je k dispozici hned.

### 19. Barevný proužek sledující zaoblení karty — overflow-hidden trick

`border-left` s `border-radius` nevyplní zaoblené rohy — barva "plave" od okraje. Fix: vnitřní div s plnou výškou + `overflow-hidden` na obálce.

```tsx
<div className="rounded-md overflow-hidden border">
  <div className="flex">
    <div className="w-1 flex-shrink-0" style={{ backgroundColor: cat.color }} />
    <div className="flex-1 min-w-0">
      {/* obsah */}
    </div>
  </div>
</div>
```

`overflow-hidden` na obálce způsobí, že vnitřní div je oříznut přesně podle zaoblení — proužek vyplní rohy správně bez CSS hacků.

### 18. Usage counting jako quality signal — KB threshold pattern

Každá odpověď v archivu začíná jako "individuální" (usage_count = 0). Teprve po opakovaném použití (dedup UPDATE) se stane součástí znalostní báze. Threshold ≥ 2 oddělí KB od šumu.

```sql
-- Supabase RPC pro atomický increment
create or replace function increment_qa_usage(entry_id uuid)
returns void as $$
  update qa_archive
  set usage_count = usage_count + 1,
      last_used_at = now()
  where id = entry_id;
$$ language sql security definer;
```

```typescript
// Volat pouze při dedup UPDATE, ne při INSERT
if (existingQAId) {
  await supabase.from("qa_archive").update(qaPayload).eq("id", existingQAId);
  await supabase.rpc("increment_qa_usage", { entry_id: existingQAId });
} else {
  await supabase.from("qa_archive").insert({ ...qaPayload, case_id: caseId });
}
```

UI pattern: `usage_count >= 2` → "KB" badge + plný styl; `< 2` → průhledné pozadí, šedý text.
Řazení: `order("usage_count", { ascending: false })` → přirozený žebříček nejpoužívanějších odpovědí.

**Proč RPC místo `update({ usage_count: count + 1 })`:** Supabase JS client nepodporuje `field = field + 1` přímo v `.update()` — musel by se nejdřív fetchovat aktuální hodnota. RPC to řeší atomicky bez race condition.

### 14. jsonrepair — robustní parsování Claude JSON

`JSON.parse` selhává na různých formátech Claude výstupu: markdown code blocky, literální newlines, unescapované uvozovky uvnitř stringů. Místo vlastního sanitizéru použij `jsonrepair`:

```bash
npm install jsonrepair
```

```typescript
import { jsonrepair } from "jsonrepair";

function parseJSON<T>(text: string): T {
  const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  try {
    return JSON.parse(clean) as T;
  } catch {
    return JSON.parse(jsonrepair(clean)) as T;
  }
}
```

Pokrývá: trailing commas, unescapované quotes, literální newlines, chybějící závorky.

### 15. AI auto-kategorizace + manuální override — pattern pro hybrid klasifikaci

Při ukládání Q&A Claude přiřadí kategorii automaticky (`category_confirmed = false`). Agent ji může ručně opravit v UI (`category_confirmed = true`). Tím máš hybrid: AI dělá 90 % práce, agent opravuje výjimky.

```typescript
// lib/claude.ts — kategorizer
export async function categorizeQA(
  question: string,
  categories: { id: string; slug: string; name: string }[]
): Promise<string | null> {
  const categoryList = categories.map((c) => `- ${c.slug}: ${c.name}`).join("\n");
  // Claude vrátí { slug: "<slug nebo null>" }
  // Pak lookup id z categories pole
}

// Supabase — RLS na lookup tabulce
// Nová tabulka s kategoriemi potřebuje explicitní read policy pro authenticated uživatele
// jinak server action vrátí prázdné pole bez chyby (tiché selhání)
create policy "authenticated users can read qa_categories"
  on qa_categories for select to authenticated using (true);
```

**Gotcha:** Supabase vrátí `[]` (ne error) pokud RLS blokuje čtení lookup tabulky. Debug: přidej `console.log` na délku pole — pokud je 0 a SQL editor data vrací, je to RLS.

### 16. Select nastylovaný jako badge — `appearance: none` + inline styles

`<select>` element lze nastylovat jako barevný badge. Klíč: `appearance: none` + `textAlignLast: center`. Pro dynamické barvy z DB použij inline styles (Tailwind purge by třídy s runtime hodnotami odstranil).

```typescript
style={{
  backgroundColor: `${color}20`,
  color: color,
  borderRadius: "6px",
  padding: "3px 10px",
  appearance: "none",
  WebkitAppearance: "none",
  textAlignLast: "center",
}}
```

Auto-submit při změně: `onChange={() => formRef.current?.requestSubmit()}` — `requestSubmit()` spustí validaci formu, `submit()` ji obejde.

### 17. Filtrování server component přes URL search params

Server component přijme `searchParams` jako prop, filtruje Supabase query, UI odkazuje na `?category=<slug>`. Žádný client state, URL je zdrojem pravdy — funguje s back/forward tlačítky a sdílením odkazu.

```typescript
export default async function Page({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category: activeSlug } = await searchParams;
  // query.eq("category_id", activeCategory.id) pokud activeSlug existuje
}
```

### 23. Claude může vrátit NaN nebo out-of-bounds index — vždy guarda na `match`

Claude Haiku vrací index nejbližší shody jako číslo. Může vrátit:
- Platný index — ale pokud pole je kratší, `array[index]` je `undefined`
- `NaN` — `NaN < 0` i `NaN >= length` jsou vždy `false`, takže bounds check projde, ale `array[NaN]` je `undefined`

**Bounds check nestačí.** Správný fix: ověř samotný výsledek přístupu do pole.

```typescript
const match = archive[result.index];
if (!match) return null;  // zachytí NaN, out-of-bounds i undefined
```

Platí pro jakékoli Claude volání, které vrací index do pole předaného v promptu.

### 20. Q&A Candidate Agent — background agent pattern

Opakující se zákaznické dotazy je potřeba detekovat asynchronně, ne synchronně při každém odeslání odpovědi.

**Architektura:**
```
Case resolved → updateStatus → fire-and-forget fetch /api/qa/candidate
                                        ↓
                              Porovná s qa_archive + qa_candidates (Claude, práh 80%)
                                        ↓
                    shoda v archivu → skip
                    shoda v kandidátech → inkrement; při ≥2 vygeneruj draft → pending
                    žádná shoda → nový kandidát pending_count
```

**Klíčová rozhodnutí:**
- API route (ne server action) — background job bez user session
- `createServiceClient()` s `SUPABASE_SERVICE_ROLE_KEY` — service role bypasuje RLS; anon klíč by v background agentu nefungoval
- Fire-and-forget: `fetch(...).catch(e => console.error(e))` — redirect nečeká na agenta
- `qa_candidates` jako fronta: odděluje surová data od kuratované knowledge base; do `qa_archive` jde pouze schválený záznam

**`lib/supabase-service.ts` pattern:**
```typescript
import { createClient } from "@supabase/supabase-js";
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

**Gotcha:** `SUPABASE_SERVICE_ROLE_KEY` je jiný klíč než `NEXT_PUBLIC_SUPABASE_ANON_KEY` — najdeš ho v Supabase → Settings → API → Legacy anon, service_role API keys. Nikdy ho nedávej do klienta.

### 21. `formAction` na tlačítkách v client componentě — více server actions v jednom formu

Approve/Reject v `CandidateCard` sdílí stejný form (textarea hodnoty), ale každé tlačítko volá jinou server action.

```tsx
<form>
  <input type="hidden" name="candidateId" value={candidate.id} />
  <textarea name="questionDraft" defaultValue={candidate.question_draft} />
  <textarea name="answerDraft" defaultValue={candidate.answer_draft} />

  <button formAction={rejectAction}>Zamítnout</button>
  <button formAction={approveAction}>Schválit</button>
</form>
```

`formAction` prop na `<button>` funguje i v client componentách — server action se předá jako prop z page. Textarea hodnoty se odešlou s tím formulářem, přes který bylo kliknuto. Není potřeba controlled state ani refs.

### 22. Supabase join vrací pole, ne objekt — TypeScript casting

Supabase client typuje `qa_categories(...)` join jako array i když je to FK vztah 1:1. Vlastní interface má `qa_categories: Category | null`. Cast přes `unknown` je nutný:

```typescript
const entries = (data ?? []) as unknown as QAEntry[];
```

`as QAEntry[]` přímo selže: TypeScript vidí neslučitelné typy. `as unknown as T` je správný způsob pro override Supabase generovaných typů.

### 11. AI suggestion — on-demand přes API route, ne server action

Generování AI návrhu v reply formu: uživatel klikne tlačítko → fetch na API route → výsledek se vloží do textarea.

Proč API route a ne server action: server action vrací redirect nebo data, ale nelze ho volat z `onClick` bez form submit. Pro on-demand volání z client component vždy použij API route.

```typescript
// components/reply-form.tsx
async function handleSuggest() {
  const res = await fetch("/api/cases/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  const { suggestion } = await res.json();
  textareaRef.current.value = suggestion;
}
```

---

## Procesní lekce

### M365 jako kritická závislost

Kroky 1, 3, 4 (M365 Graph API) jsou blokované od začátku — čekáme na IT.
**Lekce:** U projektů závislých na externích systémech ověř přístup dřív než cokoli jiného.
Postup: build vše co není blokováno, M365 integrace přijde jako hotswap.

### Design → implementace

Uživatel dodal HTML mockup jako referenci. Přístup který fungoval:
1. Přečíst mockup a identifikovat co je použitelné
2. Prioritizovat — stats grid jako první (přidá hodnotu rychle), sidebar layout jako druhý
3. Vzít z mockupu CSS hodnoty (`#F4F2EE`, `#2A5EFF`, DM Sans font) přímo

---

## Co přidat do OS template

- [x] `next.config.ts` — opravit Sentry options
- [x] `playbooks/vercel-deploy.md` — trick s `printf` pro hromadné env vars
- [ ] Zvážit přidání `(protected)` route group přímo do nextjs-starter jako vzor
