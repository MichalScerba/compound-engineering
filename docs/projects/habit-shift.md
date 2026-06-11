# Habit Shift

**Stav:** AKTIVNÍ — Fáze 1 (MVP)
**Zahájení:** 2026-06-11
**Repo:** /Users/michalscerba/AI-Projects/Personal/habit-shift
**Deadline MVP:** 2026-06-15

---

## Co projekt dělá

HabitShift je osobní transformační systém — ne tracking appka. Pomáhá uživateli identifikovat a odstranit největší brzdu jeho života prostřednictvím multi-agent AI coachingu.

První use case: nadměrná konzumace alkoholu (osobní validace pro Michala). Metoda je univerzální.

**Filozofický základ:**
> "Můžeš mít jakékoliv ambiciózní cíle — ale pokud neporazíš svého největšího nepřítele, nikdy se výrazně neposunneš."

---

## Stack

| Vrstva | Technologie |
|--------|-------------|
| Frontend + Backend | Next.js 14+ (App Router) |
| Databáze + Auth | Supabase |
| Hosting | Vercel |
| Mobile | PWA (manifest + service worker) |
| AI | Anthropic Claude API |
| Paměť | Supabase pgvector (Fáze 2) |

---

## Multi-agent architektura

| Agent | Model | Priorita |
|-------|-------|---------|
| Orchestrator | Sonnet | MVP |
| Memory Agent | Sonnet | MVP |
| Craving Coach | Sonnet | MVP ⚡ |
| Trigger Coach | Sonnet | MVP |
| Replacement Coach | Haiku | MVP |
| Mindset Coach | Haiku | Fáze 2 |
| Environment Coach | Haiku | Fáze 2 |
| Progress Coach | Haiku | Fáze 2 |
| Reflection Agent | Sonnet | Fáze 2 |

---

## Fáze

| Fáze | Obsah | Deadline | Stav |
|------|-------|----------|------|
| Fáze 1 — MVP | Orchestrator + Memory + Craving + Trigger Coach, tracking, PWA | 2026-06-15 | 🟡 Zahájeno |
| Fáze 2 — Core | Všech 9 agentů, Pattern Report, notifikace, vizualizace | 2026-07-31 | ⏳ Čeká |
| Fáze 3 — Škálování | Komerční verze, onboarding, více typů návyků | Q4 2026 | ⏳ Čeká |

---

## MVP success criteria

- Spotřeba alkoholu: max 1× týdně (sobota), max 5 MD na sezení — do 14 dní

## Roční cíl

- Max 3× měsíčně do 31. 12. 2026
- Ultimátní cíl: úplná abstinence

---

## Otevřené úkoly (Fáze 1)

- [ ] Next.js + Supabase + Claude API hello world (Den 1)
- [ ] Orchestrator + Memory Agent + Craving Coach (Den 2–3)
- [ ] Trigger Coach + Replacement Coach + tracking UI (Den 4–5)
- [ ] PWA setup + testování na iPhone (Den 6–7)
