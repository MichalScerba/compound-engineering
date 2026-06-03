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

## Dev

```bash
npm run dev
```
