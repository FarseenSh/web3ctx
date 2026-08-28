# launch/ — the submission artifacts, pre-built so the owner's work is form-filling

**Built 2026-08-28** against the registry documentation as it stands **today**, read rather than
recalled: `modelcontextprotocol/registry` → `docs/modelcontextprotocol-io/{quickstart,remote-servers,authentication}.mdx`
and the schema at `https://static.modelcontextprotocol.io/schemas/2025-12-11/server.schema.json`.

🔴 **Nothing here has been submitted.** Every line below is an outward-facing action against a
third party, under the owner's name, and each one is the owner's to take.

⚠ **Re-validate before submitting** — `node --experimental-strip-types tools/validate-launch-artifacts.ts`.
It fetches the schema each file names, checks the constraints that actually reject a submission
(`description` ≤ 100 chars, the reverse-DNS name pattern, the remote transport type), and **calls
the endpoint, the website and the repository**. A file that was valid when written and is invalid
today looks identical on disk. Last run: **all green**, `tools/list` answering with five tools.

---

## 🚩 One decision only the owner can make: which namespace

The registry ties your server's **name** to how you authenticated. Both files are ready; publish
exactly one.

| file | name | what it needs |
|---|---|---|
| **`server.json`** | `io.github.farseensh/web3ctx` | `mcp-publisher login github` — nothing else. **Ready today.** |
| `server.dns.json` | `xyz.scarai/web3ctx` | a TXT record on the **apex** of `scarai.xyz` |

⚠ **The DNS route has two documented traps**, both from the registry's own warnings:
the TXT record must sit on the **apex** (`scarai.xyz`), *not* under a selector like
`_mcp-auth.scarai.xyz` — MCP DNS auth is SPF-style placement, not DKIM-style, and a selector fails
with a generic signature error. And on macOS the Ed25519 path needs **OpenSSL 3** invoked
explicitly (`/opt/homebrew/opt/openssl@3/bin/openssl`), because the system `openssl` is LibreSSL
and answers `Algorithm Ed25519 not found`. The ECDSA P-384 path works on LibreSSL.

**Recommendation: publish `server.json` under the GitHub namespace.** It needs no DNS change, it is
the namespace the ecosystem sees most, and the domain form can be added later — the registry
versions entries rather than replacing identity.

---

## The registries, one line each

| # | where | state | the exact next action |
|---|---|---|---|
| 1 | **Official MCP Registry** — canonical; the aggregators sync from it, so it goes first | ☐ | `brew install mcp-publisher` → `mcp-publisher login github` → `mcp-publisher validate` → `mcp-publisher publish` from `launch/` |
| 2 | **awesome-mcp-servers** (90k★) | ☐ | one PR adding a line under the remote/hosted section; no build, no account |
| 3 | **Web3 MCP directories** — `hive-intel/awesome-crypto-mcp-servers`, `rudazy/web3-mcp-hub` | ☐ | one PR each. **Neither has a docs/context category — that is a first-mover slot** |
| 4 | **Smithery** | ☐ | listing form; OAuth is live at `/mcp/oauth`, so its prerequisite is met |
| 5 | **Docker MCP Catalog** (`type: remote`) | ☐ | ⚠ **BLOCKED** — it wants a static API-key header and the API-key REST surface is not built. Do not attempt |
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
- **Licence** MIT (code and site) + CC BY 4.0 (evidence documents).
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
