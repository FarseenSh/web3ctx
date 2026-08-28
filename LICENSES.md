# Licences — two of them, because this repository holds two kinds of thing

| what | licence |
|---|---|
| **Code and the website** — the Worker, the packages, the tools, the rendered site | **MIT** — see [`LICENSE`](LICENSE) |
| **Evidence documents** — the measurements, pre-registrations, results and cached artifacts under `evidence/` | **CC BY 4.0** — see below |

## Why they are different

The code is a tool; take it, change it, ship it. **The evidence is a record of what was measured,
and a record that can be reproduced without attribution stops being checkable.** CC BY 4.0 lets
anyone republish, quote, re-score and disagree with any measurement here — the whole point of
publishing the dead experiments and the gates we failed — while keeping the measurement attached to
the run that produced it. A number is only re-checkable if you can find the protocol it came from.

## Evidence documents — CC BY 4.0

The files under `evidence/` (measurements, pre-registrations, results, protocols and the cached
payload artifacts that are ours to publish) are licensed under the
**Creative Commons Attribution 4.0 International License**: https://creativecommons.org/licenses/by/4.0/

**Attribution:** web3ctx (ScarAI), with a link to the document you used.

## 🔴 Two things this does NOT license

1. **Content served by the endpoint.** Every unit the server returns is an excerpt of a
   **third-party open-source repository**, served under **its own original licence**, with a
   40-character commit pin so you can go and read that licence at the exact revision quoted.
   Nothing here relicenses anyone else's code.
2. **Competitor payload bytes.** They are not in this repository at all — by rule. What is here is
   the protocol, the hashes and the counts, so any measurement can be re-run against the live tools.
   See `evidence/README.md`.
