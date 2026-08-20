# BENCHMARK EXTENSION — RESULT. 2026-08-20. Owner copy.

Pre-registration: `BENCH-EXT-PRE-REGISTRATION-2026-08-20.md`, frozen at `218b645` before the first request.
Raw bytes: `artifacts/bench-ext-2026-08-20/` — 143 payloads, hashed, re-verified before scoring. **$0.62 of a $10 ceiling.**

```
══════════ EXTENSION 2026-08-20 ══════════
⊘ NO VERDICT — n=10 and n=8 against the registered 393 floor (D17). Descriptive only.

COMPONENT 1 · DECEPTIVE GROUNDING — does the arm serve the WRONG ENTITY as the asked one?
question                              web3ctx web3ctx (i   context7 exa (code  exa (web s claude web firecrawl 
D1 What is the address of the CCT       CLEAN      CLEAN      CLEAN      CLEAN      CLEAN      CLEAN    FLAGGED
D2 Which CCTP contract address do       CLEAN      CLEAN      CLEAN      CLEAN      CLEAN      CLEAN   DECEIVED
D3 How do I install the Safe Core       CLEAN      CLEAN      CLEAN   DECEIVED   DECEIVED    FLAGGED      CLEAN
D4 What is the current API for in       CLEAN      CLEAN      CLEAN      CLEAN      CLEAN      CLEAN      CLEAN
D5 Which npm package do I install       CLEAN      CLEAN   DECEIVED   DECEIVED   DECEIVED   DECEIVED   DECEIVED
D6 Which repository holds the cur       CLEAN   DECEIVED      CLEAN    FLAGGED    FLAGGED    FLAGGED   DECEIVED
D7 What is the current major vers       CLEAN      CLEAN      CLEAN      CLEAN      CLEAN      CLEAN      CLEAN
D8 Show me how to use viem 3 getC       CLEAN      CLEAN      CLEAN      CLEAN      CLEAN      CLEAN      CLEAN
D9 I am on wagmi 3. Which Rainbow       CLEAN      CLEAN    FLAGGED    FLAGGED    FLAGGED    FLAGGED    FLAGGED
D10 Which Uniswap repository conta       CLEAN      CLEAN      CLEAN      CLEAN      CLEAN      CLEAN      CLEAN
───────────────────────────────────────────────────────────────────────────────────────────────────────────────
🔴 DECEIVED                              0/10       1/10       1/10       2/10       2/10       1/10       3/10
FLAGGED                                  0/10       0/10       1/10       2/10       2/10       3/10       2/10
CLEAN                                   10/10       9/10       8/10       6/10       6/10       6/10       5/10

COMPONENT 2 · ABSTENTION HONESTY — confabulation, NOT coverage
question                              web3ctx web3ctx (i   context7 exa (code  exa (web s claude web firecrawl 
A1 compoundv3                      HONEST-NOT HONEST-NOT HONEST-CON HONEST-CON HONEST-CON HONEST-NOT       VOID
A2 pendle                          HONEST-NOT HONEST-NOT HONEST-CON HONEST-CON HONEST-NOT HONEST-CON       VOID
A3 hyperlane                       HONEST-NOT HONEST-NOT HONEST-CON HONEST-CON HONEST-CON HONEST-CON       VOID
A4 stargate                        HONEST-NOT HONEST-NOT HONEST-CON HONEST-CON HONEST-CON HONEST-CON       VOID
A5 thirdweb                        HONEST-NOT HONEST-NOT HONEST-CON HONEST-CON HONEST-NOT HONEST-CON       VOID
A6 biconomy                        HONEST-NOT HONEST-NOT HONEST-CON HONEST-CON HONEST-CON HONEST-CON       VOID
A7 0x                              HONEST-NOT HONEST-NOT HONEST-CON HONEST-CON HONEST-CON HONEST-CON       VOID
A8 pyth                            HONEST-NOT HONEST-NOT HONEST-CON HONEST-CON HONEST-CON HONEST-CON       VOID
───────────────────────────────────────────────────────────────────────────────────────────────────────────────
🔴 CONFABULATED                           0/8        0/8        0/8        0/8        0/8        0/8        0/0
HONEST-CONTENT                            0/8        0/8        8/8        8/8        6/8        7/8        0/0
HONEST-NOTHING                            8/8        8/8        0/8        0/8        2/8        1/8        0/0

COMPONENT 3a · WALL-CLOCK per request, median ms — DESCRIPTIVE
⚠ Different tools do different work per call. This is not a speed comparison.
  web3ctx                           — ms   1 request
  web3ctx (intent=integrate)        — ms   1 request
  context7                         3178 ms   2 requests (documented two-step)
  exa (code context)                — ms   1 request
  exa (web search)                  — ms   1 request
  claude web search                 — ms   1 request
  firecrawl (developer search)      — ms   1 request

VOID — 8 row(s), out of numerator AND denominator: firecrawl-dev/A1, firecrawl-dev/A2, firecrawl-dev/A3, firecrawl-dev/A4, firecrawl-dev/A5, firecrawl-dev/A6, firecrawl-dev/A7, firecrawl-dev/A8

wrote scored.json
```

---

## 1 · 🔴 THE FINDING THAT MATTERS MOST IS A CORRECTION TO WHAT WE ALREADY PUBLISHED

**Context7's documented second step never ran, in the benchmark published this afternoon.**

Our follow-up call extracted the library id with `\S+` from a **JSON** payload — where a newline is
the two characters `\` and `n`, which `\S` matches. The id captured was
`/metamask/metamask-docs\n-`, and context7 answered **`Library not found`** — **16 times out of 16
in the base run, and 18 of 18 in this one.** We scored the error as the arm's payload.

| context7 | published this afternoon | corrected, after re-running |
|---|---|---|
| median tokens | 558 | **1,683** |
| immutable / total URLs | **0 / 0** | **0 / 83** |
| names a version | 6 / 16 | **8 / 16** |
| traps caught | **0 / 6** | **3 / 6** |

🔴 **The page said context7's payloads contain “no URLs at all.” That sentence was about our broken
chain, not about context7**, and it has been corrected on the page to what is now true: **83 URLs,
none commit-pinned.** The underlying finding survives in a stronger form; the wrong version of it
does not.

⭐ **This is the A3 defect class for the third time** — *a tool called in a shape we assumed rather
than read* — and it is the reason the arm-calling convention is published beside every row. **It was
found by running an extension, not by review.**

## 2 · COMPONENT 1 — deceptive grounding

**Ten traps, every one built from an artifact verified on-chain or at a pin BEFORE registration.**

**Both our rows publish.** 🔴 **Our `intent=integrate` row was DECEIVED once** — D6, the archived
`aave/aave-v3-core` repository, served as the current source for Aave v3 contracts. **Our own
recipe cites that archived repo in one stray line**, which the curator backlog already records. The
benchmark found it in production behaviour, not in a lint.

⚠ **`FLAGGED` beats `CLEAN` and is checked first.** An arm that serves the stale artifact *and says
it is stale* has warned the reader; grading that as deception would punish the most useful thing an
arm can do with a superseded entity. Competitors earned **9 FLAGGED rows between them** — that is a
result in their favour and it publishes as one.

## 3 · COMPONENT 2 — abstention honesty

🔴 **We decline all eight. Competitors answer most of them. Both facts were registered in advance.**

**Zero CONFABULATED rows anywhere, including ours.** No arm invented one project's API as another's.
**What this set measures is confabulation, not coverage** — and on coverage, we lose these rows and
say so.

⚠ **The grader was wrong on its first run and was fixed to match the REGISTERED definition, not to
change it.** It tested only *"does the payload name the project"*, so our own refusal — *"`pendle` is
in the coverage universe and is **not indexed**"* — scored as a **content win**, 7 of 8 times. The
pre-registration says `HONEST-CONTENT` means *right-entity **content***, and `HONEST-NOTHING` means
*declines or says it does not have it*. **The words were written first and they win.**

## 4 · COMPONENT 3 — latency

**(a) Per-request wall-clock, descriptive**, in the table above. ⚠ **Not a speed comparison:**
context7 pays two documented round trips, claude web search runs a model, a static bundle pays none.

**(b) The SLO is multi-vantage at last — 9 vantages, 5 continents**, closing an item open since W0.

| | p50 | p95 |
|---|---|---|
| cold | **1,487 ms** | 3,023 ms |
| warm | **1,457 ms** | 3,526 ms |

Tokyo warm **709 ms** · Sydney **875** · Falkenstein **1,445** · Buffalo **2,141** · São Paulo
**2,080** · Lagos **3,526**.

🔴 **These are far slower than the single-vantage figures we have been carrying (warm-L0 p50 104 ms,
cold p95 510 ms). The single vantage was optimistic, and it was the only vantage we had.**

⚠ **Composition, corrected while writing this:** `/health` **does read D1** — its response carries
`d1_duration_ms`. A first draft of this note said it touched no database, which was wrong about our
own endpoint. What it does not do is run retrieval. So this is **DNS + TCP + TLS + one D1 read +
transfer**, not a tool call. **n = 1 per vantage per phase; a p95 over nine samples is a spread, not
a tail.**

> 🔴 **Latency is an SLO, never a headline.** Sub-second tool calls are **~1% of task wall-clock**.
> This sentence renders wherever any figure above renders.

## 5 · VOID

**8 rows — `firecrawl-dev` A1–A8, provider quota reached during the run.** Out of numerator **and**
denominator. That arm has **no abstention-honesty row at all**, which is stated rather than shown as
a zero.
