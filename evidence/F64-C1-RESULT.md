# F64 · candidate C1 (inline bodies) — **REJECTED.** 2026-08-13.

Pre-registration: `F64-PAYLOAD-EFFICIENCY-PRE-REGISTRATION.md`, committed before C1 was
built. Partial pass, product arm only, `?inlineBodies=20000`, `claude-sonnet-5`, same 12
tasks, same harness. **$2.91.**

---

## The scoreboard, against effects committed in advance

| # | prediction | measured | |
|---|---|---|---|
| **E1** | median tool calls **12 → ≤ 6** | **6.5** | ✘ misses by 0.5 |
| **E2** | tokens/completed **toward ≤ 2× Context7** (≤ ~54,000) | **123,192** — *worse than the 94,559 baseline* | ✘ |
| **E3** | **completion does not fall** (8/12 or better) | **7/12** | ✘ |
| **E4** | payload budget still holds (~4,000 tok, caps) | 3,888 tok, `truncated: true` | ✔ |
| **E5** | provenance survives on every unit | `project@version`, `as_of`, `pin_ref` present | ✔ |

**C1 is rejected**, and by the rule written before the run:

> *"If E3 or E5 fails, the candidate is rejected regardless of E1 and E2."*

E3 failed. That settles it without appeal to the token numbers — which is the point of
having written it down first.

⚠ **The honest caveat, reported and NOT applied:** at n=12, one task is 8 percentage points,
and 8/12 → 7/12 is well inside noise. **The pre-registration has no noise band on E3, and
adding one now because a run failed is F22 exactly.** So C1 is rejected as specified, and the
weakness is in my pre-registration rather than in the verdict.

---

## Why it went the wrong way — the useful part

**C1 attacked the wrong term.** It bought fewer round trips by making each response fatter:
a `search` payload went **1,666 → 3,888 tokens**. But an agent loop **re-sends every previous
tool result on every subsequent turn**, so a fatter response is paid for again on turn 2, and
again on turn 3. Cost is quadratic in turns and linear in payload size; C1 improved the
linear factor slightly and multiplied the quadratic one.

| | baseline | C1 |
|---|---|---|
| median tool calls | ~12 | **6.5** |
| median tokens | 49,846 | **63,124** |
| tokens per completed | 94,559 | **123,192** |

⭐ **Half the tasks converged in 1–2 calls** (q037, q105, q106 at 2 calls; 13k–15k tokens) —
so inlining *does* short-circuit the escalation when the right body lands in the first
response. The tail is what ruins the median: q023 at 11 calls / 144k, q118 at 9 / 136k. When
the first response is wrong *and* fat, the agent pays for the wrong bodies on every remaining
turn.

**This points at C2, not at a bigger C1.** `C2 — content-hash pointers so repeated fetches
dedupe across turns` attacks the **re-send term**, which this run identifies as the dominant
one. C1's own data is the argument for reordering the candidates.

⚠ **Do not "fix" C1 by lowering the threshold.** A smaller threshold inlines fewer bodies and
converges on the baseline; that is not a candidate, it is a dial back to where we started.

---

## Two things that are not conclusions

- **No verdict.** n=12 against a floor of 393, as with every number this harness produces.
- **Version-correctness read 2/3 against the baseline's 1/3.** Three tasks. Noise. It is
  recorded only so nobody later discovers it and thinks it was hidden.
- ⚠ **The baseline and C1 are separate runs of a stochastic system**, not a paired
  comparison. A paired design — same seeds, same order — is what the full $7 re-run should
  use, and its absence here is a limitation of the cheap pass, not of the candidate.

## Cost

**$2.91**, against the ~$2 estimate and the $40 halt. Cumulative M-B + F64 spend: **~$15.3**.
