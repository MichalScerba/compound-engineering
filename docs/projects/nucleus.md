# Nucleus

**Stav:** AKTIVNÍ — Fáze 1 MVP  
**Zahájení:** 2026-06-11  
**Deadline MVP:** konec června 2026  
**Repo:** https://github.com/MichalScerba/nucleus (privátní)  

---

## Co projekt dělá

Nucleus je osobní AI operační systém života — druhý mozek který koučuje uživatele přes tým specializovaných agentů, sleduje výzvy a projekty, trackuje čas a postupně přebírá operativní úkoly prostřednictvím osobní asistentky **Mia**.

Primární uživatel: Michal — solo, osobní validace před případným komerčním nasazením.

---

## Stack

| Vrstva | Technologie |
|--------|-------------|
| Backend | Python + FastAPI |
| Frontend | React + TypeScript + Vite |
| Databáze | PostgreSQL (lokálně pro MVP) |
| AI | Anthropic Claude API (Sonnet + Haiku) |
| Deployment | Lokálně (MVP), Railway Fáze 2 |

---

## Architektura — 4 vrstvy

1. **Core Council** — 10 specializovaných agentů (Orchestrátor, Psycholog, Trader, Analytik, Trenér, Nutricionista, Biohacker, Kouč, Mnich, Filosof)
2. **Mission System** — dočasné výzvy s vlastními Mission Agenty, timeline a metrikami
3. **Mia** — osobní asistentka která vykonává (ne radí); kompetence odemykané postupně
4. **Time Tracker** — migrovaný z time-tracker.html, plně funkční React komponenta s reálnými daty

---

## MVP Scope (Fáze 1 — červen 2026)

- [x] Frontend scaffold — React + TypeScript + Vite
- [x] Design system — DESIGN_SYSTEM.md, design-tokens.css, dark blue-black palette
- [x] App shell — sidebar navigace, MiaBar, status bar
- [x] Today stránka — HeroBlock, PriorityCard, SessionCard, InsightsCard, QuickActions
- [x] Time Tracker — kompletní port z HTML (timer, cíle, projekty, statistiky, graf, záznamy, modály)
- [x] Import dat — 53 sessions + 16 projektů z timetrack-export-2026-06-11.json
- [ ] Core Council: Orchestrátor + Psycholog + Trenér + Trader (backend)
- [ ] DailyLog model + endpointy
- [ ] DailyScore model (sebehodnocení 1–10, 5 dimenzí)
- [ ] Chat s agenty (POST /api/chat)
- [ ] Mia: konverzace + správa úkolů (bez automatizace)
- [ ] Time Tracker: migrace dat z localStorage → PostgreSQL
- [ ] Mission System: vytvoření výzvy + tracking + check-in

---

## Co bylo postaveno — Frontend (session 2026-06-11)

### Design systém
- `frontend/DESIGN_SYSTEM.md` — vizuální pravidla, barvy s verifikačním systémem (`✓ ověřeno` / `⚠ neověřeno`)
- `frontend/src/styles/design-tokens.css` — CSS custom properties
- Verifikované barvy: `--bg-sidebar: #05060A`, `--bg-global: #0A0E12`

### Komponenty (Today stránka)
- **HeroBlock** — ranní pozdrav, SVG globus, zkratky dne, tlačítko briefing
- **SessionCard** — aktivní session s kruhovým progressem, proklik → Time Tracker
- **PriorityCard** — prioritní výzvy dne
- **InsightsCard** — přehledová karta
- **QuickActions** — rychlé akce
- **Sidebar** — navigace (Dnes / Mise / Historie / Nastavení)
- **MiaBar** — vstupní panel Mia asistentky

### Time Tracker (plná React komponenta)
- Timer stavový automat: stopped → running → paused → stopped
- Výběr projektu + přidání nového projektu (modál)
- Výběr cíle (Bez cíle / 30m / 1h / 1,5h / 2h / 3h / celý den)
- Web Audio API — zvuk při dosažení cíle (C5 E5 G5 C6)
- Detail modál — popis session při ukončení
- Statistiky — Dnes / Tento týden / Min. týden / Tento měsíc
- Graf aktivity — týdenní nebo měsíční, span vs tracked, produktivita %
- Záznamy — filtry (období + typ), inline editace minut
- Toast notifikace
- localStorage: `tt_logs`, `tt_projects`, `tt_clean_7`
- Import: `src/data/sessions-export.json` (seeduje localStorage idempotentně při startu)

### Importovaná data
- **53 sessions** od 2026-05-25 do 2026-06-11
- **16 projektů**: AXA, Nemovitostní trezor, Formulář majetku UI, Znalostní báze, Time tracker, Agenda, Meal Mate, Mia osobní asistentka, Compound Engineering, IQ Support, MailQ, Deploy Mate, Implementace Cesto Ergo, Habit Shift, Unbecome, Nucleus

---

## Aktivní výzvy (Mission System — první instance)

| Výzva | Cíl | Deadline |
|-------|-----|----------|
| Unbecome — Váha | 89 kg (z 105 kg) | Dlouhodobý |
| Unbecome — Alkohol | Max 3× měsíčně | Červenec 2026 |
| Unbecome — Trading | 2 000 USD/měsíc | Červenec 2026 |

---

## Fáze

| Fáze | Obsah | Stav |
|------|-------|------|
| Fáze 1 — MVP | Frontend ✓ + Backend + Agenti + Mia + Mission System | IN PROGRESS |
| Fáze 2 — Core | Všech 10 agentů + AI analýza + Mia rozšíření | Plánováno (srpen 2026) |
| Fáze 3 — Scale | Komerční nasazení, multi-user | Q1 2027 |

---

## Open tasks

- [ ] Backend scaffold (FastAPI + PostgreSQL)
- [ ] System prompty pro 4 MVP agenty (Orchestrátor, Psycholog, Trenér, Trader)
- [ ] Endpoint POST /api/chat
- [ ] DailyLog + DailyScore modely
- [ ] Mia chat UI (propojit MiaBar s backendem)
- [ ] Mission System UI (Missions stránka)
- [ ] Time Tracker: migrace localStorage → PostgreSQL
- [ ] Verifikace zbývajících design tokenů (barvy ⚠ neověřeno)
- [ ] History stránka
- [ ] Settings stránka

---

## Design

- Paleta: blue-black dark (`#0A0E12` globální, `#05060A` sidebar)
- Accent: zelená `#84FF00` (neon green)
- Font: Inter (systém), monospace pro timer
- Referenční design: time-tracker.html (přenesen do Nucleus stylu)
- Verifikační systém barev: `/* ✓ ověřeno */` vs `/* ⚠ neověřeno */`
