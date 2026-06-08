# Project Diary

Detailní záznamy průběhu projektu, rozhodnutí, poznatků a kontextu.

---

## 2026-06-08

### Fáze 2 — základ template dokončen + reálný test

**Co vzniklo:**

Dokončeny kroky 2–4 Fáze 2 — template má plně funkční základ.

**Fáze 4 — Specializované AI role dokončeny**

7 agentů v `agents/`:
- **Orchestrator** — koordinuje agenty, řídí zpětný tok do OS, ví kam a jak ukládat poznatky
- **Architect** — navrhuje systém před tím než někdo píše kód
- **Builder** — implementuje jednu feature od začátku do konce
- **Refactorer** — zjednodušuje kód bez změny chování
- **Debugger** — hledá root cause, ne symptomy (existoval od Fáze 1)
- **QA** — píše test scénáře, myslí v edge cases
- **Product Thinker** — zpochybňuje feature před tím než se staví

Klíčové rozhodnutí: Orchestrator jako řídící agent s povinnou kontrolou zpětného toku po každém tasku. Ví přesně kam co uložit a jak.

---

**Fáze 5 — Memory System dokončen**

- `architecture/ADR-template.md` — šablona pro architektonická rozhodnutí
- `lessons/postmortem-template.md` — šablona pro postmortemy s explicitní sekcí "co patří zpět do OS"
- `prompts/project-definition.md` — project definition prompt (8 sekcí, readiness score)

Zpětný tok do OS je zakódován v Orchestratoru — není závislý na paměti nebo disciplíně.

---

**Compound Engineering OS — všech 5 fází dokončeno**

| Fáze | Stav |
|------|------|
| 1 — AI Engineering Cockpit | `[x]` |
| 2 — Project Template | `[x]` |
| 3 — Operating Manual | `[x]` |
| 4 — Specializované AI role | `[x]` |
| 5 — Memory System | `[x]` |

---

**Fáze 3 — Operating Manual (SYSTEM.md) dokončena**

Dokument `docs/SYSTEM.md` vznikl rozhovorem krok po kroku — 6 sekcí zachycuje celý engineering OS:

1. **Jak stavím produkty** — 5 kroků od project definition po hotovou feature, 5 principů
2. **Standardy** — kebab-case projekty a soubory, PascalCase komponenty, flat over nested architektura
3. **Deployment flow** — preview vždy před produkcí, jeden deploy = jedna feature
4. **Testing philosophy** — manuální vždy, automatický pro logiku/kritické flow/regrese; pravidlo: testy aby zachránily, ne aby existovaly
5. **AI rules** — jeden krok najednou, čeština pro komunikaci, pravidlo 3 pokusů pak reset
6. **Product philosophy** — osobní zkušenost jako zdroj, malé a fokusované, definition first

---

**Logging a analytics (krok 5):**
- `@sentry/nextjs` — error tracking, silent bez DSN
- `@vercel/analytics` — page views, 1 řádek v `layout.tsx`
- `sentry.client.config.ts`, `sentry.server.config.ts`, `instrumentation.ts`
- `next.config.ts` wrappnutý s `withSentryConfig`
- `.env.example` rozšířen o Sentry proměnné

**PR rules (krok 10):**
- `.github/PULL_REQUEST_TEMPLATE.md` — šablona pro PR (co, proč, jak testovat, checklist)
- `CLAUDE.md` — branch naming (`feat/`, `fix/`, `chore/`, `docs/`), commit message formát, PR pravidla

**Landing page (krok 7):**
- `app/page.tsx` — Hero + Features (3 karty) + CTA sekce
- Placeholder text, nahradit = 5 minut na novém projektu

**Billing přeskočen** — přidá se na prvním reálném projektu kde je potřeba.

**Stav Fáze 2:** 9/10 kroků hotovo. Základ template validovaný na reálném projektu.

---

**Supabase setup (krok 3):**
- `lib/supabase.ts` — browser client (`createBrowserClient` z `@supabase/ssr`)
- `lib/supabase-server.ts` — server client pro Server Components a Server Actions
- `.env.example` — s komentáři k legacy klíči
- `@supabase/supabase-js` a `@supabase/ssr` přidány do `package.json`
- `.gitignore` opraven — přidána výjimka `!.env.example`

**Auth integrace (krok 2):**
- `app/login/page.tsx` — login + signup v jednom formuláři
- `app/dashboard/page.tsx` — chráněná route s user info a sign out
- `app/auth/callback/route.ts` — PKCE callback handler
- `proxy.ts` — session refresh + ochrana `/dashboard/*` + redirect přihlášených z `/login`

**Deploy pipeline (krok 4):**
- `vercel.json` — security headers (X-Frame-Options, XSS, nosniff, referrer policy)
- `playbooks/vercel-deploy.md` — rozšířen o Supabase env proměnné, redirect URL setup a verifikační checklist

---

### Reálný test — auth-test projekt

Template otestován na projektu `/Users/michalscerba/AI-Projects/Personal/auth-test`.

Postup:
1. Template zkopírován přes `rsync` (bez `node_modules`, `.next`)
2. Supabase projekt `auth-test` vytvořen, klíče vyplněny do `.env.local`
3. `npm install && npm run dev` — app spuštěna lokálně
4. Registrace → potvrzení emailu → přihlášení → dashboard → sign out — vše funkční

**Nalezené bugy (opraveny zpět v template):**

1. **`emailRedirectTo` chybí** — confirmation email přesměrovával na `/?code=...` místo `/auth/callback?code=...`. Fix: přidáno `options.emailRedirectTo` do `signUp` volání.

2. **`middleware.ts` deprecated** — Next.js 16 přejmenoval konvenci na `proxy.ts`. Fix: soubor přejmenován, deprecation warning odstraněn.

**Klíčová lekce:**

Compound efekt v praxi — test na reálném projektu odhalil dva bugy, které by jinak zůstaly skryté. Opraveny zpět v OS → příští projekt je dostane opravené automaticky.

---

## 2026-06-03

### Inicializace projektu

- Vytvořena struktura dokumentace: `docs/DIARY.md` a `docs/PHASES.md`.
- Projekt Compound Engineering zahájen.

### Definice vize a metodologie

**Výchozí bod:** Claude Code + VS Code byl game changer — umožnil navrhovat, prototypovat a nasazovat webové aplikace.

**Identifikovaný další level:** Přejít od AI-assisted coding k AI-orchestrated engineering.

Klíčový insight: nejde o nový framework, nový jazyk ani lepší promptování. Jde o moment, kdy přestaneš AI používat jako chytrý autocomplete a začneš ji používat jako **operační vrstvu pro vývoj**.

---

**Co to znamená v praxi:**

AI, která autonomně:
- generuje kód
- testuje
- deployuje
- analyzuje logy
- píše migrace
- dělá code review
- připravuje PR
- komunikuje přes API
- iteruje bez přímého vstupu

---

**Tři pilíře projektu:**

**1. Agentní workflow**
Stavět specializované agenty (planner, coding, testing, debugging, deployment) a mezi nimi předávat context, soubory, rozhodnutí a TODO stav.

**2. Context Engineering**
Dnes možná nejvíc underrated skill. Ne lepší prompt — ale jak organizovat repozitář, psát CLAUDE.md / AGENTS.md, udržovat architekturu a dávat AI správný kontext ve správný čas. Lidi, kteří tohle umí, mají 10× lepší výsledky se stejnými modely.

**3. Compound Leverage**
Každý script, prompt, template, agent, deploy flow se stává násobičem pro další projekty. MVP není týden, ale večer.

---

**Klíčové varování (slepé místo):**

Největší past AI-orchestrated engineering je orchestrace před zkušeností — stavět agentní systémy na úkoly, které člověk sám nikdy nedělal dost manuálně. Agent funguje, až když víš, co dobrý výsledek obsahuje.

**Proto metodologie jde takto:**
1. Problém vyřešit manuálně
2. Napsat specifikaci (CLAUDE.md)
3. Zautomatizovat
4. Sledovat, kde se context ztrácí

---

**Historický kontext:**

Tento moment je srovnatelný s:
- naučit se internet v 90s
- cloud v 2010
- mobilní apps v 2008

Skill s největším ROI v dalších 3–5 letech: schopnost navrhovat systémy pro AI spolupráci — architektura práce mezi člověkem a AI, orchestrace agentů, context management, rychlá iterace produktu.

---

### Systém na stavění app — konkrétní architektura

Klíčový posun: nezačínat tím, že postavíš další appku — ale postavit **systém na stavění app**.

**Problém většiny lidí s AI:** generují kód → shipnou MVP → začnou znovu od nuly. Žádný compound efekt.

**Cíl:** každý projekt zvyšuje schopnost dalšího projektu.

---

**6 fází systému (upřesněná architektura):**

**Fáze 1 — AI Engineering Cockpit**
Jedno prostředí, kde vzniká všechno. Důležité není tooling, ale standardizace, repeatability, reuse.
Struktura `/personal-os`: `templates/`, `agents/`, `workflows/`, `playbooks/`, `prompts/`, `architecture/`, `lessons/`.

**Fáze 2 — Project Template**
Starter repo s auth, DB, deploy, logging, analytics, billing, landing page, design system, CLAUDE.md, PR rules, coding conventions.
Cíl: nový produkt = instantiate system, ne nový chaos.
Poznámka: kroky 1–4 (stack, auth, DB, deploy) jsou základ — ne vše najednou.

**Fáze 3 — Operating Manual (SYSTEM.md)**
Personal engineering OS. Jak stavíš produkty, standardy, naming, architecture decisions, deployment flow, testing philosophy, AI rules, product philosophy.
Skoro nikdo tohle nedělá.

**Fáze 4 — Specializované AI role**
Architect, Builder, Refactorer, Debugger, QA, Product Thinker — každý jako `agents/*.md`.
Klíčový mindset shift: nepoužívat AI „udělej mi feature", ale „funguj jako člen systému".

**Fáze 5 — Memory System**
Ukládat rozhodnutí, patterns, chyby, reusable prompty, debugging postupy, deployment postupy, postmortems, architecture patterns.
Po roce: vlastní software manufacturing intelligence.

**Axiom (průřezové pravidlo od Day 1):**
Kdykoliv tě něco sere podruhé → automatizace, script, workflow, agent. Každé opakování je kandidát na systém.

---

**Konkrétní první týden:**

| Den | Úkol |
|-----|------|
| 1 | Vytvoř `/personal-os` strukturu |
| 2 | Napiš první `CLAUDE.md` |
| 3 | Rozhodni stack + vytvoř kostru starter repozitáře |
| 4 | Vytvoř první agent roli: `agents/debugger.md` |
| 5 | Shipni malou appku pouze přes tento systém — testuj manufacturing, ne produkt |

---

**Konec prvního týdne — GitHub push:**

Repozitář inicializován a pushnut na GitHub jako soukromý.
`github.com/MichalScerba/compound-engineering`

Fáze 1 — AI Engineering Cockpit: **dokončena**.
Aktivní fáze: **Fáze 2 — Project Template**.

Shrnutí prvního týdne:
- OS struktura vytvořena a verzována
- CLAUDE.md definuje jak AI v systému pracuje
- Starter template připraven pro nové projekty
- Debugger agent jako první specializovaná role
- Quick Notes appka otestovala celý manufacturing cyklus
- 2 playbooks vznikly z reálných problémů (Supabase setup, Vercel deploy)

---

**Den 5 — Quick Notes appka (test manufacturing systému):**

První projekt postavený přes Compound Engineering OS. Cíl byl testovat systém, ne produkt.

Stack: Next.js + Supabase + shadcn/ui + Tailwind
Projekt: `/Users/michalscerba/AI-Projects/Personal/quick-notes`

Co fungovalo:
- Template kopírování proběhlo bez problémů
- CLAUDE.md v template byl okamžitě použitelný
- Struktura složek dávala smysl od začátku

Problémy a lekce:
1. **Supabase nový klíč formát** — `sb_publishable_...` nefunguje s `@supabase/supabase-js`. Je třeba použít legacy anon klíč (`eyJ...`) z záložky "Legacy anon, service_role API keys".
2. **RLS timing** — tabulka byla vytvořena s RLS zapnutým (první SQL pokus proběhl před kliknutím "Run without RLS"). Fix: `alter table notes disable row level security;`

Akce pro OS — splněno:
- `playbooks/supabase-setup.md` — postup pro Supabase setup včetně legacy klíče a RLS
- `playbooks/vercel-deploy.md` — postup pro první deploy včetně env proměnných

Live URL: https://quick-notes-d6rchbwwx-michal-scerba-s-projects.vercel.app

---

**Den 3 — První starter template (v1):**

Vytvořen `templates/nextjs-starter/` — kostra pro nové projekty.

Stack: Next.js App Router + TypeScript strict + Tailwind + shadcn/ui
Struktura: `app/`, `components/ui/`, `hooks/`, `lib/`, `types/`
Vlastní `CLAUDE.md` přímo v template — pravidla zdědí z OS, ale má lokální kontext.

V1 záměrně bez auth a DB — základ se testuje první, rozšíření přijde po validaci.

---

**Den 2 — CLAUDE.md:**

Vytvořen `CLAUDE.md` v kořeni projektu. Klíčová rozhodnutí:
- Kód anglicky, komunikace česky
- TypeScript strict, žádné `any`, explicitní > implicitní
- Malé komponenty, flat struktura, žádný over-engineering
- Claude funguje jako člen systému — před implementací kontroluje `/templates` a `/playbooks`
- Axiom "automatizuj bolest" zakódován přímo do instrukcí

---

**Den 1 — Vytvoření struktury personal OS:**

Vytvořeny složky v kořeni projektu:
```
agents/       ← specializované AI role
architecture/ ← architektonická rozhodnutí a patterns
lessons/      ← poznatky z reálných projektů
playbooks/    ← postupy pro opakující se situace
prompts/      ← reusable prompty
templates/    ← starter templates pro nové projekty
workflows/    ← automatizované workflow
```

Compound Engineering = systém samotný. Žádná appka tady nevzniká — jen OS. Nové projekty jsou vlastní repozitáře, které z toho vychází. Zpětná vazba z reálných projektů se zapisuje sem a systém se průběžně ladí.

---

**Identita shift:**

Nejsi coder, founder ani indie hacker.
Začínáš být **designer systému pro tvorbu software**.

---
