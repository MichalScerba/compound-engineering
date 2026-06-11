# ADR-004 — Markdown rendering v AI agent odpovědích

**Datum:** 2026-06-11
**Status:** Přijato
**Projekt:** DeployMate

---

## Kontext

AI agenti vrací odpovědi ve formátu markdown — tučný text (`**text**`), odrážky, nadpisy, kód. Bez renderingu se zobrazují raw markdown znaky, což je nečitelné.

Streaming komplikuje situaci: markdown přichází po znacích, ne najednou. Renderer musí fungovat na neúplném textu bez pádu.

## Rozhodnutí

`react-markdown` s custom Tailwind komponentami. Renderuje pouze zprávy asistenta — zprávy uživatele zůstávají jako prostý text (`whitespace-pre-wrap`).

```tsx
import ReactMarkdown from "react-markdown"

// Pouze pro role === "assistant"
<ReactMarkdown
  components={{
    p:      ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em:     ({ children }) => <em className="italic">{children}</em>,
    ul:     ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
    ol:     ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
    li:     ({ children }) => <li>{children}</li>,
    h1:     ({ children }) => <h1 className="font-semibold text-base mb-1">{children}</h1>,
    h2:     ({ children }) => <h2 className="font-semibold mb-1">{children}</h2>,
    h3:     ({ children }) => <h3 className="font-medium mb-1">{children}</h3>,
    code:   ({ children }) => <code className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
    pre:    ({ children }) => <pre className="bg-background/50 p-2 rounded text-xs font-mono overflow-x-auto mb-2">{children}</pre>,
    hr:     () => <hr className="border-border my-2" />,
  }}
>
  {message.content}
</ReactMarkdown>
```

## Alternativy které byly zvažovány

- **Vlastní regex parser** (`**text**` → `<strong>`) — fragile, nepokryje edge cases (nested formátování, escaped znaky)
- **`marked` + `dangerouslySetInnerHTML`** — XSS riziko pro AI-generated content, navíc vyžaduje sanitizaci
- **Žádný rendering** — raw markdown znaky, nečitelné pro uživatele

## Důsledky

**Pozitivní:**
- `react-markdown` bezpečně parsuje markdown bez `dangerouslySetInnerHTML`
- Funguje se streamingem — React re-renderuje při každém chunk update, parser zvládá neúplný text
- Custom komponenty umožňují plnou kontrolu nad stylingem (Tailwind dark theme)

**Negativní / trade-offs:**
- +1 závislost (`react-markdown` ~8 kB gzip)
- Streamovací kurzor (blikající `|`) je vždy za posledním renderovaným elementem — při streamování odstavce bliká za posledním slovem, ne za řádkem

## Kdy přehodnotit

Pokud by agenti vraceli matematické vzorce (LaTeX) nebo komplexní tabulky — pak zvážit `remark-math` / `remark-gfm` pluginy.
