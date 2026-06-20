# Lekce: KB-asistované mapování pojistných rizik (WSP Automatizace)

**Datum:** 2026-06-20  
**Projekt:** WSP Automatizace  
**Kontext:** Fáze 3b — hromadné mapování 946 pending rizik 4 pojišťoven do L1/L2/L3 taxonomie pomocí Claude Code in-context

---

## Co jsme řešili

Po PoC (Fáze 1) zbylo 946 rizik označených `manual_review`. Možnosti:
1. Ručně v Review UI — odhadovaný čas: 800+ hodin
2. Batch API — build overhead, latence
3. **In-context mapování s Claude Code** — zvolen přístup

Výsledek: 1 session → 0 pending, 85% pokrytí in-scope rizik.

---

## Per-pojišťovna: co fungovalo

### ČPP (126 pending)

**Vstup:** `property-vault/active/cpp.md` — kompletní KB soubor s produkty, krytimy, výlukami.

**Přístup:** Načíst KB, projít každé riziko, přiřadit L1/L2 dle produktu + kryté události. Package produkty (OPTI/MAXI/MINI tier) → L1 only, L2/L3 null.

**Výsledek:** 113 confirmed, 16 skipped (nejednoznačné bundle/package produkty).

**Proč vault pomohl:** KB soubor explicitně popisoval, jaký produkt kryje jakou událost. Bez toho by ČPP produkty (DOMEX, BYTEX, ÚPIS) byly neprůhledné.

---

### Kooperativa (19 pending)

**Vstup:** `property-vault/active/kooperativa.md`

**Přístup:** Stejný — KB jako primární zdroj, pojistné události jako vodítko pro L2.

**Výsledek:** 19 confirmed, 0 skipped. Nejčistší výsledek.

**Proč vault pomohl:** Kooperativa má kódové produkty bez intuitivního pojmenování. KB přeložila kódy na srozumitelné kategorie.

---

### DIRECT (178 pending)

**Vstup:** Žádný KB soubor — nepotřeba.

**Přístup:** Strukturované pojmenování `{Modul} - {CoverageType} - {SubParam}` neslo veškerou informaci. Modul → L1, CoverageType → L2. Vault byl záloha, ne primář.

**Výsledek:** 175 confirmed, 3 skipped.

**Klíčový pattern:**
- Domácnost modul → L1:6; coverage type → L2 (Základní nebezpečí=30, Vodovodní=33, Krádež=34, Skla=35, Elektro=36, Povodeň=32)
- Stavba/Garáž modul → L1:5 (stejná L2 logika, jiné IDs)
- Odpovědnost modul → L1:7, L2:38
- Asistence modul → L1:8, L2:42
- Standalone "Základní nebezpečí" bez modulu (product=neuvedeno) → rozlišení dle subparam: "věci/zvířata/peníze/vybavení" = Domácnost, "vedlejší stavby/porosty/hlavní objekt" = Nemovitost

---

### Generali (639 pending)

**Vstup:** Žádný KB soubor — produktové kódy + naming patterns stačily.

**Přístup:** Analýza produktových kódů in-context:
- `05/051` → Odpovědnost L1:7, L2:38/39
- `0701-0703` → Domácnost (L1:6, L2 dle kryté události)
- `0802-0803` → Bydlení/Nemovitost (L1:5)
- `081/083` → Víkend (mix building + household)
- `BH/BO/MB/MM/MD` → homeowner produkty, různé L1/L2 dle jména rizika

**SKIP kategorie** (~173 rizik = 27%):
- Úrazové/zdravotní/životní pojištění (AH, zdravotní produkty)
- Cestovní pojištění
- Právní ochrana
- Vozidla (AUT kódy)
- Komerční stroje (strojní pojištění, D&O)
- V-kódy (V70, V99, V112, V103...) — komerční odpovědnost, ne fyzické osoby
- Zásoby (inventories)

**Výsledek:** 466 confirmed, 173 skipped.

---

## Kvantitativní dopad

| Metrika | Hodnota |
|---------|---------|
| Pending před Fází 3b | 946 |
| Pending po Fází 3b | 0 |
| Confirmed (KB mapping) | 1 027 |
| Skipped (KB mapping) | 192 |
| Pokrytí in-scope | 85 % (vs. 21 % po PoC) |
| Odhadovaný čas ručně | 800+ hodin |
| Skutečný čas (Claude Code) | ~1 session (~3 hodiny) |

---

## Co nefungovalo

**1. Vault neexistoval pro DIRECT ani Generali.**
Vault byl připraven jen pro ČPP a Kooperativa. Přesto jsme zvládli bez něj — naming patterns a produktové kódy nesly dostatek informace.

**Implikace:** Vault je cenný, ale ne nutný podmínkou. Explicitní pojmenování nebo kódy jsou alternativa.

**2. Package/bundle produkty (L1 only).**
Cokoliv, co je "balíček OPTI/MAXI" nebo agregovaný produkt, nelze bez hazardování přiřadit jednomu L2. Správné řešení: L1 only, L2 null. Nevynucovat L2 za každou cenu.

**3. Komerční produkty (SKIP).**
~27% Generali rizik bylo mimo scope (komerční odpovědnost, stroje, zdraví, cestovní). To není chyba mapování — správně rozpoznané jako out-of-scope. Skipping je validní výsledek.

---

## Doporučení pro budoucí projekty

### 1. Přidej L1/L2 mapping table do každého KB souboru

Aktuální KB soubory popisují produkty, kryté události, výluky — ale chybí explicitní tabulka:

```markdown
## Taxonomie mapping

| Produkt | Kryté události | L1 | L2 |
|---------|----------------|----|----|
| DOMEX | Základní živel | 6 (Domácnost) | 30 |
| DOMEX | Krádež | 6 (Domácnost) | 34 |
| DOMEX | Skla | 6 (Domácnost) | 35 |
...
```

S touto tabulkou by budoucí importy šly automatizovat bez in-context mapování.

### 2. Explicitní naming konvence ≥ opaque kódy

DIRECT byl nejrychlejší na mapování (naming pattern neslo vše). Generali byl nejtěžší (kódy bez kontextu). Doporučení: pojišťovny/produkty s explicitním pojmenováním mapuj dle vzoru, opaque kódy vyžadují KB.

### 3. Script pattern: idempotentní TypeScript seed

Osvědčený pattern:

```typescript
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";

const p = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

type M = { l1Id: number | null; l2Id: number | null; l3Id: number | null; status: "confirmed" | "skipped" };
const MAPPINGS: Record<number, M> = { /* ... */ };

async function main() {
  for (const id of Object.keys(MAPPINGS).map(Number)) {
    const { l1Id, l2Id, l3Id, status } = MAPPINGS[id];
    await p.risk.update({
      where: { id },
      data: { l1Id, l2Id, l3Id, reviewStatus: status, reviewedAt: new Date() },
    });
  }
}

main().finally(() => p.$disconnect());
```

Spustit: `npx tsx scripts/apply_<insurer>_mapping.ts`

**POZOR:** Script je idempotentní, ale přepíše ručně zadané hodnoty. Nespouštět znovu po manuálním review.

### 4. Skipping je první třída výsledku

Nestačí jen "confirmed". Každé riziko mimo scope nebo nejednoznačné dostane `skipped` — čistší výsledky než "best guess" confirm. Počet skipped je validní metrika.

### 5. Package rizika → L1 only (nikdy nestresuj L2)

Pokud produkt je bundle více krytí, přiřaď jen nejbližší L1. Vymyšlené L2 = halucinace, ne mapování.

---

## Technické gotchas

- `DATABASE_URL` musí být absolutní cesta (Prisma 6 ignoruje CWD)
- Shell CWD se resetuje mezi příkazy → vždy `cd /abs/path && npx tsx ...`
- `npx tsx` místo `ts-node` (Prisma 6 generuje ESM TypeScript)
- Kooperativa: IDs v DB jsou jiné než v původním CSV (seed přiřadil nové auto-increment IDs)

---

## Vzor pro příští podobný projekt

1. Zanalyzuj pojmenování rizik — existuje struktura? (DIRECT pattern)
2. Existuje KB soubor? → Načti jako kontext
3. Existují produktové kódy? → Clasifikuj dle kódů (Generali pattern)
4. Generuj `MAPPINGS: Record<number, M>` dict in-context
5. Piš TypeScript seed script, spusť, ověř čísla
6. Skipping je OK — netlač L2 za každou cenu
