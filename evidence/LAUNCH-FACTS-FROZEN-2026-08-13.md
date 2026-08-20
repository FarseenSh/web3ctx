# Launch facts — FROZEN 2026-08-13 (L1–L5)

**Not copy.** Facts and constraints for the copy the owner writes. **The audit is frozen**: no
revision unless a number is *wrong* — not to add an arm, not to improve a method, not to re-run
a mode. A table that keeps moving cannot anchor a launch.

---

## L1 — the launch uses ONE row

**Immutable citations**, over the frozen cache:

| arm | immutable / total URLs |
|---|---|
| **web3ctx** | **142 / 144** |
| context7 | **0 / 57** |
| exa (web search) | 7 / 213 |
| firecrawl | 25 / 338 |
| ethskills | 0 / 181 |

It is the only count that survives every caveat raised: it does not depend on tool mode, on
`intent=integrate`, on the twin undercount, on `n`, or on firecrawl's missing seven. **It is a
property of the URL string, computed over cached bytes.**

`0/57` means Context7 returned 57 citations and **none of them can be re-fetched to the same
bytes** — not that it returned none.

**Everything else in the audit publishes as DATA IN THE REPO, never as a claim.**

---

## L2 — our two failures, in the same breath

### The two web3ctx URLs that are not immutable

| q | URL | what it is |
|---|---|---|
| q01 | `https://github.com/sponsors/wevm` | a **"Become a sponsor on GitHub" link inside wagmi's own documentation prose**, which we quoted |
| q05 | `https://github.com/wevm/viem/issues/2484` | the **name of a test case** in viem's source: `test('https://github.com/wevm/viem/issues/2484', …)` |

⚠ **The number stays 142/144.** Decomposed, all **140** provenance citation lines are SHA-pinned
with **zero** exceptions, and the two misses are URLs belonging to the *content we quote*. That
decomposition is an **explanation, not a correction** — the count is right under its stated rule
(every URL in the payload), and moving a number because the explanation flatters us is the thing
this project exists not to do.

### q15 / q16 — LI.FI: no version, no citations at all

Both LI.FI questions return **302 characters, zero URLs**: *"`lifi` is in the coverage universe
and is **not indexed** (as of 2026-08-04)."* The corpus does not hold LI.FI. It is the correct
answer and it is also **a payload with nothing to cite**, scored exactly like any other
citation-free payload.

**Nine of our sixteen rows fail at least one count** — `wagmi@2` twins on q01–q03, `cctp@v1` on
q07–q08, `uniswap/v4` on q13, and q15/q16 above.

---

## L3 — firecrawl publishes with its sentence attached

> **incomplete — our harness overwrote 7 valid payloads; Firecrawl answered 16/16 on the first
> fetch.**

**Never `9/16` without that sentence.** If the quota resets before the thread goes out:
`node tools/payload-audit.ts --fetch --refetch firecrawl` repairs exactly those seven, and the
row publishes as 16/16.

**We misrepresented a vendor once in an internal doc today. We do not do it in public.**

---

## L4 — exa

Labelled **`exa (web search)`**, with: *"Exa's code retrieval is unmeasured; this row is not
evidence about it."*

---

## L6 — the twin count, split (the named exception to L5; run 2026-08-13)

Over the cached bytes only. No fetching, no new arm, no mode change.

| arm | twins fired | **labelled** | **unlabelled** |
|---|---|---|---|
| web3ctx | 6 | **5** | **1** |
| context7 | 1 | 1 | 0 |
| exa (web search) | 6 | 2 | **4** |
| firecrawl | 3 | 2 | 1 |
| claude web search | 0 | — | — |
| ethskills | 2 | 2 | 0 |

**labelled** = every occurrence of every fired marker has the project **and** a version stated
within 200 characters of it. **unlabelled** = at least one occurrence sits bare.

⚠ **The first rule scored web3ctx 6 labelled / 0 unlabelled and was too lenient** — it asked
only whether the payload named a version for that project *anywhere*, so the twin could sit in
one unit and the label on another. *"Beside it"* is local, so the window is local, and **one
bare occurrence makes the payload unlabelled.** Tightening it cost us a row, which is the
evidence that the measure can lose.

⚠ It is deliberately **not** proximity-to-the-marker-only: several declared markers *are*
`project@version` strings (`wagmi@2`, `cctp@v1`), so a naive window would find the marker itself
and score us labelled **by construction** — a bug in our own favour, in the one row nobody
would investigate (F48).

### Our unlabelled row, named

**q03 (wagmi)** — the marker `@metamask/sdk` fires inside a code comment in a unit we serve:

> `// NOTE the id is still 'metaMaskSDK' after the move off @metamask/sdk.`

The surrounding 200 characters carry no wagmi version. The unit is version-stamped in its own
header; the *mention* is not, and the rule judges the mention. **It publishes as unlabelled.**

### 🔴 The structural finding: this count is partly a version-labelling count

**21 of the 34 declared markers contain a version in their own text.** A payload that never
writes a version **cannot trip them**.

| arm | names ver | twins fired |
|---|---|---|
| web3ctx | 13/16 | 6 |
| context7 | **5/16** | **1** |
| exa (web search) | 12/16 | 6 |
| firecrawl | 9/9 | 3 |
| ethskills | 1/1 | 2 |

Context7's `1/14` twin score and its `5/16` version score are **substantially the same fact**.

> **A low twin score can mean "no wrong-version content" or "no version written down at all",
> and the count cannot separate them. As defined, the twin count REWARDS version-blindness.**

**It is read beside `names ver`, never alone.** Quoting the twin column on its own would
credit an arm for saying nothing.

---

## L5 — frozen

Revised four times in one sitting, each correctly. **No further revisions unless a number is
wrong.**

---

## L7 — the corpus counts, decomposed (added 2026-08-15 under owner ruling R-G)

**This is an ADDITION, not a revision** — L5 freezes the *audit table*; the corpus grew after
it was frozen and the copy needs true ship-day counts (F-8).

🔴 **THE PROJECT COUNT NEVER PUBLISHES UNDECOMPOSED.** It is stated as a pair, always:

> **65 integration projects + 610 ERC specification ids = 675 total**
> *(measured 2026-08-15 after wave-2 sub-batch 1; recompute on ship day — F-8, the corpus is
> still growing.)*

Roughly 610 of the 675 are ERC **specification** ids that the R-F relabel derived from
`ethereum/ercs`. **A bare project total in a thread, a README, a deck or a registry entry is the
precise overclaim this product exists to refuse** — a true number that misleads, which is worse
for us than a wrong one *because it survives checking*.

Both halves are computed from the database by one shared expression
(`packages/schema/src/project-decomposition.ts`) and printed by `validate-load` on every run, so
the total cannot be lifted out of a report without its pair. `formatProjectPair` **throws**
rather than degrading to the bare number.

⚠ **One project is genuinely BOTH** — `erc-4337` holds 64 units of `ERCS/erc-4337.md` beside
1,359 units of eth-infinitism's implementation. It counts as integration, and the mixed row is
printed rather than absorbed: a pair that hid it would be R-G's own defect one level down.

**Other ship-day counts** (recompute, never transcribe): **371,819 units** · **18 stamped
recipes** (curator's repo, 2026-08-15) · **442,963 dependency edges**.

---

## Claims that must NOT appear (standing, unchanged)

- **Any bare project total**, in any medium. R-G: it publishes as a pair or
  it does not publish.

- Any **accuracy percentage**, relevance grade, LLM-judged result, or "beats X".
- Anything about being **faster** — latency is single-vantage and an internal SLO.
- Anything about being **cheaper per payload** — measured false; we are higher.
- **`depositForBurn`** as a version-blindness example (C45 — it was a fabrication stake).
- **Any recipe count not re-read from the curator's repo on the day.** Frozen 2026-08-13 as
  *"20 is wrong, it is 11"*; on **2026-08-15 it is 18 stamped + 1 unstamped draft**. The ban is
  on the *transcribed* number, not on a particular digit — quoting `11` today is now the same
  error the original line was written to stop. Count stamps, never files (F-6).
- Any **verdict** from the audit. It issues none and none is computable from it.
