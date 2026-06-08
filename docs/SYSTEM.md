# SYSTEM.md — Personal Engineering OS

Jak stavím produkty. Standardy, principy, workflow.

---

## 01 — Jak stavím produkty

### Proces (v tomto pořadí)

**Krok 1 — Project definition**
Před jakýmkoliv kódem. Otevřu Claude projekt se šablonou project definition promptu.
Projdu 8 sekcí: Problem Statement, Scope & MVP, Cíle & Metriky, Tech Stack, Fáze & Milníky, Stakeholders, Rizika, Kapacita.
Výstup: strukturovaný dokument + readiness score (0–100 %).
Dokud není readiness dostatečný, nezačínám.

**Krok 2 — Otevřu Claude Code**
Primární prostředí pro vývoj. Vždy jako první věc po otevření projektu.

**Krok 3 — Inicializuji docs**
Vytvořím `docs/DIARY.md` a `docs/PHASES.md`.
PHASES.md musí mít kroky navržené tak, aby na sebe navazovaly — špatně navržené fáze = chaos při implementaci.

**Krok 4 — Inicializuji projekt**
Zkopíruji `templates/nextjs-starter/` z Compound Engineering OS.
Základní struktura, auth, DB, deploy, analytics — připravené bez nastavování od nuly.

**Krok 5 — Implementuji features**
Jedna feature = jeden krok v PHASES.md.
Claude Code provádí feature od začátku do konce podle aktuálního kroku.
Feature je hotová když funguje manuálním testem v prohlížeči.

### Principy

- **Definition first** — žádný kód bez projektové definice
- **PHASES.md je zákon** — kroky musí na sebe navazovat, ne být přidávány za běhu
- **Template over scratch** — nový projekt = instantiate system, ne nový chaos
- **Manual test = done** — feature je hotová když ji vidím fungovat v prohlížeči
- **Compound efekt** — každý problém který řeším podruhé je kandidát na systém

---

## 02 — Standardy

### Projekt naming

- Složky projektů: `kebab-case` (`auth-test`, `quick-notes`, `compound-engineering`)
- Tři kategorie: `Personal/`, `Shared/`, `Work/`

### Soubory a komponenty

- Soubory: `kebab-case` (`user-profile.tsx`, `supabase-server.ts`)
- React komponenty uvnitř souboru: `PascalCase` (`export function UserProfile()`)
- App Router routes: kebab-case podle Next.js konvence (`app/user-profile/page.tsx`)

### Architektura

Flat over nested — přidávej do existující složky, novou vytvoř až když máš 3+ souborů se stejným kontextem.

Standardní struktura Next.js projektu:
```
app/          ← pouze routes (page.tsx, layout.tsx, route.ts)
components/   ← sdílené UI komponenty
components/ui ← shadcn komponenty — nesahej na ně manuálně
lib/          ← utility a klienti (supabase, helpers)
types/        ← TypeScript typy a interfaces
hooks/        ← custom React hooks
```

---

## 03 — Deployment flow

### Postup

1. Feature hotová (manuální test v prohlížeči)
2. Commit + push
3. Preview deploy: `npx vercel`
4. Ověř na preview URL
5. Produkční deploy: `npx vercel --prod`

### Pravidla

- **Preview vždy před produkcí** — nikdy rovnou `--prod` bez ověření
- **Jeden deploy = jedna feature** — po každé hotové feature, ne v dávkách
- **Env proměnné přes CLI** — `npx vercel env add` pro production i preview
- Viz `playbooks/vercel-deploy.md` pro detailní postup

---

## 04 — Testing philosophy

### Pravidlo

**Manuální test vždy.** Automatický test pro:
- logiku která se opakuje (kalkulace, transformace dat, validace)
- kritické flow (auth, platby, data mutations)
- cokoliv co se pokazilo a nesmí se opakovat

UI, layout a jednoduché renders — pouze manuálně.

### Princip

Testy nepíšeš pro to abys měl testy. Píšeš je aby tě zachránily.

---

## 05 — AI rules a interaction patterns

### Jak pracuji s Claude Code

- **Jeden krok najednou** — žádné velké tasky, vždy jeden konkrétní krok z PHASES.md
- **Komunikace v češtině** — tasky i zpětná vazba vždy česky
- **Kód v angličtině** — názvy, commity, komentáře vždy anglicky

### Oprava chyb — pravidlo 3 pokusů

1. Vysvětlím co je špatně a zkusím znovu
2. Pokud stále špatně — upřesním zadání, zkusím znovu
3. Pokud stále špatně — **reset**: nový kontext nebo rozložení tasku na menší kroky

Po třech neúspěšných pokusech není problém v modelu — je problém v zadání nebo ztraceném kontextu.

### Interaction patterns

- Claude Code funguje jako **člen systému**, ne jako nástroj — před implementací kontroluje `/templates` a `/playbooks`
- Každý nový projekt začíná s CLAUDE.md z template — pravidla jsou zděděna automaticky
- Po každém netriviálním tasku: *patří to zpět do OS?*

---

## 06 — Product philosophy

### Principy

- **Osobní zkušenost jako zdroj** — stavím produkty z problémů které sám znám, ne z předpokladů
- **Přidaná hodnota nad vším** — produkt musí mít jasný důvod proč existuje
- **Malé a fokusované** — žádné feature bloat, jeden produkt řeší jeden problém dobře
- **Definition first** — readiness kritéria jsou součástí projektové definice (krok 1 procesu), ne globální pravidlo — každý projekt má svá vlastní

### Co nikdy nedělám

- Nepřidávám funkce bez jasného důvodu
- Nezačínám stavět bez projektové definice
- Nestavam komplex před validací základu
