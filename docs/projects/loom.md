# Loom

**Stav:** AKTIVNÍ — Fáze 4 probíhá (UI refresh, design system Orfeus)  
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
| 4 | UI refresh: Orfeus design system, landing page, SiteHeader, travel step 2, background unification | 🔄 AKTIVNÍ | 2026-06-17 |

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

### Fáze 4 (probíhá)
- `components/orfeus-ui.tsx` — sdílený design system: T tokeny, StepIndicator (bars + circles), SectionCard, ToggleSwitch, Divider, HomeLink
  - StepIndicator bars: sticky, transparentní pozadí, klikatelné kroky (`onStepClick`), ✓ ikona u hotových kroků
  - SectionCard: ikona bez tyrkysového čtverečku, jen icon + text
- `components/site-header.tsx` — sticky navigace (Partners logo, nav linky, CTA tlačítko), přidána do všech 3 product layoutů
- `app/page.tsx` — kompletní rewrite landing page dle developer-package: 6 product karet, selection bar, 4-krokový process, Partners branding
- `public/` — obrázky a logo z developer-package (travel, car, home, life, liability, business, partners-logo.svg)
- `app/globals.css` — radial-gradient pozadí na `html`, body transparent
- Všechny outer form wrappery — `background: transparent` (8 souborů)
- `components/sections/cestovni/travel-comparison-orfeus.tsx` — kompletní implementace kroku 2 (srovnání nabídek) 1:1 dle specifikace:
  - 7 pojišťoven se SVG logy (AXA, Union, Direct, Slavia, ČSOB, UNIQA, KB)
  - Horizontálně scrollovatelná tabulka, sticky první sloupec, fade gradient overlay
  - CompactDropdown s `createPortal` (fix pro `overflow-x: auto` clipping)
  - SectionHeader sticky (první cell sticky + filler cells — fix pro colspan sticky bug)

### Spuštění
```bash
cd outputs/app && npm install && npm run dev
# → http://localhost:3001
```

---

## Open otázky / technický dluh

- Iterace: jak opravit chybný agent output bez restartu celé pipeline?
- Validace TSX výstupu (TypeScript check jako krok orchestratoru?)
- Fáze 5 (real backend), Fáze 6 (mobile responsivita)
- Storybook integrace (volitelné)
- Fáze 4 zbývá: cestovní pojištění krok 3 (účastníci) + rekapitulace refresh; auto a property kroky dopracovat do stejné úrovně jako cestovní

---

## Lessons learned

- `export * from "./types"` v barrel exportu způsobí duplikátní type konflikty pokud komponenty definují vlastní typy inline — řešení: neexportovat types.ts z barrel
- `git filter-repo` smaže remoty jako bezpečnostní opatření — je třeba znovu přidat origin
- Claude generuje zkrácené (`// ... rest of implementation`) výstupy pro velké komponenty — je třeba vždy ověřit kompletnost
- `<td colSpan={N}>` se `position: sticky; left: 0` nefunguje spolehlivě — řešení: první cell sticky (230px) + prázdné filler `<td>` pro zbytek
- `position: absolute` dropdown uvnitř `overflow-x: auto` kontejneru je oříznutý — řešení: `createPortal(dropdown, document.body)` s `position: fixed` + `getBoundingClientRect()`
- `onMouseDown` místo `onClick` v portálovém dropdownu zabrání race condition (blur → select)
- StepIndicator s `position: sticky; background: transparent` se vizuálně oddělí od sticky headeru a patří k tělu formuláře
- Gradient pozadí patří na `html` element, ne na `body` — jinak wrapper s `min-height: 100vh` gradient nezobrazí
