# DeployMate

**Stav:** AKTIVNÍ
**Zahájení:** 2026-06-10
**Repo:** https://github.com/MichalScerba/deploy-mate
**Produkce:** Vercel (deploy na explicitní žádost)

---

## Co projekt dělá

Multi-agentní systém pro řízení procesu implementace pojišťovny do pojišťovacího srovnávače Cesta. Neřeší technickou integraci — řídí, dokumentuje a automatizuje proces od kickoffu (F0) po spuštění na produkci (F7).

Primární uživatel: Michal (interní). Sekundárně sdílení s kolegy.

## Stack

| Vrstva | Technologie |
|--------|-------------|
| Frontend | Next.js 16 + TypeScript (App Router) |
| Backend | Next.js API routes |
| Databáze | Supabase (PostgreSQL + Storage) |
| Hosting | Vercel |
| AI | Anthropic Claude API (Sonnet + Haiku) |
| Styling | Tailwind CSS + shadcn/ui |

**Modely:**
- Orchestrátor, Dokumentační, Testovací, Review → `claude-sonnet-4-20250514`
- Checklist, Komunikační → `claude-haiku-4-5-20251001`

## Vizuální identita (referenční pro nové projekty)

- Dark theme
- Primary color: `oklch(0.955 0.211 108)` — neon yellow (#e8ff47)
- Font: Manrope (Google Fonts)
- Layout: tmavý sidebar vlevo, hlavní obsah vpravo

## Fáze vývoje

| Fáze | Popis | Stav |
|------|-------|------|
| 1 | Základ — DB schéma, layout, auth, seed data | ✓ HOTOVO |
| 2 | Core funkce — wizard, detail projektu, stavové přechody, orchestrátor agent | ✓ HOTOVO |
| 3 | Deploy — Vercel, env vars, GitHub integrace | ✓ HOTOVO |
| 4 | Multi-agent systém — dokumentační, checklist, komunikační agent + tab bar UI | ✓ HOTOVO |
| 5 | Metriky & tracking — MetricsSection, Deník projektu, atomická RPC | ✓ HOTOVO |
| 6 | Novinky pojišťoven (`/updates`) — specifikace hotová | čeká na implementaci |
| 7 | Task Outputs + Template Library + Markdown v agentech | ✓ HOTOVO (2026-06-11) |

## Klíčové architektonické rozhodnutí

- **Dynamický `/api/agents/[type]`** místo samostatných routes (ADR-001)
- **Agent configs as const** — type-safe bez enum (ADR-002)
- **selectedAgentRef** pro race condition při streamování (ADR-003)
- **Markdown rendering** přes react-markdown + custom Tailwind komponenty (ADR-004)
- **Server-side upload** do Supabase Storage — MIME validace na serveru
- **has_content** computed při page fetch — ne lazy load v komponentě

## Otevřené úkoly

- [ ] Fáze 6: Novinky pojišťoven (`/updates`) — datový model + UI specifikace hotová v DIARY.md
- [ ] Export metrik (CSV nebo report)
- [ ] Testovací a Review agent (odloženo na reálná data)
