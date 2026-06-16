---
name: project-loom
description: Loom — autonomní UI generátor pojišťovacích formulářů; aktuální stav Fáze 4 (UI refresh)
metadata:
  type: project
---

Loom je AKTIVNÍ (Fáze 4). Fáze 1–3 hotové (108 komponent → Next.js 15 app). Fáze 4 = manuální UI refresh dle Orfeus design systému.

**Why:** Agentsky generované komponenty potřebují vizuální sjednocení a dotažení 1:1 dle specifikace než půjdou do produkce.

**How to apply:** Pracujeme na konkrétních TSX souborech v `outputs/app/` — ne na python pipeline. Každá změna musí projít `tsc --noEmit` (0 errors).

---

## Repo
- Lokální: `/Users/michalscerba/AI-Projects/Work/loom/`
- App: `/Users/michalscerba/AI-Projects/Work/loom/outputs/app/`
- Dev server: `cd outputs/app && npm run dev` → http://localhost:3001

## Orfeus design system (`components/orfeus-ui.tsx`)
- T tokeny: brand `#00A7B8`, brandDark `#007F8C`, brandLight `#E6F7F9`, n50/100/200/400/600/900, white, pageBg, green, error, orange
- `StepIndicator` — `variant="bars"` (krok 1) nebo `"circles"` (kroky 2+); prop `onStepClick?: (index) => void` pro navigaci
  - bars: sticky, transparentní, hotové kroky mají ✓ ikonu + tučný text
- `SectionCard` — icon (Tabler Icons), title; ikona bez tyrkysového čtverečku
- `ToggleSwitch`, `Divider`, `HomeLink`
- Font: Inter; ikony: Tabler Icons webfont (třída `ti ti-<name>`)

## SiteHeader (`components/site-header.tsx`)
- Sticky top:0 z-index:200, Partners logo jako Next.js Link na `/`
- Přidána do layoutů: `app/cestovni/layout.tsx`, `app/auto/layout.tsx`, `app/property/layout.tsx`

## Hotové v Fázi 4 (do 2026-06-17)
- Landing page (`app/page.tsx`) — kompletní rewrite dle developer-package; 6 product karet, selection bar, 4-krokový proces
- `public/` — obrázky produktů + Partners logo
- `app/globals.css` — radial-gradient na `html`, body transparent
- Všechny outer form wrappery — `background: transparent` (8 souborů)
- `travel-comparison-orfeus.tsx` — krok 2 cestovního pojištění 1:1 dle specifikace (7 pojišťoven, sticky tabulka, CompactDropdown s createPortal, SectionHeader sticky fix)
- StepIndicator bars — transparentní pozadí (oddělen od SiteHeader)

## Zbývá v Fázi 4
- Cestovní: krok 3 (účastníci) + rekapitulace — vizuální refresh
- Auto + property: všechny kroky na úroveň cestovního
- Obecně: circles varianta StepIndicatoru — sjednotit s barsem (transparentní, navigace)

## Klíčové technické vzory
- **Dropdown v overflow kontejneru:** `createPortal(dropdown, document.body)` + `position: fixed` + `getBoundingClientRect()`; `onMouseDown` ne `onClick`
- **Sticky colspan fix:** místo `<td colSpan={N} sticky>` — první cell sticky (fixed width) + prázdné filler `<td>`
- **Gradient pozadí:** patří na `html`, ne `body`; form wrappery `transparent`
- **StepIndicator sticky:** `position: sticky; top: 0; background: transparent` — vizuálně patří k formuláři, ne k headeru
