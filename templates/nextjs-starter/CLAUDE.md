# CLAUDE.md — Next.js Starter Template

Part of the Compound Engineering OS. See parent CLAUDE.md for full conventions.

## This project

Next.js App Router + TypeScript strict + shadcn/ui + Tailwind.

## Folder structure

```
app/          ← routes and pages (App Router)
components/   ← shared UI components
components/ui ← shadcn components (do not edit manually)
hooks/        ← custom React hooks
lib/          ← utilities and helpers
types/        ← TypeScript types and interfaces
public/       ← static assets
```

## Rules

- TypeScript strict — no `any`
- Components: one responsibility, small, composable
- Flat over nested — avoid deep folder hierarchies
- Explicit over implicit
- No comments explaining what code does — name things well instead
- shadcn components go in `components/ui/`, custom components go in `components/`

## Adding shadcn components

```bash
npx shadcn@latest add <component>
```

## Supabase

- `lib/supabase.ts` — browser client (Client Components)
- `lib/supabase-server.ts` — server client (Server Components, Server Actions)

Env proměnné viz `.env.example`. Klíče: Settings → API → **Legacy anon, service_role API keys** → anon klíč (`eyJ...`).

## Auth

- `/login` — přihlášení i registrace
- `/dashboard` — chráněná route (redirect na `/login` bez session)
- `proxy.ts` — session refresh + ochrana `/dashboard/*` (Next.js 16: middleware.ts → proxy.ts)
- `app/auth/callback/route.ts` — callback pro OAuth / magic link

Middleware chrání `/dashboard/*` by default. Pro přidání dalších chráněných routes uprav `middleware.ts`.

## Git konvence

**Branch naming:**
```
feat/<co>     ← nová funkce
fix/<co>      ← oprava bugu
chore/<co>    ← údržba (deps, config, refactor)
docs/<co>     ← dokumentace
```

**Commit messages:**
- Formát: `typ: co a proč` (jedna řádka, anglicky)
- Typy: `feat`, `fix`, `chore`, `docs`, `refactor`
- Popis co se mění, ne jak — kód to říká sám

**PR pravidla:**
- Jeden PR = jedna věc
- Malé PRy nad velkými — jednodušší review
- Použij `.github/PULL_REQUEST_TEMPLATE.md` — vyplní se automaticky
- WIP → použij GitHub Draft PR

## Dev

```bash
cp .env.example .env.local
npm install
npm run dev
```
