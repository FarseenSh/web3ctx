# PRE-REGISTRATION (a) — `expansion_prose`, RE-ATTEMPT. Written 2026-08-18. **NOT RUN.**

**Status: submitted for owner review. No index has been built, no probe issued, no number exists.**

**Trigger:** the OZ anchor. *"custom logic on every token transfer in an OpenZeppelin ERC20"* returns
`_update` **nowhere**, while `openzeppelin-contracts@5.x::ERC20::_update` sits in the corpus. The
query is conceptual; BM25 ranks a README above a Solidity function body because the README overlaps
generic English better. **That is rule 6a's case exactly** — the semantic gap closes at ingest.

---

## 1. 🔴 THE BAR DOES NOT MOVE. IT IS INHERITED VERBATIM.

`measurements/S5.2-EXPANSION-PRE-REGISTRATION.md` (2026-08-14) **applies unchanged**, including
amendment R-C. Restated here **only so a reader cannot claim it was unclear**, not re-derived:

| clause | bar | kind |
|---|---|---|
| **P1** | `expansion_prose` **NEVER enters a version or scope predicate** | binary — asserted over the generated SQL, not by reading code |
| **P2** | **PROSE ONLY.** Code-scoped units with non-empty `expansion_prose` must be **0** | binary — counted over the built index |
| **2** | `intrusion_treatment` ≤ `intrusion_control` **+ 0.5 pp** | non-inferiority |
| **3** | `prose_recall@10_treatment` ≥ control **+ 2.0 pp** | it must EARN its place |
| **4** | run MDE on the intrusion delta **≤ 1.00 pp** | R-C: *"the bar STANDS"* |

**All five, or it does not ship.** P1/P2 are not traded against recall.

⚠ **What failed on 2026-08-14 was clause 4** — MDE **6.41 pp** at n=784 — and clause 3, because the
column was **empty**: the run measured an unbuilt feature. **An empty expansion earns nothing, and
that was the correct verdict.** Nothing about the OZ miss makes 6.41 pp acceptable now.

**Target n, carried from R-C and not recomputed to taste:** `6.41 × √(784/n) = 1.00` → **n ≈ 32,200
probes.** Under-powering and reporting descriptively is **not** an option here: clause 4 is a gate
clause, not a caveat.

## 2. What is actually new — the fill, which has never been built

The 08-14 run gated a column that was empty at both endpoints. This proposal is to **build it**:

- **Generator:** `opensearch-…-doc-v3-gte`, Apache-2.0, **inference-free at query time** (golden rule
  6a). Doc-side only. **No hot-path model** — golden rule 6 is untouched.
- **Scope:** prose units only (P2). At 572,997 units, **108,525 are markdown** — that is the
  population, and it is 29.2% of the corpus.
- **Written to:** `expansion_prose`, bm25 weight **0.5** (the shipping vector's existing slot).
  ⚠ **The weight is NOT a tunable in this run.** Sweeping it would make the gate a search over
  configurations until one passes, which is F22 with extra steps. One weight, pre-registered.

## 3. The falsification — what would make me wrong

**The mechanism claim:** *the OZ miss is a vocabulary gap between a conceptual question and a code
unit's tokens.* Registered predictions, all falsifiable:

| # | prediction | falsified if |
|---|---|---|
| E1 | The OZ anchor's `correct_answer_present` flips **false → true** | it stays false. Then expansion does not address this class and the diagnosis was wrong |
| E2 | `boilerplate_hits` on the OZ anchor **falls** | it rises or holds — expansion helped the README more than the code |
| E3 | Clause 2 holds (intrusion ≤ control + 0.5 pp) | it does not. **This is the predicted failure mode** — rule 6a itself calls expansion *"the arm most likely to smear version boundaries"* |
| E4 | Clause 3 holds (prose recall +2.0 pp) | it does not — the fill is neutral, and neutral does not ship |

⭐ **E1 is registered as a prediction, NOT as a gate clause.** The OZ anchor is n=1 and internal; a
single question may never decide whether a corpus-wide column ships. If E1 succeeds and clauses 2–4
fail, **the column still does not ship** — and the honest reading would be *"expansion fixes this
question and costs version separation"*, which is a reason to write the recipe, not to ship the
column.

## 4. Cost, stated so it is never the remembered reason

Doc-side generation over 108,525 prose units is a **batch ingest job**, not a serving cost, and the
model is Apache-2.0 and self-hosted at ingest. **If this does not ship, the reason is the gate, not
the bill.**

## 5. What I am asking for

**A ruling on whether to build the fill at all** — because building it is the only way to run a gate
that has already refused it once, and running it a second time under the identical bar is the only
form of re-attempt this project permits.

---

## 6. AMENDMENT — approval to run, 2026-08-18 (owner). Two confirmations recorded BEFORE the fill.

> *"Two confirmations recorded in the pre-reg before the fill starts."*

### Confirmation 1 — the model is rule 6a's pinned choice, not a new one

✔ **`opensearch-neural-sparse-encoding-doc-v3-gte`, Apache-2.0.** Verified against **both**
independent statements of it: golden rule 6a in `CLAUDE.md`
(*"`opensearch-…-doc-v3-gte`, Apache-2.0"*) and `S5.2-EXPANSION-PRE-REGISTRATION.md` §1
(*"`opensearch-neural-sparse-encoding-doc-v3-gte`, Apache-2.0, run once at ingest"*).
**It is the same model. Nothing was chosen today.**

🔴 **And the thing that makes this confirmation load-bearing: the 2026-08-14 run NEVER RAN IT.**
That run gated **stubs** — `live` (column empty), `stub-scopecopy`, `stub-crossversion` — against an
empty column. So this is not a re-run with a new model; it is **the first run of the pinned model at
all**, and the 08-14 verdict (EXCLUDED) was a verdict about an unbuilt feature.

**Environment, stated because it is a dependency of the result:** the model is not installed in this
environment; `torch 2.13.0` and `transformers` are being installed into a repo-local `.venv`
(gitignored, regenerable). **If the model cannot be run here, the fill does not happen and this
section records that instead of a number.**

### Confirmation 2 — the containment invariant, falsified before it is trusted

> *"expansion terms exist ONLY in expansion_prose — zero in scope columns, zero reachable by any
> version predicate."*

**This is P1 and P2 made checkable rather than asserted.** The check, fixed here before any term is
generated:

| # | assertion | how it is checked | why it is not the same as P1/P2 |
|---|---|---|---|
| **C1** | every generated term is present in `expansion_prose` and in **no other FTS5 column** | for a sample of generated terms, `MATCH 'scope_project : "<term>"'`, `scope_version`, `symbol`, `ident_subtokens`, `content` each return **0** rows *that do not already contain the term natively* | P2 says the column is prose-only; **C1 says the terms did not LEAK into a different column** |
| **C2** | no version predicate can be satisfied by an expansion term | for every distinct corpus version label, a scoped query whose only match is an expansion term returns **0** | P1 says the query builder does not reference the column; **C2 says the INDEX cannot be reached through it even if it did** |
| **C3** | expansion terms never alter `scope_project` / `scope_version` **content** | byte-compare both columns' reachable row counts before and after the fill: **must be identical** | F61's lesson — a row count is identical whether a column loaded its value or `''`, so the check is on reachability, not cardinality |

⚠ **C1–C3 are FALSIFIED BEFORE TRUST** (rule 13): the falsification is a deliberately **poisoned**
build in which an expansion term is copied into `scope_project`. If C1–C3 do not fire on it, they are
not checks. **The 08-14 run already proved this discipline works** — its `stub-crossversion` arm was
built precisely to be caught, and it was (`+0.66pp`, **✘ CAUGHT**).

⭐ **A failure of C1, C2 or C3 is a FAIL of the whole gate**, at the same rank as P1 and P2. Not
traded against recall.

### What does not move

**The bar is inherited VERBATIM** — P1, P2, intrusion ≤ control + 0.5 pp, prose-recall ≥ + 2.0 pp,
MDE ≤ 1.00 pp, target **n ≈ 32,200**. **E1 (the OZ anchor flipping) stays a PREDICTION, never a gate
clause.** If E1 succeeds and any gate clause fails, **the column does not ship and the result
publishes anyway.**

### 🔴 Three environment facts, recorded before the fill's numbers exist

1. **The pinned model requires `trust_remote_code=True`.** It pulls its encoder implementation from
   **`Alibaba-NLP/new-impl`** (the GTE architecture). **Nobody had recorded this about the ruled
   choice.** It executes third-party Python **at ingest, locally, in a repo-local venv** — never in
   the Worker, never on a serving path. **Flagged for the owner as a property of the ruling, not
   waived by me**: if executing that code is unacceptable, the fill is discarded and nothing shipped.
2. **The remote code is incompatible with `transformers` 5.x.** On 5.15.0 it reads uninitialised
   `position_ids` and throws `IndexError: index 4314298496 is out of bounds`. **Pinned to
   `transformers 4.57.6`** — a version pin, not a patch. Patching a model's forward pass to silence
   an index error would produce embeddings nobody could vouch for.
3. ⚠ **The prose population in §2 above (108,525) is STALE** — it was measured on the 371,819-unit
   corpus. On the rebuilt **572,997**-unit corpus it is **157,582** (`scope IN ('docs','eip')`:
   143,171 docs + 14,411 eip). **The number is corrected here rather than left to be discovered.**

**Measured throughput:** 39.9 units/s on MPS → **~66 min** for the full fill.

**One filtering decision, stated because it is not free:** the model emits WordPiece ids, and a
continuation piece like `##by` written into a `unicode61` column **can never match a query token**.
Continuations, specials and non-alphanumerics are dropped; whole words survive. **TOPK = 32, one
pre-registered value, not a sweep.**

⭐ **The smoke test is worth recording because it is the mechanism in miniature.** The sentence
*"override the `_update` function… replaces the removed `_beforeTokenTransfer` hook"* expands to
`update · transfer · token · custom · logic · function · hook · before · removed`, while an MIT
LICENSE expands to `mit · license · free · software · permission · copyright` **and no code
vocabulary at all.** That is exactly the bridge the OZ miss needs — and it is a *prediction* (E1),
not a result.

### 🔴 C51/C54 APPLIED TO A MODEL — the pin. Owner addition, 2026-08-18.

> *"`trust_remote_code=True` pulls the encoder implementation from Alibaba-NLP's repo at whatever ref
> it resolves today — a MUTABLE ref inside the ingest path (C51/C54's exact class), and
> deterministic ingest is a measured differentiator."*

**Correct, and it is the same rule the corpus already lives by: a pin that re-resolves is not a
pin.** A model whose bytes can change under us makes the column unreproducible and every citation
derived from it uncheckable.

**The model's `pin_ref` — BOTH refs, because `trust_remote_code` means there are two:**

| what | repo | SHA |
|---|---|---|
| weights + config | `opensearch-project/opensearch-neural-sparse-encoding-doc-v3-gte` | **`1646fef40807937e8e130c66d327a26421c408d5`** |
| **the executed remote code** | `Alibaba-NLP/new-impl` | **`40ced75c3017eb27626c9d4ea981bde21a2662f4`** |

Applied as `revision=` **and** `code_revision=` on both the tokenizer and the model. Pinning only the
weights would leave the executed code mutable, which is the half that actually runs.

⚠ **The fill was STARTED UNPINNED, and the record names the bytes rather than claiming otherwise.**
Verified two ways on the day: the local HF cache holds exactly these two SHAs, **and** the Hub API
reports each as what `main` resolves to today. **So the running fill is on these bytes** — the pin
prevents future drift rather than describing a different past. **Re-running was not required and was
not done.**

### Rule 13 applied to a CLAIM — the bucketing verification

I justified length-bucketing (8 → 125 u/s, a **15×** speedup) with *"output-identical by
construction: pooling multiplies by `attention_mask` before the max, so padding contributes exactly
zero."* **That is an argument, not a measurement.**

`tools/verify-bucketing.py` encodes a **length-diverse, deliberately interleaved** sample both ways
and diffs the emitted term strings **byte-exact**. ⚠ The sample is interleaved on purpose: taking the
first N units would give near-uniform lengths, in which bucketed and unbucketed order barely differ
and **the check would pass without testing anything**.

**If any term differs, the bucketed fill is what gets re-done — not the claim softened.**

### ⚠ And a throughput number I got wrong

I reported **66 min** from a 256-unit sample. The real run measured **8 u/s → 309 min** — a **5×
error**, because I timed the *first* 256 rows (short docs) and batches pad to their longest member.
Bucketing then took it to 125 u/s at the head, declining toward the long tail. **The final measured
figure is what publishes; the 66 min was never a measurement of the job.**

### 🔴 CORRECTION — the bucketing SPEEDUP claim is REFUTED. The output claim survives.

Two separate claims were made about length-bucketing. **One is now measured true, the other is
measured false, and they were published together as if they stood or fell together.**

| claim | status |
|---|---|
| **output-identical** (padding is masked, so terms cannot change) | ✅ **HOLDS — measured.** 200 units strided across the full length distribution (**300× spread**), bucketed vs unbucketed, **0 of 200 terms differ byte-exact** |
| **15× speedup** (8 → 125 u/s) | 🔴 **NOT SUPPORTED** |

**Why the speedup claim collapses:** the fill encodes **`snippet`, which is capped at 300 chars**
(`SNIPPET_MAX_CHARS`; `validate-load` asserts *snippets over cap = 0*). Measured over the fill
population: **min 1 · p50 274 · p90 298 · max 300.** There is no long tail. **~300 chars is ~75
tokens, and padding differences that small cannot buy 15×.**

What actually happened: bucketing sorts shortest-first, so the run **opened on the 1-char snippets**
and reported 125 u/s — *the head of a sorted distribution, not the job's rate.* It then decayed to
5 u/s as it reached the median. **I read that opening number as a speedup and published it.**

🔴 **The bucketed job took 493.5 min against the unbucketed projection of 309 min.** The unbucketed
8 u/s was measured on `ORDER BY chunk_id` — random with respect to length — so **that projection was
the sound one and this run was slower.**

⚠ **I cannot separate algorithm from machine.** 493 min is wall clock across ~9 hours on a laptop;
thermal throttling or sleep is at least as plausible a cause as anything in the code. **So the
honest statement is that the speedup is unsupported, not that bucketing is harmful** — and the
distinction matters because only one of those would justify changing the code back.

⭐ **What this cost, and what it did not:** nothing about the column. The output is verified
byte-identical to the unbucketed encoding, so **the fill's 157,582 rows are valid and the gate
proceeds on them.** What was wrong was my *explanation*, published twice — as *"the longest
documents are last"* in status reports, over a population whose longest document is 300 characters.

### ⚠ And the verification itself was VACUOUS on its first run

`verify-bucketing.py` printed **`0 of 200 differ`** from a sample measuring **`min 200 max 201`** —
uniform length, so bucketed and unbucketed order were **the same list** and the diff compared a run
with itself. `LIMIT n OFFSET count/3` over a length-ordered table returns *consecutive* rows.

**The tool's own header had warned against exactly this** (*"taking the first N would give
near-uniform lengths… the check would pass without testing anything"*) and I wrote the sample that
did it anyway. Fixed by striding across the whole distribution, **and a guard now REFUSES to report
a result when the spread is under 5×** — a check that cannot fail must not be able to print a pass.
