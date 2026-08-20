# 09 — Evaluation Harness

**Status:** Spec — ready to implement | **Date:** 2026-06-01 · **substantially revised 2026-08-02** · ***rev. 2026-08-03*** | Part of the Web3 Context MCP build package

> **2026-08-02 revision.** The sparse-audit-retriever activation gate is gone *(historical — that retriever is out of scope entirely)* — replaced by the **signal-hierarchy ablation** and the **reinstatement trigger**. The **denominator bug (E8) is fixed**, three slices are appended, and **hard-negative intrusion rate is now the headline metric** — the previous metric set could not detect the failure this product exists to prevent. Evidence: `14-RESEARCH-2026-08.md` §4.1. Hosting: `16-HOSTING-DECISION.md`.
>
> **2026-08-03 revision *(rev. 2026-08-03)*.** The eval is **a weapon, not just a gate** (`18-` §6). Changes: intrusion rate must be **reported with HN-recall** (the conditional denominator is self-selecting); the **SACL asymmetric-normalization protocol** and **HELEA same-name negative mining** are adopted; a **numeric launch gate** now exists; a **second headline metric — tokens-to-task-completion** — is added with mandatory **Context7 / plain-web-search / no-tool** baseline arms; the `short-keyword` slice is renamed **`agent-shaped`** and respecified by *shape*, not length; the ablation matrix is extended to the `18-` §6.4 arms plus the tool-description and Layer-0 resolution-rate measurements; Job B is restated around **OOD / version-confusable intrusion resistance**, not short-query rescue. Evidence: `17-SOTA-REVIEW-2026-08.md` §2 (C33–C44) + §6.6 · `18-SOTA-BLUEPRINT-2026-08.md` §6 · `19-RESEARCH-LEDGER-2026-08.md` §3. Where `17-` and `18-` conflict, `18-` wins.

---

## Why This Is W1 Task #1

The eval harness is the gating artifact for the entire build. It must exist before any retriever comparison is meaningful. Without a locked query distribution and labeled ground truth, every claim about retrieval quality ("arm X beats arm Y by Z points") is unfalsifiable.

**It is also a distribution asset.** No credible independent eval of docs-context MCPs exists — the only published head-to-head is co-marketed by its winner and predates Context7's rewrite (`19-` §6). Pre-registered and published, ours would be the first in the category (`18-` §6).

Four downstream decisions block directly on this harness *(rev. 2026-08-03)*:

1. **Baseline lock** — eval numbers on the served stack must be established before launch so you have a before-state to compare against. **This is now the *only* real accuracy number we have**: MTEB Code 74.12 is measured on a contaminated suite (see Job A) and cannot be defended.
2. **Signal hierarchy** — the ablation matrix decides whether dependency closure and BM25 carry the product, whether the dense arm stays in v1 at all, and whether a late-interaction arm is ever bought (destination: **turbopuffer ~$16/mo**, not a box — `18-` §2.2). Unenforceable without this harness.
3. **The token axis** — tokens-to-task-completion against the measured **3.3k Context7 bar** is a headline number, not a footnote. The objective function is accuracy → performance → tokens, and agent traces put sub-second tool latency at ≈1% of task wall-clock (`19-` §5): tokens and calls per *completed task* are what the product actually competes on.

⚠️ **Token framing, permanent (ruled 2026-08-12):** **payload cost is MEASURED and we are HIGHER** — 3,304/3,736 vs Context7's 1,249/1,573 on the two demo tasks; **task cost is UNMEASURED (M-B pending)**. The real claim was always **tokens-to-TASK-completion**: fewer tokens of version-blind docs can cost more tokens of retries. **We no longer claim cheaper-per-payload anywhere.** `measurements/W2-BASELINES-RESULT.md`.
4. **Recipe-completion measurement** — the 20 hand-curated recipes only prove their value if you can measure how often they appear and satisfy integration-intent queries. The ≥70% target is meaningless without this runner — and its denominator was undefined until 2026-08-02 (E8). *(P20 ✅ RESOLVED 2026-08-03: the metric is now **completion-on-covered-protocols**, with **coverage reported separately and always alongside it** — two numbers, never blended.)*

The query distribution must be **locked before launch** (W8). Changing it afterward invalidates your before/after comparisons. Build it in W1, validate it in W2-W5 against real indexed data, and freeze it at W8.

See `07-COVERAGE-UNIVERSE.md` for the P1/P2/P3 project tiers that determine which projects supply ground-truth relevant documents.

---

## Spec

### Query Set *(rev. 2026-08-03)*

| Property | Value |
|---|---|
| Size | **200 queries — locked 2026-06-07.** That is the core set and it is frozen; the three appended slices below are independently versioned files, never merged into it |
| Style | **Integration / tutorial** — "how do I use X with Y" — NOT audit-style |
| Scope | Must NOT include vulnerability, audit-finding, or exploit queries (those belong to the separate v-next audit module) |

**Sources for query authoring:**

- Foundry forums (common integration pain points)
- Stack Overflow `solidity` tag
- Ethereum Stack Exchange
- Real integration tasks encountered during recipe authoring
- Protocol-docs FAQs

Do not generate synthetic queries from the corpus. Every query must map to a real developer question someone actually asked.

### Categories (Mirror the Intent Router)

The query set must cover all live intents in proportion to expected traffic. The `vulnerability` intent is NOT included — it is the v-next audit module.

| Category | Intent tag | Example query shape |
|---|---|---|
| Wallet connector / AA | `integrate` | "How do I add ERC-4337 smart account support with ZeroDev and wagmi?" |
| Standard implementation | `implement` | "Show me a minimal ERC-4626 vault with deposit and redeem" |
| Protocol integration | `integrate` | "How do I call Uniswap V3 exactInputSingle from a Foundry script?" |
| Debug | `debug` | "What does UniswapV2: INSUFFICIENT_OUTPUT_AMOUNT mean and how do I fix it?" |
| Lookup | `lookup` | "What is the USDC contract address on Arbitrum One?" |
| Learn | `learn` | "What is EIP-7702 and how does it differ from ERC-4337?" |

Distribution guidance: weight toward `integrate` and `implement` (highest recipe coverage), with meaningful representation of `debug` and `lookup`. The wallet/AA category should have the largest single slice — it is the #1 recipe priority category.

### Ground-Truth Labels

Each query gets a labeled set of relevant document/code/recipe IDs from the corpus. A label is:

```
{
  "query_id": "q001",
  "query": "How do I integrate Pimlico bundler with a Safe smart account?",
  "intent": "integrate",
  "category": "wallet-connector-aa",
  "relevant_ids": ["pimlico::EntryPoint::handleOps", "safe::SafeProxyFactory::createProxyWithNonce", "recipe::safe-pimlico-4337"],
  "min_relevant_in_top10": 2
}
```

Relevant IDs include: doc chunk IDs, code selector IDs (`project::contract::function`), and recipe IDs. A result is relevant if it materially helps a developer complete the integration — not just topically related.

Label authoring is the responsibility of the recipe-curator owner (see `08-BUILD-PLAN.md` — human blocker #1 is NAMED & STAFFED). Do not auto-generate labels from model output; that is circular.

---

## Runner Metrics

Run every metric below on every eval run. **There are now two headline metrics**, and neither substitutes for the other; the supporting metrics are required but individually insufficient.

*Metrics rewritten 2026-08-02 — see `14-RESEARCH-2026-08.md` §4.1 (E8, E10, E12, E13) and `15-RETRIEVAL-ARCHITECTURE.md` §7. **Hardened and extended 2026-08-03** — see `18-` §6 and `17-` §6.6.*

### ⭐ Hard-Negative Intrusion Rate — HEADLINE METRIC #1 *(protocol hardened, rev. 2026-08-03)*

**Among queries where both a true positive and a hard negative appear in the top 10: what fraction have at least one hard negative ranked above the highest true positive?**

- **Target:** as low as possible. **There is no published system to beat — the CoREB baseline is >55% for every model tested, and 64% for the strongest.**
- **Lower is better.** This is the only metric that directly measures the failure this product exists to prevent: **a plausible-but-wrong version outranking the correct one.**
- **Hard negatives are version-confusable pairs**, graded `relevance=1` against `relevance=2` true positives: wagmi v2 vs v3 · **viem 2 vs an assumed viem 3** · CCTP v1-legacy vs v2 · ~~Aave v3 vs v4~~ **Aave v3.3 vs v3.7** *(C50, 2026-08-08 — see below)* · EntryPoint v0.7 vs v0.8 · Uniswap v3 vs v4 · `@metamask/sdk` vs `@metamask/connect-evm`.
- **⚠️ C50 — the Aave pair named here was the wrong pair, and this is a candidate for growth, not a relabel.** Aave **v4 has no `Pool` at all** (hub-and-spoke), so `v3 vs v4` is an *architecture* difference with nothing to confuse — the same fault F43 names, structural confusability that is not *asked* confusability. The measured confusable pair is **inside v3**: two live Ethereum V3 pools return different revert encodings for the identical call (Core `POOL_REVISION` 11 → custom error `0x17c5a78e`; Horizon `POOL_REVISION` 7 → `Error(string)` `"33"`; the `Errors` library flipped at **v3.4.0**). 🔴 **This changes no locked row.** `hard-negative` v1.0 is locked and **grows only through the attestation gate by dated amendment** — an Aave v3.3/v3.7 pair enters that way or not at all. Recorded here so the *source list* stops pointing miners at a pair the corpus cannot support (F52's shape: a pair with no asked confusion is invisible to mining by construction, and its absence reads as "no hard negative here").
- **⚠️ Why this had to be added:** CoREB demonstrates that this failure is **structurally invisible to any benchmark with binary, one-positive qrels** — which is exactly the format the original 200-query set uses. Without graded hard negatives we cannot detect the thing we are building against. Note also that **stronger retrievers can score *worse*** here (they surface more same-problem content, creating more chances to mis-rank), so this metric must never be inferred from R@10.

**🔴 REQUIRED — report HN-recall@10 alongside; never publish the intrusion rate alone.**
The conditional denominator ("queries where both a TP and an HN appear in the top 10") is **self-selecting**: a system that *retrieves fewer hard negatives* shrinks its own denominator and can post a flattering intrusion rate while being strictly worse. That makes the bare number **incomparable across systems** — and cross-system comparison is precisely what Job B and the reinstatement trigger depend on. Every run publishes the pair **`(intrusion rate, HN-recall@10)`**, or runs the alternative **fixed-candidate-set protocol** (score all arms over one shared candidate pool, so the denominator is identical by construction). A run reporting one without the other is not a result. (`17-` §3.8 · `18-` §6.1.)

**🔴 REQUIRED — the SACL asymmetric-normalization protocol.**
Report, as a companion table, the **mean rank of the correct-version document in the sub-population where the wrong-version document is better-documented** (longer, more examples, denser prose). This isolates the measured *mechanism* behind version intrusion rather than only its symptom: documentation density alone moved a dense retriever's gold-document rank from **87 → 288** with no change in relevance. A system whose headline intrusion looks fine but whose asymmetric-normalization gap is large is one corpus update away from regressing.

**🔴 REQUIRED — HELEA-style negative mining.**
Hard negatives are mined as **same-name, different-referent** pairs — identical symbol or package name resolving to a different version, chain, or project (`depositForBurn` v1 vs v2; `EntryPoint` 0.7 vs 0.8; `@metamask/sdk` vs `@metamask/connect-evm`). Do not hand-write plausible-sounding negatives: mine them from the corpus so the confusability is real. Today's incumbent-failure audit (`18-` §0) is the seed source and should be re-run quarterly.

**🎯 Launch gate (numeric) — new 2026-08-03.**
Until now this metric gated nothing. The gate is: **intrusion < 25% on the `hard-negative` slice, at HN-recall@10 ≥ 0.6** *(confirmed 2026-08-03 — thresholds are final and launch-binding)*. Both halves bind — clearing intrusion by retrieving fewer hard negatives is a failed run, not a pass. Any margin smaller than the published MDE does not count.

### ⭐ Tokens-to-Task-Completion — HEADLINE METRIC #2 *(new 2026-08-03)*

**Total tokens an agent consumes end-to-end to complete a scored integration task** — every tool call, every returned payload, plus the amortized registered-schema cost. Report **calls-per-task** beside it.

- **Target: ≤3.3k tokens/task** — the measured Context7 bar (~3.3k tok, ~3 calls after their Jan-2026 server-side rewrite; `19-` §6). This is a real published bar, not an aspiration, and the design as originally written loses to it.
- **🔴 Mandatory baseline arms — all three, every run: Context7 · plain web search · no-tool.** Without them "we beat everything" is unfalsifiable. Exa built a code-context tool, measured it, and pointed users back at general web search (`19-` §6) — specialization must be *measured*, not assumed. The no-tool arm is not a formality: it scored **0/20** in the only published category head-to-head, which is the one clean fact that establishes the category has value at all.
- **Report the Skill-mediated and raw-MCP numbers separately.** The Skill front door costs ~100 tokens idle vs 2.5–3.5k for five verbose registered tools; conflating them hides where the win comes from. State the schema-cost amortization explicitly.
- **Why it is a headline:** the objective function is accuracy → performance → tokens. Latency is an SLO (sub-500 ms warm), not a competitive axis — tokens and turns per *completed task* are.

### ⭐ Grade 1 NEVER earns positive relevance credit — RULED PERMANENT 2026-08-06

> *"The twin **NEVER** earns positive relevance credit in any scorer — it exists solely as the intrusion marker; recall/nDCG compute over grade-2 only."*

**Enforced, not documented.** `packages/eval/src/relevance.ts` is the single function every scorer calls — `gain(2) = 1`, everything else `0` — with a test that fails if a grade of `1` ever produces non-zero gain. There is no partial-credit tier.

⚠️ The rule previously lived in a doc comment in `types.ts`, which is the form of guarantee **F51** is about. A scorer that gets it wrong makes **every number in the matrix better**, so nothing in the output would flag it — F48's shape, in the place it is hardest to notice.

⚠️ **Graded ids render in full, with their `project@version` prefix, always.** The v1 hard-negative sheet stripped the prefix, so `grade 2` and `grade 1` printed as byte-identical strings on 17 of 23 rows, leaving a reviewer unable to check the one dimension the slice exists to test.

### R@10 (Recall at 10)

Fraction of queries for which at least one ground-truth relevant document appears in the top-10 results.

- **Target:** >0.85 across corpus
- **Interpretation:** The retriever finds something useful for 85% of queries. **Necessary but far from sufficient** — R@10 is blind to intrusion, and a system can score 0.90 R@10 while ranking a wrong-version answer first on half its queries.

### nDCG@10 (Normalized Discounted Cumulative Gain at 10)

Measures ranking quality — relevant results ranked higher score better.

- **Interpretation:** Complements R@10. Detects ranking regressions even when R@10 stays flat.
- **⚠️ Only meaningful once graded relevance exists.** Under binary one-positive qrels, nDCG collapses to a function of rank position alone and becomes **perfectly correlated with MRR** — the degeneracy CoREB documents across all ten CoIR datasets. The hard-negative slice is what makes nDCG carry independent information here.

### Recipe-Completion % — **two numbers, never one** *(P20 ✅ RESOLVED 2026-08-03)*

**🔴 The metric is redefined as completion-on-covered-protocols, reported alongside coverage.** The old single number silently blended two unrelated failures — *"we have no recipe for that protocol"* (a worklist decision) and *"we have the recipe and still didn't satisfy the query"* (a retrieval/freshness failure). Blending them makes the number undiagnosable and caps it at whatever the worklist happens to cover. They are now split, permanently.

**Base population — corrected 2026-08-02 (E8).** The previous wording said "queries in the `integrate` and `implement` **categories**." Those are **intents**, not categories; the eval file's actual categories are `wallet-connector-aa`, `standard-impl`, `protocol-integration`, `debug`, `lookup`, `learn`. The base population is queries whose *intent* is `integrate` or `implement` — **n = 106 of the locked 200**. (The alternative reading — the three integrate-ish *categories* — gives 130, and all 106 fall inside it. Report 130 as a secondary line, never interchangeably.)

**Metric 1 — Recipe-completion on covered protocols *(the target)*.**
- **Denominator:** the subset of the 106 **whose protocol is on the covered (recipe-worklist) list**.
- **Numerator:** a relevant hand-curated recipe appears in **top-10**, its `last_validated` stamp is **current**, and it was judged to provide a working integration path.
- **Target: ≥70%.** This is a **retrieval-and-freshness** measurement: given that we curated the protocol, did the system actually deliver it?

**Metric 2 — Coverage *(reported, not targeted)*.**
- **Coverage = covered-queries ÷ 106.** This is a **worklist / roadmap** measurement: how much of real integration demand the 20 recipes address at all.
- It has **no launch target**. It is a planning input that tells you which recipes to author next.

**🔴 The reporting rule.** The two numbers are **never blended into one**, never averaged, and never quoted alone. Every run, every dashboard and **all public reporting must show both** — always as the pair `(completion-on-covered %, coverage %)`. A single "recipe-completion" figure is not a result.

- **⚠️ Where the E8b ceiling now applies.** The keyword proxy suggesting the 20-recipe worklist reaches **~69%** of the 106 was always a statement about *coverage*, not about completion — and under this definition it bounds **Metric 2 only**. **The ≥70% completion target is no longer at risk from it.** (That proxy remains crude, not arithmetic proof: a query need not name a project to be recipe-satisfiable, and 69 vs 70 sits inside proxy noise.) A low coverage number is a signal to widen the worklist; it can no longer drag the completion target below its gate.
- **Why separate from R@10:** R@10 counts any relevant document. This pair isolates the moat, and splits its two failure modes.

### Ablation matrix (E13) — required on every run *(extended, rev. 2026-08-03)*

*Extended to the `18-` §6.4 arms. **Every arm reports intrusion (with HN-recall) AND tokens** — an arm ships only if it does not raise intrusion.*

**Retrieval / index arms:**

| Arm | What it tests |
|---|---|
| **deps-only** | does dependency closure alone carry it? (the primitive with zero competitive analogs) |
| **BM25-raw** | the honest lexical floor, generic tokenization |
| **deps + BM25** | the proposed primary path — closure defines candidates, BM25 ranks within them |
| **+ dual-tokenization** | verbatim compound + camelCase/snake subtokens in a separate weighted column — the measured **+89% BM25 identifier headroom** on camelCase-heavy corpora |
| **+ doc-side sparse expansion** | inference-free doc-only expansion on prose (`opensearch-…-doc-v3-gte`, Apache-2.0). **Ships only if it does not raise intrusion** — expansion is predicted to smear version boundaries |
| **+ doc2query** | cheap batch question generation into `expansion_prose` |
| **+ dense** | the single-vector arm. It ships **only if it earns its place here** |
| **+ reranker** | `@cf/baai/bge-reranker-base` over top-50 — W1-qualified on latency, ships only if it cuts intrusion within budget |
| **fusion vs no-fusion** | CC α≈0.7 vs RRF vs **none**. HetDocQA found rank fusion delivers no reliable gain on exactly this corpus shape (code + markdown + prose) — the null arm is mandatory, not optional |

**Deps is never score-fused** — it defines the candidate set, it is not a similarity distribution. Any ablation that min-max-normalizes a reachability score into a convex combination is measuring an artifact (`18-` §4).

**Two non-retrieval ablations, mandatory and easy to forget:**

- **Tool-description ablation.** Description wording measurably swings tool-activation rates (`19-` §4). Descriptions are an eval subject, not marketing copy — an unactivated tool scores zero regardless of its retrieval quality.
- **Layer-0 resolution-rate measurement.** The fraction of queries whose entity + version + symbol Layer 0 actually resolves. **This has never been estimated**, and the "106 of 200 never touch an encoder" figure silently assumes 100%. Until it is measured, that figure is stated as a *derivation*, never as a result.

### Per-language breakdown — required, never aggregated

Report **Solidity · Vyper · Rust-Anchor · Move · Cairo** separately. CoREB shows retrieval quality tracks training-corpus coverage, with Ruby and Go lagging by up to **0.33 nDCG**; our languages sit further down that slope. An aggregate number hides exactly the gap that decides FT1a/FT1b.

### ⭐⭐ THE LAUNCH GATE IS TWO-TRACK — AMENDED 2026-08-06 BY OWNER RULING (F50)

> *"The gate is AMENDED, owner-ruled and dated today. Same shape as the F30 ceiling amendment and §1c: **an outcome whose correct form is exclusion needs its own vocabulary, not a forced reading as failure.**"*

⚠️ **Provenance, stated because a gate amended by the party being measured is not a gate.** This is an **owner ruling, dated**, and it is the third amendment of this shape in the project — `EDGE-RESOLUTION-PROTOCOL.md` §1c and §1c-2 are the other two, and both are recorded with the same insistence. **The original Track-A verdict is still computed and still printed for every predicate arm.** Today's FAIL stays in the record beside the amended verdict. **History is not rewritten; that is what keeps pre-registration credible through an amendment.**

#### Track A — ranker arms (the twin is candidate-eligible). **UNCHANGED.**

```
intrusion < 25%   AND   HN-recall ≥ 0.6   AND   the MDE beside every verdict
```

#### Track B — predicate-scoped arms. PASS requires **ALL FOUR**.

```
1.  every labelled hard negative accounted for by predicate exclusion (n/n),
    ZERO admitted to the candidate set
2.  ZERO grade-2 (correct) ids excluded — the predicate must never overreach.
    REPORTED EXPLICITLY IN EVERY RUN, as its own column.
3.  recall@10 ≥ the best ranker floor's — exclusion may never be bought with
    retrieval loss
4.  version bound ONLY from query evidence. With no version evidence the
    predicate must not fire, and the arm scores on Track A.
```

⚠️ **Track B is STRICTER than Track A, not a relaxation.** Each clause closes a specific way exclusion could be cheated:

| clause | the cheat it closes |
|---|---|
| 1 | a predicate that only *sometimes* fires |
| **2** | **over-reach — a spotless intrusion column bought by throwing the right answer away with the wrong one** |
| 3 | **the same cheat HN-recall guards on Track A, in filter form** |
| 4 | a predicate firing on a *guess* — the intrusion failure committed before search, where nothing observes it (F28) |

**Why two tracks and not one looser one.** `intrusionRate` / `hnRecall` measure a **ranker**: does a system holding both versions put the right one first? A predicate-scoped arm never holds both — Layer 0 removes the confusable before BM25 runs, which is golden rule 3's thesis. Forcing that into Track A printed *"HN-recall 0.00 — a low intrusion rate bought by retrieving fewer hard negatives"* over the arm with the **best recall in the matrix**.

**First measurement under the amendment** (draft set, not headline-eligible): `layer0+predicate+bm25` — **✔ PASS · TRACK B**, HN excluded **68/68**, correct excluded **0**, recall@k **63.2%** vs floor **35.3%**. Under the original Track-A gate, unamended: **✘ FAIL**. Both are on the record.

⚠️ **Clause 3 immediately did its job**: `layer0+deps+bm25` excluded 68/68 and excluded 0 correct ids, and still **FAILED** — recall 0.0% against a 35.3% floor. Exclusion bought with retrieval loss is not a pass.

Implemented as `checkLaunchGateTrackB()`; clauses asserted individually in `packages/eval/test/intrusion.spec.ts`.

### ⭐⭐ NO GATE VERDICT BELOW THE MINIMUM n — PRE-REGISTERED 2026-08-06 (D17)

> *"Compute the n at which the launch gate's MDE ≤ 10pp; below that n, results are reported descriptively and **NO gate verdict may be issued**. The rule's shape is registered today; **the number is derived mechanically, not chosen.**"*

`packages/eval/src/power.ts` · `minimumN()`. Below the floor, `GateVerdict.verdictIssued` is `false`, the harness prints **⊘ NO VERDICT**, and every number is descriptive.

- **Derived, not chosen** — the smallest n with `minimumDetectableEffect(p, n) ≤ 0.10`, at the variance-maximising baseline `p = 0.5`. That baseline is the only one that can never *understate* the requirement; the gate's own 25% threshold would give a smaller, flattering number for exactly the runs closest to the line.
- **Registered before the rows exist.** It was pre-registered while the `hard-negative` slice stood at three rows — far below any plausible bar — so the number cannot have been picked to clear.
- ⚠ **When `verdictIssued` is false, `passed` carries no meaning.** Same shape as F50: an outcome whose correct form is *"the question cannot be answered here"* needs its own vocabulary rather than the pass/fail axis. The rule refuses a **flattering** run as readily as a poor one — it is about the sample, not the result.
- ⚠ **`n = 68` is below the floor.** The Track-B PASS recorded in F50 stays in the record as issued under the rules then in force; **under this rule it is not re-issuable** and no run may quote it as a verdict.

### ⭐ Version evidence has TWO classes — RULED 2026-08-06

| class | example | strength |
|---|---|---|
| **version token** | `CCTP V1:` · `wagmi v3` · `0.7` · `TokenMessengerV2` | the developer's explicit statement |
| **version-bearing identifier** | `minFinalityThreshold` — held by `cctp@v2` and no other version | **presence, not parsing** |

> *"F39's lesson applied in the positive direction: **the identifier is the version signal.**"*

F39 recorded the negative form — CCTP puts the version *inside* the container name, so a `\bv2\b` regex cannot see it. Read forward, presence is the **stronger** signal: it cannot be spoofed by writing "v2" in a sentence about v1. `packages/eval/src/version-evidence.ts`; **Layer 0 binds on it**, and a corpus-unique identifier binds the project too.

Two guards, both learned from defects the rule produced on its own first run:
- **the token must be written as an identifier** — an internal capital. Length is not a substitute: `consumed` is eight characters and is an identifier in `cctp@v1` only, so every corpus-side check passed on the phrase *"receiveMessage consumed nonce"*.
- **`version-shared` is not a version** — the standing ruling already excludes it from hard-negative mining.

⚠ **The no-invention rule governs it: absence binds nothing.** A token the corpus does not hold never means *"then it must be the new one."* That is the recency prior, and it is the bias that got a row dropped from the locked slice.

### ⭐ No artifact may contain a literal statistic — RULED 2026-08-06 (D16)

> *"Every number reproduced from data at render time. That closes the 17-vs-20 class permanently."*

Enforced by `tools/verify-artifacts.ts`, which re-runs every generator and fails if any artifact is not byte-identical. **Regeneration rather than a lint for digits**, because a derived `20` and a typed `17` look identical on the page — and because a prose rule would be the failure it forbids.

### ⭐ Every gate verdict carries its MDE — RULED PERMANENT 2026-08-06

> *"n=68 → MDE 23.6pp: correctly refused as a measurement. **Protocol note, permanent: every gate verdict carries its MDE beside it.**"*

**Enforced by the type, not by a reporting convention.** `checkLaunchGate(result, mde)` takes the MDE as a **required** argument, `GateVerdict.mde` is a field, and `GateVerdict.summary` renders as `✘ FAIL (MDE 23.6pp) — …` so that **quoting the verdict carries the sample-size caveat with it**. A convention is what gets dropped when a number is quoted somewhere else; a verdict without its MDE is a claim about a threshold with no statement of whether the sample could see that threshold at all. Asserted in `packages/eval/test/intrusion.spec.ts`.

### Statistical power (E12) — state it before reporting anything

Publish the **minimum detectable effect at n=200** and confidence intervals on every headline number. A 2026 study on adjacent data measured the *same* configuration at **+2.0% (n=100) and −2.7% (n=250)** — a sign flip straddling our set size. Any delta smaller than the MDE is not a result.

---

## Lock-Distribution-Before-Launch Rule

The **core 200** — queries, labels and category proportions — were locked **2026-06-07** and are **frozen at W8** (launch). That lock holds. After W8:

- You may ADD queries only in a separately versioned slice; the original 200 are immutable.
- You may NOT relabel queries retroactively to make a retriever look better.
- You may NOT reweight categories between comparison runs.

**Rationale *(rev. 2026-08-03)*:** the lock exists so the **ablation arms** and the **before/after of any retriever change** are comparable, and so the published eval carries a frozen baseline a third party can re-run against us. If the distribution shifts between runs, every delta is meaningless.

### ⭐⭐ NO ROW ENTERS ANY SLICE WITHOUT PASSING THE ATTESTATION GATE — RULED 2026-08-06 (F51)

The first `hard-negative` set presented for lock was **refused**: it attributed text to sources that do not contain it and bound golds to threads about different symbols — *"the product's target failure class, confident, well-formed, wrong attribution, committed by our own harvest layer."*

**The gate is a TOOL, pre-registered before it judges anything.** Protocol: `measurements/ATTESTATION-PROTOCOL.md`. Implementation: `packages/eval/src/attestation.ts` (pure) + `tools/attest-slice.ts` (I/O, exits non-zero on any failure). Evidence: `tools/fetch-sources.ts` caches every cited source verbatim — title, body, **every comment**, author metadata — so each verdict is re-checkable against the same bytes.

| check | requires |
|---|---|
| **A1** | the source resolves and is cached |
| **A2** | the phrasing is an exact substring of **one line**, or the normalization of one contiguous unit, modulo **only** the three declared normalizations |
| **A3** | the gold's member and container are named in the source, demonstrably its subject (same block, or container-in-title), **and the query names the gold's own member** (`A3e`/`A3f`) |
| **A4** | the source is a developer thread — **audit-report prose and agent-generated text are disqualified**; README / doc-file / release-note are flagged |
| **A5** | not the twin's version; **no query text used in both directions with different golds**; the **source thread's own** version evidence must not contradict the asked side (`A5d`) |
| **A6** | exactly one grade-2 in the asked scope, ≥1 grade-1 in the twin scope, every id resolvable in the corpus |
| **A7** | the source lives in the gold project's own repository |
| **A8** | the container is distinguishable from prose (internal capital, or ≥8 chars) |

**Every defect the curator found is a test case** in `packages/eval/test/attestation.spec.ts`, written against the real cached bytes.

⚠️ **A guarantee stated in prose is not a guarantee.** The refused sheet promised *"no word is ever added"* and an inline-flag rule; both were violated by its own content and neither was ever executed.

### 🟢 Three appended slices — added, not merged (E10) *(rev. 2026-08-03)*

The core 200 stay untouched. Three slices are added **as independently versioned files**, so the baseline stays comparable while the set gains the coverage it was missing:

| Slice | Why | Size |
|---|---|---|
| **`agent-shaped`** *(renamed from `short-keyword`)* | **~10-term, keyword-dense, operator-heavy, low-natural-language** queries — built from the **measured shape** of agent-emitted queries (Hornet / BrowseComp traces: median ~10 terms, keyword-dense, beyond human p99 — `19-` §3). **The property is shape, not length.** The old "short-keyword, ~19 tok" framing was wrong twice: the locked 200 already average 13.3 words (≈18–22 tok), so token length does not distinguish them at all; and agent queries are not "short" — they are *keyword-dense and operator-heavy*. Currently 0% of the set; ≈100% of what an agent actually emits. Agent-shaped traffic also costs **~8.4×** more to serve at the same p99, so this slice feeds W0 cost measurement M3 | ≥40 |
| **`hard-negative`** | Version-confusable graded pairs, mined HELEA-style (same name, different referent). Without these, intrusion — headline metric #1 — is unmeasurable. Sources: wagmi v2/v3 · viem-2-not-3 · CCTP v1-legacy/v2 · **Aave v3.3/v3.7** *(C50 — not v3/v4; v4 has no `Pool` to confuse)* · EntryPoint 0.7/0.8 · `@metamask/sdk`→`@metamask/connect-evm`. ⚠️ **v1.0 is LOCKED at 2 attested rows** — this column is the *mining* source list, not the slice; growth is by dated amendment through the attestation gate | ≥40 pairs |
| **`per-language`** | Solidity / Vyper / Rust-Anchor / Move / Cairo, balanced | ≥50 |

> ### ⚠️ Index-version caveat on `per-language` *(added 2026-08-04, finding F10 — approved)*
>
> **This slice can currently be fairly scored for Solidity and TypeScript only.** Grammar coverage decides what is in the index at all, and in this index version:
>
> | Language | Index state | Fair to score? |
> |---|---|---|
> | Solidity | full structure — hand-verified node map, containers/members/edges | ✅ |
> | TypeScript | **structure-light** — cAST spans, identifiers, imports; deliberately **no** container/member selectors | ✅ (as structure-light) |
> | Rust-Anchor | structure-light, same path | ✅ (as structure-light) |
> | **Vyper · Move · Cairo** | **PROSE ONLY — no grammar pinned** | ❌ |
>
> Measured consequence, not a projection: Stage A ingested `curve` (Vyper) as 249 units from **44 of 119 files**, all prose; and `sui`'s 44,921 units are its **Rust**, not its Move.
>
> **Reporting rule: a prose-only language is reported as `not-indexed`, never scored.** Scoring it would produce a number that measures grammar coverage while appearing to measure retrieval quality — the precise failure mode `11-` (C1–C32) exists to prevent. The slice's language balance is therefore **conditional on the index version it ran against**, and every published per-language table names that version.
>
> Unblocking Vyper/Move/Cairo is W2 work: `tree-sitter-vyper@0.1.1` exists (wasm availability unverified), `tree-sitter-cairo@0.0.2` likely ships no wasm, and **no Move npm grammar was found**.

⚠️ **Do not build `agent-shaped` by truncating the locked 200.** Truncation produces short *natural-language* queries, which is a different distribution from keyword-dense operator-heavy ones and would measure the wrong thing. Author them from observed agent traces and from the query strings our own tool receives once traffic exists.

> ### ⭐ `agent-shaped` STATUS: **`pending-traces`** — APPROVED AS SHIPPED *(ruled 2026-08-05)*
>
> > *"Contract + validator with zero queries. Never generate them. It populates from real agent traces when beta traffic exists; until then it is listed as `pending-traces` in the protocol."*
>
> **`artifacts/slice-agent-shaped-CONTRACT.json` ships the shape bounds and `shapeReport()`, which returns *which* property a candidate misses. It contains zero queries, and that is its approved state — not an unfinished one.** ⚠️ **Do not add queries to it.**
>
> **Measured, and it is why the slice cannot be authored from what we have:** **0 of the locked 200** match the agent shape. Mean stopword share **46%** against a bound of ≤25%; mean identifier-ish share **9%** against a bound of ≥50%. The gap is not marginal — the two distributions barely touch, so nothing in the existing set can be reshaped into this one.
>
> The alternative — writing 40 plausible-looking keyword-dense queries by hand — would produce a slice measuring **our imagination of agent traffic**, reported as a measurement of agent traffic. That is the same fault F43 identifies in the hard-negative slice (structural confusability ≠ *asked* confusability) and the same one that keeps `aave-v4` UNVERIFIABLE rather than guessed. **The corpus decides what is confusable; reality decides what is asked; the slice needs both, and only one of them is available yet.**
>
> It populates when beta traffic exists, from the query strings our own tool receives.

Slices are reported **separately and never pooled into the core-200 numbers.**

Version-control the query file and every slice. Treat any commit that modifies locked content after W8 as a protocol violation. *(The package became a git repo on 2026-08-01 — E9 closed.)*

---

## Three Jobs the Harness Must Execute

### Job A — Baseline on the Cloudflare-native stack

**When:** W5 (after 20 recipes indexed, ~150 P1 projects indexed)

**What *(rev. 2026-08-03)*:** Run the full eval on the live stack — **lexical-D1 FTS5 BM25 ranking within a core-D1 recursive-CTE dependency closure**, plus whichever prose arm survived the W1 ablation — against the locked 200 plus all three slices. Record **intrusion rate with HN-recall**, the **SACL asymmetric-normalization table**, **tokens-to-task-completion vs the three baseline arms**, R@10, nDCG@10, recipe-task-completion%, **the full ablation matrix**, and **per-language breakdowns**.

**Output:** The "before" numbers that appear in all public positioning. They must be real; do not cherry-pick a subset. **Publish MDE and CIs alongside them.**

**Also establishes:** latency distribution (P50, P95) warm and on miss, against the **sub-500 ms warm SLO**. ⚠️ Measure the **Sessions-API replicated D1 path** — a naive `prepare()` always hits the primary and will produce the wrong number (`19-` §5). Latency is an SLO here, not a headline: the competitive axes are tokens and calls per completed task.

**⚠️ Why this baseline matters more than ever:**

1. **The published number is contaminated.** The **MTEB Code 74.12** figure is measured on a suite where CodeSearchNet-derived data is ~**59% of queries**, where CodeSearchNet-CCR alone (28% of the suite) leaks the function name through a shared `title` field, and where the qrels are degenerate enough that **nDCG ≡ MRR**. **Never use it as a capability claim.** Capability claims cite RTEB, FreshStack, or this eval — noting that **no trustworthy public code-retrieval leaderboard currently exists**, which is precisely why ours is worth publishing.
2. **The languages were never in the training data.** No off-the-shelf code retriever's fine-tune corpus contains **Solidity, Rust-Anchor, Move, or Cairo**. Job A is the first real measurement of Web3-language quality, which is why the per-language breakdown is mandatory.
3. **If it exposes a material gap**, the remedy is the Web3 fine-tune, **split in two**: **FT1a** fine-tunes a *doc-only expansion / single-vector* model that the serving stack can actually use, **FT1b** fine-tunes a late-interaction model offline as decision input for the reinstatement trigger. ~$20–100 GPU each. ⚠️ **Daytona credits fund ingest *or* fine-tunes, not both** (`17-` C44) — budget the split explicitly before committing. **The locked query set stays out of all training data.**

Methodology references: FreshStack (NeurIPS 2025 D&B) for nugget-level labelling · CORE-Bench (arXiv 2606.11864) · CoREB (arXiv 2605.04615) for graded hard negatives and the intrusion metric · SACL for asymmetric normalization · HELEA for same-name negative mining. *(A "HAKARI-Bench/NanoCoIR (arXiv 2606.22778)" reference previously appeared here and has been **removed 2026-08-03**: it never resolved to a title. That is the exact failure mode the FinanceBench correction (C9/C25) exists to prevent — **[citation unresolved — do not cite until verified]**.)*

**🔴 Label provenance — the nugget contradiction, resolved.** FreshStack nugget-level labelling coexists with the "no model generates our labels" rule as follows: **nuggets are LLM-*drafted*, curator-*judged*.** A model may propose candidate nuggets from a document to save curator time; **human judgment is the label of record** and nothing enters the ground truth without a curator accepting it. Auto-generating labels from model output and scoring a retriever against them is circular and remains forbidden.

### Job B — Signal-hierarchy ablation ⭐ *(rev. 2026-08-03)*

**When:** **W1**, then re-confirmed at W5.

**⚠️ What W1 actually runs on.** W1 has no full corpus — W2 is when indexing starts. So Job B at W1 runs against **the three appended slices plus whatever corpus subset W2 has indexed at that point** (the fixture corpus and the first P1 projects), and its results are **directional, not final**. The numbers that gate anything — the launch gate, the reinstatement trigger, the published eval — are the **W5 re-confirmation** on the full ~150-project P1 index. Report W1 numbers explicitly labelled as a subset run, with the corpus size and project list attached. Anything else silently compares runs over different corpora, which is the failure the distribution lock exists to prevent.

**What:** Run the ablation matrix and answer: **is the measured ordering — dependency closure ≫ lexical ≥ dense — true on *our* corpus?** Several papers found it on Python and on non-Solidity code; nobody has tested it here.

**Two decisions ride on the answer:**

| If | Then |
|---|---|
| deps + BM25 alone are within noise of the full stack | **Drop the dense arm from v1 serving entirely.** Fewer moving parts, lower latency, lower cost — and the last model leaves the serving path |
| the dense arm carries a material share, **or** the offline late-interaction run resists intrusion materially better on the `hard-negative` slice | The **late-interaction reinstatement trigger** below is evaluated — destination **turbopuffer ~$16/mo**, on evidence that was earned |

**Mandatory companion run — the offline late-interaction arm *(restated 2026-08-03)*.**
Run **mLateOn / GTE-ModernColBERT vs the single-vector arm vs BM25** on the **`hard-negative` and `per-language` slices**, measuring **intrusion (with HN-recall)**.

**The question it answers is OOD and version-confusability, NOT short-query rescue.** The previous framing ("does late interaction resist the short-query collapse?") was backwards: **MaxSim's documented failure mode is *long* queries** — an 86–97% drop beyond ~20 words, and architectural, not a training artifact (`19-` §3). Short-keyword robustness comes from exact lexical match, which is what BM25 already is. Late interaction's real, measured edge is **out-of-distribution generalization**: every late-interaction model holds or improves rank under decontamination while single-vector dense drops, with a 26-point MLDR gap on identical training data. Unseen ecosystems and version-confusable pairs are exactly that regime — so that is what we test.

**Naming:** the model is **LateOn** (LightOn, arXiv 2607.27178). **There is no "LateOn-Code" — the name does not exist** and must never be cited (C33, `17-` §2). There is also no good *code* late-interaction model off the shelf: every downloadable ColBERT scores **≤63 MTEB Code** (GTE-ModernColBERT 54.37, jina-colbert-v2 49.88); only mLateOn reaches 73.48. That — not hosting — is why v1 has no late-interaction arm.

**Deployment note:** an **in-Worker ColBERT is not currently feasible** — a 17M int8 model plus the ONNX-Runtime WASM build exceeds the 10 MB gzip Worker bundle cap (`19-` §5). So this arm cannot be smuggled onto the edge as a top-50 reranker today; it is an offline measurement whose only serving destination is the store swap described below. Re-check the bundle math when either the model or the runtime shrinks.

### Job C — Recipe-Completion Measurement (ongoing)

**When:** W5 baseline, then re-run after every recipe addition or recipe update

**What:** Track the **pair** — completion-on-covered-protocols % **and** coverage % — as the recipe corpus grows from 0 to 20 *(P20 ✅ RESOLVED 2026-08-03; never collapse the pair into one number)*. This is the only metric that directly measures the moat, and the split makes it diagnosable: **completion below 70%** means the recipe exists but was ranked too low (fusion weight) or was stale (freshness gap); **coverage low** means the worklist is the gap and the fix is authoring, not retrieval.

**Ongoing cadence:** re-run after each weekly ingest cron updates the corpus (post-launch). Alert if **completion-on-covered %** drops more than 5 pts between runs — that signals a freshness or ranking regression. Track coverage % separately; it moves only when recipes are added or the query mix shifts.

---

## Late-Interaction Reinstatement Trigger *(rev. 2026-08-03 — was "Box-Reinstatement Trigger")*

*The destination changed. **There is no box** — the reinstatement target is **turbopuffer at ~$16/mo flat**, which has served ColBERT-style multi-vector since 2026-07-29 (C34). The Hetzner path is historical. Equally important, the premise changed: v1 has no late-interaction arm because **no good code late-interaction model exists** (all ≤63 MTEB Code), **not because serverless hosting was unavailable** (C33/C34).*

The decision is: **does a late-interaction arm earn a store swap to turbopuffer?** All three conditions must hold. Failing any single one = stay on D1.

| # | Condition | How to verify |
|---|---|---|
| 1 | The offline late-interaction run beats the served arm on the axis that matters — **materially lower intrusion at equal-or-better HN-recall on the `hard-negative` slice**, or a clear OOD win on unseen-ecosystem queries. *(≥3 pts R@10 overall is a supporting signal, never the deciding one — R@10 is blind to intrusion.)* | Job B companion run on the slices + the W5 full index. Margins below the published MDE do not count |
| 2 | The margin survives **per-language** breakdown on Solidity specifically | An aggregate win driven by prose queries does not justify the swap |
| 3 | Fusion weights re-tuned for the new arm on the real distribution | Tune on a held-out split. **Do not transfer α from the single-vector configuration** — it will not carry to a late-interaction arm. Deps remains a candidate filter and is never fused in |

**If all three hold:** land the arm on **turbopuffer (~$16/mo)** behind the **CodeRetriever seam** — a store swap, not a redesign. ⚠️ Get the late-interaction beta terms **in writing first** (private beta, max 2 vector columns, pricing unpublished — `19-` §8), and note the trade: turbopuffer converts the Worker from edge-global to region-pinned via placement hints, and has no uptime SLA below Enterprise. Everything else — dependency graph, recipes, payload shapes — is constant across the switch. That is the seam's entire remaining purpose.

**If they do not hold:** the $16/mo is never spent, and the finding — that dependency closure and BM25 carry the product — becomes a publishable result in its own right.

---

## Implementation Checklist *(rev. 2026-08-03)*

- [x] Author 200 queries from real developer sources — **done; locked 2026-06-07**
- [x] Assign intent + category tag to each query
- [x] Version-control query file + labels — **done 2026-08-01 (E9 closed)**
- [ ] Label ground-truth relevant IDs (recipe-curator owner, not a model) — needs the indexed corpus, W2–W5
- [ ] Set `min_relevant_in_top10` per query
- [ ] **Adopt FreshStack nugget-level labelling** in place of binary `relevant_ids` (P9) — **nuggets LLM-drafted, curator-judged; human judgment is the label of record**
- [x] **`agent-shaped` slice — SHIPPED as a contract + validator with ZERO queries, status `pending-traces`** *(ruled 2026-08-05; see the status box in §"Slices")*. Populates from real agent traces when beta traffic exists. **Never generate them.**
- [ ] **Build the `hard-negative` slice** (≥40 graded version-confusable pairs, `relevance=1` vs `2`) — **mined HELEA-style: same name, different referent**
- [ ] **Build the `per-language` slice** (≥50, balanced across Solidity/Vyper/Rust-Anchor/Move/Cairo)
- [ ] Implement runner: call `web3.search` + `web3.grep` + `web3.deps` + `web3.lookup`, collect top-10 IDs
- [ ] **Implement the intrusion-rate scorer — emitting `(intrusion, HN-recall@10)` as a pair.** Reject any run that reports one without the other
- [ ] **Implement the SACL asymmetric-normalization table** — mean rank of the correct-version doc where the wrong-version doc is better-documented
- [ ] **Enforce the launch gate:** intrusion **<25%** on the `hard-negative` slice at HN-recall **≥0.6** *(confirmed 2026-08-03 — final)*
- [ ] **Implement the tokens-to-task-completion harness** — end-to-end tokens + calls per completed task, target **≤3.3k**, with amortized schema cost stated
- [ ] **Wire the three mandatory baseline arms: Context7 · plain web search · no-tool**
- [ ] **Implement the extended ablation matrix** — deps-only · BM25-raw · deps+BM25 · +tokenization · +expansion · +doc2query · +dense · +reranker · fusion-vs-no-fusion, each scored on intrusion **and** tokens
- [ ] **Run the tool-description ablation** — wording swings activation rates materially
- [ ] **Measure the Layer-0 resolution rate** — the "106 never encode" figure depends on it and has never been estimated
- [ ] **Implement per-language reporting** — never aggregate
- [ ] **Compute and publish MDE + confidence intervals** before any headline number
- [ ] Implement the recipe-completion scorer as a **pair** *(P20 ✅ RESOLVED 2026-08-03)* — **completion-on-covered-protocols %** (denominator = the covered-worklist subset of the 106 `integrate`/`implement`-intent queries; target ≥70%) **and coverage %** (covered-queries ÷ 106). **Reject any run, dashboard or publication that emits one without the other, or blends them**
- [ ] **Run the offline late-interaction companion** (Job B: mLateOn / GTE-ModernColBERT vs single-vector vs BM25 on the `hard-negative` + `per-language` slices) — testing **OOD / version-confusable intrusion resistance**, not short-query rescue
- [ ] Label W1 Job-B output as a **subset run** (slices + whatever W2 has indexed); full confirmation is W5
- [ ] Run Job A baseline at W5, record numbers
- [ ] **Pre-register and publish the protocol** — it would be the first credible eval in the category
- [ ] Freeze distribution at W8 (launch)
- [ ] Schedule Job C re-runs post each weekly ingest cron; re-run the incumbent version-truth audit quarterly (it is the hard-negative source *and* the marketing engine)

---

## Cross-References

- `07-COVERAGE-UNIVERSE.md` — P1 ~150 projects that supply ground-truth relevant documents at W5 baseline
- `08-BUILD-PLAN.md` — W1 task #1 placement; W5 recipe milestone; W8 launch and distribution freeze
- `03-ARCHITECTURE.md` — serving path, Layer 0 disambiguation, the CodeRetriever seam
- `14-RESEARCH-2026-08.md` — §4.1 CoREB (intrusion, contamination) · §4.3 FreshStack labelling · §4.11 the signal hierarchy this harness tests. ⚠️ Superseded in places by `19-`
- `15-RETRIEVAL-ARCHITECTURE.md` §7 — the decisions this harness is designed to settle
- `16-HOSTING-DECISION.md` §5 — the original reversal condition; **destination amended to turbopuffer** by `17-` C34
- `17-SOTA-REVIEW-2026-08.md` — §2 corrections **C33–C44** (C36 restates the late-interaction question; C39 the slice rename) · §3.8 the self-selecting denominator · §6.6 metric hardening
- `18-SOTA-BLUEPRINT-2026-08.md` §6 — **the design of record for this harness.** Where `17-` and `18-` conflict, `18-` wins
- `19-RESEARCH-LEDGER-2026-08.md` — §3 agent query shape, late-interaction evidence, expansion risk · §5 Worker bundle cap · §6 the 3.3k bar and baseline arms · §8 open probes (incl. the removed HAKARI citation)
- `05-DATA-MODEL.md` — recipe schema, the 20 launch recipes, validation stamps
