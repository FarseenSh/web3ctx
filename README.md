<div align="center">

# web3ctx

### The last mile before your agent signs.

Human-validated, chain-run web3 integration recipes, served version-true over MCP.

![integration projects 630](https://img.shields.io/badge/integration%20projects-630-3ddc97?style=flat-square) ![specification ids 1,193](https://img.shields.io/badge/specification%20ids-1%2C193-3ddc97?style=flat-square) ![units 1.34M](https://img.shields.io/badge/units-1.34M-3ddc97?style=flat-square) ![recipes 26 · human-run](https://img.shields.io/badge/recipes-26%20%C2%B7%20human--run-3ddc97?style=flat-square) ![endpoint live](https://img.shields.io/badge/endpoint-live-3ddc97?style=flat-square) ![access free · no key](https://img.shields.io/badge/access-free%20%C2%B7%20no%20key-2b2b33?style=flat-square)

</div>

## Quickstart

```bash
claude mcp add --transport http web3ctx https://mcp.scarai.xyz/mcp
```

```json
{ "mcpServers": { "web3ctx": { "type": "http", "url": "https://mcp.scarai.xyz/mcp" } } }
```

```text
Cursor, Windsurf, Zed and any MCP client: add the same URL as a remote HTTP server.
No key, no signup, no account. The free tier is the read path and always will be.
```

## How a question is answered

```mermaid
flowchart LR
  A[Resolve<br/>entities from the query] --> B[Bind or ABSTAIN<br/>version from evidence]
  B --> C[Filter then rank<br/>predicate first, BM25 within]
  C --> D[Budget-true payload<br/>citations before bodies]
```

*Deterministic end to end — no model on the serving path.*

## Why this exists

**It does not get fooled by a wrong premise.** Ten questions built on premises verified false
before the run — an archived repo, a renamed package, a version that does not exist. web3ctx was
deceived **0 of 10**; every other arm was deceived at least once (1–3 of 10).
🔴 Our own `intent=integrate` row was deceived **once**, and it publishes here beside the other:
a stray line in one recipe cited an archived repository.
[The ten traps and every arm’s answer →](evals.html)

**Citations you can re-fetch.** Every unit carries `project@version` and a URL pinned to a
40-character commit: **142 of 144** across the audited payloads, against **~0** for every tool
compared. [The audit protocol →](evals.html)

**When it does not know, it says so.** Asked about eight projects it does not index, it declines
all eight and names what would resolve each one. Competitors answer most of them.
⚠ Zero confabulated rows anywhere, **including ours** — that column separates nobody, and it is
reported rather than claimed as an advantage. [Abstention honesty →](evals.html)

**The recipes are the moat.** Each one was run by a human against live chains and ships with the
transaction receipts, so anyone can check the claim by RPC rather than trusting the stamp.

## The evidence

This repository carries every measurement behind the claims above — including the experiments
that failed, the gates we did not clear, and the corrections to things we published wrong.
Competitor payload **bytes** are withheld by rule; their protocol, hashes and counts are all
here, so any count can be re-run against the live tools.

**[Read the evidence →](evidence/README.md)** · [overview](index.html) · [evals](evals.html) · [architecture](architecture.html)

---

<sub>630 integration projects + 1,193 specification ids (609 ERC + 583 core EIP + 1 in both repos) = 1,823 total · 1,339,786 units · 26 human-stamped recipes.
Every number on this page is read from the live database at publish time; none is typed.</sub>
