# WSP Automatizace

## Co to dělá

AI-powered nástroj pro mapování pojistných rizik z číselníků 4 českých pojišťoven (Kooperativa, DIRECT, ČPP, Generali) do standardizované taxonomie pojištění majetku fyzických osob (L1/L2/L3).

**Problém:** WSP má data od 4 pojišťoven, každá pojmenovává rizika jinak. Ručně zmapovat ~1 773 unikátních rizik do společné taxonomie je časově náročné a náchylné k chybám.

**Řešení:** Kombinace Python PoC skriptů + Next.js Review UI + in-context KB mapování pomocí Claude Code.

## Stack

| Vrstva | Technologie |
|--------|-------------|
| PoC mapování | Python + openpyxl |
| DB | SQLite + Prisma 6 |
| Review UI | Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/ui |
| KB mapování | Claude Code in-context (property-vault znalostní báze) |
| Seed scripty | TypeScript + tsx |

## Stav

**AKTIVNÍ — Fáze 4 ✅ dokončena (2026-06-20)**

Validace & čištění dokončena. 734 confirmed, 0 pending, 485 skipped. Pokrok 100 % u všech pojišťoven.

## Výsledky — celkový přehled

### Fáze 1 PoC (automatické mapování)

| Pojišťovna | Celkem | In scope | Automaticky | Manual review | Out of scope |
|------------|--------|----------|-------------|---------------|--------------|
| Kooperativa | 139 | 22 | 3 (2 %) | 19 | 116 |
| DIRECT | 254 | 236 | 73 (29 %) | 163 | 3 |
| ČPP | 318 | 128 | 3 (1 %) | 125 | 189 |
| Generali | 1 062 | 816 | 177 (17 %) | 639 | 246 |
| **Celkem** | **1 773** | **1 202** | **256 (21 %)** | **946** | **554** |

### Fáze 3b KB Mapování (in-context, property-vault)

| Pojišťovna | Script | Confirmed | Skipped | Metoda |
|------------|--------|-----------|---------|--------|
| ČPP | `apply_cpp_mapping.ts` | 113 | 16 | property-vault/active/cpp.md |
| Kooperativa | `apply_kooperativa_mapping.ts` | 23 | 0 | property-vault/active/kooperativa.md |
| DIRECT | `apply_direct_mapping.ts` | 248 | 3 | naming pattern |
| Generali | `apply_generali_mapping.ts` | 643 | 173 | produktové kódy + naming |
| **Celkem** | | **1 027** | **192** | |

**Pokrytí in-scope:** 1 027 / 1 202 = **85 %** (oproti 21 % po PoC)

## Fáze projektu

| Fáze | Název | Stav |
|------|-------|------|
| 0 | Příprava & pochopení dat | ✅ 2026-06-19 |
| 1 | PoC AI mapování (4 pojišťovny) | ✅ 2026-06-19 |
| 2 | DB schema + seed | ✅ 2026-06-19 |
| 3 | Review UI (Next.js) | ✅ 2026-06-19 |
| 3b | KB Mapování (property-vault) | ✅ 2026-06-20 |
| 4 | Validace & čištění | ✅ 2026-06-20 |
| 5 | Export výsledků (CSV/Excel) | 🔲 TODO |
| 6 | Polish (keyboard shortcuts, bulk ops) | 🔲 volitelné |

## Repo

GitHub: `github.com/MichalScerba/wsp-automatizace` (private)  
Lokálně: `/Users/michalscerba/AI-Projects/Work/wsp-automatizace/`

`data/raw/*.xlsx` a `.env` jsou v `.gitignore` — citlivá data pojišťoven nejdou do gitu.

## Taxonomie

Zdroj: `data/wsp_majetek_struktura.json`

- **L1 (4):** Nemovitost (5) | Domácnost (6) | Odpovědnost (7) | Asistenční služby (8)
- **L2 Nemovitost (8):** Základní živel (22), Rozšířený živel (23), Povodeň a záplava (24), Vodovodní škody (25), Odcizení a vandalismus (26), Skla (27), Elektro (28), Ostatní (29)
- **L2 Domácnost (8):** Základní živel (30), Rozšířený živel (31), Povodeň a záplava (32), Vodovodní škody (33), Odcizení a vandalismus (34), Skla (35), Elektro (36), Ostatní (37)
- **L2 Odpovědnost (4):** Běžný OŽ (38), Držba nemovitosti (39), Pronajímatel (40), Nájemce (41)
- **L2 Asistenční (1):** Asistenční služby (42)
- **L3:** 107 specifických událostí

## Klíčová architektonická rozhodnutí

| Rozhodnutí | Alternativa | Důvod |
|-----------|-------------|-------|
| SQLite místo Supabase | Supabase | Lokální projekt, citlivá data, žádný cloud potřeba |
| tsx místo ts-node | ts-node | Prisma 6 generuje ESM TypeScript, ts-node s CommonJS nefunguje |
| KB mapování místo ručního review | 946× manuální review | 1 session → 800 ručních hodin úspory |
| In-context Claude místo API | Batch API | Rychlost iterace, žádné API rate limity pro PoC |
| Absolutní cesta v DATABASE_URL | Relativní | Prisma query engine ignoruje CWD procesu |
| Package rizika → L1 only | L1+L2 guess | Bundle = nelze určit jeden L2 bez hazardování |

## Mapovací skripty

| Script | Fáze | Popis |
|--------|------|-------|
| `scripts/generate_mapping.py` | 1 | Python PoC — Kooperativa |
| `scripts/generate_direct_mapping.py` | 1 | Python PoC — DIRECT |
| `scripts/generate_cpp_mapping.py` | 1 | Python PoC — ČPP |
| `scripts/generate_generali_mapping.py` | 1 | Python PoC — Generali |
| `scripts/apply_cpp_mapping.ts` | 3b | KB → seed — ČPP |
| `scripts/apply_kooperativa_mapping.ts` | 3b | KB → seed — Kooperativa |
| `scripts/apply_direct_mapping.ts` | 3b | Pattern → seed — DIRECT |
| `scripts/apply_generali_mapping.ts` | 3b | Product codes → seed — Generali |
| `scripts/confirm_out_of_scope.ts` | 4 | Bulk-skip 554 out-of-scope rizik |
| `scripts/apply_generali_missing_l1.ts` | 4 | Oprava 146 Generali confirmed bez L1 |
| `scripts/skip_part1_koop_cpp.ts` | 4 | Vyřazení 70 Kooperativa+ČPP (balíčky, objekty) |
| `scripts/skip_part2_generali_objects.ts` | 4 | Vyřazení 156 Generali (pattern: Pojistná částka, Limit na objekt, Sublimit) |
| `scripts/skip_part3_generali_bundles.ts` | 4 | Vyřazení 58 Generali (balíčky krytí, objekty bez suffixu) |
| `scripts/confirm_part4_real_risks.ts` | 4 | Potvrzení 8 Generali skutečných rizik s L2 |
| `scripts/analyze_pending.ts` | 4 | Utility — výpis aktuálních pending rizik |
| `scripts/final_stats.ts` | 4 | Utility — finální statistiky per pojišťovna |

## Fáze 4 — klíčové poznatky (Validace & čištění)

### Taxonomický rozdíl

| Typ záznamu | Popis | Akce |
|-------------|-------|------|
| **Riziko (peril)** | Co se může stát: Povodeň, Krádež, Přepětí | POTVRDIT + L2 |
| **Předmět pojištění (object)** | Co je pojištěno: Rodinný dům, Soubor movitých věcí | VYŘADIT |
| **Balíček krytí (bundle)** | Soubor více rizik: OPTI, Základní, Nadstandardní | VYŘADIT |
| **Limit / Pojistná částka** | Finanční parametr: "- Pojistná částka", "- Sublimit" | VYŘADIT |

### Identifikační vzory předmětů pojištění v názvech

- Obsahuje `Pojistná částka` → finanční parametr objektu → vyřadit
- Obsahuje `Limit plnění na objekt TIA` → limit objektu → vyřadit
- Obsahuje `Doporučený limit plnění na objekt TIA` → limit objektu → vyřadit
- Obsahuje `Sublimit` → sublimit objektu → vyřadit

### Finální výsledky validace

| Část | Záznamy | Akce |
|------|---------|------|
| Kooperativa 12 + ČPP 58 | 70 | Vyřazeno (balíčky + předměty pojištění) |
| Generali — pattern-based | 156 | Vyřazeno (Pojistná částka / Limit na objekt / Sublimit) |
| Generali — balíčky + objekty bez suffixu | 58 | Vyřazeno |
| Generali — skutečná rizika | 8 | Potvrzeno s L2 |
| **Celkem vyřešeno** | **292** | |

### 8 potvrzených rizik z Části 4

| ID | Riziko | L1 | L2 |
|----|--------|----|----|
| 2542 | Poškození stavebních součástí (all risk) | Nemovitost | Ostatní (29) |
| 2632 | Poškození stav. souč. (all risk) - Limit plnění TIA | Nemovitost | Ostatní (29) |
| 2993 | Náhrada výdajů za ztrátu nájmu | Nemovitost | Ostatní (29) |
| 2635 | Náhrada výdajů za ztrátu nájmu - Limit plnění TIA | Nemovitost | Ostatní (29) |
| 2535 | Základní rozsah pojištění - Limit plnění (OH) | Odpovědnost | — |
| 2791 | Základní rozsah pojištění (OH) | Odpovědnost | — |
| 3033 | Základní rozsah / All Risk ODP (MD) | Odpovědnost | — |
| 3482 | základní rozsah - Limit plnění - odpovědnost (MD) | Odpovědnost | — |

### Finální DB stav (2026-06-20)

| Pojišťovna | Confirmed | Pending | Skipped | Pokrok |
|------------|-----------|---------|---------|--------|
| DIRECT | 248 | 0 | 3 | 100 % |
| Generali | 420 | 0 | 396 | 100 % |
| Kooperativa | 11 | 0 | 12 | 100 % |
| ČPP | 55 | 0 | 74 | 100 % |
| **Celkem** | **734** | **0** | **485** | **100 %** |

### UI změny (Fáze 4)

- Odebrány insurer tabs nahoře → pojišťovny jen v levém sidebaru
- Status filtr přesunut doleva pod název stránky
- "Přeskočeno" → "Vyřazeno" (tab + badge v listu i detail stránce)
- "Přeskočit" → "Vyřadit" (tlačítko ve formuláři)
- StatsBar pokrok: `confirmed / (confirmed + pending)` — vyřazená rizika nevstupují do jmenovatele
- ReviewSidebar: zachovává status filtr při přepínání mezi pojišťovnami
- L1/L2 kaskádní filtr (`components/TaxonomyFilter.tsx`) — dropdown vpravo vedle status tabů; L2 se mění podle vybraného L1; filtr se zachovává při stránkování, přepínání pojišťoven i statusů; URL param `?l1=5&l2=22`

## Fáze 4b — Bug fixes L1/L2 filtr + testy (2026-06-20)

### Opravené bugy

| Bug | Příčina | Oprava |
|-----|---------|--------|
| L1=Nevybráno → L2 zůstalo nastavené (l2=22) → 0 výsledků | `navigate()` mazal L2 z URL, ale `buildUrl` v status tabech ho znovu přidával | `buildUrl` vynucuje `l2=none` když `l1=none` |
| `l2="none"` způsobilo `parseInt("none") = NaN` v Prisma query | Chybějící ošetření `none` hodnoty ve where clause | `l2 === "none" ? { l2Id: null } : l2 ? { l2Id: parseInt(l2) } : {}` |
| L2 dropdown nešel kliknout bez vybraného L1 | `disabled={!l1Value}` blokoval L2 i při prázdném L1 | L2 vždy aktivní; při prázdném L1 zobrazí všechny L2 seskupené přes `<optgroup>` |
| L2 nemělo možnost "Nevybráno" | Chybějící option | Přidáno `<option value="none">Nevybráno</option>` |
| L1=Nevybráno → L2 auto-nestalo na Nevybráno | L1 onChange předával `undefined` pro L2 | L1 onChange předává `"none"` pro L2 když vybráno `"none"` |

### Klíčová pravidla URL stavu

- `?l1=none` → vždy musí být i `?l2=none` (buildUrl to vynucuje)
- `l2=none` → `{ l2Id: null }` v Prisma where
- `l1=none` → odstraňuje `inScope: { not: "false" }` (zobrazí i out-of-scope záznamy bez L1)
- Kombinace `l1=none + l2=22` je nevalidní stav — UI ji neumožní, buildUrl ji opraví

### Testy

Přidán Vitest + React Testing Library (`__tests__/`):
- `url-logic.test.ts` — 13 testů pro `buildUrl` a `buildWhere` logiku
- `TaxonomyFilter.test.tsx` — 13 testů pro chování komponenty (navigate, disabled state, cascade)
- Spustit: `npm test`

## Otevřené úkoly

- [ ] Export CSV/Excel potvrzených rizik (Fáze 5)
- [ ] Keyboard shortcuts pro rychlé korekce (Fáze 6, volitelné)

## Kontakt

Pracovní projekt — WSP (pojišťovací makléř).  
Deadline: 26. 6. 2026.  
Citlivá data — excel soubory s čísly smluv, nesdílet.
