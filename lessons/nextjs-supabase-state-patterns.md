# Lesson: Next.js App Router + Supabase — State & Data Patterns

**Projekt:** DeployMate
**Datum:** 2026-06-10
**Fáze:** Metriky + Deník projektu (Fáze 5)

---

## Co jsme řešili

Real-time aktualizace client-side stavu po mutaci dat přes Supabase RPC. Metriky se nezobrazovaly, i když DB měla správné hodnoty.

---

## Technické lekce

### 1. Supabase nested select vyžaduje FK v PostgREST schématu

```typescript
// ❌ Toto vrátí prázdné pole pokud FK není explicitně definovaný v Supabase schématu
const { data } = await supabase
  .from("projects")
  .select("*, project_metrics(*)")

// ✅ Přímý dotaz je spolehlivý vždy
const { data } = await supabase
  .from("project_metrics")
  .select("*")
  .eq("project_id", id)
  .maybeSingle()
```

**Proč:** PostgREST vytváří nested select podle FK vztahů v `information_schema`. Pokud tabulka nemá `REFERENCES` clause nebo vztah není viditelný pro PostgREST, nested select vrátí prázdné pole bez chyby — tiché selhání.

**Pravidlo:** Pro 1:1 nebo N:1 vztahy vždy fetchuj separátním dotazem. Nested select používej jen pokud víš, že FK je definovaný.

---

### 2. `router.refresh()` nespolehlivě propaguje data do client komponent se `useState`

```typescript
// ❌ Toto funguje nepředvídatelně
async function handleSave() {
  await fetch("/api/save", { method: "POST", ... })
  router.refresh() // server re-fetchuje data, ale useState v MetricsSection se neaktualizuje
}

// ✅ Explicitní fetch + key remount
async function handleSave() {
  await fetch("/api/save", { method: "POST", ... })
  const res = await fetch("/api/data")
  const updated = await res.json()
  setData(updated)
  setRefreshKey(k => k + 1) // forces remount s novými daty
}

// V JSX:
<MetricsSection key={refreshKey} initialMetrics={data} />
```

**Proč:** `router.refresh()` invaliduje Next.js router cache a re-renderuje server komponenty. Ale client komponenty s `useState` drží svůj vlastní stav — nové server-side props projdou jako nový `initialMetrics` prop, ale `useState` ignoruje prop změny po initial mount.

**Pravidlo:** Nikdy nespoléhej na `router.refresh()` pro synchronizaci client state. Po mutaci explicitně fetchni nová data a předej je přes state.

---

### 3. `useEffect([obj])` je nespolehlivý pro prop synchronizaci

```typescript
// ❌ Toto nefunguje konzistentně
useEffect(() => {
  setMetrics(initialMetrics)
}, [initialMetrics]) // React porovnává referencí — Object.is(prev, next)

// ✅ key prop je deterministický
<MetricsSection key={refreshKey} initialMetrics={metrics} />
// Po každém incrementu refreshKey se komponenta remountuje a useState se inicializuje znovu
```

**Proč:** React porovnává useEffect závislosti pomocí `Object.is`. Pro objekty to znamená porovnání referencí, ne hodnot. Pokud nová data přijdou ze stejné cache nebo Next.js vrátí stejný objekt, efekt se nespustí — i když hodnoty uvnitř jsou jiné.

**Pravidlo:** Pro "resetni stav při nových datech" používej `key` prop s counter, ne useEffect s objektovým dep.

---

### 4. Atomická RPC pro multi-tabulkové operace

Když potřebuješ zapsat do více tabulek najednou a musí být konzistentní:

```sql
CREATE OR REPLACE FUNCTION public.insert_diary_entry(
  p_project_id uuid,
  p_content    text,
  p_tags       public.diary_tag[],
  p_delay_insurer_days integer DEFAULT 0,
  p_delay_ours_days    integer DEFAULT 0
) RETURNS public.project_diary_entries AS $$
DECLARE
  v_entry public.project_diary_entries;
  v_tag   public.diary_tag;
BEGIN
  -- 1. Insert záznamu
  INSERT INTO public.project_diary_entries (project_id, content, tags)
  VALUES (p_project_id, p_content, p_tags)
  RETURNING * INTO v_entry;

  -- 2. Upsert metriky (pokud řádek neexistuje)
  INSERT INTO public.project_metrics (project_id)
  VALUES (p_project_id)
  ON CONFLICT (project_id) DO NOTHING;

  -- 3. Inkrementuj čítače dle tagů
  FOREACH v_tag IN ARRAY p_tags LOOP
    CASE v_tag
      WHEN 'bug_p1' THEN UPDATE public.project_metrics SET bugs_found_p1 = bugs_found_p1 + 1 WHERE project_id = p_project_id;
      -- ...
    END CASE;
  END LOOP;

  RETURN v_entry;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Proč:** Supabase client nemá transakční API. Bez RPC by insert deníku a update metrik byly dva separátní requesty — při selhání druhého by data byla nekonzistentní.

**Pravidlo:** Operace "zapiš A a aktualizuj B" patří do RPC funkce v PostgreSQL. Nevolej je jako dva samostatné Supabase dotazy.

---

### 5. Shared state mezi sibling komponentami — wrapper pattern

Místo global state (Zustand, Context) pro jednoduchou komunikaci mezi sourozenci:

```typescript
// ProjectDataSection.tsx — klientský wrapper
"use client"
export default function ProjectDataSection({ initialMetrics, initialEntries, projectId }) {
  const [metrics, setMetrics] = useState(initialMetrics)
  const [refreshKey, setRefreshKey] = useState(0)

  async function handleDiarySaved() {
    const res = await fetch(`/api/projects/${projectId}/metrics`)
    if (res.ok) {
      setMetrics(await res.json())
      setRefreshKey(k => k + 1)
    }
  }

  return (
    <>
      <MetricsSection key={refreshKey} initialMetrics={metrics} projectId={projectId} />
      <DiarySection initialEntries={initialEntries} projectId={projectId} onDiarySaved={handleDiarySaved} />
    </>
  )
}
```

**Proč:** Server komponenty (page.tsx) nemohou předávat funkce jako props. Tenký klientský wrapper drží sdílený stav a předává callbacky dolů — bez nutnosti globálního state managementu.

**Pravidlo:** Pro lokální sdílení stavu mezi 2–3 sourozenci použij wrapper komponentu. Global state (Zustand) přidávej až když wrappery přestávají dávat smysl.

---

### 6. `@base-ui/react` nepodporuje `asChild` prop

```typescript
// ❌ TypeScript chyba: Property 'asChild' does not exist
<Button asChild>
  <Link href="/new">Nový projekt</Link>
</Button>

// ✅ buttonVariants přímo na Link
import { buttonVariants } from "@/components/ui/button"
<Link href="/new" className={buttonVariants()}>Nový projekt</Link>
```

**Pravidlo:** Pokud používáš `@base-ui/react` místo Radix, zkontroluj zda komponenta podporuje composition pattern. `buttonVariants` je vždy bezpečná alternativa.
