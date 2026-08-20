# PHASE 2 — BENCHMARK RESULT. 2026-08-20. Owner copy.

Pre-registration: `BENCH-PRE-REGISTRATION-2026-08-20.md`, frozen before the first arm ran (`2eaafb0`).
Raw bytes: `artifacts/bench-2026-08-20/` — 128 payloads, hashed, re-verified before scoring.

```
══════════ BENCHMARK 2026-08-20 — publication-grade ══════════
⊘ NO VERDICT — n=16 against the 393 floor (D17). Every figure below is DESCRIPTIVE.
   Raw bytes on disk, hashed, re-verified before scoring. One tokenizer, full payloads.

arm                              ran  VOID   med tok   immutable/total  names ver
────────────────────────────────────────────────────────────────────────────────────
web3ctx                          16     0      3071           316/324  10/16
web3ctx (intent=integrate)       16     0      7454           424/516  16/16
context7                         16     0       558               0/0  6/16
exa (code context)               16     0      1033             1/171  11/16
exa (web search)                 16     0      8986            11/263  13/16
claude web search                16     0     17163             6/404  11/16
firecrawl (developer search)     11     5      3781            26/233  9/11
ethskills (static bundle)         1     —     85068             0/275  1/1
   ⚠ STATIC bundle, carried from the frozen 2026-08-13 cache. Different unit, different provenance.

══════════ TRAPS ══════════
trap                                                 web3ctx web3ctx (in    context7 exa (code c exa (web se claude web  firecrawl (
T1 deadline is NOT in the params struct on Swap         FAIL        PASS        FAIL        PASS        PASS        PASS     partial
T2 amountIn: 0 spends the contract's WHOLE bala         PASS        PASS        FAIL     partial     partial        PASS     partial
T3 outputAmount IS the fee — the difference is       partial        PASS        FAIL     partial        PASS        PASS        PASS
T4 wagmi v3 uses useConnection, not useAccount       partial        PASS     partial        PASS        PASS        PASS        PASS
T5 RainbowKit 2.x declares wagmi ^2 as its peer      partial        PASS     partial     partial        PASS        PASS        PASS
T6 BOTH halves — down when issuing shares/payin      partial        PASS        FAIL        FAIL        PASS        PASS        PASS
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
CAUGHT                                                   1/6         6/6         0/6         2/6         5/6         6/6         4/6
partial (graded NOT caught, J2)                            4           0           2           3           1           0           2

══════════ BOOTSTRAP CIs — 2,000 resamples, deterministic seed ══════════
⚠ A confidence interval does not repair a small n. It states it.
  web3ctx                         names-version [38–88%]    traps [0–50%]
  web3ctx (intent=integrate)      names-version [100–100%]  traps [100–100%]
  context7                        names-version [19–63%]    traps [0–0%]
  exa (code context)              names-version [50–88%]    traps [0–67%]
  exa (web search)                names-version [63–100%]   traps [50–100%]
  claude web search               names-version [50–88%]    traps [100–100%]
  firecrawl (developer search)    names-version [55–100%]   traps [33–100%]

══════════ VOID — 5 row(s), out of BOTH numerator and denominator ══════════
  firecrawl-dev/Q06: quota message in body
  firecrawl-dev/Q07: quota message in body
  firecrawl-dev/Q08: quota message in body
  firecrawl-dev/Q09: quota message in body
  firecrawl-dev/Q10: quota message in body

🔴 A refusal is not a measurement. A void arm is never a zero.
```

---

## 1 · 🔴 The registered prediction was WRONG on tokens, and that is the first thing to say

**Registered, §6:** *"We expect to be the most expensive arm, and by MORE than the stranger run showed."*

**Measured:** our default row is **3,071 median tokens** — **cheaper than exa web search (8,986), claude
web search (17,163) and the ethskills bundle (85,068)**, and dearer than context7 (558) and exa code
context (1,033). With `intent: "integrate"` we are **7,454**, still under two arms.

⭐ **The stranger run's "most expensive of four" does not survive a harness that counts every arm the
same way.** That run priced a *minimal answer path* and read our self-reported content-only figure
against competitors' full payloads (J4). **One tokenizer over full payloads reverses the ordering.**
🔴 **It does NOT license a token claim** — R-Z's lock stands, M-A and M-B measured different
denominators and are not overturned by this, and the composition rule (14a) forbids quoting any of
the three without its unit.

## 2 · 🔴 F76, measured — the default-argument row is our weakest

| | traps caught | names version | median tokens |
|---|---|---|---|
| **web3ctx, default** (no `intent`) | **1 / 6** — 4 partial | 10/16 | 3,071 |
| **web3ctx, `intent: "integrate"`** | **6 / 6** | **16/16** | 7,454 |

**Both rows are ours and both publish.** The recipe argument is the entire difference, and a client
that does not send it gets an arm that catches **one trap in six**. ⭐ **This is the strongest
evidence yet for roadmap item (b)**: the fill order is what makes the moat reachable without the
caller knowing a magic enum value. **F76 is no longer a hypothesis about real traffic.**

⚠ **4 of the 6 default-row traps scored `partial`** — the right artifact surfaced and the text did
not state the fact. Under J2 that is NOT caught, and the partial count is printed beside the total
rather than buried.

## 3 · Immutable citations — the one axis that separates cleanly

**web3ctx 316/324 (97.5%)** · integrate row 424/516 · firecrawl 26/233 · exa web 11/263 ·
**claude web search 6/404** · **exa code context 1/171** · **context7 0/0** · ethskills 0/275.

⚠ **Context7's `0/0` means its payload contains NO URLs at all** — not that its URLs fail. That is a
different fact from everyone else's low ratio and must never be collapsed into one.

## 4 · What we lost, plainly

- **T1 (SwapRouter02 `deadline`)**: our default row **FAILED**; exa code context, exa web, context7-no,
  claude web search all handled it or better. The integrate row passes.
- **T6 (ERC-4626 rounding)**: default row **partial**, integrate **PASS**. ⚠ **Disclosed in advance**:
  our recipe gained the rounding matrix on 2026-08-20 *after losing this trap in the adversarial run*.
  **A benchmark that quietly re-runs a question after fixing its answer is measuring its own patch** —
  so the row is published with that sentence attached, permanently.
- **claude web search caught 6/6 traps.** A general web-search agent with no code index matched our
  best row on the traps and beat our default row.

## 5 · VOID, listed

**5 rows: `firecrawl-dev` Q06–Q10, quota message in body.** Excluded from numerator **and**
denominator; firecrawl publishes as **11 ran / 5 void**, never as 11/16 and never as a zero.
⚠ **This is firecrawl's real quota, hit during the run — not our harness destroying payloads**, which
is what happened in A3 and is why the idempotent skip exists.

## 6 · Judgement calls, named

- **J-A · `partial` counts as NOT caught.** Declared before the run (J2 inherited). Printed separately.
- **J-B · T6 requires both halves.** A payload naming one rounding direction has stated half a rule,
  which reads as a whole one.
- **J-C · ethskills is carried from the frozen 2026-08-13 bundle.** Its source repo is not in this
  environment, so its rule-based selection could not be re-run. Bytes unchanged and hashed; **it is a
  different provenance from every other row and is labelled on the row, not in a footnote.**
- **J-D · context7's two-step chains on the id its own step 1 returned.** No re-ranking by us. An arm
  whose step 1 returned nothing usable is scored on what it returned, never credited with step 2.

## 7 · Harness defects found by running it, both mine

1. 🔴 **A skip that dropped the manifest row.** The smoke run's `T1` sat on disk; the idempotent skip
   saw the file, skipped the fetch **and the record**, so both paid arms published `15/16` and
   `10/15`. **A skip that drops the row silently shrinks the denominator** — the one direction a
   missing measurement is invisible in. Fixed: a carried payload is re-hashed and recorded.
2. ⚠ **My key-hygiene assertion was wrong, not the scrub.** It reported `0/32 redacted` because
   `json.dumps` escapes the guillemets. Verified by reading the actual records: `x-api-key` and
   `authorization` both hold `‹REDACTED›`.

## 8 · Cost and custody

**$0.50 of a $10 ceiling** (plan printed before the first paid call; retries charged before the
request goes out, `MAX_RETRIES = 1`). **135 files scanned — the Anthropic, firecrawl and exa keys
appear in no payload, no manifest, no source file and no log.** All 32 credentialled requests reached
their one allowed host and zero reached any other. **`~/.anthropic-bench-key` was deleted at the end
of the run and its absence confirmed.**
