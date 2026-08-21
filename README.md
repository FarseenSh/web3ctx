# web3ctx — the evidence layer

Human-validated, chain-run integration recipes for web3, served version-true over MCP.

**The server:** `https://mcp.scarai.xyz/mcp` — free, no key, no signup.

⚠ The original `*.workers.dev` hostname keeps answering and always will — an install someone
already pasted into a config is a promise. It is simply no longer the published URL.

**The pages:** [overview](index.html) · [evals & evidence](evals.html) · [architecture](architecture.html)

## What this repository is

The measurements behind the pages, published so the claims can be checked — including the
experiments that failed and the corrections to things we got wrong. Every number on the site is
regenerated from these files and from the live database at build time; none is typed.

## 🔴 Competitor payload bytes are NOT published

The payload audit compared several retrieval tools. **Only our own cached payloads are
published here.** For every other arm this repository carries the **protocol, the hashes and the
counts** — not the bytes.

- The bytes are **retained privately** so every published count remains re-checkable against the
  exact material it was computed from.
- **The protocol is re-runnable by anyone** against the live tools. Nothing here asks you to take
  a count on trust: the questions, the calling convention for each arm, and the scoring rule are
  all in `evidence/PAYLOAD-AUDIT-2026-08-13.md`.

Republishing another vendor's output is not necessary to make a measurement checkable, and we
do not do it.

## What is here, and why each file is here

- **`architecture.html`** *(5 files)* — the three rendered pages + stylesheet — the site itself
- **`evidence/LAUNCH-FACTS-FROZEN-2026-08-13.md`** — L1–L5, frozen; the source of every launch number
- **`evidence/PAYLOAD-AUDIT-2026-08-13.md`** — the audit protocol and its limitations, including the seven payloads we destroyed
- **`evidence/payload-audit/web3ctx/`** *(16 files)* — OUR OWN cached payloads — the only arm whose bytes are ours to publish
- **`evidence/BENCH-PRE-REGISTRATION-2026-08-20.md`** — the benchmark pre-registration, frozen before the first arm ran — a result without its pre-registration is an anecdote
- **`evidence/BENCH-RESULT-2026-08-20.md`** — the benchmark result, including the prediction we registered and did not meet
- **`evidence/bench-2026-08-20/manifest.json`** — every payload collected: HTTP status, byte count, sha256 and the scrubbed request — hashes and counts for every arm, per the standing ruling
- **`evidence/bench-2026-08-20/scored.json`** — the grading records the site renders from — one computation, published
- **`evidence/bench-2026-08-20/web3ctx/`** *(16 files)* — OUR OWN raw payloads, both rows — the only arm whose bytes are ours to publish
- **`evidence/bench-2026-08-20/web3ctx-integrate/`** *(16 files)* — the same, for the labelled second row
- **`evidence/BENCH-EXT-PRE-REGISTRATION-2026-08-20.md`** — the extension pre-registration — ground truth verified on-chain and at pins BEFORE any question was registered
- **`evidence/BENCH-EXT-RESULT-2026-08-20.md`** — the extension result, opening with our correction to numbers we had already published
- **`evidence/spec/artifacts/bench-ext-2026-08-20/manifest.json`** — every extension payload: status, bytes, sha256, wall-clock and the scrubbed request
- **`evidence/spec/artifacts/bench-ext-2026-08-20/scored.json`** — the extension grading records
- **`evidence/spec/artifacts/bench-ext-2026-08-20/web3ctx/`** *(18 files)* — OUR OWN raw payloads
- **`evidence/spec/artifacts/bench-ext-2026-08-20/web3ctx-integrate/`** *(18 files)* — the same, labelled second row
- **`evidence/spec/artifacts/globalping-2026-08-20.json`** — the multi-vantage latency measurement, with its composition and the SLO lock inside the artifact
- **`evidence/COST-EXPOSURE-2026-08-20.md`** — the cost audit: every meter with its mechanism, the breaker, and the no-self-perpetuating-compute invariant
- **`evidence/VERIFICATION-PROTOCOL.md`** — the rules the measurements were run under, including rule 14
- **`evidence/ROADMAP-POST-LAUNCH-2026-08-20.md`** — what is adopted, what is leashed, what is refused
- **`evidence/EXTERNAL-EVIDENCE-2026-08-20.md`** — the literature sweep, verbatim, under its citation banner
- **`evidence/stranger-bench-2026-08-20/`** *(4 files)* — the adversarial benchmark WITH its limitation banner and hash manifest
- **`evidence/F7-RESULT-2026-08-20.md`** — the clean-config stranger review and its two caveats
- **`evidence/S5.2-EXPANSION-RESULT-2026-08-18.md`** — dead experiment, published because it died
- **`evidence/S5.3-DEMOTION-RESULT-2026-08-19.md`** — dead experiment
- **`evidence/F72-RESULT-2026-08-20.md`** — dead experiment — and the comment-stripper refused before it was built
- **`evidence/F64-C1-RESULT.md`** — dead experiment
- **`evidence/F64-C2-RESULT-2026-08-19.md`** — dead experiment
- **`evidence/F64-PAYLOAD-EFFICIENCY-PRE-REGISTRATION.md`** — the pre-registration those two were gated on — a result without its pre-registration is an anecdote
- **`evidence/PRE-REG-A-EXPANSION-REATTEMPT.md`** — pre-registration
- **`evidence/PRE-REG-B-UNIT-CLASS-DEMOTION.md`** — pre-registration
- **`evidence/F72-PRE-REGISTRATION-2026-08-20.md`** — pre-registration
- **`evidence/W1-PRECISION-PRE-REGISTRATION.md`** — pre-registration for the precision number the site publishes
- **`evidence/W1-PRECISION-RESULT-2026-08-16.md`** — the precision result and the CodeGrep non-comparability analysis
- **`evidence/F68-RESULT-2026-08-19.md`** — the shipped floor, and the measured cost the site quotes
- **`evidence/ATTESTATION-PROTOCOL.md`** — how a slice row earns its place; the gate that refused our own harvest
- **`evidence/spec/10-DECISIONS-AND-CORRECTIONS.md`** — corrections C1–C32 and C45–C57 — the index of things we got wrong
- **`evidence/spec/17-SOTA-REVIEW-2026-08.md`** — corrections C33–C44
- **`evidence/spec/09-EVAL-HARNESS.md`** — the eval spec the pre-registrations reference
- **`evidence/spec/06-MCP-INTERFACE.md`** — the surface contract — every public payload field, documented

## What is deliberately NOT here

⚠ **An excluded file and a missing file are different facts, and only the first can be
reviewed.** Each exclusion names its reason — several are excluded because they are *wrong*,
not merely old.

- `generated/` — build output and 26 stage-a corpora — scratch, gigabytes, no evidentiary value
- `artifacts/bench-{2026-08-20,ext-2026-08-20}/{context7,exa-*,firecrawl-dev,claude-web-search} (raw bytes)` — 🔴 RULED 2026-08-20 — competitor payload BYTES do not publish. `manifest.json` carries their sha256, byte counts and the exact request that produced each, and the protocol is re-runnable by anyone against the live tools. The bytes are retained privately so every published count stays re-checkable against the material it was computed from.
- `artifacts/payload-audit/{context7,exa,firecrawl,ethskills}` — 🚩 FLAGGED FOR THE OWNER, NOT DECIDED — see the flag below
- `~/web3ctx-recipes (the curator repo)` — a separate repo on a separate cadence; its publication is the curator's decision, not this set's
- `measurements/*CYCLE*.md, *DEFECTS*.md, session logs` — internal working records — the findings that matter are already in the protocol and the corrections index
- `.dev.vars, .env, ~/.w3ctx-token, wrangler state` — credentials-adjacent, categorically
- `tools/, packages/, apps/` — the implementation is not the evidence layer; publishing it is a separate decision with its own consequences
- `overview-v3-2026-08.html` — SUPERSEDED — spec-era deck; its design shell was reused for the site at b557635, its numbers were not
- `overview-v2-2026-08.html` — RETIRED — pre-16-, already ruled do-not-show
- `~/web3mcp/*.html` — WRONG — depicts the pre-pivot design that was never built
- `eval-2026-08.html` — 🔴 WRONG — carries numbers from the slice whose lock was REFUSED (F51). Publishing it would publish figures scored on a slice that does not exist. ⭐ **RETIRED 2026-08-21 (RULING K), and retirement here means UNEMITTABLE, not merely unpublished.** `tools/build-site.ts` used to copy this file verbatim into `docs/eval.html`; `docs/` is served by nothing today, so the page was inert rather than safe — and a generator that can still render a ruled-wrong page is a standing hazard, because the day anyone points a host at `docs/` it publishes. **The code path is DELETED, not flagged**, on the `overview-v2` precedent below: a flag can be flipped back by someone who never read the ruling. Five dead `protocols/…` links died with it — dead twice over, into a PRIVATE repo at a path that exists in neither. ⚠ The FILE stays in this repo as history: **removal is from publication, never from the record.** The only evals page that publishes is `public-site/dist/evals.html`, slot-generated from frozen artifacts under D16 — every figure derived, none typed.
- `launch-charts.html` — LOCKED — superseded by the generated site, which regenerates instead of storing
- `status-honest.html, tweet-cards.html` — HISTORICAL — dated states, not current claims

## Integrity

`MANIFEST.sha256` carries a hash for every file in this set.

Staged from 126 files.
