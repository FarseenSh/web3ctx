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

# web3ctx benchmark v2 — corrected protocol (2026-08-20)

## PRE-REGISTERED PREDICTION (made before v1 run, quoted verbatim, stands either way)
"you lose on breadth, you're competitive-to-better on tokens once truncation is fixed,
 and you win outright on version-correctness and on anything involving an address."

## RULE-3 CORRECTIONS TO THE v1 RUN (errors in my own method, found by reading the endpoint)
C1. Context7 is NOT INSTALLED in this session. Two ToolSearch sweeps found no
    resolve-library-id / get-library-docs. => Context7 is a VOID ARM. Not scored, not
    counted in numerator or denominator. v1 silently omitted it by assumption.
C2. v1 used mcp__firecrawl__firecrawl_search(categories:["developer"]). There is a
    DEDICATED tool, mcp__firecrawl__firecrawl_developer_search, whose docs say it is the
    one for "a developer question - code behaviour, a library or framework, an API
    contract". v1 called the wrong firecrawl surface. Arm C is re-run with the correct tool.
    v1 firecrawl rows are SUPERSEDED, not deleted; both are reported.
C3. exa arm: get_code_context_exa IS correct per its own docs ("Best for: Any
    programming question"). No change.

## ARMS
A  web3ctx                              (data from the 10-question run, same session)
B  mcp__exa__get_code_context_exa
C  mcp__firecrawl__firecrawl_developer_search   [corrected]
D  WebSearch
VOID Context7 — not installed

## QUESTIONS -> TRAPS (6 traps / 5 questions)
Q-UNI Uniswap exact-input swap   -> T1 `deadline` not in params ; T2 `amountIn:0` = whole balance
Q-ACR Across bridge deposit      -> T3 outputAmount IS the fee
Q-WAG wagmi connect wallet       -> T4 v3 useConnection (not useAccount)
Q-RBK RainbowKit connect button  -> T5 RainbowKit 2.x requires wagmi ^2, NOT v3
Q-462 implement ERC-4626 vault   -> T6 rounding direction (BOTH halves: down when issuing
                                      shares for assets; up when computing what user supplies)

## GRADED PER QUESTION PER ARM
1. tokens on the full answer path (chars/4 of every payload on that path)
2. version-correct: did it name the version an implementer needs?
3. trap-caught: yes/no per trap listed above

## VOID POLICY
Rate limit / quota / auth refusal => VOID row, listed by id, excluded from num AND denom.

## JUDGEMENT CALL J1 (named per rule 6)
MCP payloads arrive in model context; I cannot byte-copy them to disk. Cached files are
FAITHFUL TRANSCRIPTIONS, not byte-exact captures. Byte counts are measured on the
transcription. Where a tool returns a re-fetchable id (firecrawl `id`), it is recorded so
the payload can be independently re-pulled. Bash/curl payloads (RPC, GitHub API) ARE byte-exact.
