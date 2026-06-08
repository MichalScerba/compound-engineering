# Project Phases

Přehled fází projektu, jejich kroků a aktuálního stavu.

---

## Vize

Nezačínat tím, že postavíš další appku.

Postavit **systém na stavění app**.

Většina lidí s AI: generuje kód → shipne MVP → začne znovu od nuly.

Cíl: každý projekt zvyšuje schopnost dalšího projektu. To je compound efekt.

---

## Průřezové pravidlo (platí od Day 1)

> Kdykoliv tě něco sere podruhé → automatizace, script, workflow, agent.

Každé opakování je kandidát na systém. Tohle není Fáze 6 — je to axiom celého projektu.

---

## Metodologie

Pořadí, které zabraňuje stavění systémů bez zkušenosti:

1. Problém vyřešit **manuálně** s Claude Code
2. Napsat **specifikaci** (CLAUDE.md / AGENTS.md)
3. **Zautomatizovat** přes workflow
4. Opakovat — sledovat, kde se context ztrácí

> Delegovat AI agentovi lze jen to, co umíš specifikovat. Specifikovat umíš jen to, co jsi dělal sám.

---

## Legenda stavů

| Symbol | Stav |
|--------|------|
| `[ ]`  | Nezahájeno |
| `[~]`  | Probíhá |
| `[x]`  | Dokončeno |
| `[!]`  | Blokováno |

---

## Fáze 1 — AI Engineering Cockpit

**Stav:** `[x]` Dokončeno

**Cíl:** jedno prostředí, kde vzniká všechno.

Důležité není tooling. Důležité je: standardizace, repeatability, reuse.

| # | Krok | Stav |
|---|------|------|
| 1 | Vytvoření struktury dokumentace | `[x]` |
| 2 | Definice vize a metodologie | `[x]` |
| 3 | Vytvoření `/personal-os` struktury | `[x]` |
| 4 | Napsání `CLAUDE.md` | `[x]` |
| 5 | Vytvoření prvního starter template (Next.js v1) | `[x]` |
| 6 | Nastavení repozitáře (git init, GitHub) | `[x]` |
| 7 | Výběr prvního reálného problému k řešení | `[x]` |

**Struktura `/personal-os`:**
```
templates/
agents/
workflows/
playbooks/
prompts/
architecture/
lessons/
```

**Stack:**
| Nástroj | Role |
|---------|------|
| Claude Code | Primární coding agent |
| VS Code / Cursor | IDE prostředí |
| GitHub | Verzování a CI/CD |
| Vercel | Deployment |
| Supabase | Databáze a backend |
| n8n | Workflow orchestrace |

---

## Fáze 2 — Project Template

**Stav:** `[~]` Probíhá

**Cíl:** nový produkt ≠ nový chaos. Ale: instantiate system.

| # | Krok | Stav |
|---|------|------|
| 1 | Rozhodnutí o stacku a kostra repozitáře | `[x]` |
| 2 | Auth integrace | `[x]` |
| 3 | DB schéma a Supabase setup | `[x]` |
| 4 | Deploy pipeline (Vercel) | `[x]` |
| 5 | Logging a analytics | `[x]` |
| 6 | Billing (Stripe) | `[ ]` |
| 7 | Landing page template | `[ ]` |
| 8 | Design system (shadcn/ui) | `[x]` |
| 9 | CLAUDE.md a AI instructions | `[x]` |
| 10 | PR rules a coding conventions | `[x]` |

> Pozor: kroky 1–4 jsou základ, kroky 5–10 jsou rozšíření. Nedělat vše najednou.

---

## Fáze 3 — Operating Manual (SYSTEM.md)

**Stav:** `[ ]` Nezahájeno

**Cíl:** napsat svůj personal engineering OS. Skoro nikdo tohle nedělá.

| # | Krok | Stav |
|---|------|------|
| 1 | Jak stavíš produkty (proces a principy) | `[ ]` |
| 2 | Standardy: naming, architektura, coding conventions | `[ ]` |
| 3 | Deployment flow | `[ ]` |
| 4 | Testing philosophy | `[ ]` |
| 5 | AI rules a interaction patterns | `[ ]` |
| 6 | Product philosophy | `[ ]` |

---

## Fáze 4 — Specializované AI Role

**Stav:** `[~]` Probíhá

**Cíl:** nepoužívat AI stylem „udělej mi feature", ale „funguj jako člen systému".

| # | Role | Soubor | Stav |
|---|------|--------|------|
| 1 | Architect — navrhuje systém | `agents/architect.md` | `[ ]` |
| 2 | Builder — implementuje feature | `agents/builder.md` | `[ ]` |
| 3 | Refactorer — zjednodušuje kód | `agents/refactorer.md` | `[ ]` |
| 4 | Debugger — hledá root cause | `agents/debugger.md` | `[x]` |
| 5 | QA — píše test scénáře | `agents/qa.md` | `[ ]` |
| 6 | Product Thinker — zpochybňuje feature | `agents/product-thinker.md` | `[ ]` |

---

## Fáze 5 — Memory System

**Stav:** `[ ]` Nezahájeno

**Cíl:** po roce mít vlastní software manufacturing intelligence.

| # | Krok | Stav |
|---|------|------|
| 1 | Systém na ukládání rozhodnutí a patterns | `[ ]` |
| 2 | Záznamy chyb a postmortems | `[ ]` |
| 3 | Reusable prompty a debugging postupy | `[ ]` |
| 4 | Architecture patterns library | `[ ]` |
| 5 | Deployment postupy a runbooky | `[ ]` |

---

## Konkrétní první týden

| Den | Úkol |
|-----|------|
| 1 | Vytvoř `/personal-os` strukturu |
| 2 | Napiš první `CLAUDE.md` |
| 3 | Rozhodni stack + vytvoř kostru starter repozitáře |
| 4 | Vytvoř první agent roli: `agents/debugger.md` |
| 5 | Shipni malou appku pouze přes tento systém — testuj manufacturing, ne produkt |

---

## Aktuální stav projektu

**Aktivní fáze:** Fáze 2 — Project Template
**Poslední aktualizace:** 2026-06-08
**Fáze 2 aktivní kroky:** 1, 2, 3, 4, 5, 8, 9, 10 hotovy — zbývá: billing, landing
