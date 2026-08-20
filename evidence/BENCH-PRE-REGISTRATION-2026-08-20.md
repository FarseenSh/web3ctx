# PHASE 2 — PUBLICATION-GRADE COMPETITOR BENCHMARK. **PRE-REGISTRATION.** 2026-08-20.

🔴 **NOTHING HAS RUN. Not one arm, not one question.** This document is written to be reviewed and
amended *before* any measurement exists, because every gate this project has honoured was
registered before its run and **a gate edited after a result is not a gate** (F22).

**It publishes whatever it says, including the rows we lose.** That clause is registered here, at
the top, where it cannot later be read as a decision made after seeing the table.

---

## 1 · The question this answers, and the one it does not

**Answers:** *when six retrieval surfaces are asked the same question through their own documented
interface, what does each return — how many tokens, how many re-fetchable citations, and does it
name the trap?*

🔴 **Does NOT answer:** *which tool is better.* No verdict issues. **`n` is 16 and the floor for a
gate verdict is 393** (D17), so every result is **descriptive** and labelled so. The
`⊘ NO VERDICT` line prints on every run.

⭐ **Its reason for existing is J1**: the stranger benchmark's payloads were **transcribed, not
captured**, so not one of its rows can be re-scored from bytes. **This harness exists to make that
impossible**, not to get a better answer.

## 2 · The harness — what makes it publication-grade

| property | how |
|---|---|
| **HTTP direct** | every arm called at its own endpoint. No model context anywhere in the path |
| 🔴 **RAW BYTES TO DISK BEFORE PARSING** | the response body is written and hashed **before** anything reads it. A harness that parses first can only ever cache a transcription |
| **hashed** | `sha256` per payload, in a manifest, so a later re-score is provably over the same bytes |
| 🔴 **ONE TOKENIZER, EVERY ARM** | full payload **including the JSON envelope**, counted by the same function. **J4 is the defect this fixes**: our column was `estimated_tokens` (content-only) against everyone else's full payload, so *we understated ourselves* |
| **idempotent fetch** | an already-valid payload is skipped; `--refetch <arm>` forces one. ⚠ **A3 destroyed seven valid payloads** by re-running every arm to fix one, and they are unrecoverable |
| **shared validity** | the skip check and the scorer use **one** definition of *valid*. In A3 they differed, and the skip accepted quota prose — it would have skipped exactly the rows needing repair |

## 3 · Arms — six, each called the way its own docs say

| arm | endpoint / tool | note registered in advance |
|---|---|---|
| **web3ctx** | `/mcp`, `web3_search` | ⚠ **called WITHOUT `intent: "integrate"` by default** — F76 says a real client may not send it, and measuring ourselves under our best argument is the thing M1 was criticised for. A **second, labelled** web3ctx row runs *with* it; both publish |
| **context7** | `resolve-library-id` → `get-library-docs` | 🔴 **Its earlier VOID was an installation gap, not a verdict**, and that is stated wherever the old void is referenced |
| **exa** | `get_code_context_exa` **and** `web_search_exa` | two rows, separately labelled. ⚠ A3 measured only web search and the code product went **UNMEASURED**; if the code product is unreachable here, the row prints **UNREACHABLE**, never absent |
| **firecrawl** | `firecrawl_developer_search` | the dedicated developer surface, per its own docs. A3 used the generic one |
| **claude web search** | owner's API key **supplied at run time** | 🔴 **The key is never written to disk, never committed, never echoed.** If it is not supplied the row prints **MISSING — never ran**, exactly as it does today |
| **ethskills** | static skill files | ⚠ **Not per-query retrieval.** Its unit of comparison differs and the table says so on the row, not in a footnote. **Rule-based file selection** — every `SKILL.md`, meta excluded — because in A3 I chose ten files by hand and the row moved 3.3× |

## 4 · Questions — 16, fixed before any arm runs

**The six verified traps** (T1–T6, from the adversarial run: `deadline` not in params · `amountIn:0`
· `outputAmount` IS the fee · wagmi v3 `useConnection` · RainbowKit 2.x peer range · ERC-4626
rounding, both halves) **plus the ten shakedown questions** (plain, no project, no version, no
manifest — the shape a stranger actually types).

⚠ **T5's grading is narrowed before the run**, per J3: the gradable fact is the **verified peer
range**, not the *"cannot install"* gloss, which is overstated — issue #2617 is filed at RainbowKit
2.2.10 **with** wagmi 3.2.0.

⚠ **T6 is registered as a question we recently changed our answer to.** The recipe gained the
rounding matrix on 2026-08-20 after losing this trap. **That is disclosed on the row**; a benchmark
that quietly re-runs a question after fixing its answer is measuring its own patch.

## 5 · Grading — fixed now, in full

**Per question, per arm, four mechanical counts and one judged column:**

1. **tokens** — one tokenizer, full payload
2. **immutable citations** — `immutable / total`, the L1 measure v1.0, unchanged
3. **names a version** — proximity-based, the audit's existing definition
4. **trap named** — `PASS` / `partial` / `FAIL`. **`partial` = the arm surfaced the right artifact
   and its returned text did not state the fact.** It counts as **NOT caught** in the tally, and the
   `partial` count publishes beside the total so the choice is visible
5. **judged**: nothing. There is no quality score, no relevance grade, no LLM judge

🔴 **VOID POLICY: a refusal is not a measurement** (F66). Rate-limit, quota, auth or
tool-not-found → **VOID**, listed by id, **excluded from numerator AND denominator**. A void arm is
never a zero.

🔴 **The cross-area repetition guard rides along**: an arm returning the same text (digits
normalised) across questions in **two or more unrelated areas** has not answered them. Digits
normalised because quota messages carry a countdown; cross-area because one legitimate *"not
indexed"* answer to two related questions is not a failure.

**Statistics (4b):** every rate publishes with a **bootstrap CI**; no significance claim is made
between arms at n=16. ⚠ **A CI does not repair a small n** — it states it.

## 6 · Registered in advance, so it cannot be claimed afterwards

| | registered prediction |
|---|---|
| **tokens** | 🔴 **We expect to be the most expensive arm, and by MORE than the stranger run showed** — its column understated us (J4). R-Z ruled this cost structural |
| **citations** | we expect to lead on immutable citations. It is the one count that survived every caveat in A3 |
| **traps** | **unknown, and T6 is the one to watch.** We lost it, changed the recipe, and are re-asking |
| **shakedown 10** | unknown for every arm including ours |

## 7 · What is NOT in this benchmark, deliberately

- **No latency.** It is an SLO, not a headline, and a single-vantage number is not a comparison.
- **No "which is better".** The audit issues no verdict and none is computable from it.
- **No competitor payload BYTES republished.** Ruled 2026-08-20: hashes + counts + protocol only,
  bytes retained privately, **protocol re-runnable by anyone against the live tools.**
- **No arm called in a way its own documentation does not describe.**

## 8 · Failure modes I am registering against myself

Each of these happened once already, in this project, in a measurement tool:

1. **A tool name assumed rather than read from `tools/list`** — 16 identical error strings scored as
   payloads (A3, exa).
2. **A destructive re-fetch** — seven valid payloads overwritten (A3, firecrawl).
3. **Two definitions of "valid" in one harness** — the skip check accepting quota prose (A3).
4. **A probe wrong about its own denominator** — a RATE_LIMITED refusal scored as *not in corpus*
   (F66), and a roster inferred from ranked top-50 hits.
5. **The measurer choosing the input** — ten skill files picked by hand (A3, ethskills).
6. **A cheap dry run that cannot catch a request-shape error** — all 48 calls 400'd on a deprecated
   parameter (M-B). **A `--smoke` call precedes every paid run.**

**Each has a named control above.** Where a control cannot be written, the failure is listed as an
accepted limitation rather than assumed away.

## 9 · ✅ ANSWERED AND FROZEN — 2026-08-20, before the first arm ran

**§3–§5 APPROVED AS WRITTEN.** 🔴 **FROZEN on the first arm run** (F22). The default-intent primary
row with a labelled `intent: "integrate"` second row stands; the T6 disclosure stands.

**`claude web search` RUNS**, via the Anthropic API with **raw HTTP response bytes to disk** — *a
subagent transcription would reintroduce the exact J1 defect this run exists to fix.* Key custody:
`~/.anthropic-bench-key`, 0600, outside the repo, **deleted when the run completes**, never in any
log, file, output or error, and asserted to reach no host but `api.anthropic.com`.

**COST CEILING: $10 total across all paid arms, retries included** — *a retry loop is how ceilings
get eaten.* The harness prints planned calls and estimated cost **before the first paid call** and
**stops rather than exceed**. Expected actual ~$1–3.

### The original asks, kept for the record

1. **Approve or amend §3–§5.** After the first arm runs, §5 is frozen (F22).
2. **The `claude web search` API key at run time**, or an explicit *"run without it"* — in which
   case the row prints **MISSING — never ran**.
3. **A cost ceiling.** Firecrawl and Exa have quotas; Context7 and web search may bill. The harness
   prints its planned call count and **stops rather than exceeding a stated ceiling**.
