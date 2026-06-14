# Lekce — ApexFeeder: debugování externích API

**Datum:** 2026-06-13  
**Projekt:** ApexFeeder  
**Typ:** Lessons learned při integraci s Tradovate demo API

---

## Co se stalo

Tradovate přihlášení selhávalo s chybou "Incorrect username or password". Credentials byly správně nastavené od začátku. Hodinu jsme debugovali heslo, formát emailu a `.env` soubor — vše zbytečně.

Skutečná příčina: **rate limit 5 pokusů za hodinu**. Tradovate ho maskuje generickou auth chybou místo jasného "Too Many Requests". Skutečná chybová zpráva (`Rate limit exceeded`) se zobrazila pouze jednou — po překročení limitu podruhé.

Druhý problém: rate limit jsme sami způsobili opakovanými `python -c` voláními při debugování. Každý pokus spálil jeden ze 5 povolených pokusů.

---

## Lekce

### 1. Před debugováním credentials ověř rate limit

Pokud API vrátí auth chybu a credentials vypadají správně → **první hypotéza je rate limit, ne špatné heslo**.

Zkontroluj:
- Status code (429 = rate limit, ale API ho může schovat za 200)
- Response body na klíčová slova: `rate`, `limit`, `throttle`, `too many`, `ticket`, `captcha`
- Zda jsi volal API víckrát za sebou

### 2. Při debugování API nevolej endpoint opakovaně ručně

Každé `python -c "requests.post(...)"` při ladění = spálený pokus z rate limitu. Místo toho:
- Debuguj logiku offline (mock response)
- Pokud musíš volat live, udělej to jednou a zaloguj celou response
- Teprve pak spusť test

### 3. Nikdy nevypisuj credentials při debugování

Při debugování `.env` jsem vypsal heslo přes `repr()` do terminálu a pak ho citoval v chatu. Správná praxe:
- Vypiš pouze `len(password)` a první znak
- Nikdy celou hodnotu — ani do terminálu, ani do chatu

### 4. Trading API mohou být offline o víkendu

Tradovate demo API bylo nedostupné v sobotu. Futures trhy jsou zavřené Sat–Sun a demo prostředí to odráží. Při integraci s trading API plánuj testování na pracovní dny.

---

## Jak to udělat příště

```python
# Při first-time auth selhání: zkontroluj rate limit v response
data = resp.json()
if data.get("p-captcha") or "rate" in str(data).lower() or resp.status_code == 429:
    # Rate limit — počkej, nevolej znovu
    ...
```

Test soubor by měl rate limit detekovat a označit test jako `SKIPPED`, ne `FAILED`.
