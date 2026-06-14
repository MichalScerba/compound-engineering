# ApexFeeder

**Stav:** DOKONČEN 2026-06-14  
**Typ:** pracovní projekt  
**Repo:** `/Users/michalscerba/AI-Projects/Personal/apex-feeder`  
**Hosting:** lokálně (Railway přeskočen)  
**Port:** 8001  

---

## Co projekt dělá

ApexFeeder načítá historická OHLCV data z Databento CSV (nebo Tradovate demo API), resampleuje je do čtyř timeframů a přehrává je svíčku po svíčce přes WebSocket na ApexEngine. Rychlost přehrávání je plně konfigurovatelná.

**Pipeline:**
```
Databento CSV (M1 OHLCV)  →  front month filter  →  M1→M5 resample  →  [M5, M15, H4, D1]  →  WebSocket stream  →  ApexEngine
```

---

## Stack

| Vrstva | Nástroj |
|--------|---------|
| Jazyk | Python |
| Server | FastAPI + WebSocket |
| Port | 8001 |
| Vstup | Databento CSV (M1, multi-contract) nebo Tradovate demo API |
| Timeframy | M5, M15, H4, D1 |
| Výstup | WebSocket stream svíček (JSON) |
| Rychlost | `SPEED_MULTIPLIER` env var (0 = max) |
| Credentials | `python-dotenv` + `.env` |

---

## WebSocket zpráva

```json
{"type": "candle", "timeframe": "M5", "timestamp": "2024-01-01T23:00:00Z", "open": 17019.0, "high": 17022.5, "low": 17013.75, "close": 17016.25, "volume": 1257}
```

---

## Co aplikace neřeší

- Žádná SMC logika
- Žádná analýza dat
- Žádný frontend

---

## Výsledky

- **Data:** 2024-01-01 → 2026-06-12, Databento NQ futures
- **173 310 M5 svíček** po front month filtru a M1→M5 resamplu
- **235 481 celkových eventů** (M5 + M15 + H4 + D1)
- Timestamps chronologické ✅, všechny 4 timeframy ✅

---

## Fáze

| # | Milestone | Stav |
|---|-----------|------|
| 1 | MVP — FastAPI WebSocket feeder | ✅ HOTOVO |
| 2 | Deploy na Railway | ⛔ přeskočeno — lokální provoz |

### Fáze 1 — detaily

| # | Krok | Stav |
|---|------|------|
| 1 | Složková struktura | ✅ |
| 2 | `requirements.txt` | ✅ |
| 3 | `config.py` | ✅ |
| 4 | `feeder/csv_loader.py` + testy | ✅ |
| 5 | `feeder/resampler.py` + testy | ✅ |
| 6 | `feeder/session.py` | ✅ |
| 7 | `main.py` | ✅ |
| 8 | E2E testy | ✅ |
| 9 | `base_loader.py` + Tradovate config + loader factory | ✅ |
| 10 | `tradovate_loader.py` + unit testy | ✅ |
| 11 | Databento CSV — front month filter + M1→M5 resample | ✅ |
| 12 | Live WebSocket test s reálnými daty | ✅ |
