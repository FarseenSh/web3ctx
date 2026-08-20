<!--
  FILED VERBATIM 2026-08-20 — INTERNAL EVIDENCE, NOT A SET OF RULINGS.

  Everything below the marker is the reviewing session's own file, byte-for-byte. This block was
  prepended on filing and is the only text we wrote. Original bytes:
  sha256 0a4b6db817c08f329b9a2c1b5946d523859423de1334aa6f00ec918c4ae1d662  (11,578 B)

  Re-check it with:
    python3 -c "import sys,hashlib;b=open(sys.argv[1],'rb').read();print(hashlib.sha256(b.split(b'-->\n\n',1)[1]).hexdigest())" EXTERNAL-EVIDENCE-2026-08-20.md

  ── THE DOCUMENT'S OWN VERIFICATION STATUS, ITS SECTION 0, RAISED TO THE TOP ──────────────────

    "4 of ~30 arXiv IDs were VERIFIED by resolving arxiv.org/abs/{id}. Titles and submission
    dates matched exactly: 2608.16586 (Aug 17 2026), 2607.09349 (Jul 10 2026), 2606.26216
    (Jun 24 2026), 2604.09515 (Apr 10 2026).
    The remaining ~26 came from firecrawl's research index (title + abstract). NOT resolved."

  ── THE BINDING RULE, OWNER, 2026-08-20 ──────────────────────────────────────────────────────

  NO arXiv ID FROM THIS REPORT MAY BE CITED IN ANY REPO DOCUMENT UNTIL RESOLVED.

  Citable NOW — these four and no others:
      2608.16586 · 2607.09349 · 2606.26216 · 2604.09515

  Every other id in this file is a TITLE AND AN ABSTRACT FROM A SEARCH INDEX. It may be read,
  it may be adjudicated, and it may not be cited. An unresolved id carries the exact property
  this product refuses in other people's payloads: a real-looking reference nobody re-fetched.
  C51/C54's rule, applied to our own reading list — the property is RE-FETCHABILITY, and an id
  that has not been resolved has not demonstrated it.

  ── RESOLUTION LOG (append-only; an id LEAVES the unresolved set only by an entry here) ──────

  2026-08-20  2603.06976  RESOLVED by fetching arxiv.org/abs/2603.06976.
              "A Systematic Investigation of Document Chunking Strategies and Embedding
              Sensitivity", submitted March 7 2026. The report's characterisation matches:
              36 segmentation methods, Paragraph Group Chunking beating naive fixed-length.
              Resolved because it was ALREADY CITED in 14-RESEARCH-2026-08.md line 474, from a
              different sweep, and the rule arrived after it. Flagged rather than silently kept
              or silently deleted; resolving it is what the rule asks for, so it was resolved.
              => CITABLE. The citable set is now FIVE.
              WARNING, AND IT IS THE POINT: what was resolved is the ID, ITS TITLE AND ITS DATE.
              The nDCG figures (~0.244 fixed vs ~0.459 PGC) are still second-hand from a search
              index. A resolved id licenses the CITATION, never the NUMBERS inside it -- reading
              the paper is a separate act, and this log does not claim it was done.

  2026-08-20  RULING: CITABILITY IS TWO-STAGE, and this log now records both stages per id.
              STAGE 1 = RESOLVES (the id fetches; title and date are what the citing text says).
              STAGE 2 = THE CITED CLAIM IS CONFIRMED PRESENT IN THE PAPER.
              An id must pass BOTH to be citable.
              WHY: a resolved-but-unread id is DECEPTIVE GROUNDING INSIDE OUR OWN EVIDENCE
              REPORT -- "every claim sourced from a real document, about the wrong entity"
              (2607.09349, VERIFIED), where the entity is the paper. We adopted that term this
              week and the first place it applies is here.

              2608.16586   stage 1 PASS · stage 2 PASS (claim confirmed against the abstract)
              2607.09349   stage 1 PASS · stage 2 PASS
              2606.26216   stage 1 PASS · stage 2 PASS
              2604.09515   stage 1 PASS · stage 2 PASS
              2603.06976   stage 1 PASS · stage 2 NOT CONFIRMED  => STAGE-ONE ONLY

              => 2603.06976 IS MARKED, NOT WITHDRAWN. The 14- citation stands on its id, title
              and date. Its NUMBERS may not be quoted until stage 2 passes. Everything else in
              this document remains uncited and unresolved.

  This is the first target of the citation linter (roadmap N2): the check points at this
  document before it points at a recipe.

  ── N3, AMENDED 2026-08-20: THE DISTINCTION IS ACCEPTED AND THE WALL IS UNCHANGED ────────────

  N3 was one proposal and it is two, with opposite rulings:
    (a) reproducing audit CONTENT      -> WALLED by golden rule 3, unchanged.
    (b) audits as a DISCOVERY SIGNAL   -> may proceed POST-LAUNCH, and only after a one-page
                                          written boundary policy, owner-approved.
  (b) names the DISCOVERY half. Written out because the letter alone reads either way.

  The four binding clauses: audits are READ, never INGESTED; nothing stored, served or quoted
  from them; every trap asserted and cited EXCLUSIVELY from pinned upstream source; the audit's
  role recorded only as an internal discovery note.

  Clause 3 is what makes this a distinction rather than a loophole: an audit can never be
  load-bearing for a claim. If the trap is real the pinned source proves it and the audit is
  invisible in the artifact; if the source does not prove it, the trap does not ship. The signal
  changes where a curator LOOKS and never what a payload SAYS.

  ⚠ ONE INTERNAL INCONSISTENCY, OBSERVED ON FILING AND NOT EDITED: section 0 calls the citation
  linter "item N3"; it is N2 (N3 is the audit-findings trap corpus). Recorded here rather than
  corrected in the text, because the text is filed verbatim.

  ── ORIGINAL FILE BEGINS ─────────────────────────────────────────────────────────────────────
-->

# EXTERNAL EVIDENCE REPORT — literature + implementation survey for web3ctx
Compiled 2026-08-20 by the reviewing session (Opus). Supplied as evidence for adjudication,
not as rulings. Slots into the roadmap already judged; does not restart it.

## 0. VERIFICATION STATUS OF THIS REPORT — read first
- 4 of ~30 arXiv IDs were VERIFIED by resolving arxiv.org/abs/{id}. Titles and submission
  dates matched exactly: 2608.16586 (Aug 17 2026), 2607.09349 (Jul 10 2026),
  2606.26216 (Jun 24 2026), 2604.09515 (Apr 10 2026).
- The remaining ~26 came from firecrawl's research index (title + abstract). NOT resolved.
- RECOMMENDATION: before any of this enters the repo, loop the citation linter (item N3)
  over every ID. Same check, pointed at this document instead of at recipes.
- Recency: 21 of the cited papers are 2026 (<=7 months). 8 are older and deliberately so
  (foundational or dataset papers). 1 is superseded and should be dropped (see section E).

## A. BEARING ON RULINGS ALREADY MADE

A1. STAMP SCOPING — CONFIRMED by published method.
  arxiv:2603.27752 (RT4CHART) "decomposes an answer into independently verifiable claims,
  performs hierarchical verification." That is assertions-as-tests, in the literature.
  The complement half is confirmed independently by A2: there is a documented failure class
  that claim-level verification structurally cannot catch.

A2. THE ENEMY HAS A NAME, A RATE, AND A PROPOSED DEFENCE.
  arxiv:2607.09349 "Deceptive Grounding: Entity Attribution Failure in Clinical RAG"
  (VERIFIED, Jul 10 2026). Definition: "a failure invisible to faithfulness, hallucination,
  and citation checks because every claim is sourced from a real document, about the wrong
  entity." Measured: 8-87% under adversarial conditions across 13 models; 86.7% for
  specialised models; 7.8% in real deployment across 740 pairs -- RISING TO 13.6% FOR
  RECENTLY APPROVED ENTITIES.
  Their proposed detection: ENTITY-ATTRIBUTION VERIFICATION, 97.0% precision / 98.7% recall.
  Relevance: the curator's own ERC1967Proxy ruling -- "a real name from a real source
  attached to the WRONG OBJECT" -- is this concept, derived independently, before the paper
  was found. The 13.6%-on-recent-entities figure is the strongest single number in this
  report: DG worsens exactly where this project operates (new majors, fresh deployments,
  upgraded proxies).

A3. 4a CONTINUATION CURSOR — is an industry-named pattern, not a bespoke fix.
  Canonical form: "return handles or ids plus a summary field; truncate lists with
  'showing 20 of 10,000, use filter X'." Current state (measured) is the anti-pattern:
  body_truncated:true + body_bytes:52212 + no handle.

A4. 4c NORMATIVE-UNIT CHUNKER — EVIDENCE IS MIXED. THIS CORRECTS MY EARLIER ADVICE.
  FOR: arxiv:2603.06976 finds Paragraph Group Chunking dominates legal and mathematical
  corpora because "definitions, theorems, and proofs [span] contiguous sections. Preserving
  these multi-paragraph structures enables the retrieval of complete logical units."
  Fixed-length baseline nDCG@5 ~0.244 / 2-3% P@1 vs PGC ~0.459 / ~24% P@1. Specs behave
  like legal/math text; this is the ERC-4626 two-adjacent-bullets case.
  AGAINST: arxiv:2608.16586 (VERIFIED, Aug 17 2026 -- three days old) finds semantic,
  contextual, late and summary chunking "rarely achieve significant wins over simpler
  baselines" at scale; token-based remains a strong default; enriched(title) is the cheap
  winner. Conclusion: chunking is "a multi-objective design decision"; methods at equal
  performance differ sharply in operational cost.
  ALSO: a Springer analysis finds overlap gives NO measurable benefit and identifies a
  "context cliff" past ~2.5k tokens.
  IMPLICATION FOR THE RULING: keep the NARROW form -- never split a normative unit -- which
  is the well-supported claim. Do NOT generalise to semantic/late chunking as a default; the
  scale evidence does not support it. Pre-register 4c as a MEASUREMENT on this corpus with
  cost as an explicit axis, not as adoption from the literature.

A5. ITEM 5 (RE-VERIFICATION CRON) — gains its justifying number. See A2: DG rises from
  7.8% to 13.6% for recently-updated entities. Liveness is worth most precisely here.

A6. ITEM 3 (PRIORITY FILL) — gains measured targets from published measurements:
  - tool-search vs standard catalog: 4,781 -> 429 tokens/turn (-91%), ~60% cost cut
    (GitHub MCP, measured, maniak.io, Jun 20 2026)
  - MCP-as-code-API on a filesystem: 150,000 -> 2,000 tokens (-98.7%) (Anthropic)
  - three-level progressive disclosure: ~79% context reduction
  - TOON-style output shaping (strip nulls, compact): 50-70% output token cut
  Anthropic explicitly recommends a DETAIL-LEVEL PARAMETER on discovery ("name only, name
  and description, or the full definition with schemas"). That is the priority-fill lever,
  already blessed upstream.
  Cheap adjacent win: responses currently emit requested_version:null,
  exact_version_match:null, empty diagnostics{} on nearly every call. Null-stripping is free.

## B. NEW, FOR ADJUDICATION

N1. POSITIONING (no surface change). Three defensible claims, each with a citation:
  (i) "RAG alone does not fix version errors" -- arxiv:2604.09515 (VERIFIED). 270 real
      updates, 8 libraries, 11 models: WITHOUT comprehensive docs only 42.55% of generated
      code is executable in the target environment; WITH structured documentation and larger
      models it still only reaches ~66%. Doc retrieval caps at two-thirds. This is the
      quantified argument for conflict-signalling (version_note) over better page-serving.
  (ii) "Doc-search is structurally vulnerable to deceptive grounding" -- arxiv:2607.09349.
       Their entity is a URL; ours is (project, version, chain, address).
  (iii) "Our tool results are safely clearable." Anthropic's clear_tool_uses drops old
       "re-fetchable" results while keeping the call record. Because every body here is
       addressable by a STABLE SELECTOR, these payloads are the ideal clearing candidate.
       A scraper result is not re-fetchable by a stable id. No competitor can make this claim.

N2. CITATION LINTER — closes a gap the literature explicitly names.
  arxiv:2605.06635 "Cited but Not Verified": current RAG "does not validate source
  accessibility, relevance, or factual consistency." arxiv:2605.27700 (CiteCheck) does
  metadata faithfulness. Measured current state of this project: 44/85 recipe citations
  SHA-pinned; 5 malformed URLs (trailing period x3, trailing backtick, stray comma); one
  glob that returns 404 (unpkg .../src/**/*.d.ts); one http://localhost:5277 leaked from a
  recipe metadata.url field. CI check: resolve every citation, assert 40-hex where a pin is
  claimed, reject globs and localhost. Transferable pattern: Prisma's lint-agent-ready.ts
  (Jul 24 2026) runs size budgets, link resolution and parity assertions on every PR.

N3. TRAP CORPUS FROM AUDIT FINDINGS — highest-yield coverage path, no prose authoring.
  In the competitor benchmark, the source that surfaced the SwapRouter02 no-deadline trap
  with its front-running consequence was a CODE4RENA AUDIT REPORT, not documentation.
  Audit findings are structured, dated, version-anchored and full of exactly the footguns
  docs omit. Corpora: code4rena reports; OpenZeppelin findings; DeFiHackLabs (541 real
  exploit incidents, catalogued by arxiv:2606.26216); arxiv:2605.03697 (31,165 annotated
  vulnerability instances, 3,200 projects, 15 platforms).
  arxiv:2604.00657 (LibScan) formalises the trap concept: library misuse detection
  "requires understanding the developer's intent rather than simply scanning for known
  code patterns."

N4. EVAL HARNESS — design to copy, and the statistical bar.
  arxiv:2606.26216 (CyberChainBench, VERIFIED, Jun 24 2026): agents interact with historical
  chain state through isolated environments on MAINNET FORKS, EACH CASE ANCHORED TO A
  SPECIFIC BLOCK. Results show the difficulty gradient: detection 37.5%, exploit generation
  43.7%, patch synthesis 23.4%; top config produced $57.4M exploit profit across 200 cases
  at $2.39/case. This is the bridge from "validated once on 2026-08-07" to "re-run against
  pinned chain state on every commit."
  Statistical bar: github.com/TheYellowDuck/RAG-codebase ships recall/MRR/NDCG with
  BOOTSTRAP CIs AND SIGNIFICANCE TESTS. The competitor benchmark I ran does NOT meet this
  bar (agent-transcribed payloads, chars/4 token estimates) and should be re-run over an
  HTTP harness writing raw responses to disk before it is treated as publishable.

N5. llms.txt AS AN INGESTION SOURCE for item 7 skeleton generation.
  Measured adoption (llmtxt.info, Jun 10 2026): 53.7% of 218 notable hosts; 68.9% of
  developer-tool hosts; median file 13.8 KB. Directly relevant: wagmi.sh/llms-full.txt and
  docs.across.to/llms-full.txt both returned in searches during this survey -- target
  projects are ALREADY publishing curated agent-shaped feeds. Cheap, high-quality docs-layer
  input alongside repo ingestion.

N6. IMPLEMENTATION PATTERNS WORTH READING (all active 2026, all verified push dates):
  - HenryBuilds/Vectra -- MERKLE-INDEXED INCREMENTAL EMBEDDING. Directly solves re-embed
    cost on corpus bumps; only re-processes what changed.
  - hunhee98/pluck -- "84-88% fewer read tokens ... SESSION DEDUP". Not currently present:
    the same cctp@v2 unit was returned across three separate calls in one session.
  - huawang1258/semantic-code-mcp -- tree-sitter + voyage-code-3 + sqlite-vec + FTS5 + RRF
    + rerank-2.5 + call-graph expansion. Reference stack for the retrieval layer.
  - wchiway/contextweaver-mcp -- "token-aware context packing" (the budget param, shipped).
  - lorenzo-cambiaghi/LynxMCP -- AST chunking + hybrid BM25/dense + code knowledge graph
    (pushed 4 days ago).

## C. VOCABULARY WORTH ADOPTING (all from 2026 papers)
  "context-memory conflict" (2604.09515) -- retrieved context fighting parametric knowledge
  "anachronistic error" / "temporal knowledge stratification" (2606.25402)
  "deceptive grounding" (2607.09349) -- the entity-attribution failure class
  "entity-attribution verification" (2607.09349) -- the defence, i.e. what this server does
  "multi-objective design decision" (2608.16586) -- for chunking, incl. operational cost

## D. THE FIELD THIS PROJECT SITS IN (version-aware code generation)
  Named benchmarks that already exist, and that a web3 benchmark should be modelled on:
  GitChameleon 2.0 (2507.12367, 328 problems with EXECUTABLE UNIT TESTS -- the right design,
  not multiple choice); LibEvolutionEval (2412.04478); VersiCode (2406.07411, defines the
  tasks VSCC + VACM); RustEvo2 (2503.16922); LibEvoBench (2606.25402); VersiBCB /
  Environment-Aware Code Generation (2601.12262); ReCode (2506.20495); KCoEvo (2603.07581,
  knowledge-graph "evolution path retrieval" -- a version-diff graph, one step from the
  current corpus model).
  The age of the older ones is an ARGUMENT, not a weakness: the problem has been documented
  for two years and the retrieval side is still unsolved.

## E. DROP / DO NOT ADOPT
  - arxiv:2411.05830 (GitChameleon v1) -- superseded by 2.0. Cite 2.0 only.
  - Do NOT adopt semantic, late, or summary chunking as defaults. arxiv:2608.16586 (3 days
    old) finds they rarely beat simple baselines at scale and cost substantially more.
  - Do NOT add chunk overlap for its own sake -- measured as no benefit, with indexing cost.
  - Do NOT treat the competitor benchmark as publishable until it runs over an HTTP harness
    (see N4).
