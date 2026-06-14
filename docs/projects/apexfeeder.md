# ApexFeeder

**Stav:** DOKONČEN 2026-06-14
**Typ:** pracovní projekt  
**Repo:** `/Users/michalscerba/AI-Projects/Personal/apex-feeder`  
**Hosting:** Railway  
**Port:** 8001  

---

## Co projekt dělá

ApexFeeder načítá historická OHLCV data z CSV nebo Tradovate demo API, resampleuje je do čtyř timeframů a přehrává je svíčku po svíčce přes WebSocket na ApexEngine. Rychlost přehrávání je plně konfigurovatelná.

**Pipeline:**
```
CSV / Tradovate API (M5 OHLCV)  →  resample  →  [M5, M15, H4, D1]  →  WebSocket stream  →  ApexEngine
```

---

## Stack

| Vrstva | Nástroj |
|--------|---------|
| Jazyk | Python |
| Server | FastAPI + WebSocket |
| Port | 8001 |
| Vstup | CSV soubor nebo Tradovate demo API |
| Timeframy | M5, M15, H4, D1 |
| Výstup | WebSocket stream svíček (JSON) |
| Rychlost | Konfigurovatelná (`SPEED_MULTIPLIER`) |
| Hosting | Railway |
| Credentials | `python-dotenv` + `.env` (nikdy hardcoded) |

---

## Co aplikace neřeší

- Žádná SMC logika
- Žádná analýza dat
- Žádný frontend

---

## Fáze

| # | Milestone | Stav |
|---|-----------|------|
| 1 | MVP — FastAPI WebSocket feeder (CSV + Tradovate) | ⏳ probíhá |
| 2 | Deploy na Railway | ⬜ todo |

### Fáze 1 — detaily

| # | Krok | Stav |
|---|------|------|
| 1 | Složková struktura + prázdné soubory | ✅ |
| 2 | `requirements.txt` | ✅ |
| 3 | `config.py` | ✅ |
| 4 | `feeder/csv_loader.py` + testy | ✅ |
| 5 | `feeder/resampler.py` + testy | ✅ |
| 6 | `feeder/session.py` | ✅ |
| 7 | `main.py` | ✅ |
| 8 | E2E test (CSV mode) | ✅ |
| 9 | `base_loader.py` + Tradovate config + loader factory | ✅ |
| 10 | `tradovate_loader.py` + unit testy | ✅ |
| 11 | Integration test WebSocket — CSV mode | ✅ |
| 12 | Live Tradovate login test | ⏳ čeká na rate limit reset |

---

## Open otázky

- Formát zprávy přes WebSocket (JSON struktura svíčky) — vyřešeno: `{type, timeframe, timestamp, open, high, low, close, volume}`
- Synchronizace více timeframů — vyřešeno: vyšší TF se emituje hned po M5 svíčce, která uzavírá periodu
