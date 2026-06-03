# Playbook: Vercel Deploy

Postup pro první deployment projektu na Vercel přes CLI.

---

## 1. První deploy

```bash
npx vercel
```

Projdeš průvodcem:
- **Which team?** — vyber svůj účet
- **Link to existing project?** — no (pokud je to nový projekt)
- **Name?** — název projektu
- **Customize settings?** — N
- **Do you want to change additional settings?** — N

---

## 2. Nastav env proměnné

`.env.local` zůstává lokálně — na Vercel musíš přidat proměnné zvlášť.

Přidej každou proměnnou pro `production` a `preview` samostatně:

```bash
npx vercel env add NAZEV_PROMENNE production
npx vercel env add NAZEV_PROMENNE preview
```

**Důležité:**
- `NEXT_PUBLIC_` proměnné jsou veřejné — na otázku "Make it sensitive?" odpověz **n**
- Na otázku "How to proceed?" vyber **Leave as is**
- Preview se ptá na branch — nech prázdné (platí pro všechny)
- Development nelze kombinovat s jinými prostředími — přidej zvlášť pokud potřebuješ

---

## 3. Deploy na produkci

```bash
npx vercel --prod
```

---

## Časté problémy

| Chyba | Příčina | Fix |
|-------|---------|-----|
| `npm run build` exited with 1 | Chybějící env proměnné na Vercel | Přidej přes `vercel env add` |
| Development cannot be combined | Development má jiná pravidla | Přidej Development zvlášť |
| Build prošel lokálně, ne na Vercel | `.env.local` není na Vercelu | Přidej env proměnné přes CLI |
