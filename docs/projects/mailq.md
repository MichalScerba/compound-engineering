# mailQ

**Stav:** DOKONČEN
**Datum dokončení:** 2026-06-10
**Repo:** https://github.com/MichalScerba/mailQ

---

## Co projekt dělá

Standalone nástroj pro macOS. Čte emaily z Apple Mail, identifikuje opakující se dotazy a generuje Q&A páry exportované do IQ-Support. Nahradil plánovanou M365 Graph API integraci — přímý přístup k macOS Mail bez závislosti na IT.

## Výsledky

- 14 071 emailů → 1 287 vláken s HelpDesk odpovědí → 524 qa_candidates
- 130 clusterů, 308 duplicit odstraněno
- **216 Q&A exportováno** do IQ-Support (`data/qa-export.json`)
- Kategorie: technical 65 · vehicles 58 · property 35 · billing 33 · travel 11 · liability 8 · business 6

## Stack

| Vrstva | Technologie |
|--------|-------------|
| Mail přístup | JXA/osascript (SQLite blokován macOS sandboxem) |
| Anonymizace | spaCy NER + regex |
| AI — clustering | Claude Sonnet 4.6 |
| AI — klasifikace, Q&A | Claude Haiku 4.5 |
| DB | SQLite + better-sqlite3, FTS5 |
| UI | Next.js 16 App Router + Tailwind v4 |

## Pipeline (pro opakované běhy)

```
pipeline-threads-v2.ts → cluster.ts → regenerate-answers.ts → export.ts
```

## Klíčové lekce

- JXA/osascript místo přímého SQLite — macOS sandbox blokuje přímý přístup k Mail DB
- Haiku pro high-volume klasifikaci, Sonnet pouze pro clustering a Q&A generování (nákladová optimalizace)
- Opakující se chyba: Opus + adaptive thinking zakázáno pro jednoduché úlohy — viz OS feedback
