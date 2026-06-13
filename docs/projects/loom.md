# Loom

**Stav:** POZASTAVENO — Fáze 3 dokončena 2026-06-13, přechod na nový projekt  
**Typ:** pracovní projekt  
**Repo:** github.com/MichalScerba/Loom (private)  
**Lokální cesta:** /AI-Projects/Work/Loom  
**Deadline:** zatím neurčen  

---

## Co projekt dělá

Loom je autonomní multiagentní systém který přeměňuje screenshoty pojišťovacích formulářů na hotové TSX komponenty — bez manuálního prostředníka.

**Celková pipeline:**
```
inputs/screenshots/  →  [Agent 1: vision]  →  outputs/component_map.json
                                                       ↓
                        [Agent 2: codegen]  →  design_tokens.json + types.ts + *.tsx (Fáze 1+2)
                                                       ↓
                        [phase3.py]         →  outputs/app/ (Next.js 15, čistý build) (Fáze 3)
```

---

## Stack

- **Orchestrace:** Python 3.11+ (async), `orchestrator.py`, `phase3.py`
- **API:** Anthropic SDK
- **Agent 1 (vision):** claude-opus-4-8
- **Agent 2 (codegen):** claude-sonnet-4-6
- **Frontend výstup:** Next.js 15 App Router, Tailwind, shadcn/ui, cva
- **State management:** localStorage (`lib/wizard-state.ts`)

---

## Dokončené fáze

| Fáze | Popis | Stav | Datum |
|------|-------|------|-------|
| 1 | Vision analýza screenshotů → 108 komponent ze 46 screenshotů | ✅ HOTOVO | 2026-06-12 |
| 2 | 9 kompozitních komponent (3 produkty × 3 sekce), TSX generované Claudem | ✅ HOTOVO | 2026-06-12 |
| 3 | Next.js 15 frontend: landing + 9 wizard stránek, čistý build, všechny routy 200 OK | ✅ HOTOVO | 2026-06-12 |

---

## Výstupy

### Fáze 1
- `outputs/component_map.json` — 108 komponent ze 46 screenshotů
- `outputs/design_tokens.json` — design systém (barvy, spacing, typografie)
- `outputs/components/consolidated/` — 47 konsolidovaných sdílených TSX komponent
- `docs/flows/property-flow.md` — zdokumentovaný 5-krokový flow majetkového pojištění

### Fáze 2
- `outputs/components/cestovni/` — 3 kompozitní sekce
- `outputs/components/auto/` — 3 kompozitní sekce
- `outputs/components/property/` — 3 kompozitní sekce

### Fáze 3
- `outputs/app/` — Next.js 15 App Router aplikace
- Landing page + 9 wizard stránek (3 produkty × 3 kroky)
- `lib/wizard-state.ts` — localStorage state management
- `lib/mock-data.ts` — mock data pro srovnání a rekapitulaci

### Spuštění
```bash
cd outputs/app && npm install && npm run dev
# → http://localhost:3001
```

---

## Open otázky / technický dluh

- Iterace: jak opravit chybný agent output bez restartu celé pipeline?
- Validace TSX výstupu (TypeScript check jako krok orchestratoru?)
- Fáze 4 (vizuální refresh), Fáze 5 (real backend), Fáze 6 (mobile responsivita)
- Storybook integrace (volitelné)

---

## Lessons learned

- `export * from "./types"` v barrel exportu způsobí duplikátní type konflikty pokud komponenty definují vlastní typy inline — řešení: neexportovat types.ts z barrel
- `git filter-repo` smaže remoty jako bezpečnostní opatření — je třeba znovu přidat origin
- Claude generuje zkrácené (`// ... rest of implementation`) výstupy pro velké komponenty — je třeba vždy ověřit kompletnost
