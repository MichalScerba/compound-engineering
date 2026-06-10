# ADR-002 — AGENT_CONFIGS as const jako single source of truth pro UI agenty

**Datum:** 2026-06-10
**Status:** Přijato
**Projekt:** DeployMate

---

## Kontext

AgentPanel v UI potřebuje pro každého agenta: label v tab baru, model badge, placeholder text, suggestion chips, endpoint URL. Tato data jsou svázaná dohromady — když přibude nový agent, musí se aktualizovat vše najednou.

## Rozhodnutí

Jeden `AGENT_CONFIGS` array s `as const` na konci souboru komponenty. TypeScript odvodí `AgentId` union type přímo z pole — přidání agenta do pole automaticky rozšíří typ.

```ts
const AGENT_CONFIGS = [...] as const;
type AgentId = typeof AGENT_CONFIGS[number]["id"];
```

## Alternativy které byly zvažovány

- **Samostatné konstanty** (labels objekt, suggestions objekt, endpoints objekt) — více míst k aktualizaci, snadné zapomenout jedno
- **Props z parenta** — přenáší konfiguraci výš, panel se stává obecnějším ale obtížněji čitelným
- **Oddělený soubor** (`lib/agent-configs.ts`) — over-engineering pro jeden konsument

## Důsledky

**Pozitivní:**
- Přidání agenta = jeden nový objekt v poli, TypeScript typy se aktualizují automaticky
- Vše na jednom místě — žádné roztroušené konstanty
- `as const` zabraňuje nechtěné mutaci a umožňuje odvozené typy

**Negativní / trade-offs:**
- Konfigurace je v komponentě, ne v `lib/` — pokud by více komponent sdílelo agenty, bylo by třeba přesunout

## Kdy přehodnotit

Pokud by `AGENT_CONFIGS` potřeboval sdílet více komponent nebo by ho bylo potřeba generovat dynamicky (např. z DB).
