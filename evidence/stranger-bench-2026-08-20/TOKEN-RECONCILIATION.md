# THREE TOKEN MEASUREMENTS, THREE ANSWERS. Reconciled, not averaged. 2026-08-20.

Ruled beside the stranger benchmark's acceptance. **Rule 14a, applied to our own most-quoted
number:** *a score is not a result without its composition* — and here the composition is the whole
disagreement.

## The three

| measurement | what it measured | what it found |
|---|---|---|
| **M-A** (2026-08-13, `PAYLOAD-AUDIT-2026-08-13.md`) | **full cached payloads**, 16 questions × 6 arms, byte-exact on disk | web3ctx **3,255** median — **cheaper than exa 7,740 and firecrawl 4,635**, dearer than context7 1,252 |
| **M-B** (2026-08-13, `M-B-RESULT.md`) | **tokens per COMPLETED TASK** inside a real agent loop, 48 arm-runs, $6.64 | web3ctx **~3.5× behind Context7** — 94,559 vs 26,972 per completed task |
| **this run** (2026-08-20, stranger) | **minimal answer paths**, 5 questions, 4 arms, ours self-reported | web3ctx **the most expensive of the four** — ~2,130/question vs exa ~300, WebSearch ~475, firecrawl-dev ~1,105 |

## 🔴 They do not contradict each other. They are three different questions.

- **M-A asks: what does one payload cost?** Its denominator is a payload. Against arms that return
  whole scraped pages we are **mid-field**, and against a docs-snippet server we are **~2.4× dearer**.
- **M-B asks: what does finishing the job cost?** Its denominator is a *completed task*, and it
  includes **every turn's re-send**. That is where the **bodies rule** shows up: `search` returns
  selectors, so more calls, and each result is re-sent every turn. **R-Z ruled that structural.**
- **This run asks: what does the cheapest path to an answer cost?** Its denominator is a question,
  and its arms are **search snippets** — exa's ~300 tokens is a highlight, not a document. A
  recipe with receipts and pinned citations cannot be 300 tokens and still be that.

⭐ **The unit is doing all the work.** Change the denominator — payload, task, question — and the
ranking changes. **None of the three is wrong; each is quotable only with its composition.**

## ⚠ And this run's column is not even the same quantity on both sides

**J4, its own note:** ours is `estimated_tokens` — **content only, excluding the JSON envelope** —
while B/C/D are measured on the full returned payload. **Our number is the understated one**, so
*most expensive of four* is a floor. We are not softening a result that runs against us; we are
saying it is worse than printed and still directional.

## 🔒 The locks, unchanged

Every existing quoting lock stands, and this run adds nothing to what may be said:

- **Never "cheaper."** Measured false at the payload level against Context7 (M-A) and at the task
  level (M-B), and now at the minimal-path level against three more arms.
- **Never an unqualified token claim.** The positioning is **cents per task** (R-X), never a
  comparison; the real lever is the caller's own prompt cache, which is theirs and not ours to spend.
- **No number here publishes.** Internal data (J1/J4: *directionally sound, not publication-grade*),
  and the M-A/M-B locks were never lifted.
- 🔴 **Any future attack on the token cost is still a DESIGN CHANGE TO THE BODIES RULE** and needs a
  new owner ruling (R-Z). **A third-party benchmark saying we are expensive is not that ruling** —
  it is the fourth independent confirmation of a cost we already ruled structural.

⭐ **What this run adds is not a token finding. It is the trade, priced by an outsider:** the arm
that cost the most caught **5 of 6** traps and named the right version **5 of 5** with a commit pin
on every answer; the cheapest arm caught **0 of 6** and was **actively wrong once**. That is the
bodies rule's other side, measured by someone with no stake in it — and it is exactly the sentence
we may not publish from a run whose payloads were transcribed rather than captured.
