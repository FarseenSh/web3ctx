# Verification protocol — how a claim about the live system earns the word "verified"

**Established 2026-08-13**, from three defects that each produced a *correct-looking verification
of the wrong thing*. Every rule here is a rule because skipping it printed a green line.

This is the house method, written down. It applies to every probe, gate and measurement that
talks to a deployed endpoint or a loaded database.

---

## Rule 1 — verify by response body, never by exit code

A `200` carrying `"No matching units."` is a perfectly healthy HTTP response and a total
product failure. A load script that hits a network error **while exiting 0** leaves the index
dropped. `reset-d1`'s own header said it first:

> **Verify with `COUNT(*)`, never with the exit code.**

---

## Rule 2 — first confirm the deployment you are probing is the one serving

⚠ **New, and the L0 cache is the reason.** After deploying the D1/D2/D3 fixes, the flagship CCTP
query **still returned the pre-fix answer** — `version: "3.0.2"`, with the old `explanation`
string. The fix was live and not served, for five minutes, because the L0 KV cache keyed on
`(tool, args, budget, variant)` and **not on the deployed code**.

> **A body served from a pre-deploy cache is evidence about the old code wearing the new
> deployment's URL.**

The cost is not staleness — it is that **Rule 1 stops working**. A probe run in that window
reports a false failure; a probe of an already-fixed path in that window reports a **false
pass**, which is worse because nobody investigates a pass.

**Therefore:** before trusting any post-deploy measurement, establish that the code under test
is the code answering. In order of preference:

1. **Make it structural.** The cache key now carries `CF_VERSION_METADATA.id`, so a deploy
   invalidates by construction. This is the only durable answer; the rest are fallbacks.
2. **Read back something only the new code emits** — a changed field, a changed explanation
   string. This is how the stale cache was caught at all.
3. **Never** "wait a bit and re-run". Cache age must not be a variable in whether a check passes.

---

## Rule 3 — a refusal is not a negative measurement

`isError: true` on HTTP 200 is a **refusal**: rate limit, invalid input, internal error. It
carries no results array. A tool that reads *"no results"* as *"nothing exists"* will publish
the refusal as a finding.

**Measured (F66):** the shakedown ran after the recipe probe, crossed the authless rate budget
(`search` costs 2 units against 60/minute), and printed **six coverage gaps that do not exist** —
including a project that returns ten units on demand.

> *"We looked and there is nothing"* and *"we never looked"* are opposite facts.

**Therefore:** every probe distinguishes **refused · empty · answered**. `RATE_LIMITED` retries
on the server's own `retry_after_seconds`; any other refusal **throws**. Shared implementation:
`tools/mcp-call.ts` — one place, because this failed twice in two different tools.

---

## Rule 4 — a tool's own denominator is a measurement, and it can be wrong

Two probes in one cycle were confidently wrong about the *set they were measuring against*:

- one inferred a project roster from **ranked top-50 `grep` hits** — ranked retrieval returns the
  *best* matches, never the *set*, so it reported `cctp` as absent in the same table row where
  ten cctp units appear;
- the other let refusals shrink the roster (Rule 3).

> **A measurement tool that can be confidently wrong about its own denominator is worse than no
> denominator**, because the number it prints looks like a finding.

**Therefore:** a denominator is derived from a source that has a *definite* answer — an explicit
scoped query, a `COUNT(*)`, a locked artifact — never from a ranked or approximate one.

---

## Rule 5 — every new check is falsified against known-broken code before it is trusted

**R4, ruled 2026-08-13.**

> **A check that has never failed has not been tested; it has been written.**

Revert the fix, run the check, watch it fail, restore. Record the failing counts in the
measurement. Five checks in one cycle would have shipped green while the thing they guarded was
broken:

| check | why it could not fail |
|---|---|
| the alias regex | `[^}]*` cannot cross the `}` closing the first property |
| invariant 2's first draft | passed `project` on every case → only entered the arm that worked |
| the shakedown scorer | graded any non-empty payload green |
| the roster probe | inferred a set from ranked hits |
| the roster probe, again | scored a rate-limit refusal as absence |

⚠ **A vacuous test is worse than no test**: it occupies the slot where the real check would go,
and it reports green.

---

## Rule 6 — state which half is which

A run that calls itself "remote" while its bodies come from a local object store claims more
than it shows. A demo that reports wall-clock from a `wrangler` subprocess is not reporting
latency. **Name the arm on every number**, and say what was not measured.

---

## Rule 7 — a schema change enumerates its checkers

F30/F40, F37, F46 are one fault in three places, and each kept returning a confident number
afterwards. When the meaning of a row changes, every checker that counts that row is part of the
change.

⭐ And when a checker *does* fire, **check that its report agrees with its verdict**: after the
D2 fix, `validate-load` printed `31 vs 37 ✘` directly above `✔ All invariants hold`, because the
table read one field and the check read another.

---

## Rule 2a — deployment propagation is a second way to probe the wrong code

⚠ **Added 2026-08-13, after Rule 2's fix did not cover it.** Seconds after a deploy, the same
query returned **"no scoping evidence"**; minutes later, with no code change, it returned the
correct family-scoped answer.

It was **not** the L0 cache — that key now carries `CF_VERSION_METADATA.id`, so a response
cached under the new version would have stayed wrong rather than healing. It was **an edge
location still running the previous version.**

> The cache fix handles *our* cache. It does not handle Cloudflare's global rollout.

**Therefore — ruled A2(a), 2026-08-13: post-deploy verification is N probes across time.** A
single probe is not evidence. Re-probe until consecutive runs agree, or read back something
version-identifying.

⚠ **A probe that passes on the first try is not exempt.** It may have hit an edge whose *old*
code also passed — and the asymmetry is the trap: a false failure gets investigated, a false pass
gets published.

---

## Rule 8 — a score is not a result without its composition

**A2(b), ruled 2026-08-13.**

> **7/7 before R1 and 7/7 after are different facts.**

The shakedown scored **7/7 on-target** before the scoping rulings and **7/7 after**. The same
number, and not the same result:

| | before R1 | after D1–D4 |
|---|---|---|
| `erc-4626` answered from | `[1inch, erc-20, openzeppelin-contracts, viem, zksync]` | its own validated recipe |
| `reown` answered from | `[wagmi]` — including wagmi's signed recipe | its own validated recipe |
| recipes served | 3 | 5 |

A reader given only *"7/7"* would conclude the rulings changed nothing. A reader given the
composition can see that one of those sevens was three wrong answers wearing a passing grade.

**Therefore:** every score this project reports carries **what it was made of** — the
denominator, the per-row composition, and what moved. This is the same principle as the
intrusion-rate rule (*"the bare conditional rate is self-selecting and incomparable"*) and D17's
MDE-with-every-verdict, generalised: **a number without its composition is not comparable to
itself across time.**

---

## Rule 9 — a coverage check on a keyed surface must ask for something that CANNOT exist

**Ruled 2026-08-15, after `web3_lookup kind=address` shipped a mainnet address for every name a
caller could type, including names that denote nothing.**

`handleLookup` called `deployment(project ?? id, chain, version)`. With `project` supplied the
caller's `id` was **discarded**, and the store had no parameter to receive it. Instrumented, the
query was:

```sql
SELECT ... FROM deployments WHERE project_id = ? LIMIT 1     -- params: ['cctp']
```

```
id=TokenMessengerV2     -> message_transmitter_v2   0x81D4…
id=MessageTransmitterV2 -> message_transmitter_v2   0x81D4…
id=Foo                  -> message_transmitter_v2   0x81D4…
id=ZZZnonexistent       -> message_transmitter_v2   0x81D4…
```

A caller asking for **TokenMessengerV2 received MessageTransmitter's address**. A caller asking
for a contract that **does not exist received an address anyway** — carrying `last_validated` and
`source_url: recipe:cctp/usdc-bridge-send.yaml`, the strongest trust signals we have, on a
mainnet address that moves money. **Fabrication with provenance attached**, from the surface
`06-` §4.4 calls the highest-precision one we own.

### How it survived is the rule

**F-4 graded that surface green for two days**, because F-4 asked only *whether a record came
back*. Every id it tried was an id the corpus held, so every call returned something, and
"returns something" was the whole test.

> **A checker that only asks for things that do exist cannot distinguish a working index from a
> constant.**

The defect is not reachable by any amount of care in choosing *positive* cases. It is reachable
only by asking a question that can fail.

### The rule

**Every coverage check on a keyed surface asks for a key that cannot exist and REQUIRES a miss.**
A surface counts as covering a key only when it does both:

1. **hits on a real key — and returns the record for THAT key**, not merely a record; and
2. **misses on an impossible one.**

Corollaries, each earned here:

- **The nonsense key is shaped like a real one.** `ZZZnonexistentContract`, not `!!!` — obvious
  junk can be rejected by input validation and never reach the query, which measures the schema
  and not the index.
- **A hit is checked against what was asked**, allowing only the notation transform the write
  side uses (`TokenMessengerV2` ⇄ `token_messenger_v2`) and nothing looser.
- **Re-derive any score that predates this.** F-4 read `address 5/14` under the old bar and
  **`2/14`** under this one: three projects were counted as answering while returning a record
  that did not match the name asked. ⚠ **Both flattering denominators were mine, one underneath
  the other** — the first was a hand-written list of which projects to ask about, the second was
  grading on `found: true`.

**This is the second time in one week a check passed by never asking the question that could
fail** (the first: the shakedown coalescing a refused read to `0` and reporting GREEN). Both were
instruments, not product code, and both reported success while blind.

---

## Rule 10 — a field naming an OUTCOME must be computed AFTER the outcome exists

**Ruled 2026-08-15, after the cost alarm reported `delivered: "webhook"` for a message that was
never delivered.**

```ts
delivered: env.ALERT_WEBHOOK === undefined ? 'log-only' : 'webhook',   // line 151
console.log(JSON.stringify(line));                                     // line 153 — logged HERE
await fetch(env.ALERT_WEBHOOK, { … });                                 // line 157 — attempted HERE
catch (error) { … }                                                    // line 167 — only on THROW
```

`delivered` was computed from whether the **secret was defined**, printed **before the POST
existed**, and the `catch` could not see a rejection because **an HTTP 4xx/5xx does not throw**.
The sink received nothing. The log said `delivered: "webhook" · 0 delivery failures`.

**It was a claim about CONFIGURATION wearing the word *delivered*.** Worse here than anywhere
else the shape has appeared, because **this is the one component whose entire job is to tell you
something went wrong, and it could not tell you it had failed.**

The measured cause, once the reporting was fixed — printed, not guessed:

```json
{"at":"cost-alarm-delivery","ok":false,"status":429,
 "body":"{\"code\":42908,\"error\":\"limit reached: daily message quota reached…\"}"}
```

### The rule

**A field naming an outcome is computed after the outcome exists.** `delivered`, `written`,
`uploaded`, `verified`, `applied`, `ok`, `sent` — each names a thing that happened, so each is
derived from the result, never from the intent, the configuration, or the fact that a call was
made.

Corollaries:
- **A non-throwing failure is still a failure.** `fetch` resolves on 4xx/5xx; a `catch`-only
  error path reports success for every rejection.
- **Keep the swallow, lose the silence.** A failed alert must not fail the request it describes —
  and must be its own loud log line with the status and the sink's own words.
- **Split the line when the outcome is not yet known.** Emit the event immediately with a field
  that is true *now* (`webhook: 'configured'` — a fact about the secret), and the outcome in a
  second line after it resolves. The signal survives an isolate death; nothing is asserted early.

### The sweep this ruling required

Every site logging or asserting `delivered / written / uploaded / verified / applied / sent /
ok`, checked for whether the value is computed **before** the operation it names — **14 sites**:

| site | verdict |
|---|---|
| `apps/mcp/telemetry.ts` `delivered` | 🔴 **the defect** — fixed, split into two lines |
| `apps/mcp/index.ts` health `ok` | 🔴 **found by this sweep** — `ok: true` was set at the top and only falsified by a `catch`, so a database answering **zero** to every query reported healthy. That is exactly what `lexical_scope_rows` was added to catch (F61). Now computed from the readings |
| `tools/load-r2.ts` `totals.written` | ✔ incremented inside `.then()` after the put resolves |
| `tools/load-bodies.ts` `written` | ✔ after `writeFileSync`, which throws |
| `tools/load-recipes.ts` `uploaded` | ✔ after the wrangler call — **and already followed by a read-back**, with the distinction written down |
| `apps/bench` `written` | ✔ after `await env.BODIES.put(…)` |
| `tools/fetch-abis.ts` `written` | ✔ read from the server's response |
| `tools/verify-version-labels.ts` `verified` | ✔ a classification over completed work |
| remaining 6 | ✔ local counters over completed operations |

**Twelve correct, two wrong, and one of the two was found only because the sweep ran.** "Checked,
correct" is printed for the twelve: a sweep that only reports what it finds cannot be told apart
from one that did not run.

**This is the fourth instrument this week reporting an intention as an outcome** — the R2 identity
line comparing units *read* to the manifest while blind to the bucket, `verify-session`'s A1
counting calls, `load-r2` piped through `tail` exiting 0, and this. Rule 9 is its sibling: that
one is about asking a question that can fail, this one is about not answering before the answer
exists.

---

## Rule 11 — *changed* and *worse* are different facts

**Ruled 2026-08-15, from the R-O grep-cost fix.**

Three ways of building the same query were compared on 20 real identifier queries. Two of them
**changed the top-10 rowids** — on 8 and 14 of the 20. Read as *"the results changed"*, that is a
retrieval regression and the cost fix dies there.

It is not what happened. Measured against a relevance property rather than an identity one — **is
the returned unit one that actually declares the identifier the caller typed** — every arm scored
**196/200 (98%)**:

| arm | rows scored | top-10 changed | **on-target** |
|---|---|---|---|
| today | 419,220 | — | **196/200** |
| drop frequent subtokens | 178,350 (−57%) | 8/20 | **196/200** |
| **narrow-first** | **44,538 (−89%)** | 14/20 | **196/200** |

The rows that moved were **interchangeable on-target hits** — BM25 reshuffling among rows that
all match the symbol. **Nothing got worse; things got cheaper.** Comparing identity would have
rejected an 89% cost reduction that costs nothing.

### The rule

**A comparison that shows a change must then ask whether the change is a LOSS.** Diffing outputs
answers *did it change*; only a property tied to what the surface is FOR answers *did it get
worse*. State which one was measured.

Corollaries:

- **Name the property before running the arms.** Here it was fixed by what `grep` is: the exact
  identifier surface, so a hit is on-target when the unit declares that identifier. Choosing the
  property after seeing which arm wins is F22.
- **A cost fix that changes results is not automatically a trade.** It is a trade only if the
  changed results are worse, and that is a separate measurement most cost fixes never run.
- **The inverse is the same error.** An unchanged output does not prove nothing broke — the
  shakedown scored 7/7 before and after R1 while three of the seven were wrong answers (rule 8).

⚠ **This is rule 8's sibling.** Rule 8 says a number needs its composition to be comparable to
itself across time; rule 11 says a *difference* needs a property to be interpretable at all.

---

## Rule 12 — a true number in the wrong unit is not a reported number

**Ruled 2026-08-16, from R-P.** Rule 8's sibling for prose: rule 8 says a *statistic* needs its
composition; this says a *sentence* needs a unit the reader can act in.

`tools/rate-headroom.ts` ended every run with:

> **`✔ DAILY: 111 tasks/day is a full working day for a small team`**

**111 tasks/day is correct.** At the measured 2 minutes per task it is also **3.7 hours of ONE
developer's agent running back to back** — not a team's day. Same number, two framings, and only
one of them lets a reader see that five developers on one NAT are locked out in ~45 minutes.

The failure is not arithmetic. It is that the number was published **in the unit that made it
comfortable** rather than the unit the reader's decision is made in.

### The rule

**A reported number carries the unit the reader must act in.** Where two units are both true,
print the one that constrains — or print both. Never only the flattering one.

Corollaries, each earned:

- **"True but unusable" is a defect.** `retry_after_seconds=75761` is exactly right and tells a
  human nothing; `19.3 hours` is the same fact in an actionable unit (R-S). Machine-readable and
  human-readable are two audiences, and one message can serve both.
- **A ceiling expressed as capacity hides a ceiling expressed as time.** *"2,000 units/day"* and
  *"~45 minutes for a five-person office"* are the same constraint; only the second is a finding.
- **Watch for the unit that flatters.** If one framing makes the result sound fine and another
  makes it sound urgent, that asymmetry is the signal, not the tiebreak.

⚠ **This is not a licence to alarm.** R-U's answer went the other way — 2,000/day costs **0.378%**
of the included monthly reads, and *"265 IPs, every day, for a month"* is the actionable unit
there. The rule is to reach for the unit the decision is made in, whichever direction it points.

---

## Rule 13 — an instrument does not spend the product's public budget

**Ruled 2026-08-18 (owner), as a standing rule.**

> *"Internal CONTENT probes run on `/mcp/oauth` (20,000/day; the tier changes limits, never
> payloads — verified when the tier was built). The authless budget is a product control, not an
> instrument budget; it is why our own row went missing from the orchestrator's four-arm
> OpenZeppelin probe. Stranger-shaped and rate-limit tests stay authless."*

### Why it is a rule and not a preference

The authless 2,000/day ceiling exists to **bound the bill on a public URL** (`11-` §2's `$134`
incident). It was never sized for our own instruments, and R-P measured what happens when it is
used as one: **one full verification pass is 562 units — 28% of an IP's entire day**, three passes
exhaust it, and everything downstream then reports refusals.

The cost is not inconvenience. It is **missing measurements that read as results**:

- the orchestrator's four-arm OpenZeppelin probe ran with **web3ctx rate-limited** — our own row
  MISSING, not passed, in a table whose other three arms answered;
- `probe-lookup-miss` scored **20 refusals as 20 wrong answers**;
- `verify-session` printed **nothing at all** on its first refusal;
- the W1 precision live arm was **⊘ UNMEASURED for two days**.

Every one is F66 wearing a different mask, and every one was *caused* by an instrument charging the
product's control.

### The split

| probe measures… | route | budget |
|---|---|---|
| **content** — what the corpus answers, payload shape, citations, recipes | **`/mcp/oauth`** | 20,000/day, keyed by GitHub user id |
| **what a stranger experiences** — first contact, refusal copy, unauthenticated reach | `/mcp` | 2,000/day, keyed by IP |
| **the limiter itself** — headroom, refusal timing, concurrency ceilings | `/mcp` | the control is the subject; measuring it elsewhere measures nothing |

⚠ **The tier changes limits, never payloads.** Both routes run the same handler, so a content
measurement is not made on a different product — and that is checkable rather than asserted,
because the same question on both routes must return the same payload.

### The mechanism

`tools/mcp-call.ts` takes `route: 'free' | 'oauth'` and reads `W3CTX_OAUTH_TOKEN` from the
environment. ⚠ **`route: 'oauth'` with no token THROWS; it does not fall back.** A silent downgrade
would spend the public budget while appearing to honour the rule — the failure mode the rule
exists to stop, with a friendlier face. The spend meter now **names which budget it charged**,
because a percentage without its denominator is rule 12's error (`28% of a day` means two different
things at 2,000 and 20,000).

🔴 **Standing blocker, stated rather than worked around:** the token requires **one interactive
GitHub sign-in**, which is the owner's to perform — this server discards the GitHub token
immediately, so an agent typing a password would contradict the property under test. Until
`W3CTX_OAUTH_TOKEN` is exported, content probes either do not run or run authless **with the
departure declared and the spend printed** (D14: the invariant — *do not silently exhaust the
public control* — outranks the wording, and the departure is stated, never absorbed).

---

## R-W · R-X — owner rulings, 2026-08-18. Recorded as dated amendments.

### R-W — LAUNCH DEFERRED. No thread date, no freeze.

**R-L's hold is LIFTED.** Wave-2 sub-batches **2–4 (201,178 units, 39 projects)** load **one
sub-batch at a time**, under sub-batch 1's discipline, unchanged:

1. `validate-load` at **both** endpoints — a relation has two ends and a gate inspecting one is half
   a gate;
2. a **per-batch shakedown** — R-H's between-batch measurement is what would catch the damage;
3. **R-G decomposed counts** — the project total never publishes undecomposed;
4. **bodies sampled in R2** — a citation whose body does not resolve is a citation to nothing (F59).

⚠ **The F-1…F-9 floor is still the launch bar.** Deferring the date does not lower it. **F-8
(launch-numbers) binds to the real ship day, whenever that is** — today's run was a **drift
rehearsal only** and must not be read as the ship-day measurement.

### R-X — POSITIONING: recipes-first. Golden rule 7 reaffirmed.

> *"All future copy presents the product as human-validated, chain-run, version-true recipes with
> re-fetchable citations; corpus exists to make recipes reachable. Never 'better retriever', never
> token claims. Growth axis: recipes toward 50; corpus breadth follows recipes."*

**What this forbids, concretely, and each already has a measurement behind it:**

| forbidden | why it was already indefensible |
|---|---|
| *"better retriever"* | golden rule 7 has always said the moat is recipes + freshness + trust, **not** the retriever |
| any **token** claim | M-A measured us at **~2.4×** Context7's payload; M-B at **~3.5×** per completed task. Both against us |
| any **precision** claim in launch copy | W1's 82–91% is **not on CodeGrep's scale** (§2 of `W1-PRECISION-RESULT-2026-08-16.md`) and is locked out of the thread by the 2026-08-18 quoting lock |
| *"faster"* | latency is single-vantage and an internal SLO |

⭐ **The 2026-08-18 OpenZeppelin probe is R-X's evidence, arriving the same day.** A question with
**no recipe** fell through to units and came back with a **LICENSE file** — while the corpus held
the correct unit (`ERC20::_update`). **Corpus breadth did not answer it; a recipe would have.**
That is the ordering the ruling states, measured rather than asserted.

**Growth axis: recipes toward 50** (20 stamped today). **Corpus breadth follows recipes** — which is
why wave 2 loads under R-W, and does not become the headline.

### R-W / R-X reconciliation — owner, 2026-08-18

> **R-W was an explicit owner override for the already-held wave-2 units; R-X governs growth beyond
> 714 and copy. No ingest beyond 714 without a recipe-driven reason.**

⚠ This closes the tension flagged when wave 2 loaded (39 projects, 0 recipes). It is not a
retro-justification: wave 2 was **already-held** work completing under an override, and the growth
rule binds from 714 onward. **A project enters the corpus from here because a recipe needs it.**

### Rule 13a — the instrument token refreshes itself. Ruled 2026-08-18.

**A 3600 s bearer puts the owner's interactive GitHub click on every probe day**, which makes rule 13
aspirational rather than operable. The grant already issues a refresh token; storing and exchanging
it is what closes that.

**Mechanism** (`tools/mcp-call.ts`): the refresh token and a stated `expires_at` live in the same
`0600` file, **outside the repository**. `route: 'oauth'` refreshes **proactively** within 60 s of
stated expiry, and **reactively** on a `401` — retrying **exactly once**, because a refresh loop
against a rejecting AS is a hang, not a recovery. Rotation-safe: a new refresh token from the AS
replaces the old one, since keeping the old would work once and fail on the next probe day.

🔴 **There is no silent downgrade anywhere in this path.** A failed refresh **throws**, names the
failure, and prints the re-mint instruction. Falling back to `/mcp` would spend the exact budget
rule 13 protects while printing nothing to say so — the failure the rule exists to prevent, wearing
the face of resilience.

**Falsified both ways before it was trusted** (`tools/test/oauth-refresh.spec.ts`, 5 tests, against a
**real local HTTP server** rather than a mocked `fetch` — a mock proves the code calls a function, a
server proves it speaks the protocol):

| break | result |
|---|---|
| remove the proactive refresh | **2 fail** |
| remove the reactive `401` refresh | **1 fail** |
| downgrade instead of throwing on refresh failure | **1 fail** |
| keep the OLD refresh token (rotation-unsafe) | **1 fail** |
| write the file `0644` instead of `0600` | **1 fail** |

✅ **THE LIVE WIRING IS MEASURED — 2026-08-18, after the owner re-minted.** The standing ⊘ is
discharged, and the evidence is the rewritten stamp rather than a claim that it worked:

| | |
|---|---|
| stored `expires_at` | `1787048178` |
| **forced to** | `1787044818` — now + 30 s, inside the 60 s skew |
| **rewritten by the refresh** | **`1787048389` — +3,571 s** |
| the probe | `web3_lookup kind=eip id=4626` → **`found: true`** |

⭐ **+3,571 s and not +3,600 s is the detail that makes it evidence.** The AS issues `expires_in:
3600`; the ~29 s shortfall is the round trip plus the write. A number that came out *exactly* 3,600
would be consistent with a constant computed locally — this one could only come from a reply.

⚠ **What was verified BEFORE the mint, and stays verified:** the five falsifications against a local
AS. What the live run adds is that **our** authorization server accepts `grant_type=refresh_token`
for **our** client, and that `mcp-call` reads the reply it actually sends. Those are different
claims and both are now measured.

**And the way it becomes measured — ruled 2026-08-18, one command:** `node tools/verify-refresh-live.ts`
rewrites `expires_at` to **now + 30 s** (inside the 60 s skew), fires **one** oauth probe, and reports
the **rewritten `expires_at`** as the evidence. That value is *the only externally-visible proof the
exchange happened* — it can move forward only if the AS returned a fresh `expires_in` — and it lets
the token itself stay unprinted.

⚠ **Forcing the stored expiry earlier is a claim about when WE refresh, not about when the AS stops
accepting the bearer.** So the measurement costs nothing if it fails, and a one-hour wait that nobody
would actually sit through is replaced by a thirty-second one that proves the same thing.

⚠ **It refuses on the pre-refresh file format** rather than guessing: a token file with no
`W3CTX_OAUTH_EXPIRES_AT` predates rule 13a, and *an absent field and a stale field are different
facts*. **The owner's existing file is that older format**, so the first mint after this ruling is
what enables the check.

⚠ `W3CTX_TOKEN_FILE` overrides the path **for tests only**. Without it the refresh path could be
exercised only against the live AS and the operator's real credential — *a refresh path that can
only be tested in production is one that will be tested in production.*

---

## R-Y — THE RETRIEVAL-SIDE OZ-CLASS WORK IS CLOSED. Owner ruling, 2026-08-19.

🔵 **PINNED, QUOTABLE, THREE LINES — quote these or none:**

> 1. **Expansion failed on INERTNESS.** The model ran; prose recall moved **+0.00pp** against a
>    +2.00pp bar with **MDE 6.15pp at n=788**. **It did not fail on intrusion** — that clause
>    **passed at −0.03pp**, descriptive only. *It did not pollute the index; it did nothing, at cost.*
> 2. **Demotion failed on POPULATION.** The mechanism worked exactly as specified — **7 of 7**
>    inert units evicted — on **2.6%** of queries, for **+0.1pp**. The anchor's own payload holds
>    **zero** inert units, so the proposal could never reach its own trigger.
> 3. **The W1 seam (dense / late-interaction) stays GATED, exactly as it always was.** It is the
>    only retrieval-side candidate left and nothing about its gate changed.

**The standing answer is R-X: recipe coverage.** The OZ question had no OpenZeppelin recipe, fell
through to units, and the corpus answered with repo front matter. *The recipe is the product; the
corpus exists to make recipes reachable.*

🔴 **No new retrieval proposal without a new owner ruling.** Not `expansion_code`, not a reranker,
not a new arm. **The anchor keeps the case** — `tools/lib/oz-regression.ts` runs with every
shakedown, writes a byte-exact baseline, and never fails a build. A case held open by an instrument
does not need a proposal held open beside it.

⭐ **What the two failures share, worth carrying:** each was refuted by a constraint **inside its
own pre-registration** — expansion by P2 (prose-only; the target is a code unit), demotion by the
permanent README exclusion (the trigger's boilerplate is README-class). **Both were derivable before
either ran.** The pre-registration is not only a defence against moving the bar afterwards; it is a
document that can be read for contradictions *before* the cost is spent, and neither of these was.

---

## STEADY STATE — the operating posture from 2026-08-19 until the owner's next recipe or ruling

| # | rule | enforcement |
|---|---|---|
| 1 | **All instruments on the elevated route; the authless budget is untouched by us** | `DEFAULT_ROUTE = 'oauth'` in `tools/mcp-call.ts` — the **default flipped**, not each call site edited, so an instrument written tomorrow is covered without anyone remembering. `tools/test/instrument-route.spec.ts` **enumerates** `tools/` and fails on any undeclared authless call site or raw `/mcp` fetch |
| 2 | **No stale 675-era line can be quoted** | `SHIP-DAY-READINESS.md` regenerated against the 714-project corpus with a supersession banner; `launch-numbers` prints the pair **104 + 610 = 714** from live D1 |
| 3 | **Ingest only recipe-driven** | the recorded reconciliation: *"R-W was an explicit owner override for the already-held wave-2 units; R-X governs growth beyond 714 and copy. **No ingest beyond 714 without a recipe-driven reason.**"* |
| 4 | **No speculative work** | next work arrives with the owner's next recipe or ruling |

⚠ **Rule 1 RECONCILES the earlier carve-out rather than dropping it.** *"Stranger-shaped tests stay
authless"* described the **query**, not the **route**: the shakedown is stranger-shaped because it
sends no project, no version and no manifest, and that property is untouched by which route carries
it — **the tier changes limits, never payloads.** What must still be authless is a test whose
**subject** is the free surface, and each one now says so in its own header with `AUTHLESS-BY-SUBJECT:`:

| instrument | why it stays authless |
|---|---|
| `probe-ratelimit.ts` | the limiter **is** the measurement |
| `verify-session.ts` (claim A1 only, `--with-a1`) | reads the authless minute budget out of the server's own refusal |
| `probe-deployment.ts` | the claim is that the **credential-less** surface answers — the adoption thesis |
| `probe-latency.ts` | ⚠ the number **is** the public path's latency; `/mcp/oauth` adds token validation and would report a different quantity under the same name (rule 12). **The one instrument where the subject and rule 1 genuinely pull apart — flagged, not silently kept** |
| `payload-audit.ts` | every other arm is called on its own public endpoint; a credential no competitor needs would make our row non-comparable |

---

## R-Z — THE TOKEN-SIDE TRILOGY IS CLOSED. Owner ruling, 2026-08-19.

🔵 **PINNED, QUOTABLE — quote this or none:**

> **The token cost is STRUCTURAL to the bodies rule.** Selectors-not-bodies buys integrity and
> costs **~3.5×**, and **no packaging trick removes it.** Three were tried and three failed:
>
> 1. **C1 — inline bodies under a threshold.** 🔴 **REJECTED by its gates, 2026-08-13.** It bought
>    fewer round trips by making each response fatter: completion 8/12 → 7/12 and tokens per
>    completed task **94,559 → 123,192**. It improved the linear factor and **multiplied the
>    quadratic one.**
> 2. **C2 — content-hash dedupe.** 🔴 **FAILED ITS BAR, 2026-08-19: 4.7% cumulative against a
>    pre-registered ≥15%.** Every structural clause held; it did not break anything and did not
>    earn enough. **Doubly dead** — production issues no `mcp-session-id`, so under C2's own scope
>    constraint it could not have fired on the deployed transport at any bar.
> 3. **Batched lookup — DECLINED on its own pre-registration.** It does not fit the 600-token
>    surface (590 today, +12 minimum) without degrading a self-describing schema; the per-id
>    pricing rule prices it into irrelevance; and **it does not touch the dominant term by
>    construction.**

**The dominant term is the per-turn RE-SEND, not the payload.** C2 is the only one of the three that
attacked it directly, and 4.7% is what a correct implementation of that idea is worth here.

**The standing posture:**

| | |
|---|---|
| positioning | **cents per task, never "cheaper"** — already locked under R-X |
| the real lever | **the caller's own prompt cache**, which is theirs and not ours to spend |
| future attacks | 🔴 **A DESIGN CHANGE TO THE BODIES RULE, requiring an owner ruling.** Not a tweak. Not off `n=1`. Not a fourth packaging candidate |

⚠ **`maxItems` was NOT dropped and the 600-token budget was NOT raised.** Both were the tempting
price of fitting batched lookup, and both were refused.

🔒 **`web3_fetch`'s per-call price for 5 selectors is ruled CONSISTENT**, and the reason now lives
beside `TOOL_COST` where the next person to add a batched argument will read it: **a batch is priced
per item unless its width is capped in the registered schema.** `fetch`'s width is capped at 5 by
the schema the client can see, so one price bounds a known worst case.

⚠ **M-B is NOT re-run** — it would price a change that is not shipping. **The instrumentation it
lacked is added today**: `toolCallsByName` on every arm-run, falsified, so whenever M-B next runs it
records what the 2026-08-13 run could not. **A count is not a composition**, and the batched-lookup
prediction could only be bounded (`6.5 → between 4.5 and 6.5`) because the artifact held only the
aggregate.

🔴 **And a near miss found while falsifying that instrumentation:** a `--dry` run **overwrote the
paid run's checkpoint** — 711 insertions of stub rows over a real $6.64 artifact — recovered from
git. **A $0 run must not be able to write over a $6.64 one.** The checkpoint is now per mode, with a
test that fails if the paths are collapsed. Same class as the payload audit destroying seven
measured payloads and the OZ anchor overwriting its own baseline.


---

## R-AB — THE RECIPE-BODY RESIDUAL IS CLOSED BY CONVENTION, NOT BY THE SERVER. (Ruled 2026-08-20.)

🔵 **Pinned, quotable — quote this or none:**

> **F72 is the third packaging attempt to fail its own gate, and the residual is not a serving
> problem.** Section-select flipped both anchors it was written for and lost the OZ twin, so it
> **does not ship**. The 15–27% of a recipe that reaches a caller closes **post-launch, by CURATOR
> CONVENTION for FUTURE recipes: operative content first** — the examples-first canon applied to
> recipe bodies. **The 24 stamped recipes are NOT amended for it.**

🔴 **No new serving-side attempt without an owner ruling**, under R-Z's discipline — the same
standing that closed C1, C2 and batched lookup. F72 joins them: built, gated, kept in the tree,
unused by the serving path.

⚠ **What that leaves true, and it is stated rather than smoothed:** three anchors' `correct_answer`
columns read **ABSENT** at launch, and the answer is in the recipe. That is a **known limitation
with a named owner and a named fix**, not an open defect looking for one.

---

## Rule 14 — THE STRANGER READ. A class of defect no instrument in this repo can find. (Added 2026-08-20; founding instance: the sonnet review of the same day.)

**Every gate here is written by the person who wrote the thing it gates.** That is unavoidable, and
it is why the gates are falsified before they are trusted. But falsification only tests whether a
check can *fail*; it cannot test whether the check **asked the right question**, because the
question comes from the same head as the code.

⭐ **The founding instance:** F-7 was run on a clean config by a model with no prior context, on ten
verbatim questions. **Every internal instrument was green at the time** — 756 tests, shakedown 10/10,
M1 24/24, `validate-load` clean at both endpoints, four anchors baselined. **The stranger read found
three things in one sitting, and no green instrument could have found any of them:**

| found | why every instrument was blind to it |
|---|---|
| **F76** — `intent` defaults to `lookup` and only `integrate` fires the recipe arm, with **no description on the enum** | **M1's probe hardcodes `intent: 'integrate'`.** The instrument passes the argument the builder knows to pass. It measures the surface *as its author calls it*, which is the one caller who never gets it wrong |
| **F77** — the payload showed `70bc2e40`, the caller asked with it, and got `UNBOUND` | Every instrument constructs its own arguments. **None of them round-trips a value out of one payload into the next call**, which is the first thing a real client does |
| **eight undocumented fields** in public payloads | A field is invisible to the author who added it. There was no check because **nobody who knew the field existed thought it needed one** |

### The rule

> **Before any surface is exposed to strangers, it is read by one.** A stranger read is a
> **verification of a different kind** from a gate: a gate asks *does the code do what I specified*,
> a stranger read asks *did I specify the right thing*. **A full green board is not a substitute
> for it, and is in fact the state in which it is most needed** — the instruments agreeing means
> only that they share their author's assumptions.

**What qualifies as a stranger read**, all three required:
1. **No prior context.** A fresh config, no repo access, no conversation history. A reader who has
   seen the build cannot un-see it.
2. **The reader chooses its own arguments.** The questions may be fixed; **the calls may not be.**
   Handing the reader the call shape reproduces exactly the blindness the read exists to break.
3. **Its findings are recorded as findings, not triaged into "user error."** F76 is the test: a
   client that omitted `intent` got the thinner answer, and the correct disposition was *the
   registered surface does not say which value unlocks the moat* — **never** *the client should
   have passed `integrate`*.

⚠ **A stranger read is not a pass/fail gate and never issues a verdict.** It produces a list. Each
item is then diagnosed by class the ordinary way — F76 a surface defect, F77 a known class through a
new door, F-7 §4(b) a **coverage** finding that must never be scored as retrieval (F52).

🔴 **Its own limits are recorded with it, because they are load-bearing.** The 2026-08-20 read was
run by the owner, and **every recipe it saw reads `validated_by: farseen`** — so it proved that a
clean *config* reaches a working surface, **not that a stranger's judgement finds the answers
trustworthy.** *The first genuinely external read is still ahead of us*, and this rule does not let
the internal one stand in for it.
