# F72 — SECTION-SELECT OVER PREFIX-TRUNCATE. **PRE-REGISTRATION, written before a line of it was built.** 2026-08-20.

Ruled:

> *"F72 — PRE-REGISTER AND BUILD section-select over prefix-truncate: the served recipe body is
> selected by **lexical relevance to the query** (complete sections, never rewritten bytes), same
> byte budget, citations and provenance untouched at every budget."*

**Nothing is built yet.** The gate below is fixed here and is not editable afterwards (F22). **If it
fails, it does not ship and the result publishes.**

---

## 0 · The defect, restated from the measurement that found it

All 24 recipes are truncated in the payload — served prefixes of **5,318–6,801 bytes** against files
of **23,843–46,054 bytes**, **15–27%**. What ships is `body.slice(0, cut)`: the head of the file,
and the head of a recipe is its YAML metadata and validation-status block.

**Counted before this ran:** the anchors' own answers occur **2 (viem) · 10 (safe) · 11 (erc-7702)**
times in their recipe files and **0 times in the served prefixes**. R-Y's standing answer to an
ABSENT column is recipe coverage; coverage arrived three times and the column never moved.

## 1 · The mechanism

1. **Split into sections at top-level YAML keys** (`^[A-Za-z_][A-Za-z0-9_]*:`), with the leading
   comment header as section 0. Sections are **byte ranges of the original file** — nothing is
   rewritten, reformatted or summarised.
2. **Always-included identity set**, regardless of score: the header and the fields that carry the
   stamp — `project_id`, `version`, `last_validated`, `validated_by`, `provenance`. **Provenance is
   not a candidate for selection**; it is the floor.
3. **Score the rest by lexical overlap with the query**, tokenised through `canonicalCompound` —
   *the same pinned transform Layer 0 and the index use*, never a second tokenizer (D11).
4. **Fill the remaining budget with whole sections, highest score first, emitted in document
   order.** A section that does not fit is skipped, not cut.
5. **Elisions are marked**, so the served text never reads as a complete file.
6. **Same byte budget** — `share = max(400, budget/2)`, citations reserved first, unchanged.

⚠ **No model, no rewriting, no summarisation.** A lexical overlap score is arithmetic over tokens;
golden rule 6 forbids an LLM on the hot path and this is not one.

## 2 · THE GATE — registered, in order

| | must hold |
|---|---|
| **G1** | **`trap-viem-getcontract`'s `correct_answer_present` FLIPS to true** |
| **G2** | **`trap-erc7702-designator`'s `correct_answer_present` FLIPS to true** |
| **G3** | **`trap-safe-init` stays ABSENT** — its question is family-scoped and D1 serves no recipe there. **That is the ruling working, and a flip would mean the family gate had broken** |
| **G4** | **OZ anchor UNCHANGED** on every graded column |
| **G5** | **shakedown UNCHANGED** — 10/10 on target, 7 recipes served |
| **G6** | **citations and provenance present at EVERY budget**, swept, not sampled — the same sweep `probe-recipe-citations.ts` runs |
| **G7** | **L6 twin grading RE-RUN on the newly served text** for every anchor whose twin marker fires. Selection changes what is served, so the labelled/unlabelled split is **re-measured, never carried** |
| **G8** | **all 24 recipes re-graded for served-answer presence, reported as a count** |

**Any of G1–G7 failing ⇒ it does not ship, and the result publishes.** G8 is a **reported count**,
not a pass condition — it is the composition that makes G1/G2 readable.

## 3 · What I expect, stated separately from the gate

- **G1 and G2 flip.** `getContract` appears twice in viem's `working_example`/`interface` sections;
  `0xef0100` eleven times in erc-7702's. A query naming those tokens should rank those sections
  first by construction.
- **G8 will NOT be 24/24**, and that is not a failure. Some recipes' "answer" is not a token the
  question repeats, and the count exists to show how far selection carries — not to be a score.
- ⚠ **G7 is the one I cannot predict.** The current twin gradings were measured on prefixes that
  contain almost no code. Serving the code-bearing sections may **introduce** superseded API
  mentions that were previously past the cut — and if any is unlabelled, the L6 split gets worse.
  **That is a real risk of this change and it is registered as one, not discovered afterwards.**

## 4 · What this does NOT do

- **No byte is rewritten.** Sections are copied verbatim; only which ones ship changes.
- **The budget does not move.** R-Z ruled the token cost structural, and this proposal explicitly
  does not attack it — it spends the same bytes on different bytes.
- **Citations do not change.** They are extracted from the **whole** body and reserved first, as
  they already are, so a citation to a section that was not served still ships.
- **F69 cause A and the four Base-Sepolia checks are untouched** — ruled post-launch.

## 5 · Falsifications to be shown to land

| break | expected |
|---|---|
| select by score but emit a partial section | a "complete sections" test fails |
| drop the always-included identity set | provenance disappears from a served recipe — G6 fails |
| score with a second tokenizer instead of `canonicalCompound` | the D11 one-definition test fails |
| ignore the query entirely (score everything 0) | selection degenerates to document order — G1/G2 fail |
| remove the elision marker | a served body reads as a complete file — a self-description test fails |
