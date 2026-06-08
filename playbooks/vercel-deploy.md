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

**Pro nextjs-starter template přidej:**

```bash
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_URL preview

npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
```

**Důležité:**
- `NEXT_PUBLIC_` proměnné jsou veřejné — na otázku "Make it sensitive?" odpověz **n**
- Na otázku "How to proceed?" vyber **Leave as is**
- Preview se ptá na branch — nech prázdné (platí pro všechny)
- Development nelze kombinovat s jinými prostředími — přidej zvlášť pokud potřebuješ

---

## 3. Nastav Supabase redirect URL (pokud používáš auth)

Po prvním deployi Vercel přidělí URL ve formátu `https://<projekt>.vercel.app`.

V Supabase dashboardu:
1. **Authentication → URL Configuration**
2. **Site URL** — nastav na produkční URL: `https://<projekt>.vercel.app`
3. **Redirect URLs** — přidej:
   - `https://<projekt>.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (pro lokální vývoj)

> Bez tohoto kroku Supabase odmítne přesměrovat uživatele po přihlášení.

---

## 4. Deploy na produkci

```bash
npx vercel --prod
```

---

## 5. Ověř auth po deployi

1. Otevři `https://<projekt>.vercel.app/login`
2. Zaregistruj testovací účet
3. Ověř redirect na `/dashboard`
4. Ověř sign out → redirect na `/login`

---

## Hromadné nastavení env proměnných ze .env.local

Pokud máš `.env.local` s vyplněnými hodnotami, můžeš je hromadně přidat na Vercel:

```bash
set -a && source .env.local && set +a

printf '%s' "$NEXT_PUBLIC_SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production --force
printf '%s' "$NEXT_PUBLIC_SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production --force
printf '%s' "$ANTHROPIC_API_KEY" | vercel env add ANTHROPIC_API_KEY production --force
```

> `printf '%s'` místo `echo` — echo přidává newline, který Vercel zahrne do hodnoty a key přestane fungovat.

---

## Časté problémy

| Chyba | Příčina | Fix |
|-------|---------|-----|
| `npm run build` exited with 1 | Chybějící env proměnné na Vercel | Přidej přes `vercel env add` |
| Development cannot be combined | Development má jiná pravidla | Přidej Development zvlášť |
| Build prošel lokálně, ne na Vercel | `.env.local` není na Vercelu | Přidej env proměnné přes CLI |
| Auth redirect selže po přihlášení | Supabase nezná produkční URL | Přidej URL do Supabase → Authentication → Redirect URLs |
| `hideSourceMaps` type error | Deprecated v novější verzi @sentry/nextjs | Nahraď za `sourcemaps: { disable: true }` |
