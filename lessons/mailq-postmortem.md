# Postmortem — mailQ

**Datum:** 2026-06-10
**Projekt:** mailQ — Q&A extraction z Apple Mail
**Typ:** Dokončený projekt

---

## Co šlo dobře

- **JXA přístup k Apple Mail** — nalezeno rychle, spolehlivě funguje bez IT závislostí
- **Thread-based pipeline** — redesign z "klasifikuj každý email" na "čti celé vlákno" byl správný krok; bez něj by 90 % Q&A nemělo odpověď
- **Clustering jedním API callem** — poslat všechny otázky najednou do Claude funguje dobře a je levné
- **Tool calling** — přechod z free-form JSON zachránil 10 kandidátů s neeescapovanými uvozovkami; měli jsme ho použít od začátku
- **FTS5 pro retrieval** — SQLite FTS5 ukázal, že nepotřebujeme vector DB pro jednoduché keyword retrieval
- **Haiku 4.5 na syntézu** — odpovědi srovnatelné kvality jako Sonnet za zlomek ceny
- **Výsledek:** 14 071 emailů → 216 Q&A exportováno, celé za ~$0.15 v API nákladech

## Co šlo špatně

- **reply_email_id záměna rolí** — část `reply_email_id` ukazovala na zákaznický email místo operátora (partneři s doménou `sol@partners.cz` sami posílají dotazy). Odhaleno až při manuálním review.
- **FTS5 external content table** — ztrátil čas debugováním; dokumentace SQLite to nezmiňuje prominentně
- **Generování Q&A bez verifikace** — prvním runném generate-qa.ts jsme vygenerovali odpovědi na špatném základě; museli jsme regenerovat

## Root cause

Pipeline identifikovala helpdesk emaily čistě podle sender domény (`sol@partners.cz`). Domény ale nerozděluje interní a zákaznická komunikace — partneři píšou na helpdesk z téže domény. Pipeline to nezachytila.

## Co by se stalo jinak

1. **Verifikace dat dříve** — po prvním generate-qa.ts ihned zkontrolovat 5 náhodných výsledků před pokračováním
2. **Tool calling od začátku** — ne jako fix po chybách, ale jako default pro každý structured output
3. **Sender identification robustněji** — místo domény použít kombinaci: sender domain + je email příchozí nebo odchozí + obsahuje HelpDesk signature

## Lekce pro OS

| Typ | Akce |
|-----|------|
| Lekce | ✅ Přidáno: lekce 24 (tool calling), 25 (FTS5), 26 (model selection) |
| Playbook | Zvážit `playbooks/email-qa-extraction.md` pokud se pattern opakuje |
| Template | Není potřeba — mailQ je standalone projekt |
| Nic | Záměna rolí v thread pipeline — příliš specifické pro OS |
