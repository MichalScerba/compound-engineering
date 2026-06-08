# Playbook: Supabase Setup

Postup pro připojení nového projektu k Supabase. Obsahuje lekce z prvního nasazení.

---

## 1. Vytvoř projekt

1. Jdi na `supabase.com` → Sign up / přihlás se
2. Klikni **New project**
3. Vyplň: name, database password (ulož ho), region (West EU / Central EU)
4. Počkej ~2 minuty než se projekt zprovozní

---

## 2. Vytvoř tabulky

1. V levém menu: **SQL Editor** → **New query**
2. Vlož SQL a klikni **Run**
3. Pokud se zobrazí dialog "Potential issue detected":
   - Pro personal tools bez auth → **Run without RLS**
   - Pro appky s uživateli → **Run and enable RLS** (a přidej policies)

> **Pozor:** Pokud první pokus selže na "Failed to fetch" (projekt se ještě spouští), zkus Run znovu. Tabulka mohla být vytvořena i přes chybu — pokud dostaneš "relation already exists", tabulka existuje.

---

## 3. Získej API klíče

1. V levém menu: **Settings → API**
2. Klikni na záložku **Legacy anon, service_role API keys**
3. Zkopíruj **anon** klíč — dlouhý JWT token začínající `eyJ...`

> **Důležité:** Nepoužívej "Publishable key" (`sb_publishable_...`) — tento nový formát nefunguje s aktuální verzí `@supabase/supabase-js`.

4. Project URL sestavíš z Project ID (Settings → General):
   ```
   https://<project-id>.supabase.co
   ```

---

## 4. Nastav .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Po změně `.env.local` vždy restartuj dev server (Ctrl+C → `npm run dev`).

---

## 5. Trigger pro auto-vytvoření profilu (pokud máš `profiles` tabulku)

```sql
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

> **Důležité:** `set search_path = public` je nutné — bez toho trigger selhává s "Database error saving new user".

---

## 6. Supabase klient

```ts
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);
```

---

## Časté problémy

| Chyba | Příčina | Fix |
|-------|---------|-----|
| 401 Unauthorized | Špatný klíč nebo RLS zapnuté bez policies | Zkontroluj klíč (musí být `eyJ...`), nebo vypni RLS |
| RLS blokuje přístup | Tabulka vytvořena s RLS, žádné policies | `alter table <tabulka> disable row level security;` |
| relation already exists | Tabulka již existuje | Ignoruj, tabulka je OK |
| Failed to fetch | Projekt se ještě spouští | Počkej 2 minuty a zkus znovu |
