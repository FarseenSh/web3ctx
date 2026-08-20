<!--
  FILED VERBATIM 2026-08-20 — INTERNAL DATA, NOT A PUBLISHED RESULT.

  Everything below the marker is the stranger run's own file, byte-for-byte. This block was
  prepended on filing and is the ONLY text in this file that we wrote. `MANIFEST.md` records the
  sha256 of the original bytes and the one-line command that re-checks them, so "verbatim" is a
  claim anyone can falsify rather than one we assert.

  THE RUN'S OWN LIMITATION, IN ITS OWN WORDS (J1 + J4), CARRIED AT THE TOP BECAUSE IT GOVERNS
  EVERY NUMBER IN THE FILE:

    J1 — "MCP payloads arrive in model context; I cannot byte-copy them to disk. Cached files are
    FAITHFUL TRANSCRIPTIONS, not byte-exact captures. Byte counts are measured on the
    transcription." Bash/curl payloads (RPC, GitHub API) ARE byte-exact.

    J4 — "web3ctx token figures are its own estimated_tokens (content only, excludes JSON
    envelope), so A's real cost is UNDERSTATED relative to B/C/D which are measured on full
    payload."

  => THE TOKEN COMPARISON IS ASYMMETRIC: ours self-reported and content-only, theirs measured on
  the returned payload. The two columns are not the same quantity and the table does not make them
  one.

  => DIRECTIONALLY SOUND, NOT PUBLICATION-GRADE. Those are the terms it is accepted on.

  ONE THING WE OBSERVED ON FILING, RECORDED RATHER THAN SMOOTHED: the run's `payloads/` directory
  is EMPTY. The transcriptions J1 describes did not arrive with these two files, so nothing here
  can be re-scored from bytes at all — which strengthens the not-publication-grade label rather
  than weakening it, and is exactly what post-launch item (a) exists to fix.

  ── ORIGINAL FILE BEGINS ──────────────────────────────────────────────────────────────────────
-->

# web3ctx benchmark v2 — RESULTS (2026-08-20)
Arms: A web3ctx | B exa get_code_context | C firecrawl_developer_search | D WebSearch
VOID ARM: Context7 — not installed in this session (2 ToolSearch sweeps). Excluded from num+denom.
VOID ROWS: none. All 20 competitor calls returned payloads. No rate-limit/quota refusal occurred.

## TRAPS (PASS = named the trap in the returned payload)
                                  A(web3ctx)  B(exa)   C(fc-dev)  D(WebSearch)
T1 deadline not in params            PASS     partial    PASS       FAIL
T2 amountIn:0 = whole balance        PASS      FAIL      FAIL       FAIL
T3 outputAmount IS the fee           PASS      FAIL      PASS       PASS
T4 wagmi v3 useConnection            PASS      FAIL      PASS       PASS
T5 RainbowKit 2.x needs wagmi ^2     PASS      FAIL      PASS       PASS
T6 rounding direction (both halves)  FAIL     partial    PASS       PASS
                                    -----     -----     -----      -----
TRAPS CAUGHT                         5/6       0/6       4/6        4/6

## VERSION-CORRECT (named the version an implementer needs)
A 5/5 - exact version + 40-hex commit pin on every answer
B 1/5 - and 1 ACTIVELY WRONG (wagmi docs from 0.9.x / 0.12.x / 1.x)
C 2/5 - explicit on wagmi v2->v3 and RainbowKit 2<->wagmi2
D 2/5 - explicit on wagmi v3 and RainbowKit 2 vs 3

## TOKENS (chars/4 of payloads on the answer path)
B exa                ~300/query   CHEAPEST
D WebSearch          ~475/query
C firecrawl-dev    ~1,105/query
A web3ctx minimal  ~2,130/question   MOST EXPENSIVE
A web3ctx as-used  ~5,000-6,000/question (incl. verification fetches)

## SOURCE-OF-TRUTH CHECKS (byte-exact, via GitHub API / RPC)
rainbowkit package.json @03360ee9 -> peerDependencies.wagmi == "^2.9.0"  => web3ctx VERBATIM CORRECT
  BUT web3ctx gloss "cannot install with it" is overstated: issue rainbow-me/rainbowkit#2617
  is filed at RainbowKit 2.2.10 + wagmi 3.2.0 (a real install).
CCTP TokenMessengerV2 0x28b5a0e9 -> identical bytecode eth/base/arbitrum (sha256 a4ebf67f4e5991a3)
  competitor-surfaced blog gave 0xBd3fa81B as "Ethereum TokenMessengerV2": 13,498 bytes on eth,
  NO CODE on base => that is CCTP v1. Fund-loss-grade error in a top-4 result.

## JUDGEMENT CALLS (rule 6)
J1 MCP payloads cannot be byte-copied from model context. Cached files are faithful
   transcriptions; byte counts measured on transcription. curl/GitHub payloads ARE byte-exact.
J2 "partial" = tool surfaced the right artifact but its returned highlight did not state the
   fact. Graded as NOT caught in the tally. Affects B/T1 and B/T6.
J3 T5 graded PASS for A on the peer-range string (verified verbatim) despite the overstated
   "cannot install" gloss. Reasonable graders could call this partial.
J4 web3ctx token figures are its own estimated_tokens (content only, excludes JSON envelope),
   so A's real cost is UNDERSTATED relative to B/C/D which are measured on full payload.
J5 Breadth was NOT tested by a designed experiment; the prediction's breadth clause is
   under-evidenced, not confirmed.
