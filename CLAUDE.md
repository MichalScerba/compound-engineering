# CLAUDE.md — Compound Engineering OS

## What this repository is

This is not an application. This is a **personal engineering OS** — a system for building systems.

Contents: templates, agents, workflows, playbooks, prompts, architecture decisions, lessons.
New products are separate repositories that instantiate from this OS.

---

## How you operate here

You are a **system member**, not a code generator. Before implementing anything:
1. Check if a pattern already exists in `/templates`, `/playbooks`, or `/prompts`
2. If building something new, consider whether it should be extracted back into the OS after

After every non-trivial task, ask: *does this belong in the OS?*

---

## Axiom

> If something is annoying for the second time → it's a candidate for automation.

Flag repetition. Suggest scripts, workflows, or agents.

---

## Language

- Code, variable names, commit messages, file names: **English**
- Communication with the user: **Czech**
- Comments in code: **English**, only when the WHY is non-obvious

---

## Code style

**TypeScript — strict mode always.**
- No `any`. If you're tempted to use `any`, find the right type.
- Explicit over implicit. More code is fine if it's clearer.
- Small components, single responsibility.
- Flat structure over deep nesting.
- No over-engineering. Three similar lines is better than a premature abstraction.
- No factory patterns, no helper-of-a-helper, no abstraction for one use.

**Never:**
- Comment what the code does — names do that
- Add `// This function...` style comments
- Create abstractions that are used exactly once
- Build for hypothetical future requirements

---

## Default stack (for templates and new projects)

| Layer | Tool |
|-------|------|
| Framework | Next.js (App Router) |
| Database | Supabase |
| Deployment | Vercel |
| UI | shadcn/ui + Tailwind |
| Auth | Supabase Auth or Clerk |
| Payments | Stripe |
| Workflows | n8n |
| AI | Claude API / Vercel AI SDK |

---

## Decision-making

1. **Manual first** — solve it by hand before automating
2. **Specify** — write what good looks like (this file, agents/*.md)
3. **Automate** — then build the workflow or agent
4. **Log** — record decisions in `/architecture`, lessons in `/lessons`

When making architectural decisions, be explicit about trade-offs. Don't pick the clever solution — pick the one that's easiest to understand in 6 months.

---

## What belongs where

| Folder | What goes here |
|--------|---------------|
| `templates/` | Starter repos and file scaffolds |
| `agents/` | AI role definitions (architect, debugger, qa...) |
| `workflows/` | Automated multi-step processes |
| `playbooks/` | Step-by-step guides for recurring situations |
| `prompts/` | Reusable prompts |
| `architecture/` | Decisions, patterns, diagrams |
| `lessons/` | Postmortems, insights from real projects |
| `docs/` | Project diary and phase tracking |
