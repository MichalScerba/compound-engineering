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

**AKTIVNÍ — Fáze 3b ✅ dokončena (2026-06-20)**

Všechny 4 pojišťovny plně namapovány. 0 pending rizik.

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
| 4 | Export výsledků (CSV/Excel) | 🔲 TODO |
| 5 | Validace & čištění | 🔲 TODO |
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

| Script | Pojišťovna | Metoda |
|--------|-----------|--------|
| `scripts/generate_mapping.py` | Kooperativa | Python PoC |
| `scripts/generate_direct_mapping.py` | DIRECT | Python PoC |
| `scripts/generate_cpp_mapping.py` | ČPP | Python PoC |
| `scripts/generate_generali_mapping.py` | Generali | Python PoC |
| `scripts/apply_cpp_mapping.ts` | ČPP | KB → TypeScript seed |
| `scripts/apply_kooperativa_mapping.ts` | Kooperativa | KB → TypeScript seed |
| `scripts/apply_direct_mapping.ts` | DIRECT | Pattern → TypeScript seed |
| `scripts/apply_generali_mapping.ts` | Generali | Product codes → TypeScript seed |

## Otevřené úkoly

- [ ] Export CSV/Excel potvrzených rizik (Fáze 4)
- [ ] Validace out-of-scope seznamů (Fáze 5)
- [ ] Keyboard shortcuts pro rychlé korekce (Fáze 6, volitelné)

## Kontakt

Pracovní projekt — WSP (pojišťovací makléř).  
Deadline: 26. 6. 2026.  
Citlivá data — excel soubory s čísly smluv, nesdílet.
