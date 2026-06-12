# Loom

**Stav:** AKTIVNÍ — Fáze 1 inicializována 2026-06-12  
**Typ:** pracovní projekt  
**Repo:** /AI-Projects/Work/Loom  
**Deadline:** zatím neurčen  

---

## Co projekt dělá

Loom je autonomní multiagentní systém který přeměňuje screenshoty pojišťovacích formulářů na hotové TSX komponenty — bez manuálního prostředníka.

**Pipeline Fáze 1:**
```
inputs/screenshots/  →  [Agent 1: vision]  →  outputs/component_map.json
                                                       ↓
                        [Agent 2: codegen]  →  design_tokens.json + types.ts + *.tsx
```

---

## Stack

- **Jazyk:** Python 3.11+ (async)
- **API:** Anthropic SDK
- **Agent 1 (vision):** claude-opus-4-8
- **Agent 2 (codegen):** claude-sonnet-4-6
- **Výstupy:** JSON tokeny + Next.js TSX (Tailwind + shadcn/ui + cva)

---

## Fáze

| # | Milestone | Stav |
|---|-----------|------|
| M1 | Projekt vytvořen, orchestrator běží bez chyb | ✅ HOTOVO |
| M2 | Screenshot → component_map.json s ≥5 komponentami | ⬜ todo |
| M3 | component_map.json → design_tokens.json + ≥3 TSX | ⬜ todo |
| M4 | E2E: cestovní pojištění → sdílené komponenty | ⬜ todo |
| M5 | Fáze 2 ready — pokrývá všechny formulářové prvky | ⬜ todo |

---

## Open otázky

- Jak se řeší iterace — agent udělá chybu, jak se opraví?
- Fáze 2 a 3 architektura (product-specific komponenty, full frontend assembly)
- Storybook integrace (volitelné)
