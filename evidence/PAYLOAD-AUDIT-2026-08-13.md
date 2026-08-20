# The payload audit — A3

**2026-08-13.** 16 plain integration questions × 6 arms. Four mechanical counts, no judgement.
**80 payloads cached byte-exact** under `artifacts/payload-audit/<arm>/<qid>.json` (2.4 MB) —
the audit is only worth publishing if a reader can recount it, so recount it.

Questions: `artifacts/payload-audit-questions.json`, declared with their twin markers **before
any arm ran**. Harness: `tools/payload-audit.ts` (`--fetch` writes the cache, `--score` reads
only the cache).

---

## How each arm was called — design vs defect

The same 16 questions went to every arm and whatever came back is the payload. **Each tool is
called the way its own documentation says to call it.** That is the method, not a lapse — and
where the calls differ, the difference *is* the finding.

### By design — the tools work differently, and that is what the audit shows

| arm | call | why it is not an asymmetry |
|---|---|---|
| context7 | two-step; `resolve-library-id` **requires** `libraryName` | It received the project name — which is **already present in all 16 questions (checked: 16/16)**. No information the question did not contain. |
| firecrawl | `categories: ["developer"]` | Its documented path for programming questions. A **mode selector**, not a hint about the answer. |
| web3ctx | `intent: "integrate"` | Activates the recipe arm. No other arm has recipes, so our payload is larger and carries `project@version` by construction. **That is what our system returns.** It is not a like-for-like *retrieval* comparison — which is why no verdict is issued. |

### 🔴 Defects in the method — mine

| arm | defect | state |
|---|---|---|
| **exa (web search)** | Measured on `web_search_exa`, the only tool the **public** endpoint exposes. Exa also ships `get_code_context_exa`, purpose-built for these questions, reachable only through a private connector whose payloads nobody could re-fetch. | **Row relabelled.** Exa's *code* retrieval is **UNMEASURED** and this row is not evidence about it. |
| **ethskills** | The first run used **ten files I picked by hand** — 25,929 tokens against the rule-based **85,068**. I chose the input data, which is the one thing a measurement must never let the measurer do. | **FIXED**: every `SKILL.md` in the repo, meta excluded. The row moved **3.3×**. |

⚠ **An overstated caveat is also an inaccuracy.** A first pass called all five of the above
"asymmetries" and said context7's arm was *"measured under conditions kinder than ours"*. Three
of them are simply the tools working differently, which is the thing being reported. Corrected.

## The table## The table

| arm | unit | ran | median tokens | names ver | immutable cite | twin |
|---|---|---|---|---|---|---|
| **web3ctx** | per-query | 16/16 | 3,255 | 13/16 | **142/144** | 6/14 |
| context7 | per-query | 16/16 | 1,252 | 5/16 | **0/57** | 1/14 |
| exa **(web search)** | per-query | 16/16 | 7,740 | 12/16 | 7/213 | 6/14 |
| firecrawl | per-query | **9/16** | 4,635 | 9/9 | 25/338 | 3/9 |
| **claude web search** | per-query | **0/16** | — | — | — | — |
| ethskills (skill) | **static** | **1 payload** | 85,068 | 1/1 | **0/181** | 2/14 |

- `names ver` — a version token bound to a project name (`project@version`, or within 40 chars).
- `immutable cite` — URLs carrying a 40-hex commit / total URLs. **`0/57` means 57 citations and
  none re-fetchable**; `0/0` would mean no citations at all and is never a pass.
- `twin` — payloads containing a declared wrong-version marker / payloads with a twin declared.
  permit2 has no coexisting major, so its two questions declare an empty twin set and are
  excluded from that denominator rather than scored as passes.
- `tokens` — median payload, `ceil(chars/3.5)`.

🔴 **`claude web search` is MISSING, not passed.** No search API key exists in this environment.
The row stays in the table because a row silently absent reads as a row that passed.

⚠ **`ethskills` is a STATIC payload and its unit of comparison differs from every other row.**
It is loaded once and answers every question with the same 85,068 tokens; it is not per-query
retrieval.

🔴 **Its row was wrong twice before it was right, and both errors were in this table.** First it
printed `0/1104` citations — **69 URLs counted 16 times**. The ratio survived (zero either way);
the magnitude did not, and the row read as though a skill had produced 1,104 citations when it
produced 69, once. Then collapsing the arm to a single payload dropped its twin count to `0/1`.

⭐ **The counts decompose, and that is the fix.** Three of the four are properties of the
**payload** — tokens, version labels, citations — and are **n=1** for a static arm. The twin
count is a property of the **(payload, question) pair**, because the declared markers differ per
question even when the bytes do not: the same fixed document contains an Aave twin marker
(`LendingPool` / `protocol-v2`) and no wagmi one. `2/14` is a real fact about it that `n=1`
cannot express. **A score is not a result without its composition** (A2(b)), applied here to
this table's own output.

---

## web3ctx's own failing rows — 9 of 16

An audit that exempts the author is an advertisement.

| q | failure |
|---|---|
| q01 | twin: `wagmi@2` |
| q02 | twin: `wagmi@2` |
| q03 | twin: `@metamask/sdk`, `wagmi@2` |
| q06 | no version bound to a project |
| q07 | twin: `cctp@v1` |
| q08 | twin: `cctp@v1` |
| q13 | twin: `uniswap/v4` |
| q15 | no version bound to a project · **no citations** |
| q16 | no version bound to a project · **no citations** |

q15 and q16 are the LI.FI questions: the corpus does not hold `lifi`, so the payload is the
"not indexed" answer, which carries no units and therefore no citations. It is scored exactly
like any other citation-free payload.

---

## Two arms were partly or wholly invalid, and that is reported, not averaged away

🔴 **CORRECTED 2026-08-13, and the first version of this section blamed the wrong party.**

It said *"Firecrawl hit its unauthenticated daily quota at q10."* That is true of the second
fetch and **false as a statement about Firecrawl**, which is how it would be read.

**Firecrawl answered all 16 questions successfully on the first fetch.** Median 4,494 tokens,
every payload real. Then I fixed an *unrelated* arm — Exa's tool name — and re-ran `--fetch`,
which had no incremental behaviour and **re-ran every arm**. That consumed nine more Firecrawl
calls, crossed the free daily limit, and **overwrote seven valid payloads with quota messages**.

⚠ **They are unrecoverable.** Only the post-overwrite state was ever committed, so the first
run's payloads exist nowhere on disk or in git. Their token counts survive in a session
transcript, which is **not** a cache a reader can recount — so they are not published.

**`firecrawl 9/16` is therefore an artifact of this harness, not a fact about Firecrawl.** The
row stands at 9/16 because that is what the cache can support; the cause is named here so the
number is not read as a limitation of the arm.

**Fixed:** `--fetch` now skips already-valid cached payloads and re-fetches only what is missing
or void; `--refetch <arm>` forces one arm. A fetch that re-runs arms it was not asked to fix is a
destructive default, and against a rate-limited source the destruction lasts a day.

⚠ **The skip check had to share the scorer's definition of valid.** Its first version accepted
the quota messages — they carry no error field and are not MCP errors, they are prose — so a
re-fetch would have skipped exactly the seven rows that needed repair. **Two definitions of
"valid" in one harness is F54's duplicate-mechanism failure**, inside the tool built to count
honestly.

The seven are voided, excluded from every count **and from the denominator**, and listed by id
in the tool's output so the call can be checked.

🔴 **Exa's first run produced 16 identical 16-token "payloads"** reading
`MCP error -32602: Tool get_code_context_exa not found`. The public Exa MCP endpoint exposes
`web_search_exa`, not the code-context tool this session's connector carries. **The tool name
was assumed instead of read from the endpoint's own `tools/list`.** Fixed and re-fetched.

### The guard that catches the next one

A phrase list only ever catches vendors someone has already been burned by. The detector is
structural: **a per-query arm returning the same text (digits normalised) across questions in
two or more unrelated areas has not answered them.**

⚠ Digits are normalised because Firecrawl's quota message carries a **countdown**, so byte
identity missed it by a few seconds of drift. ⚠ **Cross-area** rather than merely repeated,
because web3ctx legitimately returns the same "lifi is not indexed" answer to both LI.FI
questions — the first version of this detector voided that, which would have been wrong.
`static` arms are exempt by declaration, which is what the `unit` column is for.

---

## Limitations, printed with the result

1. **The twin markers were declared before any arm ran and were NOT extended after seeing
   results** (F22). They are conservative and **undercount**: Exa returned `1.x.wagmi.sh` and
   `0.6.x.wagmi.sh` documentation, which are wrong-version surfaces that no declared marker
   matches. **The undercount flatters every arm whose payloads carry old-major doc subdomains.**
2. `names ver` is proximity-based and cannot distinguish a version **label** from a version
   **mentioned in prose**.
3. `immutable cite` counts URL shape, not reachability — no 40-hex URL was fetched to confirm it
   resolves.
4. **n=16 questions, 7 areas. No verdict is issued and none is computable from this.**

---

## What this is not

No accuracy percentage. No relevance grading. No LLM judge. No "beats X". No comparison copy —
that is the owner's to write.
