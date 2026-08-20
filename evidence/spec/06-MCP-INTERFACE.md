# MCP Tool Surface & CodeRetriever Seam

**Status:** Canonical v1 specification — implement this contract exactly  
**Date:** 2026-06-01 · **substantially revised 2026-08-02** · **rev. 2026-08-03**  
**Part of:** Web3 Context MCP build package  
**Audience:** Engineer implementing the MCP server  
**Related docs:** `18-SOTA-BLUEPRINT-2026-08.md` §5 (the design of record for this surface), `19-RESEARCH-LEDGER-2026-08.md` (measured numbers), `05-DATA-MODEL.md` (the two chunk shapes), `15-RETRIEVAL-ARCHITECTURE.md`, `03-ARCHITECTURE.md`, `08-BUILD-PLAN.md`, `02-PRD.md`

> **2026-08-03 revision — the type-level pass.** (1) **`search`/`grep` return `SearchHit` — selector + snippet, never `content`.** Bodies are reachable only through `web3.fetch`; the old `IntegrateResult.code_chunks[].content` leak is closed by construction (§3.3). (2) **Hard caps and a truncation contract exist** — `fetch.selectors ≤ 10`, `deps` inlined units ≤ 15, snippet ≤ 300 chars, ~4,000-token response budget, `content_omitted` + self-describing cursor (§3.3, §4.1–4.2). (3) **Caller knobs deleted:** `mode` is gone, `max_results` demoted, token budget moves to the `?maxTokenBudget=` URL parameter (§3.1). (4) **Trust fields are on the types**, not just in prose: `version_defaulted`, `last_validated`, `as_of` on every chunk (§3.3, §4.5). (5) Registered-surface target is **≤600 tokens** plus a Tool-Selection-Guide `instructions` block (§2). Rationale: `17-` §3 + §5, `18-` §5.
>
> *Prior revision (2026-08-02): the two-tool constraint was dropped in favour of **five granularity primitives**; `web3.expand` was **split** into `web3.fetch` + `web3.deps`.*

---

## Contents

1. [Overview](#1-overview)
2. [Registered Schema, Instructions & Capabilities](#2-registered-schema-instructions--capabilities)
3. [Tool: web3.search](#3-tool-web3search)
   - [Input Schema](#31-input-schema)
   - [Intent Routing](#32-intent-routing)
   - [Output Shapes by Intent](#33-output-shapes-by-intent)
   - [Response Budget & Truncation Contract](#34-response-budget--truncation-contract)
4. [Tools: web3.fetch · web3.deps · web3.grep · web3.lookup](#4-tools-web3fetch--web3deps--web3grep--web3lookup)
   - [web3.fetch](#41-web3fetch--complete-units-by-selector)
   - [web3.deps](#42-web3deps--dependency-closure)
   - [web3.grep](#43-web3grep--exact-lexical-match)
   - [web3.lookup](#44-web3lookup--typed-records)
   - [Version provenance](#45-version-provenance--mandatory-on-every-response)
5. [CodeRetriever Seam](#5-coderetriever-seam)
   - [Interface Definition](#51-interface-definition)
   - [v1 Default: no encoder on the primary path](#52-v1-default-no-encoder-on-the-primary-path)
   - [The seam's remaining purpose — reversibility](#53-the-seams-remaining-purpose--reversibility)
   - [Fallback Behavior](#54-fallback-behavior)
   - [Latency SLO](#55-latency-slo)
6. [Response Delivery](#6-response-delivery)
7. [Error Contract](#7-error-contract)

---

## 1. Overview

Web3 Context MCP exposes **five granularity primitives** over MCP:

| Tool | Purpose | Returns | Arms engaged |
|---|---|---|---|
| `web3.search` | Discovery, intent-dispatched | **`SearchHit[]` — selector + snippet. Never `content`.** | routed (§3.2) |
| `web3.grep` | Exact identifier / lexical match | **`SearchHit[]`** | lexical-DB FTS5 BM25 |
| `web3.fetch` | Complete units by selector | **`FetchedUnit[]` — the only source of `content`** | core DB + R2 |
| `web3.deps` | Dependency closure for a selector | edges + inlined units (≤15) | core-DB recursive CTE |
| `web3.lookup` | Typed record: deployment address / ABI / EIP | one typed record | core-DB table hit |

**The bodies rule, stated once and enforced by the types:** discovery returns *addresses and evidence* (`SearchHit`); only `web3.fetch` returns bodies. This is what makes the surface cheaper than a search tool that dumps documents — agents pull every returned document into context, so an unrequested body is a direct token cost and a direct accuracy risk.

The consuming agent (Claude Code, Cursor, Codex CLI) calls these tools. This server is the **ranked-discovery stage** — it serves version-true context; the agent does the generation and the iteration. Do not conflate the two.

**Latency is an SLO, not a headline (`18-` §2.3, golden rule 5): sub-500 ms warm, end to end.** The competitive axes are **tokens and calls per completed task** — the measured bar is ≈3.3k tokens / ~3 calls. Per-tool millisecond targets appear in §5.5 as *internal, unvalidated* engineering targets; do not publish them.

### Why five, not two

The old two-tool constraint was self-imposed and cost accuracy. **The failure mode to avoid was never "more than two tools" — it is *mirroring an API surface*.** Granularity primitives are a different thing from endpoint wrappers.

Evidence it is safe: A-RAG (arXiv 2602.03442) exposes three granularity tools and beats single-shot RAG **at comparable or lower retrieved tokens** — more tools did not cost tokens, they saved them, because the agent stopped over-fetching. `search` returning selectors rather than bodies is what preserves that: the agent pays for bodies only via `fetch`.

Two of these are the highest-value primitives on the surface, and both were previously buried:

- **`web3.deps`** — dependency closure measured **~1.7× the recall of either BM25 or dense**, and 2.4–2.9× on variables. It is also **structurally unreachable by any embedding**: dependency relevance is query-dependent, so it cannot be baked into a vector computed without the query (Hydra's contrastive training failed to converge for exactly this reason). Previously an `expand` side-effect.
- **`web3.grep`** — CoREB: on keyword-dense queries, **all eleven embedding models tested scored 0.000–0.015 nDCG@10.** Two scored exactly 0.000. Agent queries are measurably that shape — median ~10 terms, keyword-dense, operator-heavy (`19-` §3). Lexical is not a fallback here; it is the only thing that works on that input class.

Composition: **`deps` supplies the building blocks; `search`/`grep` supply the usage examples; `fetch` is the only way to get a body.**

---

## 2. Registered Schema, Instructions & Capabilities *(rev. 2026-08-03)*

### 2.1 Registered-surface budget

**Target: ≤600 registered tokens for all five tools combined.** That is the number to build against and the number to measure — not an estimate, and not the retired two-tool figure that used to appear here.

Measured comparables (`19-` §2, live `tools/list` probes 2026-08-02): Cloudflare docs **2 tools / 250 tok**; DeepWiki **3 / 259**; MS Learn **3 / 951**; Context7 **2 / 1,146**. The cost driver is **description verbosity, not tool count** — five terse schemas cost less than two verbose ones. Five is defensible (AWS ships five) but it inherits AWS's obligation: a routing guide that lives outside the schemas.

- **Cloudflare-terse descriptions.** One line of what the tool does, one line of what it does **not** do. Routing policy, examples and escalation logic live in `instructions` (§2.2), where they are paid for once rather than per tool.
- **All five tools register in a single `tools` array** so one cache entry covers the surface.
- **Deterministic ordering is required** — spec `2026-07-28` says `tools/list` SHOULD be deterministically ordered for prompt-cache hit rates. Sort by a fixed key; never by map iteration.
- **`ttlMs` + `cacheScope` are REQUIRED** on `tools/list` (spec `2026-07-28`, `CacheableResult`) — and per SEP-2549 on **all `*/list` results and `resources/read`**, which is broader than a schema-only reading suggests.
- Anthropic prompt caching still applies (`cache_control: { type: "ephemeral" }`); on cache hit the tool definitions cost ~0 tokens.
- **Every tool needs `title` + `readOnlyHint`.** All five of ours are read-only. A hard Anthropic Connectors Directory requirement, alongside a privacy-policy URL — missing either is an instant rejection.
- **Write schemas to JSON Schema 2020-12** — `inputSchema`/`outputSchema` were loosened to full 2020-12 in spec `2026-07-28`.
- **Never build meta-tools.** No dynamic tool discovery, no "list available tools" tool, no schema-returning tool. GitHub built dynamic tool discovery, shipped it as beta, and **deleted it 2026-05-20**; consolidation plus URL-route surface selection won.
- **Tool descriptions are an eval subject, not copy.** Wording measurably swings activation rates; the W1 description ablation owns this text.

### 2.2 Server `instructions` — the Tool-Selection Guide

The server's `instructions` block (~300 tokens) carries the routing policy that the schemas deliberately omit. It must contain:

1. **A one-line "does NOT do" for every tool** — the highest-leverage sentences on the surface, because mis-routing is the dominant failure mode. For example: *`lookup` does not search prose. `grep` does not rank semantically. `search` does not return bodies. `deps` does not follow calls across projects. `fetch` does not discover selectors.*
2. **The escalation ladder, in order:**

   **`lookup` → `grep` → `search` → `deps` → `fetch`**

   Start at the cheapest primitive that can answer. `lookup` when the answer is a typed record (address / ABI / EIP) — **mis-routing away from `lookup` is the worst failure mode on this surface.** `grep` when an exact identifier is known. `search` when the query is prose or the identifier is unknown. `deps` once a selector is in hand and the surrounding contract surface matters. `fetch` last, only for selectors already chosen — it is the only step that spends tokens on bodies.
3. **The version contract:** callers should pass `version` when they know it; the server labels every response with `version_defaulted` when they do not.

### 2.3 Capabilities and request handling — three non-obvious requirements

- **Declare empty `prompts` and `resources` capabilities with no-op handlers.** Some clients (opencode among them) treat a `-32601 Method not found` as fatal and drop the connection. Declaring the capability and answering with an empty list costs nothing and prevents a whole class of silent integration failures. Recipes are **tools, not MCP prompts** — prompt support is far less widely implemented than tool support.
- **Arg-alias remapping runs BEFORE schema validation.** Models echo phrasing from descriptions and from other servers they have seen. Remap known aliases into canonical parameter names first, then validate: `libraryName` → `project`, `question` → `query`, `library_id` → `project`, `topic` → `query`. MS Learn's `question`→`query` rename broke 2–5% of requests without this. Aliasing is a compatibility shim, never a documented parameter — it does not appear in `inputSchema`.
- **Dual return on every tool: `content` AND `structuredContent`.** `content` carries a compact markdown rendering with a source URL under each snippet (for clients and models that read text); `structuredContent` carries the typed object in this document (for clients that parse). Convergent practice across every winning doc server; it costs one field.

Implementation note: the schema strings below are the source of truth for what gets registered.

---

## 3. Tool: web3.search

### 3.1 Input Schema *(rev. 2026-08-03)*

**Caller knobs are deleted, not defaulted.** The frontier deleted theirs and cut responses 10× (Context7 v2 removed `tokens`/`topic`/`page`/`limit`; MS Learn hides `topK` and thresholds — *"Your API is not an MCP tool"*). Every knob is a decision the server can make better and a token the schema pays for forever.

| Parameter | Status | Why |
|---|---|---|
| `mode` (`draft`/`full`) | **REMOVED** | The server decides how a response is delivered. It is a transport decision, not a caller decision, and it never belonged in a retrieval schema. *(As of 2026-08-03 there is nothing to choose between: every response is a single complete emission — §6.)* |
| `max_results` | **Demoted** — optional, undocumented in the terse description, hard-capped | The budget (§3.4) binds before this ever does. |
| **token budget** | **Moved off the schema** to the `?maxTokenBudget=` **URL query parameter** (MS Learn pattern) | Deployment-time configuration, not a per-call argument. The schema never changes; the operator tunes the endpoint. Default ~4,000 tokens. |
| `project` · `version` · `chain` · `scope` | **Kept** | These are **Layer-0 predicates, not tuning knobs.** They are the product — they are what makes a response version-true. |

```typescript
interface Web3SearchInput {
  /** Natural-language retrieval query */
  query: string;

  /**
   * Query intent — drives output shape and retrieval mode.
   * 'vulnerability' is v-next (audit module, not in v1). Do NOT route it in v1.
   */
  intent?:
    | "learn"       // → summary + selectors
    | "implement"   // → treated as 'integrate' (alias)
    | "debug"       // → decoded error + matches
    | "integrate"   // → recipe payload
    | "compare"     // → side-by-side summary + selectors
    | "lookup";     // → typed record (EIP / ABI / address)
  // NOTE: 'vulnerability' is intentionally absent from v1. It belongs to the
  // separate audit/vulnerability module (v-next). Return an error if received.

  /**
   * Scope filter — restricts retrieval to these content types.
   * ACCEPTED SUBSET for web3.search (7 of the canonical 11 — see §3.1.1):
   *   docs · code · eip · abi · canonical · recipe · deployment
   * Omitted => all seven are searched. 'example', 'test' and 'config' are
   * reachable via web3.grep, not here; 'audit' is not in v1 at all.
   */
  scope?: Array<
    | "docs"
    | "code"
    | "eip"
    | "abi"
    | "canonical"
    | "recipe"
    | "deployment"
  >;

  /** Project ID (e.g. "uniswap-v4", "zerodev", "safe"). A Layer-0 predicate. */
  project?: string;

  /** Semver or tag (e.g. "4.0.0", "latest"). A Layer-0 predicate.
   *  Omitted => resolved from version_latest, and version_defaulted: true
   *  is set on every unit in the response. Unresolvable => VERSION_NOT_FOUND. */
  version?: string;

  /** Chain identifier (e.g. "ethereum", "arbitrum", "base"). A Layer-0 predicate. */
  chain?: string;

  /** Maximum results. Demoted knob: default 5, hard cap 20. The response
   *  budget (§3.4) normally binds first. Values above the cap are clamped,
   *  never errored. */
  max_results?: number;
}
```

#### 3.1.1 The canonical `scope` enum — stated once

`scope` is defined **once**, on the `Chunk` in `05-` §1, with **eleven values**. Every tool accepts an explicitly named **subset**; no tool may silently widen or narrow it, and no tool invents a value.

| Value | In v1? | `search` | `grep` | Notes |
|---|---|---|---|---|
| `docs` | ✅ | ✅ | ✅ | |
| `code` | ✅ | ✅ | ✅ | |
| `eip` | ✅ | ✅ | ✅ | tombstoned (`status: Moved`) EIPs are never indexed — `05-` §4.1 |
| `abi` | ✅ | ✅ | — | ABI chunks are `language: "json"` |
| `recipe` | ✅ | ✅ | ✅ | addressed by **two-part** recipe IDs, not code selectors (`05-` §1.3) |
| `deployment` | ✅ | ✅ | — | typed record; prefer `web3.lookup` |
| `canonical` | ✅ | ✅ | ✅ | canonical reference implementation |
| `example` | ✅ | — | ✅ | harvested; gated on match precision |
| `test` | ✅ | — | ✅ | |
| `config` | ✅ | — | ✅ | |
| `audit` | ❌ **not in v1** | — | — | reserved for the separate audit module. Reject with `INTENT_NOT_SUPPORTED`. |

**`grep` gains nothing silently.** Its subset is `code · docs · example · test · config · recipe · eip · canonical` — deliberately wider on *code-adjacent* scopes (that is what lexical match is for) and deliberately narrower on typed records (`abi`, `deployment`), which are `web3.lookup`'s job. Any scope value outside a tool's stated subset is an `INVALID_INPUT` error, not a silently ignored argument.

### 3.2 Intent Routing

Routing is **deterministic** — a table, not a model. **No LLM runs on the hot path**: no query rewriting, no decomposition, no dynamic top-K. If the caller omits `intent`, the router infers it from the query text by rule. Layer-0 resolution (entity · version · chain · symbol) runs first and applies its SQL predicate **before any search**.

Two retrieval modes are dispatched by intent *(rev. 2026-08-03 — corrected: BREADTH is not "vector retrieval")*:

| Mode | When | Mechanism |
|---|---|---|
| **STRUCTURE** | `implement`, `debug`, project-anchored `integrate` — i.e. a symbol resolved | **deps closure defines the candidate set → BM25 ranks within it.** No model invoked. |
| **BREADTH** | `learn`, `compare`, cross-project / un-anchored `integrate` | **Expanded-BM25** over the 5-column index (`05-` §3.3). A dense arm joins by convex combination α≈0.7 **only if the W1 ablation earns it** (§5.2). |

If the lexical arm returns fewer than *k* results, widen the scope first, then fall back to the dense arm if one is enabled.

`lookup` is special: it hits structured tables directly — `(project, version, chain) → address`, `(project, version) → ABI`, EIP registry. It does **not** fall back to vector search; a typed record either exists or the answer is `VERSION_NOT_FOUND` / `PROJECT_NOT_FOUND` (§7).

### 3.3 Output Shapes by Intent *(rev. 2026-08-03)*

> **The rule this section now enforces at the type level: `web3.search` and `web3.grep` NEVER return `content`.** They return `SearchHit` — a selector, a precomputed snippet, provenance and a score. Bodies exist on exactly one type, `FetchedUnit`, reachable through exactly one tool, `web3.fetch`. Earlier drafts declared a "never full bodies" guarantee in prose while `IntegrateResult.code_chunks[].content` returned complete units for the majority intent; the guarantee is now structural rather than aspirational.

All output shapes are wrapped in a discriminated union on `intent`:

```typescript
type Web3SearchResult =
  | IntegrateResult
  | DebugResult
  | LearnResult   // also handles intent = 'compare'
  | LookupResult;

/**
 * SearchHit — the discovery shape. Returned by web3.search and web3.grep.
 * Deliberately has NO `content` field. Not "usually omitted" — absent from the type.
 * To read a body, take `selector` and call web3.fetch.
 */
interface SearchHit {
  // ── Address ───────────────────────────────────────────────────────────
  selector: string;              // 3-part code selector, or 2-part recipe ID (05- §1.3)
  chunk_id: string;
  scope: ChunkScope;             // canonical enum, §3.1.1
  language?: CodeLanguage;       // omitted for prose hits

  // ── Evidence (bounded) ────────────────────────────────────────────────
  snippet: string;               // PRECOMPUTED at ingest, <= 300 chars. Never generated
                                 //   at query time; contentless FTS5 cannot do it (05- §3.3).
  source_url: string;
  source_lines?: [number, number];

  // ── Provenance — mandatory on every hit (§4.5) ────────────────────────
  project: string;
  version: string;
  version_defaulted: boolean;
  last_validated: string;        // ISO date
  as_of: string;                 // ISO datetime the upstream source was read
  /* ⚠ C51's `provenance_kind` + `pin_ref` are deliberately NOT here. A SearchHit is a
   * DISCOVERY result — the agent has cited nothing yet — and this type already carries a
   * REDUCED provenance set for that reason (no last_updated, no content_hash). At top-20
   * the two fields would cost ~200 of the ~4,000-token budget to describe units the agent
   * may never fetch. They ride the FETCHED unit, where citation actually happens.
   * ⚠ Revisit if measurement shows agents citing straight from search hits — that would
   * make this the wrong call, and it is a measurement, not a matter of taste. */

  // ── Ranking ───────────────────────────────────────────────────────────
  score: number;
  retriever?: "bge-m3" | "lexical-fallback";  // see CodeChunk.retriever, below
}

/** Returned for intent = 'integrate' | 'implement' */
interface IntegrateResult {
  intent: "integrate";
  recipe: RecipePayload | null;  // null if no recipe exists; fall back to hits.
                                 //   "no matching example exists" is a first-class answer —
                                 //   a mismatched example measured worse than none.
  code_chunks: SearchHit[];      // ranked code units as SELECTORS + SNIPPETS.
                                 //   Was CodeChunk[] (which carried `content`) — that was
                                 //   the body leak. Bodies come from web3.fetch only.
  related_recipes: string[];     // two-part recipe IDs (project_id::recipe_type)
  truncated?: boolean;           // budget was hit; see §3.4
}

/**
 * RecipePayload — field ORDER is part of the contract, not a style preference.
 * `working_example` is FIRST: agents follow the example over the prose, and
 * example-led payloads measured better on both retrieval and generation.
 */
interface RecipePayload {
  working_example: {             // ← FIRST. Lead with the runnable thing.
    code: string;
    source_protocol: string;
    source_url: string;
  } | null;                      // null => say so explicitly; never substitute a near-match
  project_id: string;
  version: string;
  version_defaulted: boolean;
  chains: string[];
  type: string;
  last_validated: string;        // ISO date
  as_of: string;                 // ISO datetime
  validated_by: string;
  interface: string;             // Solidity interface block (string)
  deployments: Record<string, string>; // chain → address
  approval_flow: string[];       // ordered approval steps
  /**
   * Enumerated parameters for the integration surface.
   * OMITTED WHENEVER `working_example` IS PRESENT — measured: dropping the
   * parameter list improves retrieval AND generation while cutting tokens.
   * Populate it only when no working example could be supplied.
   * (Does not apply to web3.lookup, where the ABI *is* the answer.)
   */
  parameter_list?: string[];
  required_imports: string[];
  common_mistakes: Array<{
    issue: string;
    source: string;
    severity: "low" | "medium" | "high";
  }>;
  gas_notes: string;
  related_recipes: string[];
}

/** Returned for intent = 'debug' */
interface DebugResult {
  intent: "debug";
  decoded_error: string | null;
  matches: SearchHit[];          // relevant code that matches the error context
  suggested_fixes: string[];
  truncated?: boolean;
}

/** Returned for intent = 'learn' | 'compare' */
interface LearnResult {
  intent: "learn" | "compare";
  summary: string;
  selectors: string[];           // selectors for web3.fetch / web3.deps
  related_docs: SearchHit[];     // was DocChunk[] (which carried `content`) — same leak,
                                 //   same fix. Prose bodies also come from web3.fetch.
  truncated?: boolean;
}

/** Returned for intent = 'lookup' */
interface LookupResult {
  intent: "lookup";
  record:
    | EIPRecord
    | ABIRecord
    | DeploymentAddressRecord
    | null;
}

interface EIPRecord {
  type: "eip";
  eip: number;
  title: string;
  status: string;
  summary: string;
  source_url: string;
}

interface ABIRecord {
  type: "abi";
  project_id: string;
  version: string;
  abi: object[];                 // JSON ABI array
  source_url: string;
}

interface DeploymentAddressRecord {
  type: "deployment";
  project_id: string;
  version: string;
  chain: string;
  address: string;
  source_url: string;
}

// --- Shared enums (defined once; see §3.1.1) ---

type ChunkScope =
  | "docs" | "code" | "eip" | "abi" | "recipe"
  | "example" | "test" | "config" | "deployment" | "canonical";
  // 'audit' is the 11th canonical value in 05- §1 and is NOT servable in v1.

type CodeLanguage =
  | "solidity" | "vyper" | "rust" | "move" | "cairo"
  | "typescript" | "markdown"
  | "json";                      // ABI and config chunks

// --- Shared chunk types (BODY-BEARING — only web3.fetch returns these) ---

interface CodeChunk {
  chunk_id: string;
  project_id: string;
  version: string;
  chain: string[];
  scope: "code" | "example" | "test" | "config" | "abi";
  language: CodeLanguage;
  level: "project" | "contract" | "function" | "concept";
  selector: string;              // project::contract::function
  source_url: string;
  source_lines?: [number, number];
  pragma?: string;
  contracts: string[];
  functions: string[];
  imports: string[];
  inherits: string[];
  content?: string;              // the complete unit (never fragmented).
                                 //   Optional because it may be withheld for budget —
                                 //   see content_omitted, §3.4.
  content_omitted?: boolean;     // true => body withheld; selector + source_url survive
  score: number;

  /** Which retriever produced this hit.
   *  "bge-m3"           — the single-vector dense arm (fallback path, and only if
   *                       the W1 ablation earns it at all).
   *  "lexical-fallback" — BM25 + deps served it because the dense arm was
   *                       unavailable or was never invoked. This is the NORMAL
   *                       case on the primary path; omit the field there.
   *  A late-interaction value may be added behind the seam later (§5.3) — treat
   *  this enum as open for reading, closed for writing. */
  retriever?: "bge-m3" | "lexical-fallback";

  // ── Provenance — mandatory (§4.5) ──────────────────────────────────────
  version_defaulted: boolean;    // caller did not pin a version; Layer 0 resolved it
  last_validated: string;        // ISO date a human/manifest last confirmed this unit
  as_of: string;                 // ISO datetime the upstream source was read
  last_updated: string;
  content_hash: string;
  /* C51, 2026-08-11 — what KIND of thing source_url points at, and the token that
   * makes it immutable. Both ALWAYS serialised (~10 tok): omitting 'repo' would make
   * ABSENCE MEAN REPO, and `version_defaulted` exists precisely to refuse that trade.
   * 'artifact' = a published per-version build (the package IS the source) — the route
   * by which a closed-source SDK is citable at all. pin_ref is never a mutable ref:
   * `latest` and `main` re-resolve, so a citation to either cannot be rechecked.
   * Definitions and checkers: 05- §1.1a. */
  provenance_kind: "repo" | "artifact" | "docs" | "chain";
  pin_ref: string;               // commit SHA · exact version · as_of read · chain+block
}

interface DocChunk {
  chunk_id: string;
  project_id: string;
  version: string;
  scope: "docs" | "eip" | "recipe" | "canonical";
  language: "markdown";
  source_url: string;
  content?: string;              // same rule as CodeChunk.content
  content_omitted?: boolean;
  score: number;

  // ── Provenance — mandatory (§4.5) ──────────────────────────────────────
  version_defaulted: boolean;
  last_validated: string;
  as_of: string;
  last_updated: string;
  content_hash: string;
  provenance_kind: "repo" | "artifact" | "docs" | "chain";  // C51 — see CodeChunk
  pin_ref: string;
}
```

### 3.4 Response Budget & Truncation Contract *(rev. 2026-08-03)*

*This section replaces the retired `draft`/`full` mode table. The server decides how to deliver a response; the caller decides what to ask for.*

**Budget: ~4,000 tokens, top-5 results, by default.** This is a measured sweet spot, not a guess — cAST found ~4,000 / top-5 optimal and **8,000 tokens produced *worse* results**. More context is not better context: agents pull every returned document into their window, so an extra passage is an extra chance to be wrong. Operators override per deployment with `?maxTokenBudget=` (§3.1); the schema never changes.

**Hard caps, all enforced server-side:**

| Cap | Value | On breach |
|---|---|---|
| Results per response | top-5 default, 20 absolute | rank-truncate; set `truncated: true` |
| `snippet` length | **≤300 chars** | truncate at ingest, not at query time (`05-` §4.4) |
| `fetch.selectors[]` | **≤10** | §4.1 |
| `deps` inlined units | **≤15** | §4.2 |
| Total response | `?maxTokenBudget=`, default ~4,000 tok | shed bodies first (below), then rank-truncate |

**The truncation contract — degrade bodies, never citations.** When the budget binds, the server drops *content*, never the ability to find the content again:

```typescript
// A budget-shed unit. Still fully addressable, still fully attributed.
{
  selector: "uniswap-v4::PoolManager::swap",
  source_url: "https://github.com/…/PoolManager.sol#L128-L214",
  project: "uniswap-v4", version: "4.0.0", version_defaulted: false,
  last_validated: "2026-07-30", as_of: "2026-08-01T04:00:00Z",
  content_omitted: true          // ← body withheld; everything needed to get it survives
}
```

Ordering of what gets shed, in order: (1) bodies of lower-ranked units → `content_omitted: true`; (2) optional metadata arrays; (3) lower-ranked units entirely → `truncated: true`. **`selector`, `source_url` and the full provenance block are never shed.** A response that cannot be traced is worse than a short one.

**The cursor must be self-describing, in the `content` text — not just a flag.** Agents act on prose, not on booleans. Emit the next step literally:

> `…3 of 11 units returned (budget). Call web3.fetch with start_index=3 for more.`

And when a narrower tool is the right next move, say which: a `fetch` that overflows points at `grep`; a `search` that returns only prose points at `lookup` if a typed record exists. This is the collapse-with-pointer-to-a-narrower-tool pattern; it is how the surface stays at ~3 calls per task instead of drifting upward.

---

## 4. Tools: web3.fetch · web3.deps · web3.grep · web3.lookup

*`web3.expand` is **split**. It conflated two operations with different costs, different call patterns and very different value: "give me this unit" and "give me what this unit depends on." The second is the highest-recall signal in the architecture and deserves to be callable on its own.*

### 4.1 `web3.fetch` — complete units by selector

```typescript
interface Web3FetchInput {
  /**
   * Selectors to fetch bodies for. 3-part code selectors (project::contract::function)
   * or 2-part recipe IDs (project::recipe_type) — 05- §1.3.
   *   "uniswap-v4::PoolManager::swap"
   *   "zerodev::KernelFactory::createAccount"
   * Obtained from web3.search / web3.grep SearchHits, or from web3.deps edges.
   * HARD CAP: 10. See below for over-cap behaviour.
   */
  selectors: string[];        // maxItems: 10 (declared in inputSchema)
  fields?: string[];          // restrict returned metadata; omit for all
  start_index?: number;       // resume point for the self-describing cursor (§3.4)
}

interface Web3FetchResult {
  units: FetchedUnit[];
  missing: Array<{
    selector: string;
    reason: "not_found" | "over_cap" | "budget";
    note?: string;            // human-readable next step, e.g. the re-call instruction
  }>;
  truncated?: boolean;
}

interface FetchedUnit extends CodeChunk {
  parent_chunk_id?: string;
  // content is present here and ONLY here (plus budget-shed cases, §3.4).
  // This is the single body-bearing shape on the entire surface.
}
```

**Hard cap: `selectors` ≤ 10.** Over-cap requests are **never errored** — the first 10 are served and **every excess selector is returned in `missing[]` with `reason: "over_cap"` and a note telling the agent exactly what to do next** (*"selector cap is 10 per call; re-call web3.fetch with the remaining selectors"*). A partial, self-explaining response keeps the agent moving; an error costs a full turn.

**Deterministic** — the same selector always returns the same complete unit (modulo freshness updates). No vector search, no model inference. Reads `units` in the core DB and the body from R2 by `r2_key`.

**This is the "code arrives whole, never fragmented" guarantee, made addressable.** A contract arrives as a contract — and it arrives *here*, never from `search`.

**⚠️ Payload shaping:** lead with `working_example`; **omit `parameter_list` whenever an example is present** — deleting it measurably improved *both* retrieval and generation while cutting tokens (see `RecipePayload`, §3.3). This does not apply to `web3.lookup`, where the ABI *is* the answer.

### 4.2 `web3.deps` — dependency closure

```typescript
interface Web3DepsInput {
  selector: string;
  depth?: number;             // default 1; >2 rarely useful and grows fast
  kinds?: ("imports"|"inherits"|"structs"|"errors"|"events"|"modifiers"|"calls")[];
}

interface Web3DepsResult {
  root: string;
  edges: DepEdge[];           // selector → selector, typed by kind. ALWAYS complete
                              //   within the depth cap — edges are cheap, bodies are not.
  units: FetchedUnit[];       // the depended-on units, inlined. HARD CAP: 15.
  truncated: boolean;         // see the trigger table below — never set arbitrarily
  truncation_reason?: "unit_cap" | "depth_cap" | "row_budget" | "token_budget";
}
```

**Hard cap: 15 inlined units, with defined triggers.** `truncated: true` is set when — and only when — one of these fires:

| Trigger | Condition |
|---|---|
| `unit_cap` | the closure resolves to **more than 15 units**; the 15 nearest by traversal depth (ties broken by edge kind priority `inherits` > `imports` > `calls` > rest) are inlined |
| `depth_cap` | traversal reached `depth` and unexpanded frontier nodes remain |
| `row_budget` | the recursive CTE hit its row budget (cycle-guarded via a visited set in SQL) |
| `token_budget` | the ~4,000-token response budget bound before the unit cap did |

When truncated, **edges for the omitted units are still returned** — the agent gets the complete shape of the graph and can `web3.fetch` any node it wants. Shedding bodies while keeping the map is the whole truncation philosophy (§3.4).

Served by a **single `WITH RECURSIVE` query against the core DB** over a precomputed edge table — depth-capped, cycle-guarded, row-budgeted. The traversal happens *inside SQLite*, not in the Worker, which keeps it under both the 10 ms Worker CPU cap and the 50-subrequest limit.

**Why it is a first-class primitive:** dependency-aware retrieval measured **0.92 recall vs 0.53–0.55** for BM25 and dense alike — and **0.92 vs 0.32–0.38 on variables specifically**. It is also **structurally unreachable by any embedding**: relevance here is query-dependent, and an embedding is computed once, without the query. Hydra's contrastive training for this task *failed to converge* for exactly that reason. Better models do not close this gap; only a graph does.

Our graph is **compiler-derived** (Slither/tree-sitter at ingest), not learned — so we get the same result at table-lookup cost. **State that distinction explicitly wherever GraphRAG critiques might be pattern-matched onto us:** those critiques target *LLM-extracted* graphs over prose.

### 4.3 `web3.grep` — exact lexical match

```typescript
interface Web3GrepInput {
  pattern: string;            // identifier, selector fragment, 4-byte sig, error name
  project?: string;
  version?: string;           // omit → resolves to project default, and says so
  /** ACCEPTED SUBSET (§3.1.1) — wider than search on code-adjacent scopes,
   *  narrower on typed records (abi/deployment belong to web3.lookup).
   *  Any value outside this list is INVALID_INPUT, not a silent no-op. */
  scope?: ("code"|"docs"|"example"|"test"|"config"|"recipe"|"eip"|"canonical")[];
  limit?: number;             // default 10, hard cap 20
}

interface Web3GrepResult {
  hits: SearchHit[];          // selector + <=300-char snippet + provenance + score.
                              //   NEVER `content` — the type does not have the field (§3.3).
  truncated?: boolean;
}
```

Served by the **dedicated lexical D1 database (SQLite FTS5, 5-column schema)** — native `bm25()` ranking with per-column weights, no external search service, no embedding model invoked. Query-side work is: tokenize the pattern with the pinned ingest tokenizer, then MATCH. The dual-tokenized `symbol` / `ident_subtokens` columns are what make `safe transfer` find `safeTransferFrom` without any encoder (`05-` §4.2).

**Why it exists:** CoREB measured **every one of eleven embedding models at 0.000–0.015 nDCG@10** on keyword-dense queries — the shape agents measurably emit (median ~10 terms, operator-heavy). Two scored exactly 0.000. This is not a fallback for when dense fails; **it is the only component that functions on that input class.**

> Note: A-RAG's `keyword_search` uses no pre-index (query-time scan). **That is their design, not ours** — we have BM25 indexed. We are *exposing* an existing signal, not adding one.

### 4.4 `web3.lookup` — typed records

```typescript
interface Web3LookupInput {
  kind: "address" | "abi" | "eip";
  id: string;                 // project name, contract name, or EIP number
  chain?: string;             // required for kind:"address"
  version?: string;
}

interface Web3LookupResult {
  kind: string;
  record: DeploymentRecord | AbiRecord | EipRecord;
  version: string;
  version_defaulted: boolean;
  last_validated: string;     // ISO date
  as_of: string;              // ISO datetime the upstream source was read
  source_url: string;
}
```

A **direct core-DB table hit — no retrieval at all.** Highest-precision surface we have; **mis-routing a query away from it is the worst failure mode on the surface** — which is why the escalation ladder in the server `instructions` (§2.2) starts here.

### 4.5 Version provenance — mandatory on every response

Every result from every primitive carries **`project` · `version` · `version_defaulted` · `last_validated` · `as_of` · `source_url`.** These are fields on `SearchHit`, `CodeChunk`, `DocChunk`, `RecipePayload` and `Web3LookupResult` — not a serialisation convention that can be forgotten.

**Every *fetched* unit additionally carries `provenance_kind` + `pin_ref`** *(C51, 2026-08-11 — `CodeChunk`, `DocChunk`; definitions and checkers in `05-` §1.1a)*. `provenance_kind` says what kind of thing `source_url` points at — `repo` · **`artifact`** · `docs` · `chain` — and `pin_ref` is the token that makes it immutable. ⭐ **`artifact` is what makes a closed-source SDK citable at all**: a published `@scope/pkg@1.2.3` is pinned as hard as a commit SHA, and for a consumer-facing SDK it is arguably the better source — it is what developers install and run. ⚠️ **`pin_ref` is never a mutable ref.** `latest` and `main` re-resolve, so a citation to either cannot be rechecked — and C49 measured `latest` splitting across two protocol majors inside a single npm scope. ⚠️ **Both are always serialised**; omitting `provenance_kind` when it is `repo` would make **absence mean repo**, and `version_defaulted` exists precisely to refuse that trade. They are deliberately **not** on `SearchHit` — see the note on that type.

> **Never return two versions of the same interface without labelling both.**

This is not cosmetic, and it is not theoretical. **Our own probes, 2026-08-02: 0 of 11 incumbent payloads carried any version label** — across an aggregator, two first-party vendor MCPs and an AI-synthesis service. Circle's docs tree contains `/cctp/v1/` *and* a v1→v2 migration guide, yet its MCP's `depositForBurn` result contains **zero occurrences of any version string**. The publisher authors the distinction; the serving layer discards it. **Two authoritative sources returned structurally incompatible `depositForBurn` signatures — and one of them describes a function that has never existed.** `bytes32 hookData` at position 5 is `depositForBurnWithHook`'s parameter *name* from position 8 fused to `depositForBurn`'s *type* from position 5. Canonical `TokenMessengerV2` has `bytes32 destinationCaller` at position 5 in **both** functions, at every release from 2025-01 to 2026-06; `hookData` is position 8 and `bytes calldata`. In v1, `depositForBurn` has only four parameters. A consumer holding the fused signature is not on the wrong version — **there is no version on which they are right.** That is the ambiguity class that misroutes funds rather than failing to compile. *(C45, 2026-08-08 — this is a **fabrication/conflation** stake, not a version-blindness one; the version-blindness stake rests on the measurements above.)*

CoREB measured **hard-negative intrusion above 55% for every model tested — 64% for the strongest.** In our domain that is `wagmi v2` outranking `v3`, `viem 2` mistaken for a v3 that does not exist, `CCTP v1` outranking `v2`, **`Aave v3.3` outranking `v3.7`** *(C50 — not v3-vs-v4: v4 has no `Pool` at all, so there is nothing to confuse; the live confusion is inside v3, `POOL_REVISION` 7 vs 11 on the same chain)*, `@metamask/sdk` served where `@metamask/connect-evm` is correct. Layer 0 (`15-` §1) prevents most of it by filtering *before* search; provenance in the payload is what lets an agent catch the rest. **`as_of` is a public promise** measured against the per-source freshness SLA — not an internal timestamp.

### 4.6 Every other field a public payload carries *(added 2026-08-20)*

🔴 **A public payload carries no undocumented fields.** Ruled after the F-7 stranger run: an
inventory of four live payloads found **eight** fields serialised to callers and **none** of them
described here — including two the owner spotted in the transcript. A field a client can see and
cannot look up is either a contract nobody wrote down or a leak; there is no third case.

**`web3_search`**

| field | when | what it means to a CALLER |
|---|---|---|
| `recipe.receipts` | on every served recipe | **What the human actually ran** — `validated_on` · `validated_by` · `checks` · `chains_exercised` · `on_chain` · optional `gas`. 🔴 **The stamp and its receipts render together or not at all**: a recipe whose receipts cannot be read is **refused**, exactly as an unstamped one is, and the block is **reserved before the body** so truncation can never separate the claim from its evidence. ⚠ **5 of 24 recipes carry on-chain transaction hashes; the other 19 carry the curator's own sentence** `on_chain: "none recorded — …"`, served **verbatim**. *A stated absence is not a gap*, and normalising it to `[]` would make it indistinguishable from a field nobody filled in |
| `recipe.body_cursor` | on a recipe whose body was **truncated** | 🔴 **The continuation handle, and the other half of `body_truncated: true`.** Golden rule 6 specifies *`content_omitted` + a self-describing cursor*; measured 2026-08-20, **9 of 9 served recipes were truncated and 0 carried a handle** — the caller was told there was more and given no way to ask for it. Shape: `recipe:<project_id>@<version>::<recipe_type>::body@<offset>` — **an offset into one immutable body, never a query, never ranking, never state.** Pass it to `web3_fetch` as `cursor` (or inside `selectors` — both doors are honoured, because a self-describing handle that only works in one place is a trap). Each call returns the next slice and the next cursor until there is none, and **the concatenation is byte-identical to the R2 object**. ⚠ Absent when the recipe cannot be addressed — *a cursor that cannot be honoured is worse than none.* Both halves of the dual return carry it |
| `recipe_candidates` | a recipe was **declined**, not absent | R-N / F68 Q4. Each entry is `{ project_id, version, recipe_type }` for a **human-stamped recipe the payload refused to serve**, because the scope was a family (D1) or a bare dictionary word (F68). The text half names the argument that serves it — *"pass `project: "across"` to receive it"*. ⭐ **This is the caller's next action**, and three of F-7's ten answers were completed by following it |
| `not_indexed_members` | a **family** scope has a member the corpus does not hold | `{ project_id, recipe: 'pending' \| { version } }`. R3's answer inside a family answer: *"`safe-protocol-kit`: known, not indexed, recipe stamped `8.0.6`"*. ⚠ `pending` means **we hold no stamped recipe**, never *"one is being written"* |
| `content_rescue` | `true` only | The identifier arms returned **zero** hits and every hit came from the **content column** instead. ⚠ **It is a trust signal, not a diagnostic**: these hits were not selected by an identifier the query named, so the ranking is weaker than a normal payload's. Measured firing on a flagship (F-7 Q7) |
| `top_body` | always | Why one unit's full body was inlined, or why none was — the **reason**, not just the effect. A shape change measured only by its output cannot tell *"it did not fire"* from *"it fired and did nothing"* |
| `scope.version_match` | always | How the caller's version string met the corpus's labels: `exact` · `major` · `none` · `not-requested`. **`none` means nothing was bound** — see the stamp note below |

**`web3_fetch`**

| field | when | what it means to a CALLER |
|---|---|---|
| `recipe_continuations` | a `recipe:…` cursor was passed | One entry per cursor: `cursor_used` · `resolved` · `project_id` · `version` · `recipe_type` · `offset` · `body` · `body_bytes` · `body_truncated`, plus the next `body_cursor` while more remains. 🔴 **A page carries NO citations and NO receipts** — those were reserved and sent whole with the head, and repeating them per page would bill the caller for the one part of the payload already guaranteed complete. ⚠ A cursor that no longer resolves returns `resolved: false` with a reason; **a malformed one is refused by name** rather than falling through to `selectors`, where it would 404 as `not_found` and read as a corpus gap |

**`web3_lookup`**

| field | when | what it means to a CALLER |
|---|---|---|
| `held_rows` | on a `NOT_FOUND` | How many typed rows the corpus holds for that project. ⭐ It separates *"this project has records and your name missed one"* from *"this project has none held"* — two cases that need different next actions and were indistinguishable before. ⚠ **It reports what the corpus holds, never what exists in the world** |

**`scope.diagnostics` — namespaced 2026-08-20, present only when non-empty**

| field | why it exists |
|---|---|
| `scope.diagnostics.naming_via` | the token(s) that granted `names_project`. It exists so a check can assert the **resolution path** rather than the outcome — without it, F68's *"`bridge usdc with across protocol` keeps its recipe"* test would pass through the bare word and have tested nothing |
| `scope.diagnostics.floor_denied` | the token(s) F68's dictionary-word floor refused |

⚠ **These two are namespaced rather than deleted, and the reason is stated:** removing them removes
the only live evidence that the floor fired *for the right reason*. **Namespacing beats deleting.**
The caller's actionable form of the same fact is already `recipe_candidates` plus the prose.

⚠ **A version you are shown is not always a version you may ask for.** A recipe's `version` is a
**`RecipeVersionStamp`** — what a human actually ran, often a git SHA — while `hits[].version` is a
**`UnitVersionLabel`**, what the corpus holds. They overlap in shape and never in meaning (D4).
Passing a stamp back as `version` binds nothing and the payload says so: `asked 70bc2e40 → UNBOUND
(none)`. **That is correct behaviour, and F77 records that the shape invites the mistake.**

---

## 5. CodeRetriever Seam *(rev. 2026-08-03)*

This is the **only swappable piece** in the retrieval stack. Everything surrounding it — the dependency graph, recipes, fusion, intent router, output shapes — is constant no matter what implements it.

**How results actually combine (this is not RRF, and it is not a three-arm fusion):**

1. **Dependency closure defines the candidate set.** It is a **filter**, never a scored arm. A reachability count is not a similarity distribution, and min-max normalising one into a convex combination is uncovered by the fusion theory we cite. BM25 then ranks *within* the candidate set.
2. **Convex combination α≈0.7 (theoretical min-max) applies only between the two *similarity* arms on the prose path** — expanded-BM25 and, if the W1 ablation earns it, a dense arm. That two-arm case is exactly the scope the TOIS result validated.
3. **RRF is a measured alternative arm, not the design**, and the ablation carries a **no-fusion arm** too — rank fusion has been found to add no reliable gain on mixed code+markdown+prose corpora.

### 5.1 Interface Definition

```typescript
/**
 * CodeRetriever — the swappable encode/retrieve seam.
 * v1: NOT ON THE PRIMARY PATH. Queries with a resolved symbol are served by
 * deps-closure + BM25 with no model invoked at all. A single-vector arm
 * (Workers AI -> Vectorize) serves prose intents ONLY IF the W1 ablation earns it.
 * Reversible: a late-interaction arm can be swapped in behind this interface
 * (landing zone: turbopuffer) without touching the graph, recipes, fusion or
 * output shapes. That reversibility is the seam's entire remaining purpose.
 */
interface CodeRetriever {
  /**
   * Encode a query string into a retrieval representation.
   * Called at most once per web3.search query, and only on the prose path.
   * Implementation must be swappable by config; callers never call the
   * underlying model directly — always go through this interface.
   */
  encode(query: string): Promise<CodeQueryVector>;

  /**
   * Retrieve the top-k most relevant code chunks for a query vector.
   * Returns ONLY this arm's results. The caller combines them with BM25 via
   * convex combination (alpha ~= 0.7) — and only on the prose path, where both
   * inputs are similarity scores. Never fuse a dependency-closure result here:
   * closure is a candidate-set filter applied upstream, not an arm.
   */
  retrieve(
    queryVector: CodeQueryVector,
    options: RetrieveOptions
  ): Promise<CodeChunk[]>;
}

interface CodeQueryVector {
  /** Opaque representation — type depends on active retriever. */
  data: Float32Array | SparseVector;
  /** Identifies which encoder produced `data`, so a mixed-encoder index is
   *  detectable at read time. A late-interaction value may be added here behind
   *  the seam if the W1 intrusion/OOD ablation earns one. */
  retrieverVersion: "bge-m3-v1";
}

interface SparseVector {
  indices: number[];
  values: number[];
}

interface RetrieveOptions {
  topK: number;
  scopeFilter?: string[];        // e.g. ['code', 'example']
  projectFilter?: string;
  chainFilter?: string;
  versionFilter?: string;
}
```

### 5.2 v1 Default: no encoder on the primary path

*Rewritten 2026-08-03. **v1 has no late-interaction retriever — because no good code late-interaction model exists off the shelf** (every downloadable ColBERT scores ≤63 MTEB Code), not because of hosting. Serverless multi-vector hosting has existed since 2026-07-29.*

| Property | Value |
|---|---|
| **Primary path** | **deps closure (candidate set) + BM25 (ranking). No model invoked.** |
| Lexical | **Dedicated lexical D1 (FTS5, 5-column schema)**, native `bm25()`, per-column weights |
| Dependency closure | **Core-D1 `WITH RECURSIVE`** over a precomputed edge table — one query, runs inside SQLite |
| Semantic gap | Closed **at ingest** — identifier dual-tokenization + doc-side sparse expansion (`05-` §4.2–4.3), not at query time |
| Dense arm | Single-vector via Workers AI → **Vectorize**, prose intents only, **ships only if the W1 ablation earns it.** Benchmark the catalog (`bge-m3` measured 51.49 MTEB Code — weak; also evaluate `qwen3-embedding-0.6b`, `embeddinggemma-300m`) against our own eval; do not inherit a default. ⚠️ Vectorize free tier ≈ 4,880 vectors — Workers Paid required for a real corpus |
| Optional reranker | `@cf/baai/bge-reranker-base` over top-50 ($0.003/M, cheapest in catalog; latency unpublished) — **W1-gated, ships only if it cuts intrusion within budget** |
| Hardware | **None.** Cloudflare Workers |
| Graduation store | **turbopuffer** (~$16/mo flat) at ~750 projects, and the landing zone for any late-interaction arm |
| Languages covered | All indexed langs (⚠ no Web3 langs in any published training corpus — W1 measures the gap per-language) |
| MCP SDK / spec | **scoped packages `@modelcontextprotocol/{core,server,…}@2.0.0`** (GA 2026-07-27 — `sdk@^2` does not resolve) · serve the **2025-11-25** wire era at launch, **2026-07-28** behind a flag |
| Auth | **OAuth 2.0 + CIMD** (DCR is deprecated) for the directory and paid tiers, **plus an authless free read tier**; API keys for REST + Docker catalog only |
| Config flag | `CODE_RETRIEVER=none` (default) · `=bge-m3` if W1 earns the dense arm |

**Critically: the dense arm is a *fallback*, not the default route — and it may not ship at all.** Queries with a resolved symbol and `implement`/`integrate`/`debug` intent go to **deps + BM25 with no encode**. Dense serves prose `learn`/`compare` only, or when lexical returns fewer than *k* results.

⚠️ The frequently quoted "106 of 200 eval queries never encode" is a **derivation, not a measurement**: it counts integrate (57) + implement (49), excludes the 44 `debug` queries that also take the no-encode route, and assumes 100% Layer-0 symbol resolution — **a rate that has never been estimated.** W1 measures the resolution rate; until then, state it as the derivation it is.

The `/encode` call-site must call through the `CodeRetriever` interface, never directly into a model:

```typescript
// Correct — always go through the seam:
const vec = await codeRetriever.encode(query);

// Wrong — never do this in calling code:
const vec = await bgeM3.encode(query);   // ← hard-codes the retriever
```

### 5.3 The seam's remaining purpose — reversibility

*§5.3 previously specified a pre-staged second retriever with an activation gate. That whole mechanism is out of scope: no offline encode, no inactive index, no activation cron, no gate.*

The seam's purpose is now sharper: **it is the only thing keeping the "no late-interaction retriever" decision reversible.** A multi-vector arm can be added behind it later — landing zone **turbopuffer**, which has served ColBERT-style multi-vector since 2026-07-29 — without touching the dependency graph, recipes, fusion, or output shapes.

```typescript
// v1 default — the primary path invokes nothing:
// CODE_RETRIEVER=none          →  no encode call at all (deps + BM25 serve)

// If the W1 ablation earns a dense arm:
// CODE_RETRIEVER=bge-m3        →  WorkersAiRetriever implements CodeRetriever

// If the W1 intrusion/OOD companion run favours multi-vector:
// CODE_RETRIEVER=late-interaction
//   →  a multi-vector implementation on turbopuffer, behind this same
//      interface. Nothing upstream or downstream changes.
```

**Standing obligation — and note the hypothesis has been corrected.** `09-EVAL-HARNESS.md` requires an **offline late-interaction companion run in W1 even though it does not serve v1**: a multi-vector model (mLateOn / GTE-ModernColBERT) vs the single-vector arm vs BM25, on the **hard-negative and per-language slices**, measuring **intrusion**.

⚠️ **The question is OOD generalization and version-confusable resistance — NOT short-query rescue.** The earlier framing had it backwards: MaxSim's documented failure mode is **long** queries (86–97% degradation beyond 20 words, architectural). Short-keyword robustness comes from exact lexical match, which is why BM25 owns that slice. Late interaction's measured edge is holding rank under decontamination and on unseen ecosystems. That is the property worth testing, because that is the property we would be buying.

### 5.4 Fallback Behavior

| Condition | Behavior |
|---|---|
| Dense arm (if enabled) unreachable or rate-limited | Fall back to **BM25 + deps only**; mark results `retriever: "lexical-fallback"`; do NOT surface an error |
| Vectorize query fails | Same — BM25 + deps still serve. **This degrades gracefully because dense was never the primary arm** |
| Lexical DB (FTS5) unavailable | Serve `deps` + `lookup` + cached results only; this is a genuine outage — alert. Recovery is **rebuild from R2, not restore** (`05-` §3.1) |
| Dependency edge table missing for a selector | Return the unit without closure; flag `deps_unavailable: true` |
| `web3.fetch` selector not found | Return it in `missing[]` with `reason: "not_found"`; do NOT error the whole response |
| `web3.fetch` over the 10-selector cap | Serve the first 10; excess into `missing[]` with `reason: "over_cap"` + a re-call note (§4.1) |
| Mixed `tokenizer_version` detected in the index | **Refuse to serve the lexical arm** and alert — a half-retokenized index is silently wrong (`05-` §4.2) |
| No matching example above the confidence threshold | **Return interface + deps and state that no matching example exists** — a mismatched example measured worse than none |

Fallback must be **silent to the agent** — degraded-but-valid results, never a hard error from a retriever failure. `retriever: "lexical-fallback"` is the single value used for every such degradation, and is also the normal steady state on the primary path. Error codes `-32020`–`-32099` are reserved by the MCP spec; our `Web3MCPError` codes are app-level strings and unaffected, but check the numeric mapping.

### 5.5 Latency SLO *(rev. 2026-08-03)*

**The SLO is one number: sub-500 ms warm, end to end.** That is what we design to, alert on, and are willing to state publicly.

Everything below it is an **internal engineering target — all of them unvalidated, none of them publishable:**

| Path | Internal target (unvalidated) |
|---|---|
| L0 exact cache hit (Cloudflare Cache API / KV) | tens of ms |
| `web3.lookup` — typed table hit | single-digit ms of DB time |
| `web3.grep` / `web3.deps` — no encode | tens of ms of DB time |
| `web3.fetch` — core DB + R2 | tens of ms |
| `web3.search` cache miss, prose path | dominated by the store round-trip |

**Why the headline was demoted.** The only published measurement of this exact stack (Workers + D1 FTS5 + Vectorize + KV) is **<240 ms hit / <400 ms miss**. The old "<40 ms / 80–160 ms" headline was 2.5–6× more aggressive than that — an unfunded claim. And it optimises the wrong axis: across 433k analysed agent tool calls, **sub-second tool calls account for roughly 1% of task wall-clock**, and the Anthropic Connectors Directory has **no latency requirement** at all.

**The competitive axes are tokens and calls per completed task** — bar: ≈3.3k tokens / ~3 calls. That is where this design can win by a lot; milliseconds are where it can only tie.

**How the budget is met:** by **not invoking a model on the primary path**, not by racing encoders.

> ⚠️ **W0.1 must measure the Sessions-API *replicated* D1 path**, benchmarked against turbopuffer with placement hints pinned, on a real ~1–3M-chunk index. **Measuring a plain `env.DB.prepare()` measures the primary only and will produce a wrong answer** — potentially killing a design that is actually fine.

Latency is an SLO, not a co-equal design law. **Correctness and freshness take priority.** A slow correct answer is acceptable; a fast stale one is not.

---

## 6. Response Delivery *(rev. 2026-08-03)*

*The `draft`/`full` caller knob is gone (§3.1). **The server decides how to deliver a response** — it is a transport concern, and callers consistently chose wrong.*

> **Streaming top-3 was cut from v1 on 2026-08-03** (SSE resumability was removed from the spec, so a broken stream loses the in-flight request; and small shaped payloads make partial emission low-value). **v1.1 candidate**, pending W0/W1 latency data.

- **The server MUST return a single, complete response.** Every tool call resolves to one emission containing the full result — no partial emission, and **no partial-emission requirement anywhere in v1**.
- Shaping and provenance stamping (§3.3, §4.5) complete **before** the response is emitted. A unit is never returned before it is capped, snippeted and labelled.
- The budget and caps in §3.4 govern that single response. Truncation is expressed **in-payload** (`content_omitted: true` + a self-describing cursor), never by cutting a stream short.
- Clients see a well-formed complete response — always, and by construction rather than as a fallback.

---

## 7. Error Contract *(rev. 2026-08-03)*

```typescript
interface Web3MCPError {
  code:
    | "INTENT_NOT_SUPPORTED"   // e.g. 'vulnerability' received in v1
    | "PROJECT_NOT_FOUND"      // project not in the index
    | "VERSION_NOT_FOUND"      // project resolved, but the requested version is not
                               //   indexed. NEVER silently fall back to another
                               //   version — that is the incumbent failure we exist
                               //   to fix. Return available_versions so the agent
                               //   can re-ask precisely.
    | "AMBIGUOUS_ENTITY"       // Layer 0 could not resolve the entity to exactly one
                               //   project/symbol (e.g. bare "Router", "connect").
                               //   Return candidates[]; do NOT guess. A wrong
                               //   confident answer costs more than a clarification.
    | "SELECTOR_NOT_FOUND"     // selector missing (use missing[] instead for partial)
    | "RETRIEVER_ERROR"        // internal; should be swallowed and fallback used
    | "RATE_LIMITED"           // auth/rate-limit from Cloudflare Workers L0
    | "INVALID_INPUT";         // schema validation failure, incl. a scope value
                               //   outside the calling tool's accepted subset (§3.1.1)
  message: string;
  selector?: string;           // for SELECTOR_NOT_FOUND
  intent?: string;             // for INTENT_NOT_SUPPORTED
  project?: string;            // for PROJECT_NOT_FOUND / VERSION_NOT_FOUND
  requested_version?: string;  // for VERSION_NOT_FOUND
  available_versions?: string[]; // for VERSION_NOT_FOUND — what IS indexed
  candidates?: Array<{ project: string; selector?: string; why: string }>;
                               // for AMBIGUOUS_ENTITY
}
```

- `INTENT_NOT_SUPPORTED` must be returned (not silently ignored) if `intent: "vulnerability"` or `scope: "audit"` is received in v1, so the agent knows to handle it explicitly.
- **`VERSION_NOT_FOUND` and `AMBIGUOUS_ENTITY` are product features, not failures.** Returning nothing is a valid answer; a plausible-but-wrong version or entity is the exact harm this server exists to prevent. Both errors must carry enough structure (`available_versions`, `candidates`) for the agent to re-ask in one turn rather than guess.
- `RETRIEVER_ERROR` must be caught internally and resolved via fallback (see [Section 5.4](#54-fallback-behavior)) before it reaches the agent. It should never appear in a response.
- All other errors surface to the agent as a structured `Web3MCPError` object, not a thrown exception.

---

*End of MCP Tool Surface & CodeRetriever Seam specification.*  
*For the design of record behind this revision, see `18-SOTA-BLUEPRINT-2026-08.md` §5 and `17-SOTA-REVIEW-2026-08.md` §3/§5.*  
*For the two chunk shapes and the index this contract reads from, see `05-DATA-MODEL.md`.*  
*For the retrieval stack this contract sits on top of, see `03-ARCHITECTURE.md`.*  
*For build week sequencing (when each piece of this is implemented), see `08-BUILD-PLAN.md`.*
