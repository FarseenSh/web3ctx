# launch/ — the submission artifacts, pre-built so the owner's work is form-filling

**Built 2026-08-28** against the registry documentation as it stands **today**, read rather than
recalled: `modelcontextprotocol/registry` → `docs/modelcontextprotocol-io/{quickstart,remote-servers,authentication}.mdx`
and the schema at `https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json`.

✅ **`server.json` WAS PUBLISHED 2026-08-31T19:22:44Z — the dated record is below.** Every other
line remains an outward-facing action against a third party, under the owner's name, and each one
is the owner's to take. *(From 2026-08-28 until the publish this paragraph read "Nothing here has
been submitted" — a sentence that aged out, not one that was wrong.)*

⚠ **Re-validate before submitting** — `node --experimental-strip-types tools/validate-launch-artifacts.ts`.
It fetches the schema each file names, checks the constraints that actually reject a submission
(`description` ≤ 100 chars, the reverse-DNS name pattern, the remote transport type), and **calls
the endpoint, the website and the repository**. A file that was valid when written and is invalid
today looks identical on disk. Last run: **all green**, `tools/list` answering with five tools.

---

## ✅ RULED 2026-08-28 (owner): the GitHub namespace. `server.json` is the file to publish.

> *"GitHub namespace (io.github.farseensh/web3ctx) — ship it, DNS can be added later if ever
> wanted."*

🔴 **A dated decision, not a shortlist.** `server.dns.json` stays in this directory as the
**recorded alternative** — removal is from publication, never from the record — and it is
**not the file to publish**. The registry versions entries rather than replacing identity, so the
domain form remains addable later without invalidating anything published under the GitHub name.

| file | name | state |
|---|---|---|
| **`server.json`** | `io.github.FarseenSh/web3ctx` *(case corrected at publish — see the PUBLISHED section)* | ✅ **PUBLISHED 2026-08-31** — was: RULED, publish this one |
| `server.dns.json` | `xyz.scarai/web3ctx` | recorded alternative — needs an apex TXT record on `scarai.xyz`; **do not publish** |

⚠ **The DNS route has two documented traps**, both from the registry's own warnings:
the TXT record must sit on the **apex** (`scarai.xyz`), *not* under a selector like
`_mcp-auth.scarai.xyz` — MCP DNS auth is SPF-style placement, not DKIM-style, and a selector fails
with a generic signature error. And on macOS the Ed25519 path needs **OpenSSL 3** invoked
explicitly (`/opt/homebrew/opt/openssl@3/bin/openssl`), because the system `openssl` is LibreSSL
and answers `Algorithm Ed25519 not found`. The ECDSA P-384 path works on LibreSSL.

⚠ **The two DNS traps above are kept even though that route is not being taken** — they are what a
future attempt would otherwise rediscover, and the ruling says *"later if ever wanted"*, not never.

---

## 🚀 PUBLISHED 2026-08-31T19:22:44Z — live in the Official MCP Registry

**`io.github.FarseenSh/web3ctx` · v1.0.0 · status `active`**, remote `https://mcp.scarai.xyz/mcp`
(streamable-http). Verified by **response body, never the CLI's exit message**, twice:
`GET https://registry.modelcontextprotocol.io/v0/servers?search=web3ctx` returned **exactly one
server** with `publishedAt: 2026-08-31T19:22:44.384532Z` and `isLatest: true` — once by the
publishing session at publish, once on the independent re-query that recorded this section.

⚠ **THE REGISTRY NAMESPACE IS CASE-SENSITIVE — the ruled file was corrected at publish time.**
The publish flow refused `io.github.farseensh/web3ctx`, the ruling's spelling (reported by the
publishing session, 2026-08-31); the accepted form is the GitHub login's canonical case,
`io.github.FarseenSh/web3ctx`. `server.json` in this directory now carries the corrected name and
matches the published entry field-for-field. 🔴 **The owner's ruling quote above keeps its
lowercase verbatim** — it named the identity correctly and a quote is history; the case mattered
only where the string became an identifier. A second trap from the same run, worth keeping beside
the DNS ones: **the registry JWT is short-lived** — it expired during the name fix, and the repair
is simply `mcp-publisher login github` again, then publish while the token is fresh.
`server.dns.json` is untouched by all of this (different namespace, still do-not-publish).

## The registries, one line each

| # | where | state | the exact next action |
|---|---|---|---|
| 1 | **Official MCP Registry** — canonical; the aggregators sync from it, so it goes first | ✅ **PUBLISHED 2026-08-31T19:22:44Z** | done — live as `io.github.FarseenSh/web3ctx` v1.0.0, status `active`, verified by API response body (see the PUBLISHED section) |
| 2 | **awesome-mcp-servers** (90k★) | ✅ **PR OPEN 2026-09-01** | [punkpeye/awesome-mcp-servers#13319](https://github.com/punkpeye/awesome-mcp-servers/pull/13319) — one line in **Developer Tools** beside the docs-for-agents comparables (no hosted/remote section exists; category-based list). Title carries the repo's own `🤖🤖🤖` agent fast-track marker, per their CONTRIBUTING |
| 3 | **Web3 MCP directories** | ✅ **PRs OPEN 2026-09-01** | [hive-intel#222](https://github.com/hive-intel/awesome-crypto-mcp-servers/pull/222) — **claims the first-mover slot**: new "Developer Docs and Integration Recipes" category + `llms.txt` Category Index row, with an explicit fold-into-EVM fallback offered (their list is in a selective phase); their `llms.txt` link-check run, added links pass, 3 pre-existing failures flagged to them. [rudazy#2](https://github.com/rudazy/web3-mcp-hub/pull/2) — Developer Tools table row + remote config example + `docs/SERVERS.md` entry + their full submission template, testing attested from the 2026-08-20 clean-config run and the 2026-09-01 sweep |
| 4 | **Smithery** | ☐ | listing form; OAuth is live at `/mcp/oauth`, so its prerequisite is met |
| 5 | **Docker MCP Catalog** (`type: remote`) | ☐ | ⚠ **BLOCKED** — it wants a static API-key header and the API-key REST surface is not built. Do not attempt |
| 7 | **Glama** (added 2026-09-01) | ✅ **AUTO-SYNCED from the MCP Registry** | Connector listing exists without any submission: `glama.ai/mcp/connectors/io.github.FarseenSh/web3ctx` — created by Glama's registry sync within hours of the publish. ✅ **CLAIMED 2026-09-01, "Ownership verified"** — the GitHub-identity flow, one click, no HTTP/DNS challenge (namespace = login). ⚠ Their Server-tab form is for open-source repos and was deliberately **not** used for the evidence repo. Status `untested` until their introspection runs; quality score "being calculated" — a badge, if minted, gets added to awesome-mcp-servers#13319 per the bot's checklist (answered in-thread) |
| 6 | **Anthropic Connectors Directory** | ☐ | ⚠ **BLOCKED on a Team/Enterprise org.** The privacy-policy URL it also requires now exists: `https://web3ctx.scarai.xyz/operator.html` |

---

## What a reviewer will check, already true

- **Endpoint** `https://mcp.scarai.xyz/mcp` — Streamable HTTP, **no credential required**, answering.
- **Authenticated** `https://mcp.scarai.xyz/mcp/oauth` — OAuth 2.1, GitHub-federated, CIMD
  advertised; DCR deliberately not offered (deprecated in MCP `2026-07-28`).
- **Health** `https://mcp.scarai.xyz/health` — live counts read from the database being served.
- **Five tools**, `title` + `readOnlyHint` on every one, **600 registered tokens** against a
  ≤600 budget. ⚠ That is *at* the ceiling: any added description needs something else removed.
- **Privacy policy** `https://web3ctx.scarai.xyz/operator.html` — written by enumerating what the
  Worker actually writes.
- **Licence** MIT (code and site) + CC BY 4.0 (evidence documents) — ✅ ruled 2026-08-28, no objection.
- **Output size** — the Directory's binding constraint is `MAX_MCP_OUTPUT_TOKENS = 25,000`; our
  payload budget is ~4,000, so it is not close.
- **Latency** — the Directory has no latency requirement. **Do not volunteer one.**

---

## 🔴 Two things that must not appear in any listing copy

1. **No token-cost claim.** Payload cost is measured and **we are higher** — our own audit puts us
   at roughly 2.4× Context7 on payload and ~3.5× on tokens-per-completed-task. "Fewer tokens" would
   be false against our own first-party measurement, and it is published in our own evidence set.
2. **No "better retriever."** The positioning is R-X: human-validated, chain-run, version-true
   recipes with re-fetchable citations; the corpus exists to make the recipes reachable. Corpus
   breadth is not a claim.
