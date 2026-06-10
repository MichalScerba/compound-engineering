# ADR-001 — Dynamický route /api/agents/[type] místo samostatných routes

**Datum:** 2026-06-10
**Status:** Přijato
**Projekt:** DeployMate

---

## Kontext

DeployMate má více AI agentů (orchestrátor, komunikační, checklist, dokumentační). Každý agent potřebuje vlastní API endpoint — jiný system prompt, jiný model, jiný max_tokens. Zároveň sdílí identický pattern: auth check → fetch projektu → build system prompt → stream response.

## Rozhodnutí

Jeden dynamický Next.js route `/api/agents/[type]/route.ts` obsluhuje všechny agenty kromě orchestrátora (ten má historický statický route). Validace `type` parametru je první věc v handleru.

## Alternativy které byly zvažovány

- **Samostatné routes** (`/api/agents/communication/route.ts` atd.) — více souborů, duplicitní streaming logika, každý nový agent = nový soubor
- **Jeden route s query param** (`/api/agents?type=communication`) — méně idiomatické pro Next.js App Router, horší čitelnost

## Důsledky

**Pozitivní:**
- Přidání nového agenta = nový `case` ve switchi a nový soubor v `lib/agents/`
- Sdílená streaming logika na jednom místě
- Next.js preferuje statický route (`/orchestrator`) nad dynamickým — bez konfliktu

**Negativní / trade-offs:**
- Neplatný `type` projde middleware (auth redirect) a 400 vrátí až samotný handler — ne ideální pro pure API, ale v pořádku pro interní web app

## Kdy přehodnotit

Pokud agentů přibude tolik že switch statement přestane být přehledný, nebo pokud různí agenti budou potřebovat zásadně odlišnou middleware logiku.
