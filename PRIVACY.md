# Privacy Policy — Web3 Context MCP

**Controller:** web3ctx, a ScarAI product, operated by Farseen Shaikh · **Contact:**
[farseen@scarai.xyz](mailto:farseen@scarai.xyz)
**Last reviewed against the code: 2026-08-28.**

⚠ **Every statement below was written by enumerating what the deployed Worker actually
writes** — its `console.log` calls, its KV writes, its Durable Object storage and its OAuth
grants — not from what the design intends. Where the code and this document ever disagree,
the code is right and this document is a defect. The sources are `apps/mcp/src/index.ts`
(`emit`), `cache.ts`, `ratelimit.ts`, `telemetry.ts` and `oauth.ts`.

---

## What this service is

A read-only retrieval endpoint for public, open-source Web3 documentation and code. It
serves excerpts of public repositories together with citations to the exact commit they came
from. **It stores no user content, accepts no uploads, and writes nothing to any blockchain.**

- **Free tier — `…/mcp`:** no account, no credential, no sign-up.
- **Authenticated tier — `…/mcp/oauth`:** optional, via GitHub, and it buys **only a higher
  rate limit**. It grants no additional data and unlocks no additional content.

---

## What is recorded

### 1. Operational logs — per request

| recorded | example |
|---|---|
| which tool was called | `web3_search` |
| the tier | `authless` / `free` |
| cost units charged, elapsed ms | `2`, `375` |
| database rows scanned, query count, retries | `660`, `3`, `0` |
| cache hit or miss; whether a body was found | `{hits:0,misses:1}` |
| which region served the database read | `APAC`, `primary: false` |

**Not recorded: your query text, the arguments you send, or the payload you receive.**

⚠ **One exception, stated because it is easy to miss:** when a tool call throws, the error
message is logged. Error messages can quote an identifier or a selector taken from your
request — for example an unparseable selector. They are not intended to carry query text and
generally do not, but this is a best-effort statement about message contents, not a guarantee.

Logs are visible only through Cloudflare's live tail and are **not persisted to any store we
operate**.

### 2. Aggregate metrics

One datapoint per tool call in Cloudflare Analytics Engine, indexed by **tool name** and
carrying only the numbers in the table above. **No identifier of any kind is attached** — no
IP, no user, no query.

### 3. Your IP address — as a rate-limit key, on the free tier

The free tier is anonymous, so the only thing available to meter is the network address.
Your IP is used as the **name of a counter** holding two numbers: units spent this minute and
units spent today.

- It is **not written to any log**, not sent to Analytics Engine, and not shared.
- The counters reset on a rolling basis and are **not retained beyond 24 hours** of activity.
- ⚠ **The address is the counter's name, so it exists in that storage for as long as the
  counter does.** We do not consider this anonymous, and it is why it is described here
  rather than omitted as "just rate limiting".

**Authenticating removes this**: an authenticated caller's counter is keyed by their GitHub
numeric user id instead, and the IP is not used.

### 4. Cached responses — and your query text, for five minutes

⚠ **This is the one place your query text is stored, and the 2026-08-13 text named the wrong
mechanism for it.** The cache KEY is a **SHA-256 hash** of the tool name and your arguments, so
nothing readable is stored there and no key can be turned back into a question. What can contain
your words is the cached **response**: when the server declines to scope a question it quotes the
question back — *"No scoping evidence in \"…\""* — and that sentence is part of the payload that
gets cached. **Same conclusion, accurate mechanism**; the previous wording is in git history.

- **Retention: 5 minutes**, by an expiry set at write time.
- It is a **cache key**, not a log: it is never read back as a record of what anyone asked,
  is not associated with your IP or identity, and is shared by anyone who sends the same
  query.
- If this matters for a particular query, do not send it — there is no opt-out flag, and
  claiming one would be a control we do not have.

### 5. The demand ledger — what was asked for and could not be served

*Added 2026-08-28.* When the server **declines** — it did not recognise a project, it knows a
project and has not indexed its source, it withheld a human-signed recipe from a family question,
or it found nothing — it increments one counter in its own database.

| the row is | example |
|---|---|
| a **UTC date** | `2026-08-28` |
| a **project id from our own published corpus**, or empty | `ethena` |
| a **decline class** from a fixed, published list of seven | `known-not-ingested` |
| a **count** | `3` |

**That is the whole row.** No query text, no fragment of one, no IP, no user id, no time finer
than a day — and the guard is structural rather than a promise: every value is checked against the
shape of a corpus project id (`^[a-z0-9][a-z0-9._-]{0,63}$`) before it is written, so nothing
containing a space can reach the table. The test suite tries to push a sentence in through each
field in turn.

- **Why it exists:** every decline this service makes is deliberate, and until now nothing recorded
  what the declines added up to. It is how a project that people keep asking for gets indexed.
- **Retention: 180 days**, after which rows are deleted.
- **It cannot be joined back to a request**, by us or by anyone with the database: one caller asking
  eighty times and eighty callers asking once are the same row.

### 6. If you authenticate with GitHub

We request **no OAuth scopes at all**. From GitHub's public profile we read and store:

| stored | why |
|---|---|
| your GitHub numeric id | the rate-limit key |
| your GitHub login | so a grant can be recognised in support |
| your display name, if public | shown on the consent record |

⚠ **The GitHub access token is used once — to read that profile — and then discarded.** It
is never stored. This service cannot act on your GitHub account, read your repositories, or
see your email.

Access tokens we issue expire in **1 hour**; refresh tokens are stored until revoked. You can
revoke access at any time in your GitHub settings under **Applications → Authorized OAuth
Apps**, which invalidates future logins immediately.

---

## What is never recorded

- Payload contents returned to you.
- Any wallet address, private key, seed phrase or signature. **The service has no field that
  accepts one**, and none of the five tools takes a credential of any kind.
- Cookies, analytics pixels, device fingerprints, cross-site trackers.
- Your email address.

---

## Sharing

**Nothing is sold, rented, or shared with third parties for any purpose.**

Data is processed on **Cloudflare** infrastructure (Workers, D1, R2, KV, Durable Objects,
Analytics Engine) as our sole processor. **GitHub** sees an authentication request when — and
only when — you choose to sign in.

---

## Content we serve

Excerpts of public, open-source repositories, each carrying its licence-bearing source URL
and a 40-character commit hash so you can verify it. Excerpts are served under the terms of
their original licences. If you are a maintainer and want a repository removed, open an issue
on this project's repository and it will be removed from the index.

---

## Contact and changes

**Email [farseen@scarai.xyz](mailto:farseen@scarai.xyz)**, or open an issue on
the project repository.

To ask for your data: the only records tied to an identity are the OAuth grant fields in §6.
Revoking the app in your GitHub settings ends future logins immediately; email the address
above to have the stored grant deleted.

Material changes are dated at the top of this document, and **the previous text stays in the
repository's git history** rather than being overwritten — the same rule this project follows
for everything it publishes.

---

## Scope of this document

⚠ **This is a factual description of what the software does, not legal advice**, and it has
not been reviewed by a lawyer.

⚠ **No GDPR or CCPA rights section appears here, deliberately.** Those sections name a
controller's legal basis, jurisdiction and statutory procedures, and this service is operated
by an individual with no company entity behind it. **Boilerplate asserting compliance
machinery that does not exist would be a worse document than one that omits it** — and this
is a service whose entire pitch is not asserting things it cannot support. If an entity is
formed, this section is where that changes.
