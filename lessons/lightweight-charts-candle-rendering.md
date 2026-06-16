# Lesson: lightweight-charts — candle rendering pitfalls

**Projekt:** ApexEngine (2026-06-15)
**Verze knihovny:** lightweight-charts v5.2.0

---

## Problémy které jsme řešili a jejich příčiny

### 1. Svíčky neviditelné — sub-pixel rendering

**Příznaky:** `setData(5000)` volán, data v konzoli potvrzena, ale graf prázdný.

**Příčina:** `fitContent()` při 5000+ svíčkách v grafu šířky ~1440px = každá svíčka < 1px → neviditelná.

**Fix:** Místo `fitContent()` použij `setVisibleLogicalRange` na posledních N svíček:
```typescript
chartRef.current?.timeScale().setVisibleLogicalRange({
  from: Math.max(0, sorted.length - 300),
  to: sorted.length,
});
```
Bar indexy (ne timestamps) jsou spolehlivější.

---

### 2. `setData()` opakovaně resetuje viewport

**Příznaky:** První render OK (setVisibleLogicalRange nastavený), ale 500ms poté svíčky zmizí.

**Příčina:** V live režimu se `setData(allCandles)` volalo každých 500ms (z bufferu). Každý `setData` v LW Charts v5 resetuje viewport na "zobrazit vše" → zpět na sub-pixel.

**Fix:** `setData` volat jen jednou (initial load). Pro live updates použít `series.update(candle)`:
```typescript
if (!hasFitContentRef.current) {
  candleSeriesRef.current.setData(sorted);
  chartRef.current?.timeScale().setVisibleLogicalRange({ from: ..., to: sorted.length });
  hasFitContentRef.current = true;
  lastDataTimeRef.current = sorted[sorted.length - 1]?.time as number;
} else {
  const newCandles = sorted.filter(c => (c.time as number) > lastDataTimeRef.current);
  for (const candle of newCandles) candleSeriesRef.current.update(candle);
  if (newCandles.length > 0) lastDataTimeRef.current = newCandles[newCandles.length - 1].time as number;
}
```
Resetovat `hasFitContentRef` a `lastDataTimeRef` v cleanup (React StrictMode mount twice!).

---

### 3. Price lines se hromadí na pravé ose

**Příznaky:** Desítky FVG-H / FVG-L labelů, cleanup nefungoval.

**Příčina:** `removePriceLine` se volal přes `candleSeriesRef.current` ale ref mohl ukazovat na jiný objekt než při vytváření lines.

**Fix:** Zachytit referenci na začátku efektu a používat ji konzistentně:
```typescript
useEffect(() => {
  const series = candleSeriesRef.current;
  if (!series) return;

  priceLinesRef.current.forEach(line => {
    try { series.removePriceLine(line); } catch { /* line already gone */ }
  });
  priceLinesRef.current = [];

  const addLine = (...) => {
    const line = series.createPriceLine({...}); // stejná `series` reference
    if (line) priceLinesRef.current.push(line);
  };
}, [zones, activeSignal, historyMarkers, asiaSession]);
```

---

### 4. TypeScript typy v LW Charts v5

- `createSeriesMarkers(series, [])` vrací `ISeriesMarkersPluginApi<Time>`, ne `<UTCTimestamp>`
- `lineWidth` musí být `LineWidth = 1|2|3|4`, ne `number`
- `setVisibleRange` bere `Range<Time>`, `setVisibleLogicalRange` bere `Range<number>` (bar indexy)
- Pokud `tsc --noEmit` projde ale runtime nefunguje → problém je pravděpodobně logický, ne typový

---

### 5. React StrictMode — double mount

Efekty se v dev módu spouštějí dvakrát (mount → cleanup → mount). Všechny refs musí být resetovány v cleanup:
```typescript
return () => {
  chart.remove();
  chartRef.current = null;
  candleSeriesRef.current = null;
  markersPluginRef.current = null;
  hasFitContentRef.current = false;
  lastDataTimeRef.current = 0;
  // priceLinesRef se vyčistí v zones efektu
};
```

---

## Architektura live grafu — doporučený pattern

```
snapshot → setData(all) + setVisibleLogicalRange(last 300)
live_update candle → series.update(candle)  // nikdy znovu setData
live_update trade → zones/markers efekt aktualizuje price lines
```

Oddělené useEffects:
- `[candles]` → pouze setData/update, žádné price lines
- `[zones, signals, markers]` → pouze price lines a markery, žádné candles

---

## Čemu se příště vyhnout

- Nevolat `fitContent()` ani `setData()` v live loop — jednou a dost
- Nezapomenout resetovat `hasFitContentRef` v cleanup
- `setVisibleLogicalRange` > `setVisibleRange` pro spolehlivost
- Nezkoušet přímé WS spojení z frontendu na feeder pokud feeder akceptuje jen 1 klienta
