# F64 — payload efficiency in agent loops. **PRE-REGISTRATION. Nothing is built.**

**Opened by ruling 2026-08-13**, immediately after M-B measured what the bodies rule costs:

> *"The `06-` rule had a justification; it now has a measured price; the fix is engineering,
> not thesis surgery."*

**Sequenced AFTER W8 publication.** M-B's numbers publish as they stand, with H2 at full
prominence. This document exists now so the fix cannot be designed around the result it is
meant to improve — and so the expected effects are on record before anyone knows whether
they land.

---

## 1. The measured price

| | web3ctx | context7 |
|---|---|---|
| median tool calls per task | **12** | **3–4** |
| tokens per completed task | **94,559** | **26,972** |
| raw payload cost, M-A | 3,304 / 3,736 | 1,249 / 1,573 |

**The mechanism, named:** `search` returns selectors and snippets and **never bodies**
(`06-` §3.3). An agent that needs a body must escalate to `fetch`, so a task costs at least
two round trips and usually many more — and because an agent loop re-sends the whole
conversation each turn, **every ~3.5k-token tool result is paid for again on every
subsequent turn.** Cost grows roughly quadratically in turns. Context7 returns prose on the
first call and converges in 3–4.

⚠ **The rule it comes from is not wrong and is not on trial.** *"Agents pull every returned
document into context, so an unrequested body is a direct token cost and a direct accuracy
risk."* That reasoning is intact. What M-B added is the other half of the ledger: **the
two-step shape has a price the one-step incumbent does not pay**, and until today only one
side of that trade had a number.

---

## 2. The three candidates, as ruled

**C1 — bodies inline under a size threshold on the first response.** 🔴 **BUILT AND REJECTED
2026-08-13** — `F64-C1-RESULT.md`. E3 failed (8/12 → 7/12) and E2 went the *wrong way*
(94,559 → 123,192 tokens per completed task). It bought fewer round trips by making each
response fatter, and an agent loop re-sends every prior result every turn, so it improved the
linear factor and multiplied the quadratic one. **Its own data reorders the candidates: C2 is
next.**
*(As specified: a unit under N tokens travels with the hit instead of behind a second call.
The bodies rule's harm is unrequested LARGE bodies; a 200-token function body is not that.
The reasoning was sound and the measurement disagreed — which is what the measurement is
for.)*

**C2 — content-hash pointers so repeated fetches dedupe across turns.** ⭐ **PROMOTED TO NEXT
CANDIDATE 2026-08-13**, on C1's own data: C1 improved the linear term and multiplied the
quadratic one, and C2 is the candidate that attacks the quadratic term directly. ⚠ **Its
pre-registration must declare a NOISE BAND on completion before it runs** — E3 was written
here with no band, so a 8/12 → 7/12 move well inside noise at n=12 counted as a failure.
That is a lesson for the next pre-registration, **not a retroactive edit to this one** (F22):
C1 stays rejected as specified. Runs after the republication settles. Units already carry a
content-addressed `r2_key`. If a body has been sent once in a conversation, later references
return the hash and a one-line reminder rather than the body again. This attacks the
re-send term, which is the quadratic one.

**C3 — a fewer-round-trips response shape for `search`.** The escalation ladder is optimal
for a careful human and expensive for an agent that will fetch anyway. Candidate: return the
top-1 body inline when the scope is bound and confidence is high, keeping selectors for the
rest.

⚠ **These are candidates, not a plan.** Each is measured on its own before any is combined;
a combined change that improves the number tells you nothing about which part did it.

---

## 3. Expected effects — committed BEFORE anything is built

| # | prediction | how it fails |
|---|---|---|
| **E1** | median tool calls **12 → ≤ 6** | ≥ 7 |
| **E2** | tokens per completed task **toward ≤ 2× Context7** (≤ ~54,000 on M-B's task set) | > 2× |
| **E3** | **completion does not fall.** 8/12 stays 8/12 or better | any drop |
| **E4** | **payload token budget still holds** — ~4,000 tokens, top-5, every array capped | any breach |
| **E5** | **provenance survives on every unit** — `project@version`, `as_of`, `pin_ref`, and `content_omitted` when a body is withheld | any unit without its citation |

⚠ **E3 and E5 are the ones that make this engineering rather than thesis surgery.** A change
that cuts tokens by dropping citations or by answering less often has not improved payload
efficiency; it has moved the cost somewhere the metric cannot see. **If E3 or E5 fails, the
candidate is rejected regardless of E1 and E2.**

⚠ **E2 says "toward", and that is deliberate.** Parity with a one-step incumbent may not be
reachable while the bodies rule holds at all. The honest target is *the premium becomes
defensible*, not *the premium disappears* — and if the floor turns out to be 2.5×, that
number publishes as the price of the rule.

---

## 4. How it is measured

**The same harness, the same tasks, the same model.** `tools/run-mb.ts --apply` on
`artifacts/mb-tasks.json` with `claude-sonnet-5`. The task set is **fixed under F22** and does
not change for this comparison — that is what makes before/after comparable at all.

⚠ **This re-uses a task set M-B showed cannot discriminate on VALUE.** That is fine here and
would not be fine elsewhere: F64 measures **overhead**, which is the half of the ledger this
task set *does* measure well. **No claim about retrieval value may be drawn from an F64 run.**

⚠ **Cost:** ~$7 per full re-run at M-B's measured rate. Each candidate measured separately
means ~$21 for three, and that needs the owner's go under the same standing rule as M-B.
A cheaper first pass — the `web3ctx` arm only, no baselines — costs ~$2 and answers E1/E3.

---

## 5. What this work item is not permitted to do

- **Change the payload budget** to make E2 pass. The ~4,000-token budget is measured
  (8,000 was worse); moving it to hit a token target is F22's shape.
- **Drop `content_omitted` or a citation** to save tokens. Degrade bodies, never citations.
- **Reframe M-B's published result.** H2 stands as measured whatever F64 achieves; a later
  improvement is a later number, not a correction to an earlier one.
- **Merge candidates before each is measured alone.**
