# ADR-003 — selectedAgentRef pro ochranu před race condition při streamování

**Datum:** 2026-06-10
**Status:** Přijato
**Projekt:** DeployMate

---

## Kontext

AgentPanel streamuje odpovědi od AI agentů. Uživatel může přepnout agenta *během* probíhajícího streamu. Bez ochrany by přicházející chunky byly připsány aktuálně vybranému agentovi (po přepnutí), ne tomu který stream odstartoval — konverzace by se pomíchaly.

## Rozhodnutí

Na začátku `sendMessage()` se pořídí snapshot aktivního agenta do lokální proměnné. Zároveň se udržuje `useRef` synchronizovaný se stavem pro přístup z closure.

```ts
const selectedAgentRef = useRef<AgentId>(selectedAgent);
useEffect(() => { selectedAgentRef.current = selectedAgent; }, [selectedAgent]);

async function sendMessage() {
  const targetAgent = selectedAgentRef.current; // snapshot při odeslání
  // všechny setState v callbacku používají targetAgent, ne selectedAgent
}
```

## Alternativy které byly zvažovány

- **AbortController** — zrušit stream při přepnutí agenta; jednodušší ale ztrácíme odpověď
- **Disable přepínání během streamu** — UX degradace, uživatel musí čekat
- **Ignore** — race condition je viditelná jen pokud uživatel přepne *přesně* během streamu; akceptovatelné riziko pro MVP

## Důsledky

**Pozitivní:**
- Uživatel může přepnout agenta kdykoliv — stream doběhne správnému agentovi na pozadí
- Žádná ztráta odpovědi

**Negativní / trade-offs:**
- Mírně složitější logika v `sendMessage` — třeba rozumět ref vs. state rozdílu při code review

## Kdy přehodnotit

Pokud by bylo potřeba umožnit zrušení streamu (např. tlačítko Stop) — pak kombinace ref + AbortController.
