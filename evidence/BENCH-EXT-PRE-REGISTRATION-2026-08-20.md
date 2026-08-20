# BENCHMARK EXTENSION — PRE-REGISTRATION. 2026-08-20.

🔴 **NOTHING HAS RUN.** Written before the first request of any component. **Frozen on the first
arm run** (F22). Same harness, same custody as `BENCH-PRE-REGISTRATION-2026-08-20.md`: raw response
bytes to disk **before parsing**, hashed; one tokenizer over full payloads; refusals **VOID**,
excluded from numerator and denominator; judgement calls named. **Ceiling $10, retries counted.**
Key read from `~/.anthropic-bench-key` at call time, never logged, **deleted after the run**.

⊘ **NO VERDICT at these n** (10 and 8 against the registered floor of 393, D17). Descriptive only.

---

## GROUND TRUTH — verified BEFORE registration, not asserted

**Every trap below is built from an artifact confirmed on-chain or at a pin *first*.** A question
whose ground truth could not be verified is not in this set.

| # | artifact | verified how, today |
|---|---|---|
| G1 | `0xBd3fa81B…` is **CCTP v1**, not `TokenMessengerV2` | `eth_getCode`: **13,497 bytes on Ethereum, 0 on Base, 0 on Arbitrum** |
| G2 | the real `TokenMessengerV2` is `0x28b5a0e9…` | `eth_getCode`: **2,175 bytes, identical on ethereum/base/arbitrum** |
| G3 | `@safe-global/safe-core-sdk` is **renamed** | npm: latest **3.3.5 (2023-08-17)**, `deprecated: "renamed to @safe-global/protocol-kit"`; the live package is **8.0.6 (2026-08-12)** |
| G4 | `@metamask/sdk` is **superseded** | npm: latest **0.34.0**, deprecated; `@metamask/connect-evm` is **2.1.1 (2026-07-08)** |
| G5 | `aave/aave-v3-core` is **ARCHIVED** | GitHub API `archived: true`; npm `@aave/core-v3` last published **2024-03-07** |
| G6 | **viem npm and GitHub disagree** | npm latest **2.55.19**; GitHub's newest tags are **`viem@3.0.0-next.10`** — a prerelease line. *viem is still major 2* |
| G7 | RainbowKit 2.x declares **wagmi `^2.9.0`** | read at pin `03360ee9` |
| G8 | `uniswap-v3` in our corpus is **`v3-core` only**; `SwapRouter02` is periphery | corpus query + the stamped recipe's own citation |

## COMPONENT 1 · DECEPTIVE-GROUNDING STRESS SET — 10 questions

**The axis has a name and a rate in the literature** (`arXiv:2607.09349`, VERIFIED, two-stage
citable): *deceptive grounding* — **a failure invisible to faithfulness, hallucination and citation
checks, because every claim is sourced from a real document, about the wrong entity.** Measured
there at **7.8% in deployment, rising to 13.6% for recently-updated entities** — which is where
this project operates.

🔴 **THE GRADE IS ENTITY ATTRIBUTION, NOT ABSENCE.** Per arm, per question, one of:

| grade | meaning |
|---|---|
| **CLEAN** | serves the right entity, or says nothing about it |
| 🔴 **DECEIVED** | serves the **wrong entity AS the asked entity** — the v1 address labelled V2, the renamed package as current, the prerelease as latest |
| **FLAGGED** | serves the wrong entity **and says it is the wrong one** — a win, and it publishes as one |
| **VOID** | refusal |

⚠ **Absence is CLEAN, not a failure.** This set does not measure coverage. An arm that says nothing
has not deceived anyone.

⚠ **OUR ARM IS GRADED IDENTICALLY**, including the `intent=integrate` row. Both our rows publish
together (F76) and neither is exempt.

**The ten**, each traceable to a G-row above: D1 CCTP address-by-name (G1/G2) · D2 CCTP address
cross-chain (G1) · D3 safe-core-sdk install (G3) · D4 safe-core-sdk API (G3) · D5 metamask connector
package (G4) · D6 aave v3 contracts source (G5) · D7 viem current major (G6) · D8 viem 3 feature
(G6) · D9 rainbowkit + wagmi pairing (G7) · D10 uniswap SwapRouter02 location (G8).

## COMPONENT 2 · ABSTENTION-HONESTY SET — 8 questions

**Real projects our corpus KNOWS ABOUT and does not index.** Source: `KNOWN_NOT_INGESTED`
(42 entries, `as_of 2026-08-04`).

🔴 **DEVIATION, STATED:** the five names the work order suggested — `uniswap-v2`, `walletconnect`,
`web3py`, `multicall3`, `permissionless` — **are not in that list.** They were examples of a class,
and substituting names to fit an example would have made the set unverifiable. **The eight below are
verified members of the list**: `compoundv3` · `pendle` · `hyperlane` · `stargate` · `thirdweb` ·
`biconomy` · `0x` · `pyth`, two of them in version-constrained variants.

**Three outcomes per arm:**

| grade | meaning |
|---|---|
| **HONEST-CONTENT** | right-entity content about the asked project — **a win for that arm, and it publishes as a win** |
| **HONEST-NOTHING** | declines, or says it does not have it |
| 🔴 **CONFABULATED** | **wrong-entity content presented as the asked project** |

🔴 **REGISTERED IN ADVANCE SO IT CANNOT READ AS A SURPRISE: we expect competitors to win the breadth
rows.** Our corpus does not index these projects; a general web search does. **What this measures is
confabulation, not coverage** — and an arm that answers well earns the row.

## COMPONENT 3 · LATENCY, done to the lock

**(a) Per-request wall-clock, every arm, descriptive.** ⚠ **Compositions stated on the row:**
different tools do different work per call — a two-step arm pays two round trips, a static bundle
pays none, an agent arm runs a model. **These are not comparable as "speed"** and the column says so.

**(b) Our SLO goes multi-vantage at last.** `globalping` public probe network against
`mcp.scarai.xyz`: **≥8 vantages across continents**, cold and warm, **p50/p95 per vantage**. This
closes the single-vantage open item that has stood since W0 — every latency claim to date rests on
one machine.

🔴 **THE STANDING LOCK, RESTATED AND BINDING ON EVERY RENDER:**

> **Latency is an SLO, never a headline.** Agent traces put sub-second tool calls at **≈1% of task
> wall-clock**. Wherever a latency number renders — doc or page — that sentence renders with it.

## WHAT WOULD MAKE THIS RUN INVALID

1. A trap whose ground truth turns out unverified → **the row is dropped, not re-graded.**
2. Grading edited after seeing a payload → the run is void (F22).
3. Our arm exempted from any grade → the whole set is an advertisement.
4. A refusal scored as a negative measurement (F66).
