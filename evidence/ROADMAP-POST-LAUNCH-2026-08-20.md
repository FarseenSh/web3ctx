# POST-LAUNCH ROADMAP. Proposed by the Opus stranger session, **ruled by the owner** 2026-08-20.

**This supersedes any separate roadmap block.** It is the one piece.

🔴 **Nothing here starts without its own pre-registration, and nothing here is launch-gating.** The
order below is the owner's; the pre-registration is per item, after launch.

⭐ **Why a roadmap from a stranger is worth adopting at all:** the adversarial run found three things
with 760 tests, the shakedown, M1 and both `validate-load`s green (rule 14). Its proposals come from
the same vantage — *what the surface does to someone who did not build it* — and that is the vantage
every instrument here structurally lacks.

---

## SHIPPED PRE-LAUNCH, by ruling — the one item pulled forward

**Recipe continuation cursor.** Ruled out of item (a) below and shipped this cycle, because the
measurement was not a design gap but an **implementation gap of rule 6's own design, at 0%**: 9 of 9
served recipes truncated, 0 handles, while `web3_fetch`'s schema already took a `cursor`.

**The chunker half of (a) stays post-launch.** Paging to the rest of a body and *never splitting a
normative unit in the first place* are different problems; only the second changes what a first page
contains.

---

## ADOPTED, in order. Each through its own pre-registration, after launch.

### a. Chunker — never split a normative unit. 🔴 **NARROWED by amendment, 2026-08-20 (A4).**

**Never split:** a MUST/SHOULD block · a function together with its NatSpec · adjacent list items
under one heading.

> **AMENDMENT (2026-08-20, per A4 of the external-evidence report — which CORRECTS ITS OWN EARLIER
> ADVICE):** the adopted item is **the narrow form ONLY**. It does not license a chunking
> philosophy.
>
> 🔴 **NOT ADOPTED, with the scale evidence cited:** semantic, contextual, **late** and **summary**
> chunking as defaults — **`arXiv:2608.16586` (VERIFIED, Aug 17 2026)** finds they *"rarely achieve
> significant wins over simpler baselines"* at scale, token-based remains a strong default, and
> methods at equal performance **differ sharply in operational cost**. 🔴 **NOT ADOPTED: chunk
> overlap** — measured as no benefit, with indexing cost, plus a *"context cliff"* past ~2.5k tokens.
>
> **The FOR side is not dismissed, and its id was RESOLVED the same day** — `arXiv:2603.06976`,
> *"A Systematic Investigation of Document Chunking Strategies and Embedding Sensitivity"*
> (Mar 7 2026), resolved because it was **already cited in `14-` from an earlier sweep** and the
> rule arrived after it. ⚠ **What that licenses is the CITATION, not the NUMBERS**: the
> Paragraph-Group-Chunking figures (fixed-length nDCG@5 ~0.244 vs ~0.459) are still second-hand
> from a search index, and a resolved id is not a paper anyone here has read.
>
> ⭐ **So (a) is pre-registered as a MEASUREMENT ON THIS CORPUS, with OPERATIONAL COST as an explicit
> axis** — never as adoption from the literature. *"Chunking is a multi-objective design decision"*
> is the vocabulary; the second objective is the one a benchmark table hides.

**T6 is the receipt.** The ERC-4626 rounding trap needs **both halves of the matrix** — round down
issuing shares, round **up** computing what the user supplies — and a unit boundary between them
serves half a rule, which reads as a whole one. ⚠ **This is the failure class the product exists to
stop, produced by our own chunker**: not a wrong fact, a *complete-looking* fragment.

⚠ It touches ingest, so it is a **re-ingest**, and the corpus is 585,017 units. Pre-registration
prices that before anything runs.

### b. Priority fill within the existing budget parameter

**Order:** version + pin → traps → selectors → recipe-only-if-asked.

🔴 **"Within the existing budget param" is the whole constraint.** No new field, no raised ceiling —
R-Z refused both, and this is a **fill order**, not a budget change.

> **AMENDMENT (2026-08-20): the pre-registration gains its FIRST CANDIDATE — null-stripping.**
> Measured in the external report: payloads emit `requested_version: null`, `exact_version_match:
> null` and an empty `diagnostics {}` on nearly every call. **Free-looking — and still gated.**
> ⚠ C2 is why: *"emitting the report unconditionally made the dedupe arm LARGER than the control"*,
> and a change whose whole case is *it costs nothing* has no margin to absorb being wrong. It is
> measured like any other fill change, and 🔴 **an absent key and a `null` key are different facts**
> — the pre-registration must say which callers read the distinction before it removes it.

⭐ **It absorbs the F76 bundle.** F76 is *the recipe is gated on an undescribed enum value*; a fill
that serves the recipe **when it was asked for** and spends the room on version+pin and traps
otherwise makes the `intent` question a priority question instead of a surface-wording question —
and the surface stays at 590/600 tokens.

### c. Assertions-as-tests — typed assertion kinds in CI against pins

`symbol_exported` · `signature_matches` · `natspec_contains` · `peer_range` ·
`address_code_identical` · `address_call_returns` · `tx_emits`.

🔴 **ASSERTIONS COMPLEMENT THE STAMP AND NEVER REPLACE IT, AND THE STAMP IS SCOPED:**

> **`validated_by` attests that THE INTEGRATION RAN as recorded. Facts get their own prover.**

**Disjoint failure coverage, and the owner ruled it proven in both directions:**

| direction | evidence |
|---|---|
| a **fact drifted** and no human run caught it | **Q9 / J3** — `rainbowkit`'s peer range was correct and the gloss beside it was falsified by its own pin. `peer_range` is a machine check; no amount of *running the integration* produces it |
| **integration evidence** no static assertion could produce | **the CCTP receipts** — five hashes with per-hash chain and role, including the arbitrum-sepolia mint. No assertion kind can attest *a human bridged one USDC and it arrived* |

⭐ **That symmetry is why the stamp narrows rather than shrinks.** A stamp that claimed both would be
F15's shape — receipt claims exceeding receipt evidence — which the curator has already fixed once,
upstream, this week.

### d. Re-verification cron — S1's successor

Daily `eth_getCode` + codehash per address row · weekly assertion re-runs · release-diff flags
against pins.

> **AMENDMENT (2026-08-20): (d) gains its JUSTIFYING NUMBER, and it is from a VERIFIED source.**
> **`arXiv:2607.09349` (VERIFIED, Jul 10 2026)** measures **deceptive grounding** in real
> deployment at **7.8% across 740 pairs — rising to 13.6% for recently-updated entities.**
>
> ⭐ **That is the case for a cron in one line: the failure rate nearly DOUBLES exactly where this
> project operates** — new majors, fresh deployments, upgraded proxies. Liveness is worth most
> precisely where staleness is most likely, and until now (d) was justified by principle alone.

⚠ **This is the freshness SLA becoming a mechanism instead of a promise** (golden rule 7: `as_of` on
every unit). A dated `as_of` that nothing re-checks is a freshness *claim*; a cron that flags drift
is a freshness *fact*.

### e. Evaluation infrastructure — the trap benchmark in CI, on a schedule

The trap set, run over the **HTTP harness** (queue item (a)) against competitor arms, **on a
schedule**.

> **AMENDMENT (2026-08-20) — N4 SPLITS INTO TWO ITEMS THAT MUST NOT WAIT ON EACH OTHER.**
>
> **4a — BLOCK-ANCHORED FORK EVALUATION (infrastructure).** Agents against historical chain state on
> mainnet forks, **each case anchored to a specific block** (`2606.26216`, VERIFIED). It is the
> bridge from *"validated once on 2026-08-07"* to *"re-run against pinned chain state on every
> commit"* — and it is **build work with real cost**.
>
> **4b — THE STATISTICAL BAR (bootstrap CIs + significance tests).** 🔴 **It applies to measurement
> data WE ALREADY HAVE**, so it is filed separately **so it never waits on 4a**. ⭐ **That separation
> is the whole ruling:** bundled, the cheap half that improves every existing number would have sat
> behind the expensive half that needs forks, infrastructure and a budget. **A dependency that only
> exists because two things arrived in one paragraph is not a dependency.**
>
> ⚠ **It also inherits D17 rather than replacing it:** every gate verdict already carries its MDE and
> the n=393 floor still stands. 4b adds intervals to descriptive numbers that currently have none.
>
> ⚠ **J1's publishability limit stands regardless of both.** The stranger benchmark's payloads were
> **transcribed, not captured**, and its token columns are asymmetric — **no statistical treatment
> repairs an input that was never byte-exact.** Confidence intervals on a transcription describe the
> transcription. **4b makes our numbers honest about their uncertainty; it does not make that run
> publishable, and only queue item (a) can.**

🔴 **The reason is a measurement, not a principle:** *"nobody else catches these" has a shelf life.*
**Firecrawl flipped FAIL → PASS on a single tool-name correction** inside one benchmark session —
the arm did not improve, the caller did. **A competitive claim measured once is a claim about one
afternoon**, and the anchors (R-AA) already work this way internally; this extends it outward.

### f. CITATION LINTER (N2) — **ADDED by amendment 2026-08-20**

**In CI: resolve every citation · assert 40-hex where a pin is claimed · reject globs, `localhost`
and trailing junk.**

> **AMENDMENT (2026-08-20) — (f) GAINS A SECOND STAGE, and citability now requires BOTH.**
>
> | stage | the bar |
> |---|---|
> | **1 — RESOLVES** | the id fetches, and its title and date are what the citing text says they are |
> | **2 — THE CITED CLAIM IS CONFIRMED PRESENT** | the sentence or number we attribute to it **is in the paper** |
>
> 🔴 **A RESOLVED-BUT-UNREAD ID IS DECEPTIVE GROUNDING INSIDE OUR OWN EVIDENCE REPORT** — *"every
> claim sourced from a real document, about the wrong entity"* (`2607.09349`, VERIFIED), with the
> paper as the entity. ⭐ **We adopted the term this week and the first place it applies is here.**
> Stage 1 alone certifies that *a paper with that title exists*; it says nothing about whether it
> contains the number we hung an argument on.
>
> **Current standing of the citable set:**
>
> | id | stage 1 | stage 2 | citable |
> |---|---|---|---|
> | `2608.16586` · `2607.09349` · `2606.26216` · `2604.09515` | ✔ | ✔ *(claims confirmed against abstracts)* | **YES** |
> | `2603.06976` | ✔ | 🔴 **NOT CONFIRMED** | **stage-one only** |
>
> ⚠ **`2603.06976` is marked, not withdrawn.** Its id, title and date are resolved and the existing
> `14-` citation stands on that basis; **its numbers — nDCG@5 ~0.244 fixed vs ~0.459 PGC — may not be
> quoted until stage 2 passes.** That is the same warning already in the resolution log, now with a
> name and a gate behind it.
>
> ⭐ **The two-stage bar is a stricter test than the one we apply to other people's payloads**, and
> that asymmetry is deliberate: an evidence report is where a wrong citation is least likely to be
> caught by anyone downstream.

🔴 **Its FIRST RUN targets `EXTERNAL-EVIDENCE-2026-08-20.md` itself** — the reading list before the
recipes. **26 of its ~30 arXiv ids are unresolved**, and until the linter resolves them they are
titles and abstracts from a search index. ⭐ **The check points at the document that proposed it
before it points at anything else**, which is the only order in which adopting an evidence report
does not require trusting it.

**The gap is measured on our own bytes, not asserted:** 44 of 85 recipe citations SHA-pinned · **5
malformed URLs** (three trailing periods, a trailing backtick, a stray comma) · **one glob returning
404** (`unpkg …/src/**/*.d.ts`) · **one `http://localhost:5277`** leaked from a recipe's metadata
field. ⚠ The last two were fixed by the curator in `f627c9e`; **a fix is not a check**, and this is
the check.

⚠ **It is a resolution test, not a shape test — and that distinction is already paid for.** The
curator's own shape-based rule flagged **23** broken citations; **HTTP said 2**. *The resolvability
test is the authoritative one*, and a linter that only reads the string would inherit the 21 false
positives.

⭐ **The literature names this gap explicitly** — *"Cited but Not Verified"*: current RAG *"does not
validate source accessibility, relevance, or factual consistency."* ⚠ **That id is UNRESOLVED and is
therefore not cited here** — it is described, which is exactly the discipline this item enforces.

---

### g. LATENCY — collapse sequential round trips. **ADDED by amendment 2026-08-20.**

**The 2026-08-20 nine-vantage run measured warm p50 `1,487 ms` against the sub-500 ms warm SLO.**
W4's diagnosis stands and is unchanged by the new numbers: **hop count × RTT, not compute** — D1's
own time was ~3 ms of it.

**Candidate mechanisms:** fewer sequential hops · Smart Placement.

🔴 **NEEDS AN OWNER RULING FIRST: is the SLO re-scoped, or is the work scheduled?** Those are
different decisions and only one of them is engineering. Nothing starts until that ruling exists.

🔴 **Never quote the single-vantage figures without the multi-vantage numbers beside them** —
cold p50 **1,487** / p95 **3,023** · warm p50 **1,457** / p95 **3,526**, n = 1 per vantage per
phase. ⚠ And **latency is an SLO, never a headline**: sub-second tool calls are ~1% of task
wall-clock, so a faster tool call does not make an agent meaningfully faster.

## 🔒 LEASHED — held behind a hard constraint, not scheduled

**10 tokens of surface headroom.** The registered surface is **590 of 600** (golden rule 9), and
that ceiling is an eval subject, not a preference.

| leashed | the leash |
|---|---|
| **traps** | ship as a **priority FIELD** inside item (b) — **before any sixth tool** |
| **`web3_compat`** | **rides the manifest arm**, not a new primitive |

⭐ **The rule underneath both:** *a capability earns a field before it earns a tool*, and **never
build meta-tools** — GitHub built dynamic tool discovery and deleted it.

## 🧱 FILED BEHIND THE EXISTING WALL — N3, the audit-findings trap corpus

**N3 proposes a trap corpus mined from audit findings** (code4rena, OpenZeppelin findings,
DeFiHackLabs, annotated vulnerability datasets), on the measurement that the source which surfaced
the SwapRouter02 no-deadline trap **with its front-running consequence** was a **code4rena report,
not documentation**.

🔴 **It is filed under GOLDEN RULE 3, unchanged and not relitigated:** *vulnerability / audit-findings
is a SEPARATE POST-TRACTION MODULE — not v1. No audit-PDF parsing, no Solodit ingest, no
`intent=vulnerability`.* **It needs a written copyright policy first.**

> **AMENDMENT (2026-08-20) — THE N3 DISTINCTION IS ACCEPTED. N3 was ONE proposal and it is TWO.**
>
> | half | ruling |
> |---|---|
> | **(a) audit-content REPRODUCTION** — parsing, ingesting, storing, serving or quoting audit findings | 🔴 **WALLED, unchanged.** Golden rule 3 stands exactly as written. Nothing below relaxes it |
> | **(b) audits as a DISCOVERY SIGNAL** — a human reads an audit, learns that a trap exists, and then goes and proves it somewhere else | ✅ **May proceed POST-LAUNCH, and only after a one-page written boundary policy, owner-approved** |
>
> ⚠ **`(b)` names the DISCOVERY half, not the reproduction half.** Written out because the letter
> alone could be read either way, and the two halves have opposite rulings.
>
> **The boundary policy, as ruled — four clauses, all four binding:**
> 1. **Audits are READ, never INGESTED.**
> 2. **Nothing is stored, served or quoted from them** — not a sentence, not a finding, not a title.
> 3. 🔴 **Every trap is asserted and cited EXCLUSIVELY from PINNED UPSTREAM SOURCE.** The audit may
>    say where to look; **only the source may say what is true.**
> 4. **The audit's role is recorded as an INTERNAL DISCOVERY NOTE** and nothing else — never
>    provenance, never a citation, never in a payload.
>
> ⭐ **Why the distinction survives scrutiny rather than being a loophole:** clause 3 means an audit
> **cannot be load-bearing for any claim we make**. If the trap is real, the pinned source proves it
> and the audit is invisible in the artifact; if the pinned source does not prove it, **the trap does
> not ship** — the audit cannot rescue it. **The signal changes where a curator looks. It never
> changes what a payload says**, which is the only property golden rule 3 was protecting.
>
> ⚠ **No work starts on the strength of this ruling.** The one page comes first, and it is the
> owner's approval that unblocks it — *"post-traction module, written policy first"* is intact, with
> its scope now stated precisely instead of by implication.

⚠ **The evidence is good and it does not move the wall.** A rule that survives only until something
attractive arrives is not a rule — and this is the second time audit findings have looked like the
highest-yield coverage path (F51 disqualified code4rena prose from the hard-negative slice under the
source-class rule). **Same answer, same reason, now with a citation.**

## 🛡 GUARDED

**Machine-generated skeletons are TYPED FACTS, never stamped recipes.** A generated artifact that
enters through the recipe door borrows `validated_by`'s signature — the trust a human earned by
running the thing. **The stamp is the moat**; generation is allowed to feed the corpus and never to
sign it.

## Standing don'ts, restated

- 🔴 **No breadth-by-prose.** Coverage follows recipes (R-X), never the reverse.
- 🔴 **No latency work.** It is an SLO, not a headline (golden rule 5).
- 🔴 **No new hand-written prose.**

---

## 📖 VOCABULARY ADOPTED, and the lock on citing it

**Adopted where apt** — because naming a failure class is how it becomes checkable:

| term | what it names here |
|---|---|
| **deceptive grounding** | *"a failure invisible to faithfulness, hallucination, and citation checks because every claim is sourced from a real document, **about the wrong entity**."* ⭐ **The curator reached it independently** — the ERC1967Proxy ruling, *"a real name from a real source attached to the WRONG OBJECT"* — **before the paper was found**. Ours is `(project, version, chain, address)` where theirs is a URL |
| **entity-attribution verification** | the defence — **and the plainest description of what this server does** |

🔴 **THE CITATION LOCK, and it binds every use of the vocabulary above.** The words may be used
freely; the **numbers and the papers may be cited only from the VERIFIED set** —
**`2608.16586` · `2607.09349` · `2606.26216` · `2604.09515`**, plus **`2603.06976`** resolved
2026-08-20 (resolution log in the evidence file) — **and only through the existing copy
locks** (R-X positioning: recipes-first, cents-per-task, **never "cheaper"**, never a token claim,
never a verdict from the payload audit).

⚠ **N1's positioning claims are ADOPTABLE ONLY IN THEIR VERIFIED HALF.** (i) *"RAG alone does not fix
version errors"* rests on **`2604.09515` (VERIFIED)** — 270 real updates, 8 libraries, 11 models,
**42.55%** executable without comprehensive docs, **~66%** with structured documentation and larger
models. ⭐ **That is the quantified argument for signalling a conflict (`version_note`, D2) rather
than serving a better page** — doc retrieval caps at two-thirds. (ii) rests on **`2607.09349`
(VERIFIED)**. **(iii) — the "safely clearable tool results" claim — cites no paper and is NOT
adopted as copy**: *no competitor can make this claim* is a claim about competitors we have not
measured, and L3's rule stands.

## What is NOT on this roadmap, and why that is deliberate

**No retrieval arm.** R-Y closed the retrieval-side work and W1's seam stays gated — *a case held
open by an instrument does not need a proposal held open beside it.*

**No token-packaging candidate.** R-Z closed the trilogy; a fourth attack on the token cost is a
**design change to the bodies rule** and needs a new owner ruling. ⚠ **The stranger benchmark
finding us the most expensive of four arms is not that ruling** — it is the fourth independent
confirmation of a cost already ruled structural.
