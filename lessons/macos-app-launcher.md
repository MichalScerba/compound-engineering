# Lekce: macOS launcher pro lokální dev stack

**Datum:** 2026-06-18  
**Projekt:** ApexEngine / ApexFeeder  
**Kontext:** Dva Python servery + Next.js frontend — chceme spouštět jedním kliknutím bez viditelného terminálu.

---

## Problém

Při vývoji s více lokálními procesy (backend, feeder, frontend) je ruční spouštění každého zvlášť zdlouhavé. Terminál zbytečně překáží.

---

## Řešení: ApexStart.app + ApexStart.command

### Vrstva 1 — shell script (`ApexStart.command`)

`.command` soubor macOS umí otevřít dvojklikem v Terminálu. Obsahuje veškerou logiku:

```bash
#!/bin/bash
# 1. Zabij existující procesy na portech (port-based kill — funguje bez ohledu na argumenty procesu)
lsof -ti :8001 | xargs kill -9 2>/dev/null
lsof -ti :8000 | xargs kill -9 2>/dev/null
lsof -ti :3000 | xargs kill -9 2>/dev/null
sleep 2

# 2. Spusť servery na pozadí s plnou cestou k binárce (AppleScript nemá PATH)
/path/to/.venv/bin/uvicorn main:app --port 8001 > /tmp/apex-feeder.log 2>&1 &
/path/to/.venv/bin/uvicorn engine.main:app --port 8000 > /tmp/apex-engine.log 2>&1 &
/opt/homebrew/bin/npm run dev > /tmp/apex-frontend.log 2>&1 &

# 3. Počkej až Next.js skutečně naběhne (ne fixní sleep — polling)
while ! curl -s http://localhost:3000 > /dev/null 2>&1; do
    sleep 1
done

# 4. Otevři prohlížeč
open http://localhost:3000
```

**Logy jsou v `/tmp/apex-*.log`** — při problémech první místo kde hledat.

### Vrstva 2 — macOS app (`ApexStart.app`)

AppleScript wrapper který spustí `.command` a schová Terminal:

```applescript
do shell script "open '/path/to/ApexStart.command'"
delay 2
tell application "Terminal"
    set miniaturized of front window to true
end tell
```

Kompilace z terminálu:
```bash
osacompile -o ~/Desktop/ApexStart.app /tmp/ApexStart.applescript
```

App lze přidat do Docku pro přístup jedním kliknutím.

---

## Klíčové poučení

### Port-based kill místo pkill -f

```bash
# ŠPATNĚ — selže pokud byl proces spuštěn s jinými argumenty
pkill -f 'uvicorn main:app --port 8001'

# SPRÁVNĚ — zabije cokoliv na daném portu
lsof -ti :8001 | xargs kill -9 2>/dev/null
```

Procesy spuštěné různými způsoby (s/bez `--host`, `--log-level` atd.) mají různé cmdline — `pkill -f` je nespolehlivý. Port-based kill funguje vždy.

### Plná cesta k binárce

`do shell script` v AppleScriptu má omezený PATH (`/usr/bin:/bin`). `npm`, `uvicorn` a jiné nástroje z Homebrew nebo venv tam nejsou. Vždy používej absolutní cestu:

```bash
/opt/homebrew/bin/npm run dev        # Homebrew
/project/.venv/bin/uvicorn ...       # Python venv
```

### Polling místo fixního sleep

```bash
# ŠPATNĚ — Next.js může trvat 5–30s podle systému
sleep 10 && open http://localhost:3000

# SPRÁVNĚ — otevře přesně kdy je ready
while ! curl -s http://localhost:3000 > /dev/null 2>&1; do sleep 1; done
open http://localhost:3000
```

### delay před minimalizací Terminálu

Při minimalizaci okna Terminálu z AppleScriptu musí Terminal nejdřív okno vytvořit. Příliš krátký `delay` způsobí že okno neexistuje a příkaz selže tiše:

```applescript
do shell script "open '/path/ApexStart.command'"
delay 2   -- nestačí 0.5 — Terminal musí stihnout otevřít okno
tell application "Terminal"
    set miniaturized of front window to true
end tell
```

### Správný modul pro uvicorn

```bash
# ŠPATNĚ — kořenový main.py může být prázdný nebo jiný
uvicorn main:app

# SPRÁVNĚ — explicitní modul
uvicorn engine.main:app --port 8000
```

---

## Shutdown z UI

Backend endpoint `POST /shutdown` zastaví všechny procesy:

```python
@app.post("/shutdown")
async def shutdown():
    async def _kill():
        await asyncio.sleep(0.5)  # stihni odeslat odpověď
        subprocess.Popen(["bash", "-c",
            "lsof -ti :8001 | xargs kill -9 2>/dev/null ; "
            "lsof -ti :3000 | xargs kill -9 2>/dev/null ; "
            "sleep 0.5 ; "
            "lsof -ti :8000 | xargs kill -9 2>/dev/null"
        ])
    asyncio.create_task(_kill())
    return {"status": "shutting down"}
```

Backend se zabíjí jako poslední (po 0.5s) aby stihl odeslat odpověď frontendu.

Frontend polling dokud backend nereaguje → zobrazí "✓ Servery zastaveny".

---

## Kdy použít

Kdykoli projekt má 2+ lokální procesy které chceš spouštět jako celek — feeder + backend + frontend, API + worker + UI, atd.

Stejný pattern funguje pro jakýkoliv stack — není vázán na Python/Next.js.
