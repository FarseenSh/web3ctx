# Attestation protocol — pre-registered 2026-08-06, before any row was judged

**Status: PRE-REGISTERED. Written and committed BEFORE the tool ran against a single row.**

> ### Amendments made while implementing — all three BEFORE any row was judged
>
> Building the checks surfaced three places where the wording above did not do what it said. Each is
> recorded here with its cause rather than edited into the text, so the protocol reads as what was
> pre-registered plus what changed and why. **None was made in response to a row's verdict** — the
> gate had not been run.
>
> | # | check | change | why |
> |---|---|---|---|
> | 1 | **A2** | branch (a) is **line-scoped**, not whole-document | "substring of the whitespace-collapsed source" **welds across lines by construction** — the collapse turns every newline into a space. It passed a two-line document joined into one sentence, which is F51 #1 exactly. |
> | 2 | **A5a** | naming the twin is disqualifying **full stop**, dropping the "and not the asked version" clause | As written it passed F51's **#10**, the one row the review singled out: the text names *both* `TokenMessengerV2` and `V1`, so the twin-side row escaped on a technicality. A query naming both versions says which neither. |
> | 3 | **A3c** | a second pass route, **`container-in-title`** — ✅ **ACCEPTED 2026-08-06 as built**: *"named, reported per row as `subjectMode`, one disjunct from strict."* | Same-block alone failed a **correctly bound** row — CCTP #105, the review's *"best row in the set"* — because the thread says *"no USDC was **minted**"* and never writes the bare token `mint` beside `TokenMinter`. A title is the author's own statement of subject. **`subjectMode` is reported on every row**, so the weaker route is never invisible, and it rescues nothing misbound: every Q3 row fails A3b outright or has a title naming a different subject. |
>
> ⚠ Amendment 3 loosens the gate, and it was made after seeing that the strict form killed a row the
> owner ruled should stay. That is the F22 shape, so it is not buried: the route is **named**, it is
> **reported per row**, and the rows that need it can be counted at a glance. If the owner would
> rather have the strict form, deleting one disjunct restores it and the report already says which
> rows would go.

Ruled 2026-08-06, on refusing the hard-negative lock:

> *"Build the attestation gate as a **TOOL**, pre-registered before re-run: for every row, fetch the source
> and verify the phrasing is an exact substring modulo ONLY the three declared normalizations; verify the
> gold's symbol is demonstrably the subject of the source; run the wrong-side check per direction INCLUDING
> both-direction reuse. Every defect in the curator findings becomes a test case for this tool. **Rows pass
> or fail by tool; no row enters any slice without passing.**"*

## 0. Why a tool, and why pre-registered

The sheet this replaces carried two written guarantees — *"no word is ever added"* and *"rows marked `body`
where the title names a different symbol are flagged inline"* — and **its own content violated both**. Neither
was ever executed; both were prose. F51 records that.

> **A guarantee stated in prose is not a guarantee.** It is a claim about behaviour with nothing behind it,
> and it fails in the one direction that is invisible: the reader believes it.

Pre-registration is the other half. This file is committed before the tool judges anything, so the checks
cannot be shaped by which rows they would kill. The same discipline as `EDGE-RESOLUTION-PROTOCOL.md` and
`09-` §E12, and the same reason F22 exists.

## 1. The evidence layer — `tools/fetch-sources.ts`

Every cited URL is fetched **once** and cached verbatim under `artifacts/attestation-cache/`, keyed by a hash
of the URL, with `title`, `body`, **every comment**, author login, `author_association`, GitHub user type,
and the fetch timestamp. The gate reads **only the cache**.

Two properties this buys, both load-bearing:

- **Falsifiable.** Anyone can re-run the checks over the same bytes, or diff the cache against the live
  thread. A gate that re-fetches and keeps nothing proves its verdict only to itself.
- **Complete threads.** A thread is title + body + *all* comments. F51's #4 is only provable as fabrication
  because the string is absent from all four — body and three replies. "Not in the body" is a weaker claim
  that invites *"it's probably in a comment."*

## 2. The checks — A1 … A6

A row **PASSES** only if every check passes. Any failure excludes it from every slice.

### A1 · SOURCE REACHABLE

The cited URL resolves and returns non-empty content. HTTP failure, empty body, or an unsupported URL shape
is a FAIL, never a skip.

### A2 · PHRASING ATTESTED — exact substring modulo ONLY the three declared normalizations

The proposed query passes iff **either**:

- **(a)** whitespace-collapsed, it is a **contiguous substring** of the whitespace-collapsed source text; or
- **(b)** there exists a single source **line or sentence** `s` with `normalize(s) === query`.

`normalize` is exactly, and only:

1. strip a leading label — `bug:` `docs:` `feat:` `fix:` `chore:` `impl:` or `[…]`
2. strip **one** trailing parenthetical
3. strip terminal punctuation
4. collapse whitespace

**Nothing else is licensed.** In particular these all FAIL, by construction:

| operation | F51 row |
|---|---|
| welding two separated sentences into one | #1 `createBaseAccountSDK` |
| deleting words from the middle of a sentence | #9 `innerHandleOp` |
| paraphrase / rewrite | #5 `isAuthorized` |
| adding words (` — migration guide`) | #3 `createCoinbaseWalletSDK` |
| text present in no source at all | #4 `onAccountsChanged` |

Branch (b) is what licenses stripping report scaffolding from a **title**; it operates on one contiguous
unit, so it can never weld. Branch (a) is the strict case and is tried first.

### A3 · SYMBOL IS DEMONSTRABLY THE SUBJECT

The gold id is `project@version::container::member`. All three sub-checks are required.

- **A3a · member named.** The `member` token appears in the source text. Absent ⇒ FAIL `MEMBER-ABSENT`.
- **A3b · container named.** The `container`'s final segment appears in the source text. Absent ⇒ FAIL
  `CONTAINER-ABSENT`.
- **A3c · same-block co-occurrence.** Member and container must co-occur **inside one block** (a
  blank-line-delimited paragraph, or the title). Otherwise FAIL `SUBJECT-NOT-DEMONSTRATED`.

  ⚠ **A3c is the check that decides "demonstrably".** A3a+A3b alone pass a thread that is entirely about
  connector *X* and mentions connector *Y* once, parenthetically, in a different paragraph — which is exactly
  F51's #5. The block is a **structural** unit of the document, chosen for that reason and not tuned: no
  threshold here was selected after seeing which rows it kills.

- **A3d · rival container, reported.** Every *other* container in the corpus that declares the same member
  **and** is named in the source is listed on the row. A rival that co-occurs in the same block as the member
  while the gold's container does not is FAIL `CONTAINER-AMBIGUOUS`.

- **A3e · the QUERY must not ask about a different member.** If the query names a sibling member of the
  gold's container (a corpus fact) and never names the gold's own member, FAIL `QUERY-ASKS-ANOTHER-MEMBER`.

  ⚠ **Added 2026-08-06 AFTER the gate's first run, and the reason is the point.** A3a–A3d all compare the
  gold against the **source**; nothing compared it against the **query**. On the first run the single row
  that passed, of 23, was F51's **#11** — a misbinding the review had already found. Issue #111 is about
  `depositForBurnWithHook`; the gold is plain `depositForBurn`, which the thread happens to mention further
  down, so a source-only check saw a symbol that was present and called it the subject.

  This is not a post-hoc loosening — it closes a **hole**, and the hole was found the only way it could be:
  by the gate disagreeing with a finding it was built to encode. The pass that exposed it is recorded in
  F51 §5 rather than quietly overwritten.

### A4 · SOURCE CLASS

Ruled: *"audit-report prose and agent-generated text are not developer phrasings. The same argument that
excluded 20 NO-SOURCE symbols disqualifies #9 and #10."*

| class | detection — **declared, never inferred from prose** | verdict |
|---|---|---|
| `audit-report` | repo owner is in the declared audit-org list (`code-423n4`, `sherlock-audit`, `spearbit`, `trailofbits`, `consensys-diligence`, `openzeppelin-audits`) | **FAIL** |
| `agent-generated` | body matches a declared signature (`🤖 Generated with`, `Co-Authored-By: Claude`, `[Claude Code]`, `Generated with [Cursor]`) or the author's GitHub user type is `Bot` | **FAIL** |
| `release-note` · `readme` · `doc-file` | the URL shape says so | **FLAG** — reported, not auto-failed |
| `developer-thread` | issue / PR / discussion authored by a human, not in an audit org | pass |

⚠ **The rule is applied UNIFORMLY, so it catches rows the review did not name.** The owner named #9 and #10;
the same list also catches `executeBatch` (code-423n4 #390). Reporting only the two named rows would be
applying a rule by hand — the thing this tool exists to stop.

⚠ `release-note` / `readme` / `doc-file` are **flagged, not failed**: the ruling named audit and agent prose,
and silently extending it would be the mirror error of silently ignoring it. Extending the rule is the
owner's call, and the flag exists so the call is in front of them.

### A5 · WRONG SIDE — per direction, including both-direction reuse

- **A5a · names the twin.** If the query text names the **twin** version, FAIL `NAMES-TWIN`. Applied to the
  final query string per direction, not to the harvested phrasing pool.
- **A5b · both-direction reuse.** If one query text is used in **both** directions of a pair:
  - if it carries a version token, only the direction whose version it names may survive; the other FAILs
    `NAMES-TWIN`;
  - if it carries **no** version token, **both** directions FAIL `CONTRADICTORY-GOLD`.

  ⚠ **This is F51's #10 generalized, and it is the check with the largest blast radius.** One query string
  with two different correct answers and no evidence to choose between them is not a hard test — it is an
  unanswerable one. At least one of the two rows is guaranteed wrong no matter what any retriever does.
### The evidence classes — what counts as "version evidence"

Ruled 2026-08-06. Two classes, and the second was named because the first alone mislabels rows:

| class | example | strength |
|---|---|---|
| **version token** | `CCTP V1:` · `wagmi v3` · `0.7` · `TokenMessengerV2` | the developer's explicit statement |
| **version-bearing identifier** | `minFinalityThreshold` — present in `cctp@v2` and no other version | **presence, not parsing** |

> *"`minFinalityThreshold` as a v2-only identifier IS version evidence — **F39's lesson applied in the
> positive direction: the identifier is the version signal.**"*

F39 recorded the negative form: CCTP puts the version *inside* the container name, so a `\bv2\b`
regex cannot see it. Read forward, the same fact is **stronger** than a token — an identifier that
only ever existed in one version binds it by presence, and cannot be spoofed by someone writing "v2"
in a sentence about v1. `packages/eval/src/version-evidence.ts`, and **Layer 0 binds on it** under
the same no-invention rule.

Two guards, both learned from defects the rule itself produced on its first run:

- **The token must be written as an identifier — an internal capital.** Length is not a substitute
  here: the first run reported `consumed` as evidence, from *"receiveMessage consumed nonce"*. It is
  eight characters and is an identifier in `cctp@v1` only, so every corpus-side check passed.
- **`version-shared` is not a version** — excluded by the standing ruling that already excludes it
  from hard-negative mining: *"shared code is correct for both sides and cannot be a negative for
  either."*

⚠ **The no-invention rule governs it.** A token binds only if the corpus holds it in exactly one
version. **Absence binds nothing** — it never means *"then it must be the new one."*

- **A5c · no version evidence — REPORTED, not failed.** A single-direction row whose query carries no
  version token is flagged `NO-VERSION-EVIDENCE`. Track B clause 4 already governs it (*"with no version
  evidence the predicate must not fire and the arm scores on Track A"*), so failing it here would be a
  second, unruled gate.

### A6 · GRADE SHAPE

- exactly one grade-2 id, at least one grade-1 id;
- the grade-2 id's `project@version` is the **asked** side; every grade-1 id's is the **twin** side;
- **every graded id exists in the corpus** — a gold that names no unit cannot be retrieved by anything.

### The version-token recogniser

`VERSION_TOKEN` must recognise a **bare major** (`v1` … `v9`), a dotted version (`0.7`, `2.11.2`), and a
version fused to an identifier (`TokenMessengerV2`). The recogniser this replaces could not see `v3` or
`v4` — in a slice whose headline pair is **wagmi@3 ⇄ wagmi@2**. F51 §3 records it.

## 3. Grade 1 never earns credit — enforced, not documented

Ruled: *"the twin NEVER earns positive relevance credit in any scorer — it exists solely as the intrusion
marker; recall/nDCG compute over grade-2 only."*

Enforced in `packages/eval/src/relevance.ts` as the single function every scorer must call, with a test that
fails if a grade of `1` ever produces non-zero gain. A rule that lives in a comment is the thing F51 is about.

## 4. Rendering

Graded ids render **in full, with their `project@version` prefix, always.** The sheet under review stripped
the prefix, so `grade 2` and `grade 1` printed as identical strings on 17 of 23 rows — leaving a reviewer
unable to check the one dimension the slice exists to test.

## 5b. The lock — `hard-negative` v1.0, 2026-08-06

> *"LOCK: hard-negative v1.0 = the 3 surviving rows, LOCKED as of today. **Real and verified beats
> large and synthetic.**"*

`artifacts/slice-hard-negative-LOCKED.json`, emitted by `tools/lock-slice.ts`, which refuses to lock
any row the gate report does not list as passing. Three conditions ride with it.

### (a) The minimum-n rule — pre-registered before any new row exists

No gate verdict may be issued below the eligible-n at which the launch gate's MDE ≤ 10pp.
`packages/eval/src/power.ts` · `minimumN()`. Below it the harness prints **⊘ NO VERDICT** and reports
descriptively. **D17.**

The shape was registered while n is far below any plausible bar, so the number cannot have been
picked to clear. It is derived at the variance-maximising baseline `p = 0.5` — the only baseline that
can never understate the requirement.

⚠ **`n = 68` is also below this floor.** The Track-B PASS recorded in F50 stays in the record as
issued; under this rule it is not re-issuable.

### (b) This slice tests RANKING, not SCOPING

> Carried in the locked artifact itself, not only here — a caveat that lives apart from its number
> is a caveat that gets separated from it.

**Two of the three locked rows carry no version token.** On those the predicate must not fire (Track B
clause 4) and the arm scores on Track A. A hard-negative slice that mostly cannot bind a version
tests **ranking, not scoping** — stated in the protocol and in `_meta.scope_caveat`, so it can never
surface for the first time in a result table.

### (c) The slice grows ONLY through the gate

Attested phrasing · cached source bytes · tool-verified · **a dated amendment per addition** in
`_meta.amendments`. A row present in the locked file with no corresponding amendment entry is a lock
violation.

## 5c. The verification loop ran against the curator, and the curator conceded

Row **#7** was cleared by the review and **failed the tool**: `_validateSignature` appears nowhere in
issue #263 — not the title, not the body, not the comment — and no corpus container declaring
`validateUserOp` at both 0.7 and 0.8 is named in the thread. A3a is a check the review's three
questions did not include. It was reported as a refusal with evidence rather than quietly kept or
quietly dropped, and the ruling that followed was:

> *"#7 — **CONCEDED on the bytes.** A3a caught a check my review didn't include; the
> refusal-with-evidence is exactly the norm. Record that the verification loop ran against the
> curator and the curator conceded — **that symmetry is load-bearing for the eval's credibility.**"*

⚠ **Why it is recorded here and not left as a pleasantry.** An eval whose checks only ever run
downward — tool checks harvest, curator checks tool — has one unexamined node left, and it is the one
with the authority to overrule. This gate ran *upward* once and the finding held. That is the only
evidence available that the process is not simply deference wearing a checklist, and it is worth more
to the eval's credibility than any single row.

## 5. What a PASS does and does not mean

A PASS means: the phrasing is in that source, the gold's symbol is the subject of that source, the source is
a developer thread, the direction is not the twin's, and the grades are shaped and resolvable.

It does **not** mean the row is a good eval item. Difficulty, realism and coverage stay the curator's
judgement. The tool removes the failures that are *checkable*, so review attention goes to the ones that
are not.
