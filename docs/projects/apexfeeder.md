# ApexFeeder

**Stav:** AKTIVNÍ — zahájeno 2026-06-13  
**Typ:** pracovní projekt  
**Repo:** zatím nevytvořen  
**Hosting:** Railway  
**Port:** 8001  

---

## Co projekt dělá

ApexFeeder načítá historická OHLCV data z CSV, resampleuje je do čtyř timeframů a přehrává je svíčku po svíčce přes WebSocket na ApexEngine. Rychlost přehrávání je plně konfigurovatelná.

**Pipeline:**
```
CSV (M5 OHLCV)  →  resample  →  [M5, M15, H4, D1]  →  WebSocket stream  →  ApexEngine
```

---

## Stack

| Vrstva | Nástroj |
|--------|---------|
| Jazyk | Python |
| Server | FastAPI + WebSocket |
| Port | 8001 |
| Vstup | CSV soubor (M5 OHLCV data) |
| Timeframy | M5, M15, H4, D1 |
| Výstup | WebSocket stream svíček |
| Rychlost | Konfigurovatelná (SPEED_MULTIPLIER) |
| Hosting | Railway |

---

## Co aplikace neřeší

- Žádná SMC logika
- Žádná analýza dat
- Žádný frontend

---

## Fáze

| # | Milestone | Stav |
|---|-----------|------|
| 1 | Projekt inicializován, FastAPI server běží | ⬜ todo |
| 2 | CSV načítání + resample do 4 timeframů | ⬜ todo |
| 3 | WebSocket stream svíčku po svíčce | ⬜ todo |
| 4 | SPEED_MULTIPLIER konfigurace | ⬜ todo |
| 5 | Deploy na Railway | ⬜ todo |

---

## Open otázky

- Formát zprávy přes WebSocket (JSON struktura svíčky)?
- Jak ApexEngine konzumuje stream — pull nebo push?
- Synchronizace více timeframů (každý má jiný počet svíček)?
