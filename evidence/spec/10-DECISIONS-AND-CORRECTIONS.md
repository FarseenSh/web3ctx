# Key Decisions & Corrections Reference

**Status:** Canonical / Locked
**Date:** 2026-06-01 · **Updated 2026-07-03** (July ground-truth refresh; adds D7, C11–C19) · **🔴 MAJOR REVISION 2026-08-02** · **🔴 REVISED 2026-08-03 (adds D10; supersedes D4)**

> **2026-08-03 *(rev. 2026-08-03)*.** **D10 added** — adoption of the `18-` SOTA blueprint: two-D1 layout, deps-as-candidate-filter (never score-fused), ingest-side dual-tokenization + doc-only sparse expansion, **no compression model on the hot path** (this inverts the previous rule 6), Skill front door + authless read tier, turbopuffer as the graduation/reinstatement destination, and a two-headline eval. **D4 is wholly superseded** (banner added; body retained as history). **D7's Consequences** now carry the CIMD priority chain and the authless tier. **C9** is aligned with C25; **C8, C10, C11, C31, C32** are re-superseded in place. **Corrections C33–C44 live in `17-` §2** — this file remains authoritative for C1–C32. Where `17-` and `18-` conflict, **`18-` wins**.
>
> **2026-08-02 — three locked decisions were superseded.** **D1** (SCAR deferred/pre-staged) → **SCAR is out of scope entirely**. **D3** (LateOn as v1 code retriever) → **v1 has no late-interaction retriever**. **D5** (meta-tool surface, self-hosted NextPlaid+Qdrant on a CPU box) → **five primitives, Cloudflare-native, no box**. **D7** amended (DCR deprecated → CIMD). **D8** and **D9** added. Corrections **C1, C2, C8, C10, C11** are superseded and **C3–C7, C19 are now historical-only**. Evidence: `14-RESEARCH-2026-08.md`. Decisions: `15-RETRIEVAL-ARCHITECTURE.md`, `16-HOSTING-DECISION.md`.
**Part of:** Web3 Context MCP build package

This document serves two purposes:
1. Short Architecture Decision Records (ADRs) for the seven key product/engineering decisions — capturing context, decision, and consequences so future contributors understand the WHY.
2. A Corrections Reference table listing every number or claim that has been corrected from earlier drafts, so the build never reintroduces these errors.

Cross-references: see `03-ARCHITECTURE.md` for the stack, `04-TECH-STACK.md` for retriever details, `08-BUILD-PLAN.md` for the build order, `09-EVAL-HARNESS.md` for the eval harness, and `02-PRD.md` for the full product scope.

---

## Part 1 — Architecture Decision Records

---

### D1: ~~SCAR Deferred to v1.1, Pre-Staged in v1~~ → **SUPERSEDED 2026-08-01: SCAR IS OUT OF SCOPE ENTIRELY**

> **Superseding decision.** SCAR is removed from v1 *and* v1.1. No offline corpus encode, no 299 MB inactive index, no SCAR-aware ingest cron, no four-condition activation gate, no v1.1 activation milestone. **Kept:** the CodeRetriever seam — not for SCAR, but because a swappable `/encode` call-site is correct architecture regardless. The analogous decision is now the **box-reinstatement trigger** (`09-EVAL-HARNESS.md`). The original ADR text is retained below as history. See `14-` §1.1.


**Status:** Decided
**Decision:** Do not activate SCAR in the v1 serving path. Pre-stage it — corpus-encode offline, build the inactive 299 MB sparse index, make the ingest cron SCAR-aware for new contracts, and install the CodeRetriever seam with a config-flag-switchable `/encode` call-site — but leave the default pointed at LateOn until the v1.1 activation trigger is met.

**Context:**
- SCAR ("Sparse Code Audit Retriever") is a SAE-LoRA model (LoRA rank 256 over a frozen JumpReLU SAE with 16,384 features at Layer 19) on Qwen2.5-Coder-1.5B. It achieves R@10 = 0.901 full-corpus and 0.977 controlled-eval, with MRR 0.803 full-corpus.
- The 1.5B query-encode step requires a GPU. v1 runs on a CPU-only box (CAX41 16 shared vCPU / 32 GB, or CCX23 4 dedicated vCPU / 16 GB — per W0). No GPU is provisioned in v1.
- SCAR is a narrow value add: its strongest case is precise Solidity source-code retrieval, which is roughly ~20% of expected traffic. It is unproven on the integration-task query distribution (the eval harness does not yet exist at decision time).
- The paper is under review. Cited numbers have required correction (see Part 2). The full-corpus vs. controlled-eval gap is meaningful (6.3 pts vs. 1.4 pts over SPLADE, respectively).
- The decision was evaluated through a 5-lens panel: 3 lenses voted defer, 2 voted conditional-agree, 0 voted include in v1.

**Decision (detail):**
Three pre-staging tasks are completed in v1 so v1.1 activation has no backfill debt:
1. Install the `CodeRetriever` seam: an interface with a `/encode` call-site, switchable by config flag. v1 default = LateOn.
2. Encode the full corpus through SCAR offline; load the 299 MB inverted index into memory but mark it INACTIVE. Make the ingest cron SCAR-aware so new contracts arriving after launch are encoded through SCAR automatically.
3. Build and lock the eval harness (W1 task #1) with the query distribution needed to gate SCAR activation.

**SCAR Activation Trigger (v1.1) — all four conditions must hold:**
1. Co-located GPU `/encode` service is deployed and healthy (latency SLO met).
2. Eval shows SCAR+BM25 beats LateOn+BM25 on the integration eval by a meaningful margin (e.g., >=3 pts R@10, or a clear Solidity-subset win).
3. RRF alpha is re-tuned for SCAR+BM25 on the real query distribution (alpha=0.5 will NOT transfer; BM25 hybrid weight must be validated for novel/OOD contracts).
4. SCAR's cited numbers are corrected per the Corrections Reference table below.

**Consequences:**
- v1 ships without GPU cost or GPU operational complexity.
- The CodeRetriever seam is the ONLY swappable piece; everything around it (graph, recipes, fusion, output shapes) remains constant across v1 and v1.1.
- Marketing can name-drop SCAR at launch (W8) since the corpus index is real; the serving-path activation is the v1.1 milestone.
- Honest positioning for v1: "EVM-strongest, broad full-Web3 coverage; SOTA Solidity code retrieval coming in v1.1."
- No latency risk from SCAR's ~140ms total (26.2ms encode on H100 + ~114ms P50 retrieval) until the GPU service is live.

---

### D2: Vulnerability / Audit Module is a Separate Post-Traction Module

**Status:** Decided
**Decision:** The vulnerability/audit-findings capability (intent=vulnerability, Solodit ingestion, audit-PDF parsing, Haiku contextual prefixes) is explicitly out of v1 and v1.1. It is a separate module, gated on traction and a written copyright/takedown policy.

**Context:**
- Audit reports are typically published under restrictive licenses by audit firms. Ingesting them at scale requires a written copyright and takedown policy before the first line of ingest code runs.
- The inline-vulnerability retrieval lane is saturated with competitors.
- Adding this capability without a legal framework creates reputational and legal risk.
- The `intent=vulnerability` value is reserved in the MCP tool surface but routes to a not-yet-built module.

**Decision (detail):**
- Solodit ingestion and audit-PDF parsing are NOT part of the ingest pipeline in v1 or v1.1.
- The `scope='audit'` chunk type exists in the data model for future use; no audit chunks are ingested until the module is green-lit.
- The module is green-lit only after: (a) meaningful traction is established, and (b) a written copyright/takedown policy is in place.

**Consequences:**
- The v1 MCP tool surface exposes `intent` values that do not include `vulnerability` in the active routing table. The canonical tool signature documents `vulnerability` as "v-next/audit-module."
- No legal exposure from audit-PDF ingestion at launch.
- Competitive lane is not entered until there is a clear differentiating angle.

---

### D3: ~~LateOn is the v1 Code Retriever~~ → **SUPERSEDED 2026-08-02 · premise corrected 2026-08-03**

> **🔴 Naming correction first (C33, `17-` §2).** The model is **LateOn** (LightOn, arXiv 2607.27178, 2026-07-29). **There is no code-specific variant of it** — the "‑Code"-suffixed name that appeared throughout earlier drafts **names a model that has never existed** and must never be reintroduced anywhere in this package. Every occurrence in the historical body below has been corrected to **LateOn**.
>
> **Superseding decision.** **v1 has no late-interaction retriever.** **Primary** retrieval is dependency closure (core-D1 `WITH RECURSIVE`, as a **candidate filter**) with BM25 (lexical-D1 FTS5) **ranking within it**; a single-vector dense arm is a fallback that ships only if W1 earns it. `14-` §4.11 ranks dense last on every head-to-head measured. ⚠️ **But every dense model in that evidence is single-vector, none late-interaction** — so **W1 must still evaluate a late-interaction arm offline** (`09-` Job B).
>
> **⚠️ Premise corrected *(rev. 2026-08-03, C33/C34)*.** This banner previously read *"no serverless platform hosts multi-vector late interaction."* **That has been false since 2026-07-29** — turbopuffer serves ColBERT-style multi-vector in beta at a ~$16/mo floor. The decision survives on **better** grounds: **no good *code* late-interaction model exists off the shelf** — every downloadable ColBERT scores ≤63 MTEB Code (GTE-ModernColBERT 54.37, jina-colbert-v2 49.88); only mLateOn reaches 73.48. And per **C36**, the W1 question is **OOD / version-confusable intrusion resistance, not short-query rescue** — MaxSim's documented failure mode is *long* queries. The seam keeps the reversal cheap; its landing zone is turbopuffer, not a box. Original ADR retained below as history.


**Status:** Decided
**Decision:** Use LateOn (LightOn, 149M parameters, Apache-2.0, ColBERT-style multi-vector code retrieval, served via NextPlaid+ONNX on CPU) as the default code retriever in v1.

**Context:**
- v1 runs on a CPU-only box (at or above the 4 vCPU / 16 GB floor). The alternative SOTA code retriever (SCAR) requires a GPU for the 1.5B query-encode step.
- LateOn is CPU-native, handles all languages (not only Solidity), is Apache-2.0 licensed, and ships without GPU provisioning.
- ColBERT-style late interaction is rerank-grade without a separate reranker pass. No separate reranker is included in v1.
- The retrieval thesis (Hydra, FSE 2026, arXiv 2602.11671) emphasizes structure-aware indexing + dependency-aware retrieval; the code retriever is one layer of a multi-signal stack (LateOn + DenseOn + BM25, fused via RRF, with tree-sitter complete-unit index and Slither dependency graph).

**Decision (detail):**
- LateOn is the default behind the `CodeRetriever` seam.
- DenseOn (149M, single-vector, 56.20 BEIR NDCG@10) and LateOn (149M, multi-vector, 57.22 BEIR NDCG@10) handle prose retrieval.
- BM25 uses a code-aware tokenizer for identifiers. RRF fuses modalities; alpha hybrid within code.
- Qdrant (in-memory, Apache-2.0, native hybrid dense+sparse+payload-filter) is the vector store.
- No separate reranker: late interaction provides rerank-grade quality natively.

**Consequences:**
- All-language code retrieval works from day one without GPU.
- The CodeRetriever seam means v1.1 can swap LateOn for SCAR (or any future model) behind the same interface with no downstream changes.
- The eval harness baseline is locked on LateOn+BM25 performance (W5), providing a clean comparison point for SCAR activation gating.
- Latency on cache miss is honest: ~80-160ms draft TTFB (CPU, via the **LateOn-edge draft path**; the 149M runs on expand/re-rank — NextPlaid's published CPU benchmarks put a 149M-only hot path at ~150–400ms P95 under load). Cache hit is <40ms. W0 spike confirms on the chosen box.
- **2026-07 update:** LateOn officially launched 6/24 with MTEB Code v1 74.12 (149M) / 66.64 (edge 17M) — the decision is strengthened. Caveat: its fine-tune corpus has no Solidity/Rust-Anchor/Move/Cairo; the W1 eval measures the Web3-language gap (if real, roadmap item R1 "LateOn-Web3 fine-tune" is the cheapest fix — see `13-PROPAGATION-CHECKLIST.md` 🅡).

---

### D4: ~~No GPU in v1 — Latency is an SLO, Not a Co-Equal Design Law~~ → **SUPERSEDED 2026-08-03 (retained as history)**

> **🔴 Supersession banner *(rev. 2026-08-03)*.** **This ADR is wholly obsolete and nothing in its body is current.** Every load-bearing element of it has been replaced: **there is no box** (D8 — Cloudflare-native serving), the cache store is **Workers KV / Cache API** not the box-resident store named below, **all compression/pruning models are OFF the hot path** (D10 — the LLMLingua clause below is *removed*, and its Provence-class successor was reversed too), the single-vector prose encoder named below has no host, and the latency figures below are retired in favour of **sub-500 ms warm as an SLO** (`18-` §2 / `19-` §5 — the published same-stack measurement is <240 ms hit / <400 ms miss, and the design's old <40 ms headline was 2.5–6× more aggressive than any measurement of it). The one idea that survived is the *title's* claim — **latency is an SLO, not a co-equal design law** — which is now golden rule 5 and is carried forward by **D8** and **D10**. Body retained below **only as history**; do not cite any number, component, or figure from it. See `16-HOSTING-DECISION.md`, `18-SOTA-BLUEPRINT-2026-08.md` §2, and `17-` C35/C40/C44.

**Status:** ~~Decided~~ **Superseded** (box *model* re-opened 2026-07-03 by Hetzner's repricing — CPU-only + no-GPU stood at the time; the box itself was removed 2026-08-02)
**Decision:** v1 ships on a CPU-only box at or above the 4 vCPU / 16 GB floor. No GPU is provisioned. Latency is demoted from a "design law" to an SLO: <40ms cache hit, ~80-160ms draft TTFB on cache miss (edge-17M draft path). **Box model:** Hetzner repriced 2026-06-15 — CCX23 is now €85.99/mo (was €31.49). W0 decides: CAX41 Arm €40.99 (preferred, pending ONNX-on-ARM64 spike) vs CCX23 €85.99 (fallback) vs re-quote competitors.

**Context:**
- The consumer is an AI coding agent, not a human waiting at a keyboard. The agent's own LLM inference takes seconds. Sub-second tool latency is acceptable; correctness and freshness matter more than raw latency.
- A GPU box adds cost, operational complexity, and a hard dependency on GPU availability — none of which are justified by the v1 query volume or the value of the ~20% Solidity-deep-retrieval slice (the primary GPU beneficiary via SCAR).
- The correct sizing floor is 4 vCPU / 16 GB — CCX23 (4 dedicated / 16 GB) sits at it; CAX41 (16 shared Arm / 32 GB) exceeds it. NOT the CCX13 (2 vCPU / 8 GB). This correction is load-bearing for capacity planning.
- Cloudflare Workers (free tier) handle L0 cache + auth + rate-limit at the edge. No GPU-dependent operation runs at the edge. In particular, no Voyage model runs at the Cloudflare Workers edge — Cloudflare Workers AI does not host any Voyage model. Prose query-embed runs on the box with DenseOn, or via Workers AI bge-m3 / qwen3-embedding-0.6b.

**Decision (detail):**
- Hardware: single CPU box — CAX41 (16 shared Arm vCPU / 32 GB) €40.99 or CCX23 (4 dedicated vCPU / 16 GB) €85.99 — W0 decides; see `04-TECH-STACK.md` §2.7.
- LLMLingua-2 compression is OFF the hot path (on expand / async only).
- CRAG (corrective retrieval) is OFF the hot path (async only).
- Streaming top-3 is served immediately so the agent can begin reasoning while remaining results arrive (Stream2LLM-style).
- L0 exact cache + L1 per-category semantic cache (Valkey 9.x) target >=30% cache hit rate to keep the median latency near the <40ms SLO.

**Consequences:**
- No GPU operational burden in v1. Hardware question moves to v1.1 with SCAR activation.
- Honest latency numbers must be used in all documentation: <40ms cache hit, ~80-160ms draft TTFB on miss (edge-17M draft path; 149M-only would be ~150–400ms P95). Do NOT claim sub-120ms single-box with SCAR.
- The GPU question is revisited only when all four SCAR activation conditions are met (see D1).

---

### D5: Open-Core Licensing, ~~Meta-Tool MCP Surface~~, No Separate Reranker → **AMENDED 2026-08-02**

> **Amendments.** (1) **The two-meta-tool constraint is dropped** — the surface is **five granularity primitives** (`search`/`grep`/`fetch`/`deps`/`lookup`). The failure mode to avoid was never "more than two tools", it is *mirroring an API surface*; A-RAG shows granularity tools *reduce* retrieved tokens. The old two-tool registered-token figure is **retired and never reused**; *(rev. 2026-08-03)* the target is now **≤600 registered tokens for all five primitives** plus a Tool-Selection-Guide `instructions` block, against measured category norms of 250–1,146 tokens for two-tool servers. **And a Skill front door costs ~100 tokens idle** (D10). (2) **The self-hosted multi-vector-server-plus-vector-store-on-a-CPU-box deployment is superseded** — Cloudflare-native, no box (D8). (3) **"No separate reranker" now stands on measurement, not inference**: CoREB reranked top-128 and on text-to-code — our dominant direction — **no off-the-shelf reranker improved anything** (−8.3% to −0.1%); on code-to-text all four degraded, one by 22.4%. Open-core licensing is **unchanged**. Original ADR retained below.


**Status:** Decided
**Decision:** Apache-2.0 for the server/SDK/skill layer; closed/hosted for the curated index, recipes, and freshness pipeline. Two meta-tools (`web3.search` / `web3.expand`) on the MCP surface with a ~400-token registered schema, 90% off via Anthropic prompt cache. No separate reranker.

**Context:**
- The moat is the hand-curated integration recipes + the freshness/ingestion pipeline + trust scaffolding. NOT the retriever model. Open-sourcing the server creates ecosystem goodwill and distribution while protecting the actual moat.
- A narrow two-tool MCP surface (`web3.search` + `web3.expand`) keeps the token footprint small and the cognitive load on the agent low. The ~400-token schema is nearly free with Anthropic prompt caching (90% off).
- Late interaction (ColBERT-style) provides rerank-grade quality natively. A separate reranker pass adds latency and complexity with no quality gain given the retriever choice.

**Decision (detail):**
- Licensing split: server/SDK/skill = Apache-2.0; curated index + recipes + freshness pipeline = closed/hosted.
- Distribution: HTTPS MCP endpoint (primary — all 7 target clients speak remote Streamable-HTTP natively as of 2026-07) + Smithery + Official MCP Registry (canonical upstream server.json) + awesome-mcp-servers (90k★) + Docker MCP Catalog + the two Web3-MCP directories (hive-intel/awesome-crypto-mcp-servers, rudazy/web3-mcp-hub) + optional Claude Code Skill. The npm stdio wrapper (`@web3context/mcp`) is **demoted to optional fallback** (`mcp-remote` also covers stragglers) — no longer a W7 critical-path deliverable.
- MCP surface: exactly two meta-tools. `web3.search` is intent-dispatched (learn / implement / debug / integrate / compare / lookup) and returns typed result shapes per intent. `web3.expand` returns complete units by selector deterministically in ~10-20ms.
- No separate reranker in v1 or v1.1.

**Consequences:**
- The two-tool surface is the agent's entire integration point. The intent dispatch, output shapes, and token economy are stable across v1 and v1.1.
- The closed curated index is the business; open server is the distribution engine.
- Recipe quality and freshness pipeline are the sustainable differentiator — competitors with the same retriever are differentiated by these.
- The top ~50-80 high-pain integrations get hand-curated recipes (the moat); all ~750 projects get indexed.

---

### D6: Distribute via the Docker MCP Catalog (Remote Entry; Optional Proxy Image)

**Status:** Decided
**Decision:** Add the **Docker MCP Catalog** as a v1 (W7) distribution channel via a PR to `docker/mcp-registry`. **Preferred path: a `type: remote` catalog entry** pointing at the hosted HTTPS MCP endpoint, with the `web3ctx_…` API key passed via `remote.headers` / `secrets` — **OAuth is optional in the entry spec, NOT required**, so there is no container to build or maintain. **Optional add-on:** also publish a **Docker-Built image** (Option A) of the open stdio→HTTPS proxy to gain signing / SBOM / provenance trust badges (image-only). Either path is a thin client to the hosted API — NOT a self-host of the curated index.

**Context:**
- The product is open-core (see D5): the server / SDK / skill are Apache-2.0; the curated index + recipes + freshness pipeline are closed/hosted. The thing users connect to is the hosted HTTPS MCP endpoint; the npm wrapper (`@web3context/mcp`) is a thin stdio→HTTPS proxy authenticated with a `web3ctx_…` API key.
- The Docker MCP Catalog (hub.docker.com/mcp + Docker Desktop's MCP Toolkit) is a high-traffic discovery + trust surface, in the same tier as Smithery / the Official MCP Registry. A PR to `docker/mcp-registry` can register either a containerized image or a remote entry.
- The MCP Gateway server-entry spec defines three server types — `server` (container), `remote` (hosted URL), and `poci`. A **`type: remote`** entry takes `remote.url`, optional `remote.headers`, and `config.secrets` (API keys); `oauth` is **optional, not required**. **Confirmed against live `docker/mcp-registry` entries (Telnyx, Short.io, Dappier):** each authenticates with a static API key via `remote.headers: { Authorization: "Bearer ${ENV}" }` wired to a `config.secrets` entry, over `streamable-http` — no OAuth, no container. (The managed OAuth flow — Notion/Linear — is just the alternative for OAuth-based services.)
- A containerized image, by contrast, gets Docker-Built security extras only via **Option A** (Docker builds, signs, and publishes to the `mcp/` Hub namespace with cryptographic signatures, provenance, and SBOMs; ~24h to live); **Option B** is a self-provided image (container isolation, no Docker-built extras). These trust badges are **image-only** — a remote entry does not get them.

**Decision (detail):**
- v1 / W7: submit a **`type: remote`** entry — hosted endpoint + API key via `remote.headers` / `secrets`. **No container required.** This is strictly less work than building an image and lists the real hosted endpoint.
- Optionally also publish a Docker-Built proxy image (Option A) if the signing / SBOM / provenance badges are judged worth the extra CI step.
- The direct **remote HTTPS endpoint is the primary on-ramp** (updated 2026-07-03: all 7 target clients speak remote Streamable-HTTP natively); npm/`npx` is an optional fallback artifact, and Docker is a parallel discovery surface — neither is a replacement for the endpoint.
- Do NOT ship the retrieval server or any curated data — it is a client to the hosted API.
- Submission shape is **confirmed** against live `docker/mcp-registry` entries (Telnyx, Short.io, Dappier) — `type: remote` + `remote.headers` (`Authorization: "Bearer ${ENV}"`) + `config.secrets`, transport `streamable-http` (NOT the deprecated `sse`). Canonical entry to submit:

```yaml
name: web3context
type: remote
about:
  title: Web3 Context MCP
  description: Version-pinned Web3 integration context — docs, EIPs, ABIs, addresses, recipes.
remote:
  transport_type: streamable-http
  url: https://mcp.web3context.dev/mcp
  headers:
    Authorization: "Bearer ${WEB3CONTEXT_API_KEY}"
config:
  secrets:
    - name: web3context.api_key
      env: WEB3CONTEXT_API_KEY
      example: web3ctx_xxxxxxxx
meta:
  category: developer-tools
```

**Consequences:**
- One more credible discovery surface at **near-zero cost** — a remote entry is a single YAML PR pointing at the existing hosted endpoint; no image to build or keep in sync.
- No moat leakage: the entry (or image) is a thin client; the curated index / recipes / freshness stay hosted and closed.
- Trade-off: a remote entry forgoes the Docker-Built trust badges (signing / SBOM / provenance are image-only). For a trust-positioned product, optionally add the proxy image later if the badges prove worth it.
- **Auth scoping (corrected 2026-07-03):** the API-key pattern above is valid **for the Docker catalog entry specifically** (verified against live entries). It does NOT generalize: product-level MCP auth is **OAuth 2.0 — see D7**. The Docker entry can keep API-key headers; Claude.ai/Desktop and the Anthropic Directory cannot.

---

### D7: OAuth 2.0 on the MCP Surface (API Keys for REST Only) → **AMENDED 2026-08-02**

> **Amendment.** OAuth 2.0 stands. But **DCR (RFC 7591) is DEPRECATED in MCP spec `2026-07-28`**, replaced by **Client ID Metadata Documents (CIMD)**. The W4 deliverable said "authorization-code + dynamic client registration" — that is now wrong. **New priority: pre-registration → CIMD → DCR fallback.** The authorization server advertises `client_id_metadata_document_supported: true`. Cloudflare's **OAuth Provider Library** implements the provider side of OAuth 2.1 and removes a meaningful chunk of W4.


**Status:** Decided 2026-07-03 (July ground-truth refresh)
**Decision:** v1 ships **OAuth 2.0** as the auth mechanism for the hosted MCP endpoint. API keys (`web3ctx_…`) remain for the REST surface and for channel-specific patterns that require them (Docker catalog remote entry, CI usage).

**Context (verified 2026-07-02/03):**
- **Claude.ai / Claude Desktop custom connectors accept OAuth only** — the add-connector UI has URL + optional OAuth Client ID/Secret and **no field for a static API-key/Bearer header** (open issue anthropics/claude-ai-mcp#112). An API-key-only server silently loses that entire audience. (Claude Code, the CLI, does support `--header` — the CLI is not the constraint.)
- The **Anthropic Connectors Directory requires OAuth 2.0** for authenticated services, plus tool annotations, and submission requires a Team/Enterprise Claude org.
- **Smithery URL-publishing requires OAuth** when the server uses auth at all.
- All seven target clients (Claude Code, Claude.ai/Desktop, Cursor, Codex CLI, Windsurf, Continue, Cline) support remote Streamable-HTTP with OAuth.

**Consequences** *(amended 2026-08-02, corrected here 2026-08-03 — the amendment above had not been propagated into this list)*:
- W4 auth scope changes from "API keys + rate limit" to "**OAuth 2.0 (authorization-code) with the CIMD priority chain — pre-registration → Client ID Metadata Documents → DCR only as a legacy fallback — plus API keys for REST/Docker** + rate limit." **DCR (RFC 7591) is deprecated in MCP spec `2026-07-28`; do not build to it as the primary path.** The authorization server advertises `client_id_metadata_document_supported: true`. Cloudflare's **OAuth Provider Library** implements the provider side of OAuth 2.1 and removes a meaningful chunk of W4.
- **An authless free read tier ships alongside** *(added 2026-08-03, `18-` §5.4)*: every winning doc server (Cloudflare, DeepWiki, MS Learn) is unauthenticated on the read path, and auth friction on a free docs surface is an adoption tax. OAuth gates the Anthropic Directory listing and paid tiers, not first contact.
- W7/W8 submission checklist gains: tool annotations (`title` + `readOnlyHint`), a privacy-policy URL (missing = instant rejection), and a Team/Enterprise org for the Anthropic Directory submission (users can still add the server by URL without the listing). The directory has **no latency requirement**; the binding limit is `MAX_MCP_OUTPUT_TOKENS = 25,000`.
- D6's Docker entry is unaffected (API-key headers remain the verified pattern there).

---

### D8: Cloudflare-Native Hosting — No Box *(new, 2026-08-02)*

**Context.** The v1 architecture required an always-on CPU box (€40.99–85.99/mo + ops) for exactly one reason: holding a multi-vector index resident in RAM and running a 149M encoder. Everything else on that box was cheap.

**Decision.** Serve v1 entirely on Cloudflare — Workers + D1 (FTS5 + `WITH RECURSIVE`) + R2 + KV + Vectorize. **$0/mo to start, ~$5/mo at Workers Paid.** Ingest and fine-tuning run on **Daytona credits**, offline, never on the serving path. **Hetzner is deferred, not rejected** — it returns only if the box-reinstatement trigger fires.

**Why it is cheap to do.** `14-` §4.11: the only component requiring the box is the dense arm, and three independent peer-reviewed papers rank it last. **The most expensive part of the stack and the least-evidenced part turned out to be the same part.**

**Rejected alternatives (with numbers).** **AWS** — Free Plan accounts self-close at 6 months; no free full-text search, so `web3.grep` has no home. **Oracle Always Free** — halved 2026-06-15 (4 OCPU/24 GB → 2 OCPU/12 GB) with no announcement. **Daytona 24/7** — $336/mo, ~8× Hetzner; priced for burst. **Azure Cosmos DB free tier** — *not rejected*, documented as the escape hatch: 25 GB + native BM25 + DiskANN + RRF at $0, which beats Cloudflare Paid on capacity; costs are regional latency and a 1000 RU/s cap.

**Consequences.** No late-interaction retriever in v1 (D3). ~~⚠️ The latency SLO is **unvalidated** until W0 measures D1 read latency from a distant edge PoP — the single biggest open risk in the plan.~~ ✅ **MEASURED 2026-08-04 — the risk closed in D8's favour. Worst-vantage p95 = 222 ms replicated; see D13.** ~~Binding capacity constraint is **D1's 500 MB free cap**.~~ **Superseded: the binding cap is the 10 GB paid per-DB limit** (500 MB is free-tier only), **and F18 relocated which database it binds — the core DB, not the lexical index.** Full analysis: **`16-HOSTING-DECISION.md`**.

---

### D9: Layer 0 Disambiguation — Version Becomes a Pre-Filter *(new, 2026-08-02)*

**Context.** Web3's defining property is **coexisting versions** — wagmi v2 ∥ v3, Aave v3 ∥ v4, CCTP v1 → v2, EntryPoint v0.7 ∥ v0.8. CoREB measured **hard-negative intrusion above 55% for every model tested, and 64% for the strongest** — a plausible-but-wrong item outranking the correct one. Stronger retrievers score *worse*, because they surface more same-problem content.

**Decision.** `project` / `version` / `chain` stop being payload and become a **SQL pre-filter applied before search runs**: entity resolution (hash lookup, sub-ms) → version binding (named → hard filter; unnamed → project default, *marked as defaulted*) → SQL predicate. Every returned unit carries `project@version`, `version_defaulted`, `last_validated`.

**Why it is the highest-value change.** It converts a *ranking* problem that every measured model fails into a *filtering* problem that is exact — and it is simultaneously faster (smaller candidate set) and cheaper (fewer wrong chunks). **The only lever that moves all three objective axes in the same direction.**

**Hard rule.** **Never return two versions of the same interface without labelling both.**

**Consequences.** Requires an identifier index in D1 (built at ingest). Mode selection now happens *after* Layer 0, not before it. Spec: **`15-RETRIEVAL-ARCHITECTURE.md` §1**.

---

### D10: Adoption of the SOTA Blueprint *(new, 2026-08-03)*

**Status:** Decided
**Sources:** `17-SOTA-REVIEW-2026-08.md` (independent review; corrections **C33–C44**) · **`18-SOTA-BLUEPRINT-2026-08.md` (the design of record — where 17- and 18- conflict, 18- wins)** · `19-RESEARCH-LEDGER-2026-08.md` (evidence, sources, confidence, open probes).

**Context.** An independent six-stream review plus a nine-stream ground-up re-derivation, both run 2026-08-02, confirmed the spine of the design (deps ≫ BM25 ≥ dense, Layer-0 version pre-filter, complete-unit chunking, intrusion-rate headline) and broke ~10 factual premises underneath it — including one golden rule. Three original first-party measurements came out of it: an incumbent version-confusion audit (**0 of 11 payloads carried any version label**), a dissection of the four winning doc-MCP servers, and a Context7 index probe (**`versions: []` on every web3 library**). The re-derivation converged on the same product from an independent direction, which is itself evidence — but it lands differently in seven places, adopted here.

**Decision.** Adopt the `18-` blueprint. The seven binding changes:

1. **Two D1 databases, not one.** A **core DB** — dependency graph (`WITH RECURSIVE`), identifier index, version predicates, typed tables, recipes, precomputed snippets — that contains **no virtual tables, ever**, and therefore stays exportable; and a **dedicated, disposable lexical DB** holding FTS5. Rationale: three independent 2026 `SQLITE_CORRUPT_VTAB` reports on D1 FTS5, and `wrangler d1 export` **refuses** virtual-table DBs and can brick one (workers-sdk #6305/#9519, both open). **Read replication via the Sessions API from day one** — plain `prepare()` always hits the primary. Binding capacity cap is **10 GB paid**, not the 500 MB free tier.
2. **Dependency closure is a candidate-set filter, never a fused score.** Closure defines the candidate set; BM25 ranks within it. A reachability score is not a similarity distribution, and min-max-normalizing one into a convex combination is uncovered by any evidence — the three-arm CC was outside its own theory (TOIS validates two arms). **Convex combination α≈0.7 applies only between the two similarity arms on the prose path**, with RRF and a **no-fusion** arm measured against it. This supersedes the three-arm reading of **C24**.
3. **The semantic gap closes at ingest, not at query time.** Identifier **dual-tokenization** (verbatim compound retained in a `symbol` column + camelCase/snake subtokens in a separate weighted column) absorbs the measured **+89% recoverable BM25 nDCG** on camelCase-heavy corpora; **doc-only inference-free sparse expansion** on prose (`opensearch-…-doc-v3-gte`, Apache-2.0) closes the prose gap at **zero query-time inference**. Expansion **never enters version predicates** and ships only if it does not raise intrusion.
4. **No compression or pruning model on the hot path — this inverts the previous rule 6** and re-supersedes **C10/C32**. Token wins come from **payload shaping**: ~4,000-token / top-5 budget (8,000 measured *worse*), hard caps on every array, `content_omitted: true` with citations preserved, self-describing cursor, examples-first. No hot-path LLM hops of any kind.
5. **Skill front door + authless free read tier.** The `web3context` Skill (~100 tokens idle) drives the five primitives; the MCP is the version-bound retrieval backend. Registered surface stays terse (**≤600 tokens for all five tools** plus a Tool-Selection-Guide `instructions` block). Authless on the read path; OAuth+CIMD for the directory and paid tiers (**D7**). Never build meta-tools.
6. **turbopuffer is the graduation and reinstatement destination — there is no box.** It has served ColBERT-style multi-vector since 2026-07-29 at a **~$16/mo flat floor**, which breaks the old "no serverless platform hosts late interaction" premise. v1 still has no late-interaction arm — **because no good *code* late-interaction model exists** (every downloadable ColBERT ≤63 MTEB Code), not because of hosting. At ~750 projects the 10 GB D1 cap breaks corpus-wide BM25 and turbopuffer becomes the store. Get beta terms in writing first.
7. **The eval is a weapon.** Headline = **intrusion rate reported with HN-recall** (the bare conditional denominator is self-selecting) **plus tokens-to-task-completion** against the measured **3.3k Context7 bar**, with mandatory **Context7 / plain-web-search / no-tool** baseline arms. Pre-registered and published, it would be the first credible eval in the category. Spec: **`09-EVAL-HARNESS.md`**.

**Consequences.**
- **Golden rules 1, 2, 5, 6, 9, 10, 12 in `CLAUDE.md` are rewritten** by this decision; **D4 is wholly superseded**; **D3's premise is corrected** (no good code model, not no host); **D5's amendment stands**; **D7 gains the CIMD chain and the authless tier**; **D8's "500 MB binding cap" becomes 10 GB**, and its "distant-PoP latency is the biggest open risk" is **largely solved** by the Sessions API — the residual risk moves to **FTS5 corruption**, which is why the lexical DB is disposable.
- **A rebuild-not-restore runbook is mandatory** for the lexical DB (`11-` §6), as is an **ingest circuit breaker** (D1 has no hard billing cap; two documented ~$5k incidents) and **retry/backoff on every D1 call**.
- **Corrections C33–C44 are now in force.** They live in **`17-` §2**, not in this file — see the pointer below.
- The moat thesis, the five primitives, Layer 0, the eval-first build order, the two human blockers, and the vulnerability-module exclusion (**D2**) all survive unchanged.

---

### D11: The `symbol` Column Stores a Canonical Compound, Not a Literal Verbatim String *(new, 2026-08-04)*

**Status:** **Decided and LOCKED 2026-08-04.** Locked *before* any index is built — changing it later is a tokenizer-version bump and a full re-index, never an incremental patch.
**Sources:** `measurements/FINDINGS.md` F1 (first-party, verified against SQLite 3.51.0 on 2026-08-04) · `05-` §3.3 (the DDL) · `05-` §4.2 (dual tokenization) · `20-` §12.

**Context.** `05-` §4.2 requires that the **verbatim compound is always retained** in the `symbol` column — the 8.0-weighted column whose whole purpose is to reward an exact identifier match. `05-` §3.3 pins `tokenize = 'unicode61'`, which treats `_`, `-` and `.` as separators. **Those two statements cannot both hold.** A snake_case, kebab-case or dotted identifier written verbatim into `symbol` is re-split by FTS5 into its pieces, so the compound is never stored as one token at all. camelCase names are unaffected, which is exactly why the defect can survive a Solidity-only corpus and first appear when a Rust, Move or Vyper chunk lands in the index.

**Decision.** `symbol` stores a **separator-free, case-folded canonical compound**; the query side applies the **identical** transform (`canonicalCompound()` in `@web3ctx/tokenizer`). The DDL is unchanged — no `tokenchars`, no FTS5 tokenizer options. `safeTransferFrom`, `safe_transfer_from`, `SAFE-TRANSFER-FROM` and `safe.transfer.from` all collide on the single token `safetransferfrom`, and **that collision is accepted and mildly desirable**: it is cross-notation recall of the same symbol, which a multi-language corpus wants.

**Rationale, for the record.** **True exactness lives in Layer 0's identifier index — a core-DB hash lookup — not in FTS.** The `symbol` column is a *ranking signal*, not an identity oracle; `ident_subtokens` preserves the pieces. Rejecting the alternative (`tokenchars '_-.'`) is a blast-radius judgement: that option changes tokenization for **every** column including `content`, gluing sentence-final punctuation in prose and hyphenated words such that a two-word query stops matching. Paying a prose-path regression to buy an exactness that Layer 0 already provides exactly is the wrong trade.

**Consequences.**
- **`ident-tok-1` is the locked tokenizer version** and embodies this decision. Any change to its behaviour is a version bump **and a full rebuild** — the serving layer refuses to serve a mixed-token index (`05-` §4.2, `11-` §6.3).
- `05-` §3.3 and §4.2 should be read through this decision: "verbatim compound" means **canonical compound**, and the DDL stays as written.
- Applies identically to turbopuffer's `pre_tokenized_array` in bench arm A3 (`20-` §5.1) — the same tokens feed both stores, which is what keeps M1 a fair comparison.
- Layer 0's identifier index carries the exactness guarantee. If a future requirement needs notation-preserving separation at the FTS layer, it is a new tokenizer version and a re-index, decided deliberately — not a patch.

---

### D12: turbopuffer Is Deferred, Not Rejected — and the Escape Keys on Latency Alone *(new, 2026-08-04)*

**Status:** **Decided 2026-08-04** (owner budget ruling). Reverses **D-W0-2** in `20-` §1. The escape rule below is **pre-registered — written before M1 runs**, and is edited only before a run, never after.
**Sources:** `measurements/FINDINGS.md` F12 · `measurements/M2-LEXICAL-RESULT.md` · `18-` §2.1–2.2 · golden rules 1 and 5 · `20-` §1, §5.1, §5.5.

**Context.** `18-` §2.2 justified turbopuffer graduation on **capacity**: *"at ~750 projects the 10 GB D1 cap breaks corpus-wide BM25."* Measured on 139,251 real units, the contentless lexical index is **552 B/unit** — **~3.2 GB at ~750 projects, roughly a third of the cap** (F12). The capacity trigger does not survive.

**Decision.** **Workers Paid ($5/mo) is approved** — it is the architecture's own cost, since the 10 GB/DB and 50M writes/month the two-D1 layout assumes are Paid-tier figures, not Free. **The turbopuffer $16/mo floor is deferred.** M1 ships **D1-only**, with the missing arm stated in the result document, and the $16 is spent only if the pre-registered escape fires.

**Rationale — and the part that is easy to get wrong.** ⚠️ **F12 does not, by itself, license this.** F12 killed the *capacity* argument and is silent on latency and cost-per-query, which are exactly what M1 and M3 measure. The deferral is licensed by **golden rule 5**: latency is an **SLO, not a headline**, the competitive axes are tokens and calls per completed task, and `19-` §5's agent traces put sub-second tool calls at **≈1% of task wall-clock**. Against a genuine threshold, a **one-armed threshold test is the correct test**; beating 500 ms by 10× buys nothing. Stated cleanly: *F12 removed the forcing function; golden rule 5 makes a threshold test sufficient.*

**The escape rule keys on latency alone.** The ruling as issued also named *"rows-read cost blowing past M3's budget."* That half is **struck**, because it cannot do what it was meant to do:

- **A `deps` blowout cannot be fixed by paying turbopuffer, because `deps` does not move.** The recursive closure lives in the **core** D1 under every configuration; turbopuffer is a candidate for the **lexical/BM25 arm only** (`18-` §2.1). As worded, the trigger could authorise a spend on a problem the spend cannot touch. A pathological `deps` scan is a **row-budget bug** — the documented $134 incident class — not a store to switch.
- **The cost half is nearly inert at this volume.** Workers Paid includes **25 billion rows read/month**: at 1M queries/month that is **25,000 rows read per query** before a cent is billed. What rows-read actually drives at our scale is latency, already measured directly.

M3 keeps its real job: sizing the `11-` §2 per-key rate limits and the `deps` CTE row budget. **It does not choose the store.**

**Consequences.**
- **Bench arms A3/A4 become conditional** (`20-` §5.1); the M1 decision rule is restated for a one-armed run (`20-` §5.5) and now branches to *procuring* A3, not to comparing it.
- **A new $0 arm, A0, replaces the lost comparison with a bound**: the identical query set against the local `lexical.sqlite`, giving the **algorithmic floor**. `A1 − A0` is D1's platform overhead — the only component a different store could recover. If A1 ≈ A0 the deferral is permanently correct rather than provisional.
- **The CodeRetriever seam is untouched.** Deferral is a spending decision, not an architecture one — the seam's whole purpose is to keep this reversible, and F12 explicitly left the capability argument (`pre_tokenized_array`, 16-way atomic multi-query, the late-interaction landing zone) standing.
- **The late-interaction private-beta terms request survives at $0** and remains a standing **pre-W7** checklist item: pricing (read **and** write), limits, and the 2-vector-column cap, **in writing**.
- **The escape costs ~1–2 days, not a week** — the corpus is store-agnostic NDJSON and the protocol already exists — and it does **not** wait on beta access, which concerns late interaction (v1.1), not BM25.
- **Sessions-API replication is load-bearing for the escape too.** A turbopuffer-pinned Worker still reads the graph from a nearby core-D1 replica; without replication the two-store split would pay cross-region RTT on every `deps` call.
- **Supabase / Postgres is rejected** for both roles (`20-` §1, D-W0-6): `ts_rank_cd` is cover-density, not Okapi BM25 (no k₁/b, no IDF saturation); Postgres offers **four** weight labels against our **five** weighted columns; it is regional; `pgvector` is single-vector so late interaction is unaddressed; and a Postgres instance **does not scale to zero**, which is the objection that retired the Hetzner box under golden rule 1.

---

### C45–C48 — upstream corrections from recipe authoring *(2026-08-08)*

Found in `~/web3ctx-recipes` while authoring recipe #11 against live canonical sources, and applied
here as **dated corrections, D14's shape: stated, not absorbed.** The recipes repo does not edit this
one; it files findings with file, line and replacement text. Source: `~/web3ctx-recipes/FINDINGS.md`
F1–F4.

⚠ **Three of the four were caught by a tool, not by review** — the recipe attestation gate, which is
the same instrument F51 forced into existence here. The verification loop now runs **between repos**,
which is a third direction after downward (harvest) and upward (curator, then a ruling — D18).

---

**C45 · The flagship `depositForBurn` example is a FABRICATION, not a version disagreement.**

The framing was *"two real signatures, one served without its version label"* — the version-blindness
thesis, and the wrong diagnosis. `bytes32 hookData` at position 5 is **not a signature of anything**:
it is `depositForBurnWithHook`'s parameter *name* from position 8 carrying `depositForBurn`'s *type*
from position 5.

Checked across versions, because *"at no version"* is a claim about versions: canonical
`TokenMessengerV2` has `bytes32 destinationCaller` at position 5 in **both** functions at
`release-2025-01-24T162104`, `-2025-03-07T183551`, `-2025-06-24T212932`, `-2025-10-01T154348` and
`master@a92a2b4e` (2026-06-18). v1's `depositForBurn` takes **four** parameters — there is no position
5 — and the string `hookData` appears **0 times** in the v1 contract.

> **The example gets stronger and changes class.** Old reading: a stale label, recoverable, because
> the right answer exists somewhere. True reading: a serving layer emitted a signature that **has
> never existed in any release of either major**. There is no version at which the consumer is right.

⚠ **It can no longer carry the version-blindness stake**, which now rests on the measurements that
genuinely are version-blindness: `0 of 11 payloads carried a version label`; `@metamask/sdk` served
where `@metamask/connect-evm` is correct; Circle's own layer stripping the `/cctp/v1/` distinction it
authors. Amended in `01-` · `06-` · `18-` · `19-` · the playbook · **`overview-v3-2026-08.html` (the
live deck)** · `tweet-cards-2026-08.html` (where the graphic *is* the claim).

⚠ **`19-` was amended IN PLACE and the measurement kept.** The probe result is real; the
interpretation was wrong. Deleting the datum would destroy evidence to fix a reading.

⚠ **`artifacts/attestation-cache/7f47b1468ef39e9a.json` was NOT edited.** It caches fetched source
bytes; that it holds the fused signature is evidence of what a source served and must stay verbatim.

---

**C46 · `TokenMessengerWithFees` is in a different repo, and the old wording was wrong three ways.**

It does **not exist** in `circlefin/evm-cctp-contracts` — that tree at `master@a92a2b4e` has 191
entries and not one path containing `Fee`. It lives in
**`circlefin/sponsored-cctp-extension-contracts`**. There is no *"bare"* core call to contrast with:
core v2 `depositForBurn` already takes `uint256 maxFee`. And the entry point is
**`depositForBurnWithFees`**, taking `IFeeManager.QuoteClaim calldata claim`.

The sponsored extension is a **separate deployment — own repo, own addresses, own entry point** — so
the recipe names and links it rather than absorbing it. Merging would be *the never-merge rule broken
in a new dimension.* Also: that repo's **tags lag `master`** by eight months, so recipes pin the
**commit**.

---

**C47 · The fast path is fee-gated, and there are TWO gates on two contracts in two repos.**

The warning was right; the mechanism was wrong. Core v2's fast route is gated by **`maxFee`, a
ceiling** — not by a signed quote, which belongs to the sponsored extension. **A core-v2 recipe
cannot show a quote flow, because `depositForBurn` has no quote parameter.**

Measured 2026-08-08, burn `0xdba9da61…a0f74`, Base Sepolia → Arbitrum Sepolia, `maxFee: 0`:
`status: pending_confirmations`, `delayReason: insufficient_fee`, for tens of minutes until hard
finality. Two poller traps ride along: `delayReason` **persists after `complete`**, and while pending
`attestation` is the literal string `"PENDING"` with `message` empty.

---

**C48 · All three harvest quotes failed byte-exactness against their own sources.**

`artifacts/recipe-notes-from-harvest.json` states the rule it broke: *"a paraphrased 'common mistake'
is an assertion wearing a citation."* One was **truncated**, one had **markdown stripped**, and one
was **welded** — an issue title fused to a paraphrase of the body, which is **F51's own named failure
mode committed in the file that forbids it**.

> Every one was faithful in *substance*. **That is exactly what makes them dangerous:** a reviewer
> reading the harvest against the source would nod along. Only a byte comparison catches it.

All three re-quoted byte-exact and **verified against `artifacts/attestation-cache/`**. The bad quotes
are **retained** under `superseded_quote` — deleting them lets the next harvest regenerate them.

⚠ **A substantive rider:** `minFinalityThreshold` values are *not* undocumented —
`src/v2/FinalityThresholds.sol` names 2000 / 1000 / 500. The residual true claim is the absence of
**per-chain** guidance.

⚠ **Found here, not upstream:** `notes[3]`'s wagmi `getProvider` entry claims a v2→v3 change. **F51
measured it under `## 0.4.0`** — overstated by three majors. Flagged in place.

---

### C49–C50 — upstream corrections from recipe #20 *(2026-08-08)*

Source: `~/web3ctx-recipes/FINDINGS.md` **F5**, found authoring the `aave-v3` recipe. Same contract as
C45–C48: the recipes repo files findings with file, line and replacement text; this repo applies them
as dated corrections.

⚠ **Both were re-verified first-party here before being written down** — npm registry documents and
the two GitHub repos, fetched 2026-08-08 — and that re-check changed one clause. **A correction is not
exempt from the standard it enforces.**

---

**C49 · Two Aave SDK repos publish the SAME npm names, and `latest` splits across majors inside one
scope.**

The playbook said *"`aave/aave-v4-sdk` exists — use it as the canonical source when authoring the v4
counterpart."* True, and **incomplete in the one direction that bites**: `aave/aave-sdk` is **V3**,
`aave/aave-v4-sdk` is **V4**, and **both ship `@aave/client`, `@aave/core`, `@aave/react` and
`@aave/graphql`**. No major appears in any name.

The semver line is the only in-name discriminator and it is **not aligned across the scope**
(measured 2026-08-08 — `@aave/react` V4 `6.3.0` vs V3 `0.10.0`; `@aave/core` V4 `1.1.0` vs V3
`0.1.1`, whose `latest` is still the **V3** one). So an unpinned install of the four resolves to
**three V4 packages and one V3 package** — one command, one vendor, two protocol majors. The V4
repo's README additionally instructs cloning the **V3** repo, and both READMEs are titled
`# Aave SDK`.

> ⭐ **This is a first-party, measured instance of the exact market failure the product exists to fix,
> and it is stronger evidence than the `@metamask/sdk` case in `19-` §2.** There, a *third party*
> served the wrong package name. Here **the vendor publishes the ambiguity into the registry**, and
> `latest` contradicts itself across two packages in one scope.

⚠ **The rider that came out of re-verification.** The upstream finding said the two lines carry
*"byte-identical package descriptions"* — that holds for **3 of 4** (`@aave/core`, `@aave/react`,
`@aave/graphql`) and **fails for `@aave/client`** (V3 *"official JavaScript client for the Aave API"*
vs V4 *"official TypeScript client for the AaveKit API"*). And the registry is **not** silent: every
published version carries `repository.url`, which does discriminate. **Restated precisely:** the
disambiguating evidence exists **per version** and is invisible to the two things everyone uses —
**the package name and `latest`.** That is a serving-layer failure, which is a sharper statement of
our thesis than "the registry has no answer", not a weaker one.

---

**C50 · The flagship version-disambiguation demo is v3-vs-v3, not v3-vs-v4.**

C18 below records the coexistence fact correctly and then draws the wrong showcase from it. **v4 has
no `Pool` at all** — it is hub-and-spoke — so v3-vs-v4 is a *different-architecture* story with
nothing to confuse, which makes it a poor demonstration of version-blindness.

The sharp case is **inside v3**, measured on-chain 2026-08-08: two Aave **V3** pools on Ethereum
mainnet, probed seconds apart with the identical call, return structurally different revert
encodings — Core (`POOL_REVISION` **11**) a 4-byte custom error `0x17c5a78e`; **Horizon**
(`POOL_REVISION` **7**) an `Error(string)` carrying `"33"`. The `Errors` library flipped from string
codes to custom errors at **v3.4.0** and both sides of that boundary are live on the same chain.
Four V3 pools run on Ethereum (Core, Lido, EtherFi at 11; Horizon at 7).

> **"The Aave V3 Pool on Ethereum" does not identify a contract, a version, or an error surface.**
> Same name, same chain, same major, incompatible behaviour, no label anywhere in the payload.

Revision→tag mapping read from `PoolInstance.sol` at each pinned tag in `aave-dao/aave-v3-origin`
(v3.2.0→5, v3.3.0→7, v3.4.0→8, v3.5.0→9, v3.6.0→10, v3.7.0→11), never inferred from a release
number. Amended in the playbook (worklist row 20 **and** addendum #20); C18's showcase clause is
annotated in Part 2 rather than rewritten.

---

### C51–C52 — upstream corrections from recipe #3 *(2026-08-11)*

Source: `~/web3ctx-recipes/FINDINGS.md` **F6**, found harvesting the first **artifact-sourced** recipe.
Both are corrections of an **assumption a spec stated as a universal** — the hardest kind to notice,
because nothing in the doc looks wrong until a case arrives that the universal excludes.

---

**C51 · Provenance assumed repo + commit, so every closed-source SDK looked *unsourceable*.**

`05-` said `source_url` was a *"GitHub permalink or docs URL"*, ingest cloned, and the Stage-A/B
filter keyed on a `repo` column. Under that assumption a package that ships no usable repo has no
route into the corpus at all.

> **What makes a source citable is that it is immutable and re-fetchable — not that it is a repo.**
> A published `@scope/pkg@1.2.3` is pinned exactly as hard as a commit SHA. **For a consumer-facing
> SDK the shipped artifact is arguably the better source**: it is what developers install and run,
> where a repo is only what upstream intended to publish.

Measured 2026-08-11: `@privy-io/react-auth` is closed-source — the `privy-io` org has **36 public
repos** (Ruby/Node/Go/Rust/Unity server SDKs, iOS binaries, examples) and **none is the React SDK**;
every Privy npm package **omits the `repository` field**. The artifact ships ~171 KB of complete type
declarations at an immutable per-version URL, beside the immutable per-version registry manifest.

**Applied as `provenance_kind: 'repo' | 'artifact' | 'docs' | 'chain'` + `pin_ref`**, both REQUIRED on
every unit (`05-` §1.1, §1.1a), with the ingest rule in §4.1 and two blocking manifest checks in §5.2.
⚠ **The schema change enumerates its checkers** (`05-` §1.1a) — F30/F40, F37 and F46 are one fault in
three places, and each kept returning a confident number afterwards. **None of those checkers exists
yet**; `artifact` ingest lands in W2 and must not be reported as working before they do.

⚠ **`artifact` tightens the pin, it does not relax it.** `latest` is a **mutable** dist-tag — C49
measured it splitting across two protocol majors inside one npm scope — so a dist-tag in `pin_ref` is
a validation failure. A citation that re-resolves cannot be rechecked, which is the whole point of
having one.

⚠ **Generalise the mechanism, not the exception.** This is a *kind*, not a privy carve-out: every
closed-source client SDK the universe covers inherits it, and a per-project special case would have to
be re-invented — and re-risked — for each one.

**Consequence for `privy`'s Stage B row:** its exit condition was *"rejoins by amendment if a canonical
public repo is confirmed"* — now measured **unreachable**. It is restated as artifact-sourced with a
**reachable** condition (the W2 artifact path). ⭐ **A row waiting on an impossible condition is
indistinguishable from a row nobody has looked at**, which is why this is a correction and not
bookkeeping. **No ingest behaviour changes here** — privy stays un-ingested until W2 builds the path;
only the stated reason and exit condition change.

---

**C52 · The mandatory upstream link assumed a public tracker exists.**

`05-` §2.2 requires *"a real URL or issue link"* on every `common_mistakes` entry, and `11-` §7's
triage path assumes an upstream issue can be filed against. **A closed-source SDK has neither** — the
declared bug channel may be a private support Slack: unreadable, uncheckable, useless to a future
reader. That leaves a real, fully-evidenced failure with nowhere to point.

**Ruled: the requirement DEGRADES rather than being waived** — to a dated first-party observation
record (`11-` §7.1) carrying the observer and environment, the error text with **every surface
labelled `attested` or `observation-only`**, an attested version table across published channels, and
the vendor's channel **named and marked uncitable**.

> **The rationale is the link's *purpose*, not its form.** A link exists so a future reader can check
> whether the failure was real and whether it is fixed. A private Slack fails that as badly as no link;
> a first-party record over pinned artifacts passes it. **A weaker-but-checkable record beats a
> stronger-looking uncheckable one.**

🔴 **The rule has NO worked example, deliberately.** The case that produced it **dissolved** — a
diagnostic showed the failure was a *recipe defect*, not external, and the verdict was withdrawn.
**The rule stands on its shape, not that precedent; privy is not its example.** Recorded loudly
because a rule that quietly keeps a dead example is how a withdrawn finding gets laundered back into
evidence — and the next closed-source SDK will be its first real use.

⚠ **Scoped so it cannot become the easy route:** it applies only when `provenance_kind` is `artifact`
**and** no public tracker exists — both checked, both recorded. An open-source project with an
inconvenient tracker still gets a link, and the degraded path is *harder* to satisfy than pasting a
URL.

---

### C53–C57 — upstream corrections from recipes #5, #12, #13, #18 *(2026-08-12)*

Source: `~/web3ctx-recipes/FINDINGS.md` **F7** and **F8**, from the eleven-recipe batch (tree
`1b7f9ef`). **F6 needs no action — it was already applied as C51/C52** (`6755bf8`); the upstream row
is still marked OPEN and can close against that commit.

⚠ **Four of the five are worklist rows that named the wrong target.** That is not a documentation
nit: the worklist is what a curator authors *from*, so a wrong row does not produce a wrong sentence,
it produces a **wrong recipe** — and recipes are the moat.

---

**C53 · Worklist #5 (`dynamic`) drifted on its URL and was silent on a two-line split.**

`docs.dynamic.xyz` 301-redirects, and the row named no SDK line at all while **two** ship: `@dynamic-labs/sdk-react-core` **5.2.0** and `@dynamic-labs-sdk/react-hooks` **1.26.0**, in two npm scopes.

> ⚠ **The higher-numbered package is the one the vendor's own quickstart calls "legacy", and it carries no `deprecated` marker.** A maintained **v4 LTS** runs beside v5 and **`latest` is not the newest publish** — 5.2.0 (2026-08-06) vs 4.96.1 (2026-08-10) under `v4-lts`. Sort by date, get a v4; read `latest`, get a v5.

This satisfies the standing *"coexisting majors are the product"* rule **in a form the rule did not anticipate**: not coexisting majors but **coexisting product lines under one publisher**, numbers running backwards, the only deprecation signal being prose on a mutable docs page. Also recorded: `@dynamic-labs/wagmi-connector@5.2.0` peers `wagmi ^2.14.11` while the docs claim v3.1.0+ compatibility — **both wagmi@3.7.6 and wagmi@3.1.0, the exact version the docs name, fail `ERESOLVE`.**

---

**C54 · A pin must be RE-FETCHABLE, not merely immutable. `gitHead` is never a `pin_ref`.**

C51 anticipated an artifact with **no** repo. It did not anticipate an artifact publishing a **repo pin that resolves to nothing**: npm writes `gitHead` into every published version document, so `@dynamic-labs/sdk-react-core@5.2.0` ships `gitHead: c053c3cf…` while declaring no `repository` — and the `dynamic-labs` GitHub org reports **`public_repos: 0`**. There is no tree in which that SHA can be looked up.

> ⭐ **It is worse than the failure rule 10 forbids, and it passes rule 10's stated test.** A mutable ref fails because it re-resolves. This ref is **immutable and still unresolvable**. **The load-bearing property was never immutability — it is re-fetchability**, which `05-` §1.1a already named and `gitHead` silently fails.

The danger is mechanical, not theoretical: `gitHead` is exactly `pin_ref`'s shape, so an ingest scanning manifests for something to pin **will find it and take it**, emitting a unit whose `provenance_kind` reads `repo` and whose citation nobody can check — **the forbidden thing arriving through the field meant to prevent it.** Applied at `05-` §1.1a (plus two checker rows), `CLAUDE.md` rule 10, and `11-` §7.1.

⚠ **`11-` §7.1 gained a second grade.** privy declares a **private** channel — uncitable, but stated. Dynamic declares **nothing**. Both degrade to a first-party observation record; **the record must name which grade**, because *"we could not cite the tracker"* and *"there is no tracker"* are different facts about a vendor. ⭐ This is also the **first real use** of the C52 rule, whose original example dissolved.

---

**C55 · Worklist #18 (`uniswap-v3`): `SwapRouter.exactInputSingle` identifies two incompatible functions.**

Two live mainnet routers, both Uniswap **v3**, both exposing `exactInputSingle`, taking **different structs with different selectors**: `SwapRouter` (`0xE592…1564`) 8 fields **with `deadline`**, `0x414bf389`; `SwapRouter02` (`0x68b3…Fc45`) 7 fields **without**, `0x04e45aaf`. **Measured against deployed bytecode: each address contains its own selector and not the other's** — calldata for one reaches no function at all on the other.

> ⭐ **This is C50's Aave v3-vs-v3 case reproduced in a second protocol.** Same protocol, same major, same function name, two live deployments, incompatible surfaces, no label anywhere. **One instance was an Aave quirk; two make it a pattern** — and it is the pattern this product exists to serve.

Pinned: **`SwapRouter02`**, with `SwapRouter` documented as the coexisting trap. ⚠ **02 moved deadline protection into `multicall(uint256 deadline, bytes[])`**, so a swap not wrapped in multicall has **no deadline at all**, silently — a safety regression wearing the look of a simplification. ⚠ **`Uniswap/swap-router-contracts` is archived** and holds the *more*-used contract, so *"prefer the maintained repo"* picks the wrong one — **the C49 shape again**.

---

**C56 · Worklist #13 (`across`): the newer entry point is the one WITHOUT the version suffix.**

`SpokePool.deposit(bytes32,…)` (`0xad5425c6`) and `SpokePool.depositV3(address,…)` (`0x7b939232`) have **identical arity, parameter names and order**, differing only in five parameter *types*. Both selectors are present in the deployed implementation behind the Ethereum SpokePool proxy, and **`depositV3` carries no deprecation marker.**

> **The naming is the trap.** *"`depositV3` is the V3 function, and V3 is current"* is a reasonable inference and a wrong one. Pinned: **`deposit`**; `depositV3` documented as coexisting, never merged.

⚠ `V5SpokePoolInterface.sol` is **fill-side** and contains no depositor entry point — stated so the row is not later "corrected" toward a V5 deposit function that does not exist.

---

**C57 · Worklist #12 (`permit2`): the `recipe_type` oversells the first step.**

`gasless-approval` is **not gasless at the start** — a real, gas-paying `approve(PERMIT2, …)` is required once per token per owner, because Permit2 pulls funds with the token's own `transferFrom`. Only *subsequent* authorisations are gasless. A reader taking the type name literally budgets zero transactions and is wrong on the first one.

⚠ **The signed message carries a field the struct does not:** `PermitTransferFrom` is `{permitted, nonce, deadline}` — **no spender** — while the EIP-712 type actually signed includes `address spender`, filled from `msg.sender`, *the contract that calls* `permitTransferFrom`. Nothing in the struct or the signature says so.

⚠ **One address, three bytecodes:** Permit2 is at the same deterministic address on every chain and its runtime code is **not identical** — same 9,152-byte length, three hashes, three `DOMAIN_SEPARATOR`s. A signature is chain-scoped by construction.

---

### Pending schema absorption — `version_discriminator` *(ruled upstream 2026-08-08)*

**Not a correction and not yet in `05-`.** The recipes repo ruled `version_discriminator` **APPROVED
as schema** (`~/web3ctx-recipes/SCHEMA-DEPARTURES.md` §5); this repo owns `05-DATA-MODEL.md` §2 and
absorbs it on its own schedule. Recorded in `05-` §2.4 as a pending amendment, **flagged as
not-yet-absorbed** — a field the docs describe but the schema does not carry is the gap that makes
specs lie. Three conditions ride with the ruling: the value is **measured**, never asserted; recorded
**per (project × version)**; **optional**, with absence *stated* rather than filled.

---

### D19: Under a Candidate-Set Union There Is No Privileged Member *(new, 2026-08-07)*

**Law.** When entity resolution produces a candidate **set**, no attribute of one member may be
inherited by the set. **Every candidate agrees, or nothing binds.**

**Ruled 2026-08-07**, on F55 shape #4's one implementation failure.

**How it presented.** Scope resolved to `[across, cctp]`. The version-bearing-identifier rule took
the *first* project's binding — `across` holds only `latest` — and applied `version = latest` to the
whole scope, **excluding both CCTP ids**: the correct answer removed by an inference about a
different project. `depositForBurn` exists at `cctp@v1` *and* `cctp@v2`, so CCTP binds nothing; the
set does not agree; nothing binds; both graded ids survive.

⚠ **The generalisation is what makes this a decision rather than a bug report.** A union has no
privileged member *by construction* — the moment one exists, the union has silently become a
precedence rule, which is the design D18 records as refuted. Version is simply the first attribute
this bit; `chain`, `language`, `pragma` and any future scoping dimension are the same shape.

**The safe form is always the conservative one:** disagreement produces *no* binding, never a
majority vote and never a first-match. Abstaining from an attribute costs retrieval breadth;
inheriting one wrongly costs the correct answer, before search, where no ranking can recover it.

---

### D18: A Grammar Fact Is Not a Semantic Claim — and the Verification Loop Runs Upward *(new, 2026-08-07)*

**Decision, two halves, one ruling.**

**(a) A grammar fact is not a semantic claim.** `container` and `member` are node types read off a
pinned grammar. They say what the parser saw; they do **not** say which is the stronger identity
claim. F55's kind-tiering assumed they were the same thing, and the bytes refuted it: **one Rust
declaration classified as a `container` outranked three genuine Solidity `member` declarations,
including both correct ones**, because a tier that answers outright can never widen.

The general form: **a syntactic classification may be used as evidence and must not be used as a
gate.** `level`, `scope`, `inherits` and any future node-derived label are the same temptation.

**(b) The verification loop runs upward, and both times it did, the finding held.**

| ran against | outcome |
|---|---|
| the harvest layer | F51 — 0 of 23 rows survived the gate |
| the **curator's review** | row #7 refused on the bytes; **conceded** |
| the **owner's ruling** (kind-tiering) | shape #2 failed E1/E2; **conceded**, *"the tiering ruling was mine and the bytes refuted it"* |

⚠ **A process that only ever corrects downward has exactly one unexamined node, and it is the one
with the authority to overrule.** Recording the two upward corrections is what makes the eval's
verdicts worth anything to a reader who was not in the room — more than any single measured number.

⚠ **The norm that makes it work is the refusal-WITH-EVIDENCE**, not the refusal. Both concessions
followed a disagreement stated with the bytes attached and the prediction registered beforehand.

---

### D16: No Artifact May Contain a Literal Statistic *(new, 2026-08-06)*

**Decision:** every number in a generated artifact is **reproduced from data at render time**. No count, rate or denominator is typed into a document. Enforced by `tools/verify-artifacts.ts`, which re-runs every generator and fails if any artifact is not byte-identical.

**Ruled:** *"Standing rule from `present-slice.ts`: no artifact may contain a literal statistic — every number reproduced from data at render time. **That closes the 17-vs-20 class permanently.**"*

**Why a rule and not a habit.** The refused hard-negative sheet stated three counts its own contents contradicted — 17 NO-SOURCE symbols against a file holding 20, "6 rows" for a count of 6 *phrasings* on 8 rows, and a denominator of 68 for a 23-row set. None was a careless subtraction. **The class of error is "a number and the thing it describes were allowed to live in different files."** A derived `20` and a typed `17` are indistinguishable on the page, which is why a lint for digits cannot close this and regeneration can.

⚠ **Enforcement is by regeneration precisely because a prose rule would be the failure it forbids.** It also catches the subtler case: an artifact correct when written that drifted when its source data changed underneath it.

---

### D17: No Gate Verdict Below the Minimum n *(new, 2026-08-06)*

**Decision:** no launch-gate verdict — Track A or Track B — may be issued below the eligible-n at which the gate's MDE ≤ 10pp. Below it, `verdictIssued` is `false`, the run prints **⊘ NO VERDICT**, and results are **descriptive only**. `packages/eval/src/power.ts` · `minimumN()`.

**Ruled**, as a condition of locking `hard-negative` v1.0 at three rows: *"Pre-register NOW, before any new row exists: the minimum-n rule for gate verdicts… **The rule's shape is registered today; the number is derived mechanically, not chosen.**"*

**The number is derived**, at the variance-maximising baseline `p = 0.5` — the only baseline that can never *understate* the required n. Using the gate's own 25% threshold would give a smaller, flattering number for exactly the runs closest to the line.

⚠ **When `verdictIssued` is false, `passed` carries no meaning.** Same shape as F50: an outcome whose correct form is *"the question cannot be answered here"* needs its own vocabulary rather than being forced onto the pass/fail axis. The rule refuses a **flattering** run as readily as a poor one — it is about the sample, not the result.

⚠ **Immediate consequence, stated rather than discovered later:** the n=68 Track-B **PASS** recorded in F50 is **below this floor**. It stays in the record as issued under the rules then in force; under D17 it is not re-issuable, and no run may quote it as a verdict.

---

### D15: Solidity Vocabulary Must Never Label Another Language in a Payload *(new, 2026-08-06)*

**Ruled by the owner 2026-08-06**, approving the `declarations` / `contracts[]` split **permanently**:

> *"Keeping `declarations` separate from `contracts[]` is approved permanently — **Solidity vocabulary must never label TypeScript in a payload**."*

#### The case

F49 needed TypeScript and Rust units to be addressable by the names they declare, so that Layer 0 could resolve a symbol to a unit outside Solidity. The cheapest implementation was to reuse `units.contracts[]`, which both loaders already read to build the identifier index — **zero schema change, zero loader change.**

It was rejected. `contracts` is Solidity's word, and it is **surfaced in payloads**. A TypeScript `class Connector` or a Rust `struct Config` arriving at an agent under a field called `contracts` is a wrong word attached to a right answer, and the agent has no way to tell that the field name is ours rather than the language's.

#### The rule

**A field name that carries one ecosystem's vocabulary may not be reused to describe another's, however convenient the plumbing.** `IngestUnit.declarations` was added instead; it never reaches a `units` column, and the loaders read it only to build the identifier index. `contracts[]` stays Solidity-only and Solidity's 3,799 tokens are byte-identical after the change.

#### Why it is a standing decision and not a style note

**This product's entire claim is that it labels things correctly.** `18-` §0's measured market failure is that 0 of 11 incumbent payloads carried a version label — we exist because other people's serving layers describe things wrongly. A payload that calls a Rust struct a "contract" is a smaller instance of exactly that fault, committed by us, in a field the agent is expected to trust.

⚠️ **The convenience argued for the reuse, and convenience is the whole reason to write this down.** The alternative cost one new field and two one-line loader changes. It will be tempting again the next time a Solidity-shaped column is nearly right for another language — `inherits`, `pragma_str`, `selector4` are all waiting.

---

### D14: An Invariant Outranks the Wording of the Instruction That Names It *(new, 2026-08-06)*

**Ruled by the owner 2026-08-06**, retroactively approving a departure taken during F40:

> *"Following my wording literally would have recreated F32, so you followed the binding condition and stated the departure openly instead of silently complying or silently deviating. Correct precedence: **the invariant outranks my phrasing**."*

#### The case that produced it

The F40 work order said two things that turned out to conflict:

| | |
|---|---|
| **mechanism** | *"The generic path needs a `__file__` unit to exist as an edge root."* |
| **condition** | *"Whatever unit roots the generic-code edges must obey — **a unit's body is a real slice of the lines it cites**."* |

Measured against the corpus, the generic path's units **already contain their file's import statements** — cAST's merge phase combines an `import_statement` with the code that follows it, so every TypeScript file's first span begins at line 0 and carries the imports verbatim. Creating a `__file__` unit over those bytes would have put them in the corpus twice: **F32 exactly, the finding the condition is named after.**

The mechanism could not be executed without violating the condition attached to it.

#### The rule

**When an instruction's stated mechanism cannot be carried out without breaking the invariant the same instruction names, the invariant wins — and the departure is stated, not absorbed.**

Three obligations, and the third is what makes this a rule rather than a licence:

1. **Satisfy the invariant.** Here: an edge is rooted at the unit whose body already contains the syntax that produced it — no unit created on the generic path, so nothing can duplicate.
2. **Say so, in the deliverable and in the record.** `F40-SOURCE-GATE-RESULT.md` §3a and F40's own entry both carry the conflict, the measurement that established it, and the resolution.
3. **Bring the evidence, not the argument.** The departure was justified by *"here are the corpus rows showing the imports are already inside units"*, not by *"a `__file__` unit seems redundant."* An unmeasured departure is a preference.

#### Why it needs to be written down

**The two failure modes it forbids are opposites, and both look like diligence.** Silent compliance — building the `__file__` unit because it was asked for — would have reopened a closed finding while appearing obedient. Silent deviation — quietly doing something else and reporting success — would have been correct code with a falsified record, which is worse, because the next person inherits a decision nobody can audit.

⚠️ **This does not license reinterpreting scope.** The invariant that wins must be one the instruction *itself* names or one already standing in this file. "I thought something else was more important" is not this rule.

---

### D13: D1 Is the Lexical Home — Measured, Not Assumed *(new, 2026-08-05)*

**Status:** **DECIDED 2026-08-05 by the owner, on W0's measurement.** Closes W0.
**Sources:** `measurements/M1-RESULT.md` · `M1-PROTOCOL.md` §5.5 (pre-registered) · `20-` §14 · `measurements/M3-RESULT.md` · F18 · F20 · F21 · F22.

**Decision.** The lexical index lives in **D1 FTS5**. **A3/A4 (turbopuffer) are never procured for the lexical role.** The `18-` §2.3 bake-off is retired as **unfired**.

**The number, against a rule written before it existed.** `M1-PROTOCOL.md` §5.5 pre-registered `P95 ≤ 250 ms → D1 is the lexical home`. Measured on the **replicated Sessions-API path**, real 139,274-unit index, 4 vantages, 200 pooled samples each:

| vantage | A1 p50 | **A1 p95** | A2 p95 *(primary — what `prepare()` ships)* |
|---|---|---|---|
| `weur` / LHR | 45 | **73** | **2,315** |
| `oc` / AKL | 83 | **100** | — |
| `wnam` / DFW | 113 | **143** | **2,522** |
| `apac` / SIN ⚠️ *(Worker's own colo)* | 205 | **222** | — |

**Worst vantage 222 ms → top band.** 143 ms excluding the vantage that violates the protocol's own colo exclusion; **the verdict does not turn on that judgement call**, which is why it is reported rather than dropped.

**Why this is a decision and not just a number.**
- **`A1 − A0` is the whole argument.** Local SQLite runs the identical FTS5 step on the identical index in **~1 ms p50 / ~10 ms p95**, against a *fastest*-vantage full path of 45 ms. **Execution is a rounding error; the figure is network and platform.** A faster store recovers almost nothing — so this is not "D1 was good enough," it is "the store was never the lever."
- **Replication is load-bearing, quantified: 19–22×.** Primary-only p95 is **2,315–2,522 ms** — the naive path misses the 500 ms SLO by 5×. Golden rule 1's *"plain `prepare()` always hits the primary"* is the difference between working and not.
- **It was a threshold test, not a race** (golden rule 5, D12). Against a genuine threshold, beating it by 10× buys nothing, which is what licensed measuring one arm.

**Consequences.**
- **W1 proceeds on D1.** The two-D1 architecture (golden rule 1) survives its largest open risk.
- **D12's escape did not fire.** turbopuffer stays deferred, and the **LI beta-terms request stays live at $0** — the CodeRetriever seam's reversibility depends on those terms being *obtainable*, not on turbopuffer being bought.
- **The graduation trigger is not latency and not the lexical index.** F18: the **core** DB is the one with a path to the 10 GB cap, and **turbopuffer cannot relieve it** — a vector store does not host a dependency graph.
- **Reads are cheap; writes are tight.** `search` costs 4,418 rows p50 / 41,504 p95 (~2.24 M searches/month included), while a full core rebuild is **22% of the monthly write allowance** (F20). For a read-serving product that is the reverse of the intuition, and it is what makes the daily incremental load-bearing.

⚠️ **Scope — what D13 does NOT decide.** It measured **`search`, in-Worker, at 139k units.** It does not validate per-tool targets (`grep`/`fetch`/`deps`/`lookup`), it does not replace the **external end-to-end SLO check** (still owed, owner-side), and it does not establish cost at P1 scale — `M3-` §3's ~8.3× estimate is stated with its mechanism precisely so it can be falsified. **It also does not license publishing a latency headline; golden rule 5 is unchanged.**

⚠️ **One process debt recorded against it.** The **F22 settle threshold post-dates this run.** The published shares (0.82 / 1.00 / 1.00 / 1.00) clear the bar as measured, but the run **was not gated** by it — weaker than F21's amendment, which was ruled before its run. The gate is now code (`isReplicaSettled()`, 8 tests, the failing 5% poll frozen as a regression) and blocks `run-m1.ts`. **The first gated run is the first one the gate can vouch for.**

---

## Part 2 — Corrections Reference

> **📍 Scope of this table *(rev. 2026-08-03)*.** This file remains authoritative for **C1–C32**. **Corrections C33–C44 live in `17-SOTA-REVIEW-2026-08.md` §2** and are not duplicated here — deliberately, so there is exactly one authoritative text per correction. C33–C44 cover: the non-existent "‑Code"-suffixed late-interaction model name — the model is **LateOn**, with no code variant (**C33**), turbopuffer's serverless late interaction (**C34**), the compression reversal (**C35**), the restated late-interaction question (**C36**), the weak dense fallback (**C37**), the Solidity AST-shape failure mode (**C38**), the agent-query-shape mischaracterization (**C39**), D1 replication via the Sessions API (**C40**), the FTS5 corruption/export hazard (**C41**), the FTS5 tokenizer identifier gap (**C42**), 2026-08 ingest-endpoint truth (**C43**), and stale cost figures (**C44**). Where a C33–C44 entry contradicts a C1–C32 entry below, **the higher-numbered correction wins** and the older row is marked superseded in place. Evidence and sources for all of them: `19-RESEARCH-LEDGER-2026-08.md`.

The following table documents every number or claim that appeared in earlier drafts but was WRONG. These are the canonical correct values. Never reintroduce the erroneous versions.

| # | Topic | WRONG (do not use) | CORRECT (use this exactly) | Notes |
|---|-------|-------------------|---------------------------|-------|
| ~~C1~~ | **SUPERSEDED by D8 — there is no box.** Hetzner box model *(figures retained in case it is ever re-costed)* | CCX13 (2 vCPU / 8 GB); "~€24.49/mo" (pre-repricing price); "CAX41 = 4 vCPU / 16 GB" | **Floor = 4 vCPU / 16 GB. Post-2026-06-15: CCX23 (4 dedicated vCPU/16 GB) €85.99/mo; CAX41 Arm (16 shared vCPU/32 GB) €40.99/mo (W0 decides)** | Load-bearing for capacity planning; CCX13 is too small; Hetzner repriced the whole cloud line 2026-06-15; CAX41's real spec verified 2026-07-06 |
| C2 | Voyage at the edge | "Voyage runs at the Cloudflare Workers edge" | **No Voyage at the edge. Cloudflare Workers AI does not host any Voyage model** (re-verified 2026-08-02: its partner models are image/audio only). Prose query-embed, **if a dense arm ships at all**, runs on a Workers AI model **benchmarked against our own prose slice, not inherited** — the previously assumed default measures 51.49 MTEB Code (C37) | Architectural error; would require a non-existent hosted model. *(Amended 2026-08-03: the box-resident single-vector encoder named in earlier drafts has no host and is not a fallback.)* |
| ~~C3~~ | *(historical only — SCAR out of scope)* SCAR LoRA rank | rank 8 | **rank 256** | The SAE-LoRA is LoRA rank 256 over a frozen JumpReLU SAE (16,384 features, Layer 19) on Qwen2.5-Coder-1.5B |
| ~~C4~~ | *(historical only — SCAR out of scope)* SCAR encode latency | "38ms encode" | **26.2ms on H100** | Do not write "38ms encode + 76ms retrieve" — the corrected figure is 26.2ms encode on H100 |
| ~~C5~~ | *(historical only — SCAR out of scope)* SCAR vs. SPLADE margin | "SCAR beats SPLADE by 6.3 pts" (presented as universal) | **6.3 pts is FULL-CORPUS only; controlled-eval margin is 1.4 pts** | The gap between full-corpus and controlled-eval margins is material; do not conflate them |
| ~~C6~~ | *(historical only — SCAR out of scope)* SCAR index size comparison | "SCAR index is ~12-15x smaller than dense" | **SCAR index is 2.3x smaller than dense** Qwen. The ~12-15x figure is vs. BM25, not vs. dense | Wrong baseline in the comparison |
| ~~C7~~ | *(historical only — SCAR out of scope)* SCAR full-corpus MRR | "MRR 0.927" | **Full-corpus MRR is 0.803; 0.927 is the controlled-eval MRR** | Do not swap full-corpus and controlled-eval figures |
| ~~C8~~ | **SUPERSEDED by D8, then re-superseded by D10.** Latency claims | "sub-120ms single-box"; ~~and its own 2026-08-02 replacement, "<40 ms cache hit / ~80–160 ms on miss"~~ — that figure is retired too | **Latency is an SLO: sub-500 ms warm**, measured on the **Sessions-API replicated path** (a naive `prepare()` measures the primary and gives the wrong answer). The only published same-stack measurement is **<240 ms hit / <400 ms miss**; the old <40 ms headline was 2.5–6× more aggressive than any measurement of it. **Stop leading with latency** — the competitive axes are tokens and calls per completed task | Agent traces put sub-second tool calls at ≈1% of task wall-clock, and the Anthropic directory has no latency requirement. Correctness + freshness first (D10, `19-` §5) |
| C9 | Code-retrieval benchmark *(aligned with C25, 2026-08-03)* | "FinanceBench" cited for code retrieval; **also: "Hydra (FSE 2026)" used as the paper title** — the exact short-form C25 bans | **Do NOT cite FinanceBench for code retrieval** (it is a financial-document QA benchmark). For the structure-aware-code retrieval thesis, cite the full form: **Le-Anh et al., "Do Not Treat Code as Natural Language," FSE 2026 (arXiv 2602.11671) — the Hydra framework**, and state that its evidence base is **Python-only** (DevEval, RepoExec) | FinanceBench is irrelevant to code retrieval. C9's own CORRECT cell previously used the banned short title; **C25 governs the citation form and C9 now matches it** |
| C10 | Compression / corrective retrieval on the hot path *(cells realigned + re-superseded 2026-08-03)* | Either component implied or stated as a synchronous serving-path component | **NO compression or pruning model runs on the hot path — none.** The named compressor is **removed** entirely; CRAG is expand/async only. Token wins come from **payload shaping** (~4k-token / top-5 budget, hard caps, `content_omitted` + cursor), not from compression | ⚠️ **Twice-superseded.** The 2026-08-02 note put a Provence-class pruner deliberately *on* the path; **C35 (`17-` §2) reversed that** — the real removal range is 50–80% (not 80–95%), it is only near-free when unified with a reranker we do not have, and compression measurably **hurts code**. Governing decision: **D10** |
| ~~C11~~ | **SUPERSEDED by D8** — the in-memory cache store was a box component and there is no box. Cache store | Any self-hosted in-memory cache server (the two names used in earlier drafts) | **Workers KV / Cache API** — nothing else | Both earlier candidates are moot: one had gone tri-license including AGPLv3, and its fork was only ever justified by a box that no longer exists |
| C12 | MCP-surface auth | "API keys; OAuth optional/future" | **OAuth 2.0 required on the MCP surface** (API keys for REST + Docker entry only) | Claude.ai/Desktop connectors + Anthropic Directory are OAuth-only — see D7 |
| C13 | EIP/ERC ingestion source | "`ethereum/EIPs` repo (alone)" | **Clone BOTH `ethereum/EIPs` AND `ethereum/ercs`** | ERCs moved to a dedicated repo; single-repo clone silently omits every token standard |
| C14 | Etherscan API | V1 endpoints (`api.etherscan.io/api`) | **V2 only** — `api.etherscan.io/v2/api?chainid=…` (free 100k/day, 3/s, attribution) | V1 hard-shutdown 2025-08-15 |
| C15 | Sourcify API | v1 endpoints (`/files`, `repo.sourcify.dev`); repo `ethereum/sourcify` | **v2 endpoints**; repo **`argotorg/sourcify`**; prefer the daily Parquet dumps for bulk ABIs | v1 permanently shut down 2026-06-30; Sourcify spun out to Argot Collective |
| C16 | CCTP version in recipes/docs | Unversioned "CCTP" | **CCTP v2 only** | CCTP v1 phase-out begins 2026-07-31 (~10-month wind-down to full contract pause) — before W5 recipes would ship |
| C17 | wagmi version at recipe authoring | "wagmi v2" (or unpinned) | **wagmi v3** (current line as of May–Jul 2026) | Pin at authoring; note v2→v3 migration in the recipe |
| C18 | Aave recipe versioning | "Aave V3" as *the* Aave | **Aave v3 AND v4 coexist** — v4 live on Ethereum mainnet since 2026-03-30 (hub-and-spoke, pro.aave.com); the aave-v3 recipe pins V3 explicitly + carries a v4 delta-note | ⚠️ **The showcase clause was wrong — see C50 (2026-08-08).** The coexistence fact above stands and v3.7.0 (2026-08-05) hardens it. But *"this is the flagship version-disambiguation showcase"* named the wrong pair: v4 has no `Pool` at all, so v3-vs-v4 is a different-architecture story with nothing to confuse. **The flagship demo is v3-vs-v3** — `POOL_REVISION` 11 vs 7, both live on Ethereum. See also **C49** (two SDK repos, same npm names) |
| ~~C19~~ | *(historical only — SCAR out of scope, but if ever cited this still applies)* SCAR numbers source | scarai.xyz (site) | **GitHub `FarseenSh/scar-retrieval` + HF `Farseen0/scar-weights` / `scar-eval` only** | The site diagram still shows stale r=8 / "12×" / TopK-100 / 38+76ms as of 2026-07; also drop the unverifiable "7 firms" phrasing |

**New corrections (2026-08-02) — from `14-RESEARCH-2026-08.md`:**

| # | Topic | WRONG (do not use) | CORRECT (use this exactly) |
|---|---|---|---|
| C20 | Hosting | "the box"; "the Hetzner box" as a v1 component | **Cloudflare-native, no box** — $0/mo → ~$5/mo (D8) |
| C21 | Signal priority | "dense-primary"; "three co-equal RRF arms" | **deps ≫ lexical ≥ dense.** Dense is a *fallback* path (`14-` §4.11) |
| C22 | Headline accuracy claim | **MTEB Code 74.12** as a capability claim | Cite **RTEB / FreshStack / our own eval**. MTEB(Code,v1) is ~59% CodeSearchNet-derived; CCR (28% of it) leaks the function name via a `title` field; qrels are degenerate enough that **nDCG ≡ MRR** |
| C23 | Headline eval metric | nDCG alone | **Hard-negative intrusion rate** — nDCG is blind to the intrusion failure by construction |
| C24 | Fusion | "RRF is the fusion method" as settled | **Convex combination, α≈0.7, theoretical min-max**; RRF retained as fallback arm. ⚠️ TOIS evidence covers *two* arms; we fuse three — ship as "test", not "proven" |
| C25 | Hydra citation | "Hydra (FSE 2026)" as the paper title; using it to justify *multi-language* claims | **Le-Anh et al., "Do Not Treat Code as Natural Language," FSE 2026 (arXiv 2602.11671) — the Hydra framework.** Its evidence base is **Python only** (DevEval, RepoExec) |
| C26 | Hydra latency | "a stable 300–400 ms" | Median **221–278 ms**, mean **363–433 ms**, **max 21,234 ms** (Table 7) |
| C27 | Tool surface | "exactly two meta-tools"; "~400 tokens registered" | **Five granularity primitives.** The token figure was for two tools and must be re-measured |
| C28 | MCP SDK / client registration | "SDK v2 is beta-only, build on 1.29.x"; "dynamic client registration (DCR)" | **`@modelcontextprotocol/core` 2.0.0 GA 2026-07-27**; **CIMD** (pre-registration → CIMD → DCR fallback) |
| C29 | Freshness argument | "Web3 docs drift, therefore retrieval breaks" | **Facts change value** — versions coexist, addresses go wrong. Documentation churn alone does *not* break retrieval (Kendall τ = 0.978 across a year) |
| C30 | Examples | "more harvested examples is better" | **A mismatched example is worse than no example** (removing it beat keeping it for 4/5 models, up to +18%). Gate on matching precision, not volume |
| ~~C31~~ | **SUPERSEDED by C38 (`17-` §2) — wrong failure mode.** Solidity tree-sitter grammar | "pinning the grammar commit solves it" | ~~"fails silently via `ERROR` nodes"~~ → the grammar **does** parse modern syntax (`transient`, custom errors, `layout`, Yul `tload`/`tstore`/`mcopy`/`blobhash` — verified by direct read of `grammar.js`). **The real risk is unstable AST *shape*** (the maintainer's own README). Canonical repo is **`JoranHonig/tree-sitter-solidity`**; `tree-sitter-grammars/tree-sitter-solidity` does not exist. W0 canary = **golden-file AST-shape diffs on every grammar bump** + `ERROR`-node rate |
| ~~C32~~ | **SUPERSEDED by C35 (`17-` §2) + D10 — the replacement was itself wrong.** Token compression | The named compressor anywhere on the path | ~~"Provence-class dual-head pruning — 80–95% removal at zero marginal cost"~~ → **both numbers were wrong** (the paper says **50–80%**; "zero marginal cost" holds *only* when unified with a reranker this design does not have) and it is prose/English/QA-only, **never evaluated on code**. **NO compression model runs on the hot path.** Token wins come from payload shaping — see **D10** |


---

## Quick-Reference Checklist for Document Authors

Before publishing any document in this build package, verify:

*Checklist items marked ⟳ were rewritten 2026-08-03 by **D10**.*

- [ ] **No box is described as a v1 component.** Serving is Cloudflare-native, $0→~$10/mo (D8, D10).
- [ ] ⟳ **Storage is TWO D1 databases** — an exportable **core DB** with no virtual tables ever, and a **dedicated, disposable lexical (FTS5) DB** that is rebuilt from R2, never exported. **Sessions-API read replication on from day one.** Binding capacity cap is **10 GB paid** (500 MB is free-tier only).
- [ ] **The deprecated sparse-audit retriever is described as OUT OF SCOPE ENTIRELY** — not deferred, not pre-staged, no 299 MB index, no activation gate.
- [ ] ⟳ **No late-interaction retriever is described as serving v1** — and the stated reason is that **no good code late-interaction model exists** (all ≤63 MTEB Code), **not** that serverless hosting is unavailable (C33/C34). Primary = **deps closure as a candidate filter, BM25 ranking within it**; a dense arm ships only if W1 earns it.
- [ ] ⟳ **The name "LateOn-Code" appears nowhere as a real model.** The model is **LateOn**; there is no code variant (C33).
- [ ] ⟳ **The tool surface is five primitives**, not two meta-tools; the registered-token target is **≤600 for all five** plus a Tool-Selection-Guide `instructions` block. The pre-2026-08 two-tool token figure is never reused. **No meta-tools, ever.**
- [ ] **MTEB Code 74.12 is not used as a capability claim** (contaminated benchmark). Cite RTEB / FreshStack / our own eval — noting no trustworthy public code-retrieval leaderboard currently exists.
- [ ] ⟳ **Hard-negative intrusion rate is named as headline eval metric #1 — and always reported WITH HN-recall** (the bare conditional denominator is self-selecting). **Headline #2 is tokens-to-task-completion** vs the 3.3k bar, with Context7 / web-search / no-tool baseline arms.
- [ ] ⟳ **Deps closure is a candidate-set filter and is NEVER score-fused.** Convex combination α≈0.7 applies only between the two *similarity* arms on the prose path, with RRF and a **no-fusion** arm measured against it; the two-arm scope limit is stated.
- [x] ✅ ⟳ Latency is written as an **SLO — sub-500 ms warm**, measured on the **Sessions-API replicated path**. **Measured 2026-08-04: worst-vantage p95 = 222 ms (D13).** The "<40 ms / ~80–160 ms" pair stays retired and is never reintroduced — **having a real number does not make the old pair citable, and does not make latency a headline.** Propagated to `03-` §Latency Budget, `08-` W4, `16-` §5 + row 5, `18-` §2.3, `10-` D8/D13. Do not lead with latency.
- [ ] Cache store is **Workers KV / Cache API** — never a self-hosted in-memory cache server.
- [ ] Hydra is cited as *Le-Anh et al., "Do Not Treat Code as Natural Language," FSE 2026 (arXiv 2602.11671) — the Hydra framework*, **never as "FinanceBench"**, and its **Python-only** evidence scope is stated.
- [ ] The freshness argument is **value invalidation**, not "docs drift".
- [ ] Base-tier examples are described as **gated on matching precision**, not volume.
- [ ] ⟳ The Solidity tree-sitter risk is stated as **unstable AST *shape*, not parse failure** (C38), with a golden-file AST-diff canary; the repo is **`JoranHonig/tree-sitter-solidity`**.
- [ ] ⟳ **NO compression or pruning model is on the hot path — none** (C35 reversed the previous Provence-on-path rule). CRAG and any pruner are expand/async, prose only. Token wins come from **payload shaping**: ~4k-token / top-5 budget, hard caps, `content_omitted` + cursor, examples-first.
- [ ] ⟳ **The semantic gap is closed at ingest, not at query time** — identifier dual-tokenization + doc-only sparse expansion, and expansion **never** enters a version predicate.
- [ ] No Voyage model is referenced at the Cloudflare Workers edge.
- [ ] ⟳ MCP-surface auth is OAuth 2.0 + **CIMD** with the **pre-registration → CIMD → DCR-fallback** priority chain (DCR deprecated), **plus an authless free read tier**; API keys = REST + Docker entry only.
- [ ] MCP SDK is **`@modelcontextprotocol/core` 2.0.0**, serving the 2025-11-25 wire era with 2026-07-28 behind a flag.
- [ ] `intent=vulnerability` is labeled "v-next/audit-module" in any MCP surface documentation.
- [ ] EIP ingestion clones BOTH `ethereum/EIPs` and `ethereum/ercs`.
- [ ] Etherscan references are V2-only; Sourcify references are v2-only (`argotorg/sourcify`).
- [ ] ⟳ CCTP is written **"CCTP v2" with a v1-legacy note** (v1 phase-out began 2026-07-31 but v1 is live on 11 chains); wagmi recipes pin **v3 + viem 2** (**viem is still major 2 — never assume viem 3**); the Aave recipe pins V3 explicitly with a v4 coexistence note; the MetaMask connector is **`@metamask/connect-evm`**, not `@metamask/sdk`.
- [ ] ⟳ EIP ingest **filters ~300 `status: Moved` tombstones** (they return HTTP 200); Sourcify's default branch is **`staging`**.
- [ ] ⟳ **No LLM and no learned model runs in the ingest parse loop.** Deterministic ingest — same commit in, same index out, hash-verified — is a measured differentiator and must not be accidentally violated.
- [ ] ⟳ Corrections cited by number resolve to the right file: **C1–C32 here; C33–C44 in `17-` §2**; sources in `19-`.
- [ ] *(Historical only — SCAR is out of scope)* If SCAR numbers ever appear: rank 256, encode 26.2 ms on H100, full-corpus MRR 0.803, index 2.3× smaller than dense, sourced from GitHub/HF and never scarai.xyz; no "7 firms" phrasing.
