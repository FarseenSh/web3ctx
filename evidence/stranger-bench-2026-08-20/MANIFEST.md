# STRANGER BENCHMARK — 2026-08-20 (Opus, adversarial). **INTERNAL DATA.** Filed verbatim.

**Accepted as internal data by the owner, 2026-08-20.** Not a published result, not a claim, not
quotable outside this repo. It is the **second** stranger read (rule 14) and the first adversarial
one — the earlier sonnet review was a clean-config read, this one designed traps.

## What is here

| file | what it is |
|---|---|
| `PROTOCOL.md` | the run's pre-registered protocol, **including the corrections it made to its own v1 method** |
| `RESULTS.md` | the run's results and its five named judgement calls |
| `TOKEN-RECONCILIATION.md` | **ours** — how this run's token numbers sit beside M-A's and M-B's |

Both benchmark files are the stranger's bytes with one prepended HTML-comment header, which is the
only text we wrote in them.

## Verbatim is checkable, not asserted

```
python3 -c "import sys,hashlib;b=open(sys.argv[1],'rb').read();print(hashlib.sha256(b.split(b'-->\n\n',1)[1]).hexdigest())" PROTOCOL.md
```

| file | sha256 of the ORIGINAL bytes | size |
|---|---|---|
| `PROTOCOL.md` | `bbfff4d017e3dc677cbb215def49948a18a403bedb07c0a0c5a84de5e12abecd` | 2,690 B |
| `RESULTS.md` | `7a369dccd89057d53b516555778ed2a91f1dd811f6f156d63c96cf93bbde65f8` | 3,061 B |

Both verified on filing. ⭐ **A "filed verbatim" claim nobody can re-check is the same shape as a
citation nobody can re-fetch** — the thing this product exists to refuse. So it is hashed.

## 🔴 The limitation the owner attached to the acceptance, and it governs every number

**J1** — MCP payloads could not be byte-copied out of model context; cached files are *faithful
transcriptions*, not captures. **J4** — web3ctx's token figures are its **own `estimated_tokens`,
content-only, excluding the JSON envelope**, while B/C/D are measured on full returned payloads.

> **The token columns are not the same quantity, and ours is the understated one.**
> **DIRECTIONALLY SOUND, NOT PUBLICATION-GRADE** — the run's own words, and the terms of acceptance.

⚠ **Recorded on filing: the run's `payloads/` directory is EMPTY.** The transcriptions J1 describes
did not arrive with these files, so **no row here can be re-scored from bytes.** That is not a
reason to discount the findings — it is the reason post-launch item (a), an HTTP harness that writes
raw responses to disk, exists.

## What it says, in one line each — none of it publishable

- **Traps caught: A 5/6 · B 0/6 · C 4/6 · D 4/6.** We lost **T6 (ERC-4626 rounding) outright**, and
  both general-purpose tools won it. → curator item (b).
- **Version-correct: A 5/5** with a 40-hex commit pin on every answer; B **1/5 and one actively
  wrong**; C 2/5; D 2/5.
- **Tokens: we are the most expensive of the four**, even measured on the understated column.
- **Context7 is a VOID ARM** — not installed in that session, excluded from numerator *and*
  denominator, and the run says its v1 had *silently omitted it by assumption*. ⭐ That is our own
  F66 discipline arriving from outside: **a refusal, or an absence, is not a measurement.**
- **Byte-exact source-of-truth checks** (GitHub API / RPC — the one part of the run that *is*
  byte-exact) found a competitor-surfaced blog giving a **CCTP v1 address as `TokenMessengerV2`**:
  13,498 bytes of code on Ethereum, **no code on Base**. → thread-class material, item (d).
- **J3 flags our own gloss:** the RainbowKit peer range `^2.9.0` we serve is **verbatim correct**,
  but the gloss *"cannot install with it"* is **overstated** — issue #2617 is filed at RainbowKit
  2.2.10 **with wagmi 3.2.0**, a real install. → curator item (c).

⭐ **The run corrected its own method before reporting** (C1–C3: a void arm it had assumed away, and
a wrong firecrawl surface, with the superseded rows kept rather than deleted). **We are filing a
benchmark that ran the verification protocol against itself** — which is why it is worth the shelf
space even at n=5.
