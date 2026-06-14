# ApexEngine

**Stav:** AKTIVNÍ — zahájeno 2026-06-14  
**Typ:** pracovní projekt  
**Repo:** `/Users/michalscerba/AI-Projects/Personal/apex-engine`  
**Hosting:** lokálně  
**Porty:** backend 8000, frontend 3000  

---

## Co projekt dělá

ApexEngine přijímá svíčky z ApexFeeder přes WebSocket, spouští top-down SMC analýzu přes 4 timeframy (D1 → H4 → M15 → M5) a vyhodnocuje vstupy a výstupy obchodů. Výsledky zobrazuje na Next.js dashboardu.

**Pipeline:**
```
ApexFeeder (ws://localhost:8001) → ws_client → TimeframeManager → SMC Engine (5 pravidel) → Evaluator → TradeLogger → Frontend
```

---

## Stack

| Vrstva | Nástroj |
|--------|---------|
| Backend | Python + FastAPI, port 8000 |
| Frontend | Next.js 14 + TypeScript, port 3000 |
| Grafy — svíčky | TradingView Lightweight Charts |
| Grafy — statistiky | Plotly |
| Data source | ApexFeeder ws://localhost:8001 |
| Výstup | `results/backtest_results.json` |

---

## SMC pravidla (top-down)

| # | Soubor | Logika |
|---|--------|--------|
| 1 | `bias.py` | Denní bias — bullish/bearish z D1 + H4 CHoCH |
| 2 | `asia_session.py` | Asia session high/low breakout (00:00–08:00 GMT+1) |
| 3 | `fvg_ob.py` | Fair Value Gap a Order Block na M15 |
| 4 | `pullback.py` | BOS vs CHoCH — pullback nebo breakdown |
| 5 | `fibonacci_ote.py` | OTE vstup na M5 (0.618–0.705 Fibonacci) |

---

## Fáze

| # | Milestone | Stav |
|---|-----------|------|
| 1 | Backend — struktura, ws_client, TimeframeManager, 5 pravidel, signal, evaluator, logger, main | ⬜ todo |
| 2 | Frontend — StatusBar, Chart, Stats, TradeLog | ⬜ todo |
| 3 | E2E — ApexFeeder + ApexEngine paralelně, první backtest výsledky | ⬜ todo |
