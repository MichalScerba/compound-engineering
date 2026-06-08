# Lesson: IQ-Support Phase 1

**Projekt:** IQ-Support — emailová podpora s AI analytikou
**Datum:** 2026-06-08
**Fáze:** MVP + Dashboard + Sidebar + Sledování času

---

## Co jsme postavili

- Auth (Supabase) + správa případů + přizvání kolegy
- Reply form → uložení do `messages` + AI hodnocení (Claude Haiku) → uložení do `qa_archive`
- Dashboard se stats (daily: přijato, vyřešeno, úspěšnost, Ø AI skóre)
- Sidebar navigace s route group `(protected)`
- Deploy na Vercel
- Sledování času: auto-start timer, auto-save při odchodu, ochrana proti souběžným tabům

---

## Technické lekce

### 1. Claude API vrací JSON zabalený v markdown code blocku

Model občas obalí JSON do ` ```json ``` ` i když instrukce říkají "respond ONLY with valid JSON".

**Fix — před JSON.parse vždy strip:**
```typescript
const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
return JSON.parse(clean);
```

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
