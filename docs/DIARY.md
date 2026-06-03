# Project Diary

Detailní záznamy průběhu projektu, rozhodnutí, poznatků a kontextu.

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
