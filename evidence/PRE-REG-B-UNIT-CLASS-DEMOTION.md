# PRE-REGISTRATION (b) — UNIT-CLASS DEMOTION. Written 2026-08-18. **NOT RUN.**

**Status: submitted for owner review. No weight changed, no query issued, no number exists.**

**Trigger:** the OZ anchor returns **7 of 10 units as repo front-matter** — README ▸ Overview,
README ▸ Installation, LICENSE, Legal, Contribute, an audit note, a 2020 CHANGELOG entry — for
*"custom logic on every token transfer in an OpenZeppelin ERC20"*, while the answer unit sits in the
corpus. Expansion (proposal (a)) attacks the vocabulary gap; **this attacks the ranking of unit
classes that can never answer a how-to question.**

---

## 1. The classes — mechanical, from fields that already exist

`units.scope` is already populated and is **not** a new inference:

| scope | units | share |
|---|---|---|
| `code` | 335,795 | 58.6% |
| `docs` | 143,171 | 25.0% |
| `test` | 76,808 | 13.4% |
| `eip` | 14,411 | 2.5% |
| `example` | 2,812 | 0.5% |

🔴 **`docs` is too coarse to be the demotion class.** A LICENSE and a genuine integration guide are
both `docs`. So the proposal adds **one** finer class, derived from the **source file's basename** —
a durable fact already in `source_url`, not a keyword heuristic over snippet text:

> **`front_matter`** — the unit's source file basename matches
> `^(README|LICENSE|LICENCE|CONTRIBUTING|SECURITY|CHANGELOG|CODE_OF_CONDUCT|GOVERNANCE|AUTHORS|NOTICE|COPYING)(\.|$)`
> case-insensitive.

**Measured population, before any decision: 51,410 units — 35.9% of `docs`, 9.0% of the corpus.**

## 2. 🔴 THE FINDING THAT SHOULD PROBABLY KILL THE SIMPLE VERSION

**37,632 of those 51,410 — 73% — are `CHANGELOG.md`.**

A changelog is the single most **version-true** prose we hold. *"What changed in OpenZeppelin v5"*,
*"when was `_beforeTokenTransfer` removed"*, *"which release flipped the Errors library"* (C50's own
case) are answered **from changelogs and nowhere else**. Demoting them to fix a how-to question would
trade away the class of question this product exists for.

**So the class SPLITS, and the split is the proposal:**

| class | units | proposed treatment |
|---|---|---|
| **`front_matter_inert`** — LICENSE · LICENCE · NOTICE · COPYING · CODE_OF_CONDUCT · GOVERNANCE · AUTHORS · CONTRIBUTING · SECURITY | **~13,778** | **demote** |
| **`front_matter_changelog`** — CHANGELOG · CHANGELOG_OLDER · RELEASES | **~38,889** | ⚠ **NO CHANGE.** Version-bearing |
| **`front_matter_readme`** — README | **~11,268** | ⚠ **NO CHANGE in v1.** A README is often the only quickstart a library has |

⭐ **Only the inert class is demoted — ~13,778 units, 2.4% of the corpus.** That is a far smaller
intervention than the trigger suggests, and stating it now prevents the proposal from being
remembered as *"we demoted the docs"*.

## 3. The mechanism, and what it is NOT

- **A ranking multiplier applied AFTER the Layer-0 predicate**, never a filter. A demoted unit stays
  retrievable and stays citable; it ranks below code for the same score.
- ⚠ **NOT a new FTS5 column.** Migration `0002` already cost a rebuild at both endpoints; a class
  this small does not earn a third schema change. It rides as a stored `unit_class` on `units`,
  applied at ranking.
- ⚠ **NOT intent-conditional in v1.** *"Demote on how-to questions only"* requires classifying the
  question, which is a query-time inference — and query-time inference is the thing rule 6 keeps off
  the hot path. **One multiplier, all queries, or nothing.**
- **The multiplier is ONE pre-registered value, not a sweep.** Sweeping until a number passes is F22
  with extra steps.

## 4. The effect on the locked 200 — how it will be measured, fixed now

The W1 precision harness, unchanged, over the **143 scorable** queries (`tools/measure-precision.ts`,
live-parity index):

| metric | bar |
|---|---|
| **scope-precision@10 (macro)** | **must not fall.** Currently **82.0%** offline / **90.6%** live |
| **id-recall@10** | **must not fall** (15.0% offline) |
| **abstention count** | **must not rise** (21 of 143) |
| **OZ anchor `boilerplate_hits`** | expected to fall — a prediction, not a bar |

⚠ **A demotion that improves nothing but breaks nothing does NOT ship.** Same rule as clause 3 of the
expansion gate: harmless is not a reason.

⚠ **n=143 is below D17's floor of 393**, so this issues **no gate verdict** — it is a
**non-degradation check reported descriptively with its MDE**. That is stated *before* the run, so a
favourable number cannot later be quoted as a verdict.

## 5. Falsification — what would show I am wrong

| # | prediction | falsified if |
|---|---|---|
| F1 | The OZ anchor's `boilerplate_hits` falls below its 714-corpus baseline of **7/10** | it holds or rises — the inert class was not what was ranking |
| F2 | scope-precision on the locked 200 does not fall | it falls — the inert class was carrying real answers, and the class definition is wrong |
| F3 | No query loses its only correct hit | any does — listed by id, never summarised |
| F4 | The OZ anchor's `correct_answer_present` **stays false** | it flips true. **Registered as a prediction of NO effect**: demotion reorders what was already retrieved, and `_update` was never in the top 10 — if it appears, my model of the failure is wrong and the win is not the one I claimed |

⭐ **F4 is the honest one.** Demotion cannot surface a unit that BM25 never scored. **On its own it
can at best replace boilerplate with other boilerplate-adjacent code** — `BridgeERC20`,
`ERC1363ReturnFalseOnERC20Mock` — which is *changed*, not *better* (rule 11). **The OZ miss is
probably not fixable by ranking at all**, and this proposal should be read as *"stop wasting payload
slots on LICENSE files"*, not as a fix for the trigger.

## 6. What I am asking for

A ruling on **whether the inert class is worth a `unit_class` column at all**, given §2 removes 73%
of the apparent problem and §5's F4 concedes the trigger is likely out of reach for ranking.
**My own reading: (a) and a recipe address the OZ miss; (b) addresses payload waste. They should be
judged as two different proposals, not as two attempts at one bug.**

---

# 🔵 AMENDMENT 1 — OWNER RULING, 2026-08-18. **APPROVED TO RUN.**

Recorded **before any weight changed and before any query was issued**. Everything above stands;
this fixes the constants, adds one control, and makes two exclusions permanent.

## A1.1 What the ruling says

> *"unit-class demotion — APPROVED, RUNS AFTER 2, with one added control: license-shaped queries
> (`what license is <project> under`, 3+ shapes) must still surface the LICENSE unit — a demotion
> that buries the answer to the question the unit exists for is a regression; falsify the check by
> inverting the demotion weight. Scope stays the inert ~13,778 only; CHANGELOG and README untouched,
> permanently — record that as part of the ruling."*

## A1.2 🔒 PERMANENT EXCLUSIONS — not a v1 scoping choice

| class | units | status |
|---|---|---|
| **`front_matter_changelog`** — `CHANGELOG` · `CHANGELOG_OLDER` · `RELEASES` | ~38,889 | 🔒 **UNTOUCHED, PERMANENTLY.** The most version-true prose we hold; demoting it trades away the question class this product exists for (C50's case is answered from a changelog) |
| **`front_matter_readme`** — `README` | ~11,268 | 🔒 **UNTOUCHED, PERMANENTLY.** Often the only quickstart a library has |
| **`front_matter_inert`** — LICENSE · LICENCE · NOTICE · COPYING · CODE_OF_CONDUCT · GOVERNANCE · AUTHORS · CONTRIBUTING · SECURITY | ~13,778 | **the entire scope of this change** |

⚠ **"Permanently" is the ruling's word and it is load-bearing:** a later run that finds demotion
helpful must not reach for these two as the obvious next increment. Re-opening them requires a new
owner ruling, not a tuning pass.

## A1.3 🔒 THE CONSTANTS — one value each, fixed here, no sweep

| constant | value | why this one, stated before the run |
|---|---|---|
| **demotion multiplier** | **0.5** | `bm25()` scores are **negative, better = more negative**, so multiplying by 0.5 halves the magnitude and moves the unit *down*. Scale-free — it needs no knowledge of the score distribution. Semantically: **an inert unit outranks a non-inert one only if it scores more than twice as well.** It never excludes |
| **over-fetch** | **3 × limit, capped at 50** | A multiplier applied to exactly `k` rows only **reorders the payload it was supposed to change**. Over-fetch is what lets a demoted unit actually leave the top 10 and a real unit enter it. 3× is the smallest factor that can evict a full boilerplate payload (7 of 10 at the anchor's baseline) |
| **primitive** | **`search` only** | `grep`'s caller typed an exact identifier — **that is the evidence** (R1's grep exemption, same reasoning). A LICENSE unit does not match an identifier grep; demoting there would be a change with no case behind it |
| **applied** | **after the Layer-0 predicate, never inside it** | P1's rule from proposal (a), inherited verbatim: a class must never enter a version or scope predicate |

⚠ **One value, not a sweep.** *"Sweeping until a number passes is F22 with extra steps"* (§3). If 0.5
does not clear the bar in §4, the proposal fails; it is not retried at 0.3.

## A1.4 ⚠ ONE DEPARTURE FROM §3, STATED RATHER THAN ABSORBED (D14)

§3 says the class *"rides as a stored `unit_class` on `units`"*. **It does not.** It is **derived at
hydrate time from `source_url`'s basename**, which `unitsByRowid` already selects.

**Why the departure:** a stored column is a **core-D1 schema change requiring a rebuild at both
endpoints** — for a value that is a pure function of a field already in every row. §3's own next
sentence is *"a class this small does not earn a third schema change"*, and a stored column is
exactly that schema change. The derivation is deterministic and total, so the two are
byte-identical in effect.

⚠ **The cost of the departure, named:** the class cannot be used in SQL (no `WHERE unit_class = ?`),
so it can only ever be a **post-hydrate ranking multiplier** — which is all §3 asks for. If a future
change needs the class *in a predicate*, that is when the column is earned.

## A1.5 🆕 CONTROL C-L — the license-shaped query. **Added by the ruling.**

> *A demotion that buries the answer to the question the unit exists for is a regression.*

**Bar:** for **each** of **at least three** phrasings of the license question against **at least
three** projects, the project's **LICENSE unit must still appear in the top 10** with demotion on.

**Shapes (fixed here, before running):**
1. `what license is <project> under`
2. `<project> license terms`
3. `is <project> MIT licensed`

**Falsification (required by the ruling):** invert the multiplier to **2.0** (promote the inert
class) and re-run C-L. **The check must move** — a control that reports the same thing under a
demotion and a promotion is measuring nothing. Reported with the counts both ways.

⚠ **C-L is a BAR, not a prediction.** F1–F4 in §5 may all fail and the proposal simply does not
ship; **if C-L fails, the change is wrong** and does not ship in any form.

## A1.6 Order of operations, fixed now

1. this amendment committed **before** any code change (it is);
2. classifier + demotion built, with tests **falsified by inverting the multiplier**;
3. **C-L run first** — a regression in the control ends it before any precision number exists;
4. offline precision on the locked 200, demotion **off vs on**, same index, same resolver;
5. deploy → **OZ anchor + shakedown live**;
6. ship / do-not-ship against §4's bar, with §4's *"harmless is not a reason"* clause.
