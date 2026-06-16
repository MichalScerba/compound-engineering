# Lekce: SMC Backtest Optimalizace — ApexEngine smc_v2

**Projekt:** ApexEngine  
**Datum:** 2026-06-16  
**Kontext:** Iterativní ladění SMC v2 strategie na NQ 2020 datech (69 730 M5 svíček)

---

## 1. O(n²) backtest tě zabije — předkonvertuj data jednou

**Problém:** První verze backtestovacího skriptu volala `df[df.index <= ts]` pro každou M5 svíčku — O(n²) = odhad 15+ minut na 70k svíček.

**Řešení:** Prekonverze všech DataFrame na listy slovníků jednou před smyčkou. Pointer indexy (bisect-like) pro synchronizaci vyšších TF.

```python
m5_all = [_to_candle(r.iloc[0], r.iloc[1:].to_dict()) for _, r in df.iterrows()]
# Pak v smyčce:
while m15_i + 1 < len(m15_all) and m15_all[m15_i+1]["timestamp"] <= ts:
    m15_i += 1
```

**Výsledek:** Backtest za < 30 sekund místo 15+ minut.

---

## 2. Fixní SL > dynamický SL při malém vzorku

**Problém:** Dynamický swing SL měl rozsah 16–64 bodů → outlier prohry o 64 bodech ničily statistiky.

**Řešení:** Fixní SL = medián swing range (29 bodů). Normalizovalo výsledky: každá prohra = -29, každá výhra = +RR×29.

**Čísla:** Stejný WR (37.8%), ale PnL +24 → +145 → +464 bodů v závislosti na RR. Fixní SL odstranil variance, ne WR.

**Pravidlo:** U malých vzorků (< 100 obchodů) dynamický SL přidává noise, ne signal. Fixní SL dřív odhalí skutečnou kvalitu strategie.

---

## 3. Vyšší RR ≠ nižší WR (lineárně)

**Pozorování na NQ 2020:**

| RR | WR | PnL |
|----|-----|-----|
| 2.0 | 37.8% | +145 |
| 3.0 | 36.1% | +464 |
| 4.0 | 22.2% | +309 |

RR=3 byl optimum — TP=87 bodů stále dosažitelný v NY session pohybech. RR=4 (TP=116) bylo příliš daleko. Přechod z RR=2 na RR=3 přidal 319 bodů při poklesu WR jen o 1.7 %.

**Pravidlo:** Hledej RR kde TP leží těsně pod přirozenou překážkou (daily high/low, session range). Mechanický nárůst RR má klesající výnosy.

---

## 4. Evaluace same-candle SL+TP — vždy přidej tiebreaker

**Bug:** Když jediná svíčka zasáhla SL i TP, kód vždy počítal SL jako první (loss). U nízkého RR (TP blízko) to nastává často → uměle nižší WR pro nízké RR.

**Fix:** Směr svíčky jako tiebreaker:
- Bullish candle (close > open) → cena šla nejprve nahoru → TP hit první → win
- Bearish candle → SL hit první → loss

```python
if tp_hit and sl_hit:
    bullish_candle = candle["close"] >= candle["open"]
    if trade["bias"] == "bullish":
        sl_hit = not bullish_candle
        tp_hit = bullish_candle
```

**Pravidlo:** Každý backtest evaluátor musí řešit same-candle kolizi explicitně. Defaultní "SL first" je konzervativní, ale zkresluje srovnání nízkých vs. vysokých RR.

---

## 5. Limit order simulace: zkontroluj fill na signálové svíčce

**Bug:** Pending order se vytvořil na svíčce X (krok 3), ale fill se zkoušel až od svíčky X+1 (krok 2). Výsledek: 10 obchodů ztraceno, WR propadl na 18.5%.

**Fix:** Po vytvoření pending orderu ihned zkusit fill na aktuální svíčce:

```python
pending_order = {...}
filled = _try_fill_limit(pending_order, candle_m5)
if filled:
    # zpracuj hned
    pending_order = None
```

**Pravidlo:** V backtestovacích smyčkách: akce a jejich efekty musí být konzistentní na stejné iteraci — nebo musíš explicitně dokumentovat, proč se odkládají.

---

## 6. WR>60% s 50+ obchody ≠ profitabilní strategie

**Experiment:** Parameter sweep 41 kombinací (RR × cooldown × window × limity).

**Nález:** WR>60% a ≥50 obchodů je dosažitelné jen při RR≤0.25, kde break-even WR = **80%**. Naše 69.9% → stále záporné PnL (-1 080 bodů).

**Matematika:**
```
EV = WR × (RR × SL) - (1-WR) × SL = SL × (WR × (1+RR) - 1)
Pro kladné EV: WR > 1 / (1 + RR)

RR=0.25 → break-even = 80%
RR=0.5  → break-even = 66.7%
RR=1.0  → break-even = 50%
RR=3.0  → break-even = 25%
```

**Pravidlo:** Nikdy neoptimalizuj na WR samotné. WR je bezcenný bez kontextu RR. Správná metrika je Expected Value per trade = WR × reward - (1-WR) × risk.

---

## 7. Filtry bez lepší selekce signálů jen snižují objem

**Testováno:**
- HVN na entry ceně → -87 PnL oproti baseline (odřízl výhry)
- HVN na místě obratu → -87 PnL (stejný problém)
- Sweep impulse 1.5× → 6 obchodů, 50% WR, +174 (statisticky bezvýznamné)
- Sweep impulse 1.0× → 11 obchodů, 36.4% WR (stejné WR jako bez filtru)

**Závěr:** Filtr přidaný "na top" bez rozumění proč konkrétní signál selhává jen redukuje sample size. Nevylepšuje WR, protože nevybírá lepší signály — jen méně.

**Pravidlo:** Filtr má smysl jen pokud vychází z jasně identifikovaného problémového vzoru (např. "10 z 23 proher bylo v ranním pre-market"). Ne jako obecný sweep hledající lepší čísla.

---

## 8. Monkey-patching modulu pro paramterický sweep — funguje, ale opatrně

**Technika:** Pro rychlý sweep bez subprocess volání: patch module-level konstant přímo.

```python
import engine.strategies.smc_v2.entry as entry_mod
entry_mod.RR = 1.0  # funkcí v entry.py čteny za runtime z globals()
```

**Funguje protože:** Python funkce resolvují globální jména z `module.__dict__` za runtime, ne za compile time.

**Nefunguje pokud:** Konstanta je importována do jiného modulu jako `from X import CONST` — tam vznikne lokální binding, patch neprojde.

**Pravidlo:** Pro sweep ověř, že patchované konstanty jsou accessed jako module globals, ne jako lokální importy. Nebo použij subprocess s argparse — čistší, ale pomalejší.

---

## 9. Backtest na 1 rok dat nestačí pro statistické závěry

36 obchodů za rok = příliš malý vzorek. Každá analýza filtru mění výsledek o ±1-3 obchodech — to je hluk, ne signal.

**Minimum pro rozhodování:** 100+ obchodů = ~3 roky NQ dat. Teprve pak má smysl porovnávat konfigurace.

**Pravidlo:** Před laděním parametrů ověř, zda máš dostatečný sample. Pokud ne, prioritou je nejdřív získat data.
