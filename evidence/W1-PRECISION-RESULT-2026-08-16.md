# W1 · PRECISION — MEASURED. 2026-08-16.

**Pre-registration:** `measurements/W1-PRECISION-PRE-REGISTRATION.md`, commit **`a16de46`**, written and
committed **before this tool ran once**. Every definition, threshold, exclusion rule and decision
band below was fixed there. Nothing was chosen after a number existed.

**Instrument:** `packages/eval/src/precision.ts` (16 tests, each falsified) · `tools/lib/arms.ts`
(the ablation harness, **extracted rather than copied**, and the extraction proven inert) ·
`tools/measure-precision.ts` · raw: `measurements/raw/precision.json`.

---

## 1. THE NUMBER

**Product arm — `layer0+predicate+bm25` as shipped, with R1 abstention — scope-precision@10,
macro, wildcard-version:**

# 82.0% [95% CI 75.4 – 88.2]

**Composition, because a score is not a result without it (rule 14a):**

| | |
|---|---|
| locked-200 queries | **200** |
| with a derivable gold scope | **153** — 47 had none (every label was `doc::`/`recipe::`/`deployment::`/`abi::`, or an `eip::` with no single corpus project) |
| **SCORABLE** | **143** |
| excluded as **coverage** (gold project not in corpus) | **10** — `uniswap-v2`, `uniswap-sdk`, `uniswap-universal-router`, `walletconnect`, `web3`, `web3py` |
| **abstained** (R1: no scoping evidence → declines) | **21** — counted, never scored as a miss |
| **n in the decision denominator** | **122 queries · 1,135 units** |
| index | **371,819 units · 675 projects — live parity** |

### The full matrix, k = 10

| arm | role | **scope-P** | strict-P | id-P | id-ceiling | scope-R | id-R | abst | n |
|---|---|---|---|---|---|---|---|---|---|
| `bm25-raw` | incumbent floor | 22.8% | 22.8% | 0.0% | 1.0% | 55.1% | 0.0% | 0 | 143 |
| `+dual-tokenization` | floor | 12.8% | 12.8% | 0.1% | 1.0% | 32.5% | 11.5% | 0 | 143 |
| `layer0+predicate+bm25` | product (pre-R1) | 72.5% | 71.8% | 0.1% | 1.1% | 70.2% | 11.5% | 1 | 142 |
| `layer0+deps+bm25` | product | 75.7% | 73.8% | 0.0% | 1.5% | 69.5% | 0.0% | **90** | 53 |
| `deps+bm25 (top-hit)` | wrong-composition control | 10.5% | 10.5% | 0.0% | 1.0% | 9.4% | 0.0% | 0 | 143 |
| **`layer0+predicate+bm25 (R1 abstain)`** | **PRODUCT, as shipped** | **82.0%** | **81.2%** | 0.2% | 0.9% | 76.0% | 15.0% | 21 | 122 |

**F₁ 78.9 · F₀.₅ 80.8** at scope granularity (paired with scope-recall, so both halves are the same
unit — rule 12). The floor's are **F₁ 18.4 · F₀.₅ 14.6**.

**Stable across k:** 79.5% @1 · 82.0% @5 · 82.0% @10. The payload delivers a prefix of this list, so
the delivered number cannot be lower for ranking reasons.

**`strict-version` costs 0.8pp** (82.0 → 81.2). The wildcard variant is the one that could flatter a
version-blind retriever; it barely differs here, which is the version-truth claim holding up on the
one variant designed to break it.

### The hypothesis, tested as registered

> *"Our BM25 runs inside a version-bounded candidate set, which should raise precision far above raw
> BM25's 0.375. That is a HYPOTHESIS, not a measurement. Test it."*

**✔ SUPPORTED — product 82.0% vs floor 12.8% = +69.3pp, MDE 12.0pp at n=122.** Reported
**descriptively**: n=122 is below D17's floor of 393, so **no gate verdict issues**.

---

## 2. 🔴 THE CAVEAT THAT OUTRANKS THE NUMBER: this is not on CodeGrep's scale

The order asked which side of CodeGrep's 0.375 / 0.445 / 0.677 we fall on. **That comparison cannot
be made with the gold we have, and saying so is the honest answer.**

**CodeGrep retrieves within ONE REPOSITORY.** Precision = retrieved files ∩ gold-patch files /
retrieved files. Project selection never enters it — every candidate is already in the right
project by construction. **Under our `scope-precision` definition, CodeGrep's BM25 would read
1.000, including the configuration measured at 0.375.**

So the two numbers measure different stages:

| | CodeGrep measures | we measured |
|---|---|---|
| stage | **within-project unit selection** | **project selection** |
| our analogue | `id-precision` — **ceiling 0.9%**, unmeasurable with our labels | `scope-precision` — 82.0% |
| their analogue | — | trivially 1.000 in their setup |

**The pre-registration called `scope-precision` an upper bound and said a pass is *"suggestive,
never proof"*. This is the mechanism behind that clause, and it makes the bound a LOOSE one.**

⭐ **What the number does support, stated in its own terms and not theirs:** *our scoping stage puts
**82.0%** of delivered units in the project the label names, where raw BM25 over the same corpus
puts **12.8–22.8%**.* That is a real, large, measured effect and it is golden rule 2's thesis
confirmed. It is **not** the claim "we are above CodeGrep's 0.677".

**The quantity that WOULD compare is `id-precision`, and its ceiling on this label set is 0.9%.**
It cannot reach 0.375 no matter how good the retriever is — so `assertCanReachThreshold()` **throws**
rather than letting a later caller quote it. A check that cannot pass has not been run either.

---

## 3. 🔴 A DEFECT INSIDE THE INSTRUMENT, FOUND MID-RUN — and both numbers publish

**The first run measured the product arm at 47.6% and read `◐ NEUTRAL BAND`.** The corrected run
reads **82.0% / `✔ BUYS EFFICIENCY`**.

**Cause: 108,525 units — 29.2% of the corpus, every prose unit — carry a bare UUID `chunk_id`**
(`a957831a-1ba0-51cd-b06e-e663627d42a9`), with `project_id` / `version` living **only in the `units`
table columns**. The scorer derived scope by parsing the selector string, so **every prose unit
resolved to nothing and was counted as off-scope.**

| arm | run 1 (defective) | **run 2 (corpus is the authority)** |
|---|---|---|
| `bm25-raw` | 4.3% | 22.8% |
| `+dual-tokenization` | 9.7% | 12.8% |
| `layer0+predicate+bm25` | 42.8% | 72.5% |
| **product (R1 abstain)** | **47.6%** | **82.0%** |

⚠ **This fix moved the number in the direction that means LESS work** — it removed the reranker's
mandate. That is exactly the shape that deserves the most scrutiny, so:

- The fix is not a judgement call: **`project_id` is a column; a UUID is not a project name.** Deriving
  identity by parsing `chunk_id` is wrong for 29.2% of the corpus, full stop.
- It was found by the instrument's **own diagnostic**, not by inspection: `returnedScopes` came back
  **empty on a query that had retrieved 10 units**, which is impossible if scope resolution works.
  `unresolvable` is now a reported field for exactly this reason — a silent zero is what hid it.
- It is pinned by a test that **fails when `scopeOf` is ignored** (falsified: 14 pass / 1 fail).
- **Run 1's artifact is kept**: `measurements/raw/precision-PREFIX-DEFECT-run1.json`. History is not
  rewritten.

⭐ **The lesson generalises past this scorer: the selector is a naming convention; the columns are
the fact.** Anything in this codebase deriving project or version by parsing a `chunk_id` inherits
this bug. **`holdersOf()` in the ablation harness does exactly that** — it `continue`s on any
chunk_id without an `@`, so version-bearing-identifier binding has never seen a prose unit.
**Reported, not fixed**: it is pre-existing, it is in a published measurement's path, and changing it
silently inside a precision run would confound two things at once.

---

## 4. THE DECISION — step 2, per the pre-registered rule

| band | pre-committed action |
|---|---|
| < 0.375 | reranker bake-off MANDATORY |
| 0.375 – 0.677 | reranker EVALUATED |
| **≥ 0.677** | **step 2 does NOT run; the zero-model primary path is kept** |

**The CI lies entirely above 0.677 on both arms — offline [75.4 – 88.2], live [85.7 – 95.0]. By the
rule as written, step 2 does not run.**

**And a second, independent measurement says the same thing — the reranker's addressable surface,
computed rather than argued:**

| product arm, n=122 | | |
|---|---|---|
| **perfect** — every delivered unit in the gold scope | **94** | 77.0% |
| **mixed** — some in, some out | **12** | 9.8% |
| 🔴 **zero** — the gold project was excluded **before ranking** | **16** | 13.1% |

⭐ **A PERFECT reranker's ceiling on this metric is 86.9% — a maximum of +4.9pp over what ships
today.** A reranker reorders *within* the candidate set; it cannot reach the 13.1% where the
predicate already removed the gold project, and 77.0% of queries have nothing left to reorder.

🔴 **But the honest reading is narrower than "no reranker needed", and the difference matters:**

**`scope-precision` is structurally near-blind to what a reranker does.** Inside a correctly-scoped
candidate set every unit counts as relevant, so ranking quality barely enters the number. The
metric that would answer *"does a reranker help the agent"* is **within-scope unit precision** —
`id-precision` — whose ceiling on our labels is **0.9%**.

**So: step 2 does not run, and the recorded reason is not "precision is high enough." It is that
the question a reranker answers is not measurable with the gold this project currently holds.**

💰 **Cost was never the blocker and is not the reason now.** `@cf/baai/bge-reranker-base` is
$0.003/M — pennies at our traffic. The reranker was **W1-gated and W1 never finished**. If this
entry is ever read back as *"we skipped it to save money"*, that reading is wrong.

**What would unblock it:** unit-level gold. That is the same blocker M-B hit
(*"the next question is a TASK-SET question, not a retrieval one"*) and the same one the
`hard-negative` slice hit at 2 attested rows. **The two open problems are one problem, for the third
time.**

---

## 5. WHERE THE PRODUCT ARM ACTUALLY FAILS — all 16, listed

Not summarised, because the taxonomy is the finding.

| class | n | queries | what happened |
|---|---|---|---|
| **wrong major inside a family** | 4 | q032, q035, q142, q179 | returned `uniswap-v4` / `aave-v4` where gold is `uniswap-v3` / `aave-v3`. **This is D1's family alias landing on the wrong member** — `uniswap`→{v3,v4,periphery} scopes units without choosing |
| **standard ↔ implementation** | 4 | q056, q079, q157, q164 | returned `openzeppelin-contracts` where gold is `erc-721`, and `erc-20` where gold is `openzeppelin`. ⚠ **Arguably the LABEL is narrow, not the retrieval wrong** — flagged, not silently scored away |
| **generic tooling captures the scope** | 3 | q029, q030, q193 | `foundry`, `lifi` won entity resolution on Uniswap questions |
| **spec-vs-project** | 3 | q012, q061, q153 | `eip::4337`→`safe`, `eip::2612`→`erc-20`, `eip::2981`→`erc-1155` |
| **large project captures the scope** | 2 | q036, q037 | `metamask-mobile@8` took the whole scope. §6 measures how much of this the ingest caused |

⚠ **q037 is F55's known residue, live and relocated.** It was recorded 2026-08-07 as resolving to
`uniswap/foundry`; it now resolves to `metamask-mobile`. **Same defect, new destination** — the
narrow-but-wrong class the two refusal floors *cannot see*, exactly as pre-registered then.

---

## 6. DID GROWING THE CORPUS HURT? MEASURED — and it refutes my own reading

The order ruled *"COVERAGE QUEUES BEHIND THIS"*. Having seen `metamask-mobile` in three failure
rows, **I inferred the newly-ingested 67,781 units were degrading scoping. I ran the A/B instead of
publishing the inference, and the inference was mostly wrong.**

Same measurement, same code, single variable — the corpus with and without `metamask-mobile`:

| | without (304,038 units) | with (371,819 units) | Δ |
|---|---|---|---|
| **product scope-P@10** | **82.2%** [75.6–88.3] | **82.0%** [75.4–88.2] | **−0.2pp** |
| `+dual-tokenization` | 14.1% | 12.8% | −1.3pp |
| `bm25-raw` | 22.4% | 22.8% | +0.4pp |

**−0.2pp, against an MDE of 12.0pp. Not a result.** Per query: **3 of 122 moved — 1 better, 2
worse** — plus one query flipped from scored to abstained (`q133`).

**Only ONE query was actually caused by the ingest:** `q036` went from a 6-project scope *containing
the gold* (`aave-v3`, `aave-v4`, `avalanche`, `erc-2525`, `lifi`, `spark`) to the single scope
`metamask-mobile@8`, 10% → 0%. **`q037` and `q142` scored zero in BOTH runs** — they were already
failing for other reasons, and attributing them to the new project would have been wrong.

⭐ **So: adding 18% more corpus did not measurably degrade scoping at this n.** That does not license
unbounded ingest — it is one project, at n=122, with an MDE that could hide a 12pp effect — but the
specific worry I formed from the failure list is **not supported by the measurement**, and it is
recorded that way rather than quietly dropped.

---

## 7. AN UNCOMFORTABLE FLOOR RESULT, AND ITS HYPOTHESIS HALF-REFUTED

🔴 **`bm25-raw` (22.8%) OUT-SCORES `+dual-tokenization` (12.8%)** — the incumbent floor beating our
own ingest-side identifier work, on project precision.

I hypothesised prose concentration and **measured it rather than publishing it**
(`tools/probe-floor-language.ts`, 2,000 units per arm over all 200 queries):

| arm | markdown | code | distinct projects | projects/query |
|---|---|---|---|---|
| `bm25-raw` | **74.2%** | 25.8% | **277** | **5.75** |
| `+dual-tokenization` | 35.4% | 64.5% | 102 | 4.00 |
| *corpus baseline* | *29.2%* | *70.8%* | *675* | — |

**Half confirmed, half refuted.** `bm25-raw` really does return overwhelmingly prose (74.2% against
a 29.2% baseline) — but it is **more** scattered, not less: 277 projects and 5.75 per query against
102 and 4.00. So *"prose is concentrated in fewer projects"* is **wrong**. The surviving reading:
**for a natural-language question, matching prose lands on the right project more often than
matching identifiers does** — and it lands there while ranging more widely.

⚠ **The distribution this was measured on is the one least favourable to identifier matching.** The
locked 200 are human-authored natural-language questions. The distribution agents actually send is
the **`agent-shaped` slice — ~10-term, keyword-dense, operator-heavy — and it holds ZERO queries**
(contract-only, approved that way, populated from real traces when beta traffic exists). **This
floor reversal is measured on prose questions and says nothing about agent-shaped ones.**

**Neither floor is the product**, and the product beats both by ≥59pp. But *"our dual-tokenization
work is below the raw lexical floor on project precision for prose questions"* is a real result and
it publishes here rather than being left out because it is unflattering.

---

## 8. THE HARD-NEGATIVE SLICE — 2 rows, descriptive only

| arm | scope-P@10 | n | abstained |
|---|---|---|---|
| `bm25-raw` | 20.0% | 2 | 0 |
| `+dual-tokenization` | 25.0% | 2 | 0 |
| `layer0+predicate+bm25` | 75.0% | 2 | 0 |
| **product (R1 abstain)** | **100.0%** | **1** | **1** |
| `deps+bm25 (top-hit)` | 0.0% | 2 | 0 |

**n=1 after abstention. This is an anecdote with a confidence interval and it is labelled one.**
MDE at n=1 is 171.6pp. The locked slice remains **2 attested rows** and remains the binding
constraint on every retrieval verdict this project can issue.

---

## 8a. ✅ THE LIVE ARM — the delivered payload. Measured on the second attempt.

The first attempt (2026-08-16) was **refused**: `2000/2000 today, retry_after_seconds=42511`. F66 —
that is the absence of a measurement, and it was recorded as ⊘ UNMEASURED rather than as a number.
**Re-run once the day budget reset, against `https://web3-context-mcp.papermind-ai.workers.dev/mcp`:**

# live scope-precision@10 — 90.6% [95% CI 85.7 – 95.0] · ✔ BUYS EFFICIENCY

| | |
|---|---|
| **n** | **131 queries · 1,116 delivered units** |
| refused by the rate limiter | **1** — unmeasured, in neither numerator nor denominator |
| server abstained (`scope.abstained`) | **14** — 11 scored as abstentions, 3 were already coverage-excluded |
| coverage-excluded | 10 |
| **units delivered per query** | **mean 8.52 · min 0 · max 10** |
| perfect / mixed / zero | **114 / 9 / 8** |
| unresolvable scopes | **0** |

⭐ **Scope came from the payload's OWN `project` / `version` fields, not from our local index** — this
arm measures what an agent *receives*, and those two fields are what it receives. Resolving the
selector against our own copy would score a payload using information the caller never got.

⚠ **The shipped product measures HIGHER than the offline reconstruction of it — 90.6% vs 82.0%** — and
it abstains less (11 vs 21 of the same set). The live path carries the recipe arm, declared family
aliases and the R-V grep changes that `tools/lib/arms.ts` does not. **So the offline product arm is a
CONSERVATIVE proxy for the product, not an equal one**, and §1's 82.0% is the lower of the two.

🔴 **A defect in this arm, caught before it ran and not by luck.** The first draft read
`res.structuredContent.hits`; the endpoint returns **`structured`**. Every hit list would have been
`[]`, and `[]` scores as **abstained** — so a wire-shape bug in my own instrument would have
published *"the product declines to answer 143 of 143 questions."* It now **throws** on an
unrecognised payload shape rather than defaulting to empty. Found by reading one live response
instead of assuming its shape.

⚠ **State ordering, stated:** coverage-exclusion is tested before abstention, so a query that is both
out-of-corpus and abstained is labelled `excluded-coverage`. Coverage is the more fundamental fact,
but the counts do not add the way a reader might expect and this is why.

---

## 9. WHAT IS STILL UNMEASURED — visibly missing, never absent
- ⊘ **`agent-shaped` queries** — 0 rows. §7's floor reversal is measured on the wrong distribution
  and says so.
- ⊘ **Within-scope unit precision**, the CodeGrep-comparable quantity — ceiling 0.9% on our labels.
- ⚠ **Parity is verified on 4 probes, not proved.** Local and live return **identical top-5
  `chunk_id` sequences** on four query shapes (identifier-symbol, identifier-subtoken, prose-content,
  `depositforburn`); `unit_rowid` differs and absolute BM25 scores differ by ~0.09–0.14 (FTS5 global
  statistics live still carries from R-F's 18,490 deleted rows). **The ablation header's claim
  *"byte-identical to remote D1, verified"* is no longer true and is corrected here.**
- ⚠ **`layer0+deps+bm25` abstains on 90 of 143.** Its 75.7% is over 53 queries and must never be read
  beside the others as though the denominators matched.

## 10. Step 4's register — considered and REJECTED, with citations

Recorded in the pre-registration §10 and repeated here so it travels with the result: **token-optimized
formats** (TOON/TRON — 27% fewer tokens, 9–14pp accuracy cost, arXiv 2605.29676) · **minification**
(42% fewer tokens, 12pp worse resolution, arXiv 2606.01326) · **any hot-path compression model**
(golden rule 6) · **rewriting returned bytes** (patch-apply 27/40 → 15/40; −38% tool-output tokens
RAISED paired cost +6.8%, arXiv 2607.12161). **None is blocked on cost.** If step 3 is ever reached
it is **SELECT, NEVER REWRITE**.
