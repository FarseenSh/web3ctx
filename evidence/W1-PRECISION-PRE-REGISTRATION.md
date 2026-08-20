# W1 · PRECISION — PRE-REGISTRATION. Written 2026-08-16, **before any precision number existed.**

> **Ruled 2026-08-16 (owner):** *"MEASURE PRECISION on the product arm… 🔴 PRE-REGISTER the precision
> definition and the decision threshold BEFORE running anything. Choosing the definition after
> seeing the number is F22, and this number decides the product."*

**This file is committed before `tools/measure-precision.ts` runs for the first time.** Nothing below
was written with knowledge of an outcome. What *was* known when it was written — and is stated here
rather than discovered later — is every **denominator**: coverage counts are composition, not
results, and hiding them until after the run would make the design unfalsifiable.

---

## 0. Why this measurement exists, and what it is a mechanism for

arXiv 2608.05886 (**CodeGrep**, SWE-Bench Verified, n=500) measures a **precision threshold** for
agent retrieval:

| retrieval precision | measured downstream effect on the agent |
|---|---|
| **0.375** (BM25) | **DEGRADES** — resolve −0.6pp, resolved-instance tokens **inflate 21%** (631K → 763K) |
| **0.445** (Jina) | neutral |
| **0.677** | **buys efficiency** |

Our primary path is BM25. **We have never measured our precision.** M-B measured `no-tool` completing
9/12 at 1,504 tok/completed-task against web3ctx 8/12 at 94,559 — a result recorded as *against us*.
CodeGrep supplies a **candidate mechanism** for that result, and this measurement tests it.

**The hypothesis under test, stated by the owner and quoted so it cannot be softened:**

> *"Our BM25 runs inside a version-bounded candidate set, which should raise precision far above raw
> BM25's 0.375 — the ablation showed 63.2% recall@10 with zero hard negatives admitted. **That is a
> HYPOTHESIS, not a measurement.** Test it."*

⭐ **Its falsification is registered here, and is independent of which band the absolute number lands
in:** the hypothesis is REFUTED if the product arm's precision is **≤ the best floor arm's**
(`+dual-tokenization`). A predicate that buys no precision has not done the thing the hypothesis
credits it with, even if the absolute number happens to be high. **That comparison publishes either
way.**

---

## 1. 🔴 The definition problem, and why a single "precision" number would be a lie

CodeGrep's precision is **file-level over a gold patch**: complete ground truth, one repository per
instance. Ours cannot be that, and the differences are not cosmetic:

| | CodeGrep | here |
|---|---|---|
| ground truth | **complete** (every file in the gold patch) | **sparse qrels** — 1–2 judged ids per query |
| granularity | file | **sub-file units** (tree-sitter complete units) |
| corpus | one repo per instance | **675 projects, 371,819 units** |
| unjudged retrieved docs | none exist | **the overwhelming majority** |

With 1–2 judged relevant ids and k=10, a naive precision@10 has a **ceiling of 0.10–0.20** — *below
CodeGrep's degradation point by construction.* Publishing that as "our precision" would report label
sparsity as a retrieval property and would put us in the degradation band no matter how well the
retriever worked.

⭐ **So a precision definition whose ceiling is below the threshold is not a test of the threshold —
it is golden rule 13's failure inverted: a check that cannot PASS has not been run either.** The
ceiling is therefore computed and printed for every definition below, and any definition whose
ceiling falls under 0.375 is disqualified as a decision quantity **by this document, in advance**.

---

## 2. The definitions. Both are registered; only one is the decision quantity.

### (A) `id-precision@k` — the **LOWER BOUND**. Registered, and DISQUALIFIED as the decision quantity.

`|{units in top-k whose chunk_id is graded 2}| / k`. Unjudged units count as **not relevant**.

- **Ceiling** = `min(|R|, k) / k`, computed and printed per query and in aggregate.
- **Disqualified in advance**: at |R| ≤ 2 and k = 10 its ceiling is ≤ 0.20 < 0.375. It cannot reach
  the threshold, so it may not decide anything. It publishes as the **lower bound of the bracket**,
  always beside its ceiling (the R-G / rule-14a discipline: a rate never publishes without what
  bounds it).

### (B) `scope-precision@k` — the **DECISION QUANTITY**, and an **UPPER BOUND** on file-level precision.

A retrieved unit counts as relevant **iff its `project@version` is one of the query's gold scopes.**

**Gold scope derivation — mechanical, one candidate only, no judgement anywhere:**

| gold id shape | → scope | rule |
|---|---|---|
| resolves to a corpus unit (directly or via the existing F42 notation migration) | that unit's `project@version` | exact |
| `<project>::…` that does not resolve to a unit | `project`, **version wildcard** | the label never named a version; inventing one is the no-invention rule |
| `eip::N` | project `erc-N`, **iff exactly one corpus project has that id** | the same unambiguous-derivation rule `migrateLabel` already uses. **14 of 18 map; 4 do not and stay unmapped** |
| alias (`openzeppelin` → `openzeppelin-contracts`) | the **declared** alias target | `artifacts/project-aliases.json` only. **An alias is declared, never inferred** (D1/D3) |
| `doc::` · `recipe::` · `deployment::` · `abi::` | **NOT MAPPED** | they name namespaces we do not serve as units, and no one-candidate rule exists. Counted as unmapped, never guessed |

- **Ceiling = 1.0 for every query**, so the threshold is reachable → it qualifies as a decision
  quantity.
- ⚠ **It is COARSER than CodeGrep's gold**: a unit from the right `project@version` but the wrong
  file counts relevant here and would be a false positive there. **Therefore it is an upper bound**,
  and the two verdicts it licenses are deliberately asymmetric — registered now, so the asymmetry
  cannot read as an excuse added after a number:

| result | strength | why |
|---|---|---|
| scope-precision **< 0.375** | **UNAMBIGUOUS FAIL** | a coarser measure below the bar means the finer measure is below it too |
| scope-precision **≥ 0.677** | **SUGGESTIVE PASS, never proof** | the finer gold can only be lower. A pass here is an upper bound clearing the bar, not the measurement clearing it |

**Two variants, both reported:**
- **wildcard-version** (the decision quantity): the project must match; the version must match only
  when the gold names one.
- **strict-version**: the version must match whenever the corpus holds more than one. Reported
  beside it, because the wildcard variant is the one that could flatter a version-blind retriever —
  and version-blindness is the failure this product exists to fix.

---

## 3. Eligibility, and the three states a query can be in

Registered in advance because two of the three have been scored wrong in this project before.

1. **SCORED** — at least one gold scope's project is in the corpus.
2. **EXCLUDED · COVERAGE** — every gold scope's project is out of corpus. **Excluded from the
   precision denominator and counted separately.** *"We have not indexed the source"* and *"we
   retrieved the wrong thing"* are different facts (R3, F52); the shakedown scored exactly this
   wrong and reported 10/10 while three answers came from other projects.
3. **ABSTAINED** — the arm returned **zero** units. **Precision is `undefined`, NOT 0.**
   ⭐ This is load-bearing: R1 ruled that no scoping evidence means *abstain*. Scoring an abstention
   as a precision failure would invert the meaning of the ruling and penalise the arm for obeying
   it. Abstentions are counted, listed, and reported as their own rate.

**Known coverage, measured before this file was written (composition, not a result):**

| | |
|---|---|
| locked-200 `relevant_ids` | **380** |
| project-namespaced | 182 · `eip::` 50 · `doc::` 93 · `recipe::` 36 · `deployment::` 16 · `abi::` 3 |
| distinct project namespaces | **35** — 25 in corpus, 10 not (`uniswap-v2`, `walletconnect`, `web3py`, `multicall3`, `permissionless`, `uniswap-sdk`, `uniswap-universal-router`, `erc-20-permit`, `web3`, `openzeppelin`→ aliased) |
| queries with ≥1 project-namespaced gold id | **134** |
| **of those, ≥1 gold project in corpus** | **116** (before `eip::`/alias mapping, which can only raise it) |
| queries with no project-namespaced gold id | 66 |
| `hard-negative` LOCKED slice | **2 rows** |

---

## 4. k, and what "retrieved" means

- Precision reported at **k ∈ {1, 5, 10}**.
- **k = 10 is the decision k.** It is the list `web3_search` ranks (`handlers.ts` default limit 10),
  and it is the list `recall@10` already uses — so precision, recall and F-beta are computed over
  one list rather than three. Budget shaping (`shapeUnits`) drops **from the tail**, so the
  delivered payload is a prefix of this list: **k=10 is the conservative choice**, since a
  well-ranked prefix can only have equal or higher precision.
- **`k_delivered`** — the number of units the live payload actually carries — is reported as its own
  distribution by the live arm (§5), never assumed.

---

## 5. The arms. An arm that does not run is **visibly missing**, never absent.

| arm | where | role |
|---|---|---|
| `bm25-raw` | offline | the incumbent lexical floor — CodeGrep's 0.375 is a BM25 number, and this is ours |
| `+dual-tokenization` | offline | our ingest-side identifier work, still no predicate — **the floor the hypothesis must beat** |
| **`layer0+predicate+bm25`** | offline | **THE PRODUCT ARM** — resolve → SQL predicate → BM25 within scope |
| `layer0+predicate+bm25 (no-abstain)` | offline | the pre-R1 composition, kept so the effect of abstention is visible rather than absorbed |
| `layer0+deps+bm25` | offline | the ruled deps composition |
| **`web3_search` live** | **the deployed endpoint** | **the delivered payload — what an agent actually receives** |

🔴 **The live arm CANNOT RUN TODAY and that is stated here, in advance, rather than explained after
the fact.** The authless day budget is exhausted — measured at 09:14 local: `2000/2000 today,
retry_after_seconds=42511` (11.8 h). Per F66 **a refusal is not a measurement**. The live arm is
therefore recorded as **⊘ UNMEASURED — missing, not passed**, and runs when the budget resets. The
offline arms need no endpoint: retrieval quality is a property of the index (§6).

⚠ **The offline product arm honours R1 abstention**, because the shipped product does. The harness's
previously published composition did not — it fell back to ranking the whole corpus when Layer 0
resolved nothing, which is the exact behaviour R1 ruled out. **Both are run and both are reported**;
correcting it silently would make the arm's own history unreadable.

---

## 6. Where it runs, and the parity claim — **earned, not asserted**

Offline, on a **local pair brought to live parity today**: `generated/precision-{core,lexical}.sqlite`
= the local build + `delta-{core,lexical}.sql` applied to **copies** (originals untouched).

| | local (before) | **local (parity)** | live `/health` |
|---|---|---|---|
| units | 304,038 | **371,819** | **371,819** |
| projects | 674 | **675** | **675** |
| max rowid | 304,038 | **390,309** | **390,309** |

🔴 **The gap mattered and it ran in the flattering direction.** The missing project was
`metamask-mobile` — **67,781 units, 18% of the corpus**, and never a gold answer. Measuring without
it would have removed 18% of the distractors from a **precision** measurement. That is the one
direction a precision number must not be wrong in.

⚠ **The ablation harness's header claim — *"byte-identical to remote D1, verified"* — is NO LONGER
TRUE and is corrected here.** Measured today on four probes (identifier-symbol, identifier-subtoken,
prose-content, and `depositforburn`): **the top-5 `chunk_id` sequence is identical on all four**,
while `unit_rowid` differs (the local build reassigns; live carries R-F's 18,490 deleted rowids) and
absolute BM25 scores differ by ~0.09–0.14 (FTS5 global statistics live still carries from the
deleted rows). **Rank order is what a retrieval metric reads, and rank order matched — on n=4
probes.** That is a spot check, not a proof, and it publishes as one.

---

## 7. Statistics — what may be concluded, and the floor that refuses

Two different questions, and conflating them is how a threshold gets cleared by accident:

**(a) arm vs arm** (does the predicate buy precision?) — a two-proportion delta. D17 governs:
`minimumDetectableEffect` at the **eligible** n, and **⊘ NO VERDICT below `minimumN()` = 393**. At
n=116 queries this floor is **not met**, so every arm-vs-arm statement publishes **descriptively,
with its MDE inline**, and no gate verdict issues. Registered now, while the direction of the delta
is unknown.

**(b) arm vs a fixed external threshold** (which CodeGrep band are we in?) — a **one-sample**
proportion against a constant, which is a different question from a two-arm delta and needs its own
rule rather than a silent reuse of D17's:

> **The threshold verdict issues only if the 95% CI lies ENTIRELY on one side of the threshold.**
> A CI straddling 0.375 or 0.677 ⇒ **⊘ INDETERMINATE**, and the resolution is a finer gold, never a
> judgement call.

- **Decision quantity = the MACRO average** (mean of per-query precision), because **the query is
  the independent sampling unit** — ten units from one query are not ten observations. Its CI is a
  **query-level percentile bootstrap** (10,000 resamples, seeded PRNG so the artifact regenerates
  byte-identically, D16).
- The **micro** average (pooled units) is reported beside it and **labelled anti-conservative**,
  because it ignores clustering and would produce the narrower, more flattering interval.

⚠ **This is not D17 being set aside.** D17's floor is applied, unchanged, to (a). Clause (b) is an
additional refusal condition on a question D17 was not written for. Both can refuse; neither can be
satisfied by the other. **If the owner reads (b) as a loophole, it should be struck and the answer
becomes ⊘ NO VERDICT on everything — which is a defensible outcome and is registered as acceptable.**

---

## 8. 🔴 THE DECISION RULE — fixed now, in the owner's own three bands

Applied to **product-arm scope-precision@10, macro, wildcard-version**, on the **core-200 scored
subset** (the `hard-negative` slice is 2 rows and can only ever be descriptive):

| band | verdict | **action, pre-committed** |
|---|---|---|
| **< 0.375** | below CodeGrep's degradation point | **step 2 RUNS — the reranker bake-off is mandatory** |
| **0.375 – 0.677** | neutral band | **step 2 RUNS** — reranker evaluated; ships only if it clears the existing **intrusion veto** and the **sub-500 ms warm SLO** |
| **≥ 0.677** | buys efficiency | **step 2 does NOT run.** The zero-model primary path is kept, **and that is recorded as a measured decision — never as a cost saving** |
| CI straddles a boundary | **⊘ INDETERMINATE** | the band is not claimed; the owner rules on whether to proceed |

**Also reported, whatever the band:**
- **F1 and F₀.₅** at scope granularity (paired with **scope-recall**, so both halves are the same
  granularity — an F-score mixing scope precision with id recall would be two units in one number,
  rule 12).
- **id-recall@10**, unchanged, so this run is comparable to the 2026-08-06 ablation.
- **The refutation test of §0**: product vs `+dual-tokenization`.

---

## 9. What would make this measurement wrong — listed before it runs

1. **The gold is sparse and third-party-authored.** The locked 200 were written 2026-06-07 against
   an imagined index. Scope-precision reads only their *project* claim, which is the most robust
   part of them — but it is still their claim.
2. **Scope granularity is coarse** (§2B). A pass is an upper bound clearing the bar.
3. **116 queries is below every verdict floor** (§7).
4. **The live arm is unmeasured today** (§5). The offline arm is the same `layer0` / `buildPredicate`
   / `buildGrepQuery` code, but it is **not** the delivered payload, and no claim about payload
   precision may be made until the live arm runs.
5. **Parity is verified on 4 probes, not proved** (§6).
6. **`metamask-mobile` is 18% of the corpus and is a pure distractor here** — it is in no gold set.
   That is a true property of the corpus we serve, not a harness artifact, but it means the number
   is sensitive to a single ingest decision and it is named so the sensitivity is visible.

---

## 10. Step 4's register — considered and REJECTED, with citations, so nobody re-proposes them

Recorded now rather than after, per the owner's order. **None of these is blocked on cost.**

| proposal | REJECTED because | citation |
|---|---|---|
| **token-optimized formats** (TOON / TRON) | up to 27% fewer tokens at **9–14pp accuracy cost**, with multi-turn parse cascades | arXiv 2605.29676 |
| **minification** | 42% fewer tokens, **12pp worse resolution** | arXiv 2606.01326 |
| **any hot-path compression model** (e.g. Squeez) | a **2B model on the primary path** — golden rule 6, which already inverted the earlier Provence rule on measured evidence that compression **hurts code** | golden rule 6 |
| **rewriting/compressing returned bytes** (if step 3 ever runs) | compression cut patch-apply **27/40 → 15/40** by corrupting verbatim edit anchors, and removing 38% of raw tool-output tokens **RAISED** paired cost **+6.8%** because cache traffic is ~87% of the bill | arXiv 2607.12161 (2,908 provider-billed runs) |

⭐ **Step 3, if it is ever reached, is SELECT-NEVER-REWRITE**: return fewer units; never alter the
bytes of a unit you return.

---

## 11. And the one sentence that must survive into the record either way

💰 **Cost is not, and never was, the blocker on a reranker.** `@cf/baai/bge-reranker-base` is
$0.003/M — pennies at our traffic. **The reranker was W1-gated, and W1 never finished.** If step 2
does not run, the recorded reason is *"precision measured above the threshold"* — never *"we skipped
it to save money."*
