# ApexEngine

**Stav:** FÁZE 6 AKTIVNÍ — 2026-06-16 (backtest + parameter sweep dokončen)  
**Typ:** pracovní projekt (research / backtest)  
**Repo:** `/Users/michalscerba/AI-Projects/Personal/apex-engine`  
**Hosting:** lokálně  
**Porty:** backend 8000, frontend 3000

---

## Co projekt dělá

ApexEngine přijímá svíčky z ApexFeeder přes WebSocket, spouští top-down SMC analýzu přes 4 timeframy (D1 → H4 → M15 → M5) a vyhodnocuje vstupy a výstupy obchodů. Výsledky zobrazuje na Next.js dashboardu s live grafem, statistikami a trade logem.

**Pipeline:**
```
ApexFeeder (ws://127.0.0.1:8001/ws)
  → ws_client.py
  → TimeframeManager (rolling buffer D1/H4/M15/M5)
  → signal.py (5 SMC pravidel)
  → evaluator.py (sledování otevřených obchodů)
  → trade_logger.py (results/backtest_results.json)
  → Frontend WebSocket /live → Chart + Stats + TradeLog
```

---

## Stack

| Vrstva | Nástroj |
|--------|---------|
| Backend | Python 3.9 + FastAPI, port 8000 |
| Frontend | Next.js 16.2.7 + TypeScript, port 3000 |
| Grafy — svíčky | TradingView Lightweight Charts v5 |
| Grafy — statistiky | Plotly (react-plotly.js) |
| UI komponenty | shadcn/ui + Tailwind CSS |
| Data source | ApexFeeder ws://127.0.0.1:8001/ws |
| Výstup | `results/backtest_results.json` |

---

## SMC pravidla (top-down, musí projít všechna)

| # | Soubor | Logika |
|---|--------|--------|
| 1 | `bias.py` | D1 SMC model — 4 pravidla: breakout_high, breakout_low, sweep_high (bearish reversal), sweep_low (bullish reversal) |
| 2 | `asia_session.py` | Asia session high/low breakout (00:00–08:00 GMT+1 → H4 close mimo rozsah) |
| 3 | `fvg_ob.py` | Fair Value Gap nebo Order Block na M15 ve směru biasu |
| 4 | `pullback.py` | ZONE_TOUCH_LOOKBACK=10; BOS po dotyku zóny (pullback OK) vs CHoCH nebo >0.705 Fib (breakdown = stop) |
| 5 | `fibonacci_ote.py` | OTE vstup na M5 (0.55–0.75 Fibonacci) ∩ FVG/OB zóna — průnik musí existovat, SL 2 ticky za zónou |

**Entry parametry:** SL 2 ticky za entry_low/entry_high, TP na R:R 1:3

---

## Fáze a stav

| # | Milestone | Stav |
|---|-----------|------|
| 1 | Backend — struktura, ws_client, TimeframeManager, 5 pravidel, signal, evaluator, logger, main | ✅ HOTOVO |
| 2 | Frontend — StatusBar, Chart, Stats, TradeLog | ✅ HOTOVO |
| 3 | E2E — ApexFeeder + ApexEngine paralelně, první backtest výsledky | ✅ HOTOVO |
| 3b | Backtest UX — start/pause/stop/reset controls, sessions management | ✅ HOTOVO |
| 5 | Audit trail — decision_trace, setup, MFE/MAE, exit_reason; zone selection fix; Asia session same-day bug fix; debug_signals.py | ✅ HOTOVO |
| 4b | Risk Manager — TopStop Challenge rules: time blocks, daily/weekly limits, position sizing, force close; GET /risk/status; StatusBar risk display | ✅ HOTOVO |
| 6a | Chart markers — history: malá šipka na entry + W/L/T dot na exit; click detection → vybere obchod; onSelectTrade callback přes MultiChart → page | ✅ HOTOVO |
| 6b | Engine diagnostika — asia_session 2 bugy, pullback historický lookback, OTE∩zone průnik, bias SMC sweep model | ✅ HOTOVO |

---

## Výsledky backtestu

### NQ 2020 (reálná data, 69 730 M5 svíček, bias v1 — breakout only)
**Datum:** 2026-06-15

| Metrika | Hodnota |
|---------|---------|
| Celkem obchodů | 23 |
| Výhry / Prohry | 2 / 21 |
| Win rate | 8.7 % |
| PnL | -280.87 bodů |
| Avg win | +40.78 bodů |
| Avg loss | -17.26 bodů |

Identifikované problémy: chybí pravidlo max 1 otevřený obchod, bias model ignoroval sweep reversals.

### Syntetická data (generate_sample.py, ~5 000 svíček)
| Metrika | Hodnota |
|---------|---------|
| Celkem obchodů | 328 |
| Win rate | 89.94 % |
| Profit factor | 26.82 |

> Syntetická data jsou random walk — hodnoty nereprezentují reálný výkon.

---

## Klíčové technické poznámky

**Python:**
- Python 3.9: `Optional[str]` místo `str | None`; `datetime.fromisoformat()` nepodporuje "Z" → `.replace("Z", "+00:00")`
- `check_asia_session_breakout` potřebuje timezone-aware datetime; `current_timestamp = h4_candles[-1]["timestamp"]` (ne M5 timestamp)
- `ws_client.py` pořadí: evaluate open trades → add to buffer → broadcast candle → analyze signal

**TypeScript / Next.js:**
- `@/*` alias mapuje na `frontend/` root → importy z `@/src/...`
- `UTCTimestamp` = Unix sekundy (ne ms)
- Price lines ukládat do `priceLinesRef`, mazat před každým updatem
- `NEXT_PUBLIC_*` env vars se načítají při startu Next.js → restart po změně `.env.local`

**WebSocket / Networking:**
- URL musí být `ws://127.0.0.1:...` ne `ws://localhost:...`  
  Důvod: macOS mapuje `localhost` na IPv6 `::1`, uvicorn poslouchá jen na IPv4 `127.0.0.1`
- Snapshot při připojení (`/live`) obsahuje `candles` + `trades` + `summary`
- Engine ukládá svíčky do `app.state.candles` (max 10 000) → pozdě připojení frontendy dostanou historii

**Data:**
- Minimálně ~1 000 M5 svíček pro první signál (D1 bias = 2 D1 svíčky ≈ 576 M5 + Asia session overlap)
- `sample.csv` = syntetická data; reálný backtest vyžaduje Databento stažení
- Spouštění: `.venv/bin/uvicorn`, env var `CSV_PATH` pro absolutní cestu k CSV

---

## Struktura repozitáře

```
apex-engine/
├── backend/
│   └── engine/
│       ├── main.py              # FastAPI + WebSocket /live + candle storage
│       ├── ws_client.py         # připojení na ApexFeeder, broadcast svíček
│       ├── timeframe_manager.py # rolling buffer 4 TF
│       ├── signal.py            # orchestrátor 5 pravidel
│       ├── evaluator.py         # sledování + uzavírání obchodů
│       ├── trade_logger.py      # JSON výstup + statistiky
│       └── rules/
│           ├── bias.py
│           ├── asia_session.py
│           ├── fvg_ob.py
│           ├── pullback.py
│           └── fibonacci_ote.py
├── frontend/
│   ├── app/page.tsx             # hlavní dashboard + WS napojení
│   └── src/
│       ├── components/
│       │   ├── StatusBar.tsx    # dual WS stav + progress
│       │   ├── Chart.tsx        # lightweight-charts v5 + SMC vrstvy
│       │   ├── Stats.tsx        # Plotly grafy + KPI cards
│       │   └── TradeLog.tsx     # filtrovatelná tabulka obchodů
│       ├── types/
│       │   ├── chart.ts
│       │   └── stats.ts
│       └── config.ts            # WS URLs (127.0.0.1) + speed multiplier
└── docs/
    └── PHASES.md
```

---

## Funnel diagnostika (5 000 M5 svíček, NQ 2020, aktuální model)

| Pravidlo | Průchodnost |
|----------|-------------|
| Bias (sweep model) | 79.0 % |
| Asia session | 18.9 % z bias |
| Zone (FVG/OB) | 91.5 % z Asia |
| Pullback | 34.4 % z zone |
| OTE∩zone (signál) | 11.5 % z pullback → **27 signálů** |

Signály: Mon 9, Tue 1, Thu 11, Fri 6. Hodiny: London open (12–14 UTC) + NY session (15–16 UTC).

Zone konstanty: `MAX_ZONE_DISTANCE_POINTS=20`, `MAX_ZONE_AGE_CANDLES=48`, `MIN_FVG_SIZE_POINTS=5`, `ZONE_PRICE_BUFFER_POINTS=2`.

OTE: `OTE_FIB_LOW=0.55`, `OTE_FIB_HIGH=0.75`, `LOOKBACK=20`, `SL_OFFSET_TICKS=2`.

---

## SMC v2 — výsledky backtestu (2026-06-16)

Nová modulární strategie `smc_v2`: bias → Asia/HVN likvidita → displacement → Fib 0.66 entry.  
Standalone backtest `backtest_v2.py` (O(n), limit order simulace, Praha trade window).

### Nejlepší konfigurace — NQ 2020
| Parametr | Hodnota |
|----------|---------|
| RR | 3.0 |
| SL | 29 bodů fixní (medián swing range) |
| Fib entry | 0.66 |
| Trade window | 15:30–17:30 Praha (CET/CEST) |
| Cooldown | 30 min |
| Obchodů | 36 |
| Win rate | 36.1 % |
| PnL | **+464 bodů** |

### Parameter sweep — 41 kombinací
Cíl WR>60% + ≥50 obchodů: **dosažitelné pouze při RR=0.25**, kde break-even WR=80%. Vždy záporné PnL.

Klíčový nález: WR a PnL jsou oddělené metriky. Správná optimalizační metrika = Expected Value = WR×reward − (1-WR)×risk.

Výsledky: `backend/scripts/sweep_results.csv`

### Testované filtry (vše zhoršilo výsledky vs baseline)
- HVN na entry ceně — odřízl výhry, PnL -87
- HVN na místě obratu — stejný problém
- Sweep impulse 1.5× — 6 obchodů (statisticky bezvýznamné)
- Sweep impulse 1.0× — 11 obchodů, stejné WR jako baseline

---

## Otevřené úkoly / příští kroky

- [ ] **Rozšíření dat** — NQ 2021–2022 (Databento), min. 100 obchodů pro validní závěry
- [ ] **Přepracovat vstupní logiku** — aktuální filtry (HVN, sweep) nepomáhají; zvážit displacement quality score
- [ ] Live trading napojení (paper trading nebo reálný broker)
