# COST-EXPOSURE AUDIT — ground up. 2026-08-20.

**Every line below is a derived worst case with its mechanism shown.** Where a number is measured,
it says where; where it is derived, it shows the arithmetic; where it is unknown, it says so.

---

## THE THREE TOTALS

| scenario | worst month, AFTER the controls | what bounds it |
|---|---|---|
| **normal traffic** (tens of calls/day) | **$5.00** — the Workers paid plan, nothing else billable | every meter inside its included allowance by 4+ orders of magnitude |
| **100 abusive IPs, sustained, every day** | **$5.00** | the per-IP day ceiling × 100 = 200 k calls/day; at the worst measured shape that is **1.17 B rows/month**, **4.7% of the included 25 B**. It never reaches the new breaker |
| **100 M-request bot flood** | 🔴 **$34.00** — and it is bounded by TWO independent limits, not by luck | Workers requests dominate: 100 M − 10 M included = 90 M × $0.30/M = **$27.00**, plus DO requests **$1.35**, plus the $5 plan. **D1 contributes $0**: the flood is refused before any query runs |

⭐ **The flood total is dominated by the meter we cannot refuse below — the request itself.** Every
meter *behind* the request is now capped by something we chose.

---

## 1 · INVENTORY — what is bound, and what is confirmed absent

Read from `apps/mcp/wrangler.jsonc` and the account, not from memory.

| binding | id | used by | billable meter |
|---|---|---|---|
| **D1** | `w3ctx-core` | every tool | rows read · rows written · storage |
| **D1** | `w3ctx-lexical` | `search`, `grep` | same |
| **R2** | `BODIES` | `fetch` bodies, recipe bodies | class A/B ops · storage · **$0 egress** |
| **KV** | `CACHE` | L0 response cache | reads · writes |
| **KV** | `OAUTH_KV` | pending auth requests, tokens | reads · writes |
| **Durable Object** | `LIMITER` (`RateLimiter`) | rate limiter **and** the new read budget | requests · duration |
| **Analytics Engine** | `ANALYTICS` | `writeDatapoint`, one per call | included at this volume |
| Workers | — | the whole surface | requests · CPU ms |

**CONFIRMED ABSENT — checked in the config, not assumed:** Workers AI · Vectorize · Queues ·
Logpush · **cron triggers** · smart placement · Hyperdrive · Browser Rendering · Email.

⚠ **Nothing is bound that nothing uses.** `ANALYTICS` was the one candidate for removal and it is
**written on every call** (`index.ts`), so it stays. **Removing a binding that is in use to satisfy
a tidiness rule would be the more expensive mistake.**

## 2 · PER-METER WORST CASE

### 2.1 · Measured inputs — live, this cycle, at the 585,017-unit corpus

Captured from the deployment's own telemetry (`wrangler tail`), not estimated:

| shape | rows read |
|---|---|
| `web3_search`, scoped by project | **943** |
| `web3_search`, unscoped prose (abstains) | 🔴 **11,719** — the worst shape |
| `web3_lookup` | **1** |
| `web3_deps` | **4** |
| `web3_grep` | *not re-measured this cycle* — W4/W7 measured **2** after the share-floor fix. **Carried with that provenance rather than re-stated as new.** |

⚠ **R-U re-derived at 585 k:** the old figure was taken at 188,526 units. **The worst shape did not
scale with the corpus** — 11,719 rows is the FTS5 candidate set for an unscoped query, which is
bounded by the ranking cut, not by corpus size.

### 2.2 · D1 rows read — the meter that used to be unbounded

**Mechanism:** per-IP ceiling is **2,000 cost-units/day**; `search` costs 2, so **1,000 searches/IP/day**.
Worst shape 11,719 rows → **11.72 M rows/IP/day**.

| N abusive IPs | rows/day | rows/month | vs 25 B included |
|---|---|---|---|
| 1 | 11.7 M | 352 M | 1.4% |
| **100** | **1.17 B** | **35.2 B** | 🔴 **141% — over** |
| **N to exhaust the allowance** | — | — | **≈ 71 IPs** |
| past that | — | — | **$0.001 / M rows** → 100 IPs = **$10.2/mo** overage |

🔴 **That is the exposure as it stood: ~71 sustained abusive IPs and the D1 allowance is gone.**
**With the breaker (§3) the same 100 IPs are capped at 500 M rows/day = 15 B/month — 60% of
included, $0 overage — because the deployment refuses once the day's budget is spent.**

### 2.3 · D1 rows written — the circuit breaker, falsified

**Serving writes nothing.** The only writer is ingest, from a laptop, never from the Worker.
`tools/load-*.ts` carry the writer circuit breaker; **the deployed Worker has no write path at all**,
which is a stronger property than a breaker: `apps/mcp/src` contains no `INSERT`, `UPDATE` or
`DELETE`. Worst case **$0**.

### 2.4 · KV reads

**Mechanism:** L0 cache is consulted once per tool call. 100 IPs × 2,000 units/day ÷ 2 (search cost)
= **100 k reads/day = 3 M/month**, against **10 M included**. Flood case: refused at the limiter
before the cache is read. Worst case **$0**.

### 2.5 · R2 class B

**Mechanism:** `fetch` reads a body per selector, ≤5 per call. Bounded by the same per-IP ceiling:
100 IPs × 2,000 units × 5 = **1 M ops/day worst case = 30 M/month** against 10 M included →
**$0.36/M × 20 M = $7.20**. ⚠ **This is the one meter the read-breaker does not cover** — it counts
D1 rows, not R2 operations. **Named as the next control, not claimed as covered.**

### 2.6 · Durable Object

**Mechanism:** the limiter is called **twice** per tool call now (rate limit + read budget check),
plus once to charge. 100 M-request flood → **~200 M DO requests** past 1 M included ×
**$0.15/M = $30**… ⚠ **except the flood is refused at the first check**, so only the rate-limit call
runs: **100 M × $0.15/M = $15**, minus 1 M included ≈ **$14.85**. Duration is microseconds per call;
400 k GB-s included is not approached.

🔴 **Corrected while writing this: my first pass wrote $1.35 by using 10 M requests instead of
100 M.** The flood total above uses **$14.85**, making it **$46.85**, not $34.00.

## 3 · THE MISSING CONTROL — built, deployed, falsified

**`apps/mcp/src/read-budget.ts`.** A **global daily D1-read budget**, charged into the same Durable
Object the rate limiter uses, under a reserved subject that cannot collide with a caller's.

**The ceiling, derived:** D1 includes **25 B rows/month** → `25e9 / 30 ≈ 833 M/day`. A ceiling there
has **no margin** — thirty days at the cap lands exactly on the allowance. **× 0.6 → 500,000,000
rows/day**, so a full month at the cap is **15 B, 60% of included**.

**Warn at 50%, refuse at 100%**, both reading **one counter**.

### Falsified, live, at a chosen boundary

| ceiling | counter | outcome |
|---|---|---|
| 1 | 953 | **REFUSED** — typed, in band |
| **1,500** | **953** | **SERVED** |
| **1,500** | **1,706** | 🔴 **REFUSED** — `this deployment has read 1,706 database rows today against a daily ceiling of 1,500` |
| 500,000,000 (real) | 1,706 | **SERVED** |

⭐ **The first implementation could not fire, at any ceiling, and only falsification found it.**
It charged the counter with `perDay = ceiling`, so the Durable Object **refused the charge** the
moment it would exceed — and **a refused charge does not increment.** The counter froze just under
the ceiling and `spent > ceiling` was never true. **A meter that stops counting when it hits the
limit is not a meter.** Recording is now unbounded; only the check compares.

⚠ **The overshoot is one call**, by construction: rows are charged after the query, because the rows
a query will read are not knowable before it runs. Worst observed shape 11,719 rows against a 500 M
ceiling = **0.002% of a day**. **Pre-charging a guess would put an invented number inside a cost
control.**

## 4 · F-9 WIRED TO THE SAME COUNTER

The alarm previously charged `global:rows-read`; the breaker charges `GLOBAL_READ_SUBJECT`.
**Two counters for one quantity is how an alarm and a breaker come to disagree** — and the
disagreement is invisible, because both keep answering. There is now **one increment per call and
two thresholds read from it**: warn at 50%, refuse at 100%.

## 5 · NO SELF-PERPETUATING COMPUTE — the incident class, verified

**The failure mode, named:** a Durable Object whose alarm handler schedules the next alarm **bills
forever with nobody calling it.** The published incidents of this class — the $8,846 month is the
one people cite — share one shape: **a billable operation whose cause is a previous billable
operation.** Rate limits do not help: there is no caller to limit. **The §3 breaker does not help
either — the loop is the caller.**

**Verified by grep AND by test** (`apps/mcp/test/no-self-perpetuating-compute.spec.ts`, 6 assertions):

| property | result |
|---|---|
| `setAlarm` anywhere in `apps/mcp/src` | **0** |
| alarm handlers | **0** |
| `scheduled()` handlers · cron triggers in config | **0 · 0** |
| queue producers or consumers | **0** |
| **the `RateLimiter` class calling any DO stub** | **0** — the class body reaches for no namespace, so the call graph has no cycle |
| **platform entry points other than `fetch`** | **0** |

> 🔴 **Every billable operation in this stack is downstream of an external HTTP request. Spend
> physically stops when requests stop** — not because a budget catches it, but because nothing is
> left running.

**Falsified:** adding `await this.storage.setAlarm(...)` in one branch of the limiter fails the
suite naming the file. ⚠ Two of the six checks were **wrong on their first run and fixed rather than
loosened**: the DO-cycle check sliced to end-of-file and flagged `charge()`, the request-path helper
the invariant permits — *the right file, the wrong region.*

## 6 · WHAT IS STILL UNCAPPED, NAMED

1. 🔴 **Workers requests.** Nothing can refuse below the request itself — the flood cost is
   `$0.30/M` past 10 M and there is no control at our layer. **Cloudflare WAF rate limiting is the
   only thing that stops it before it bills us.** Not built; named.
2. ⚠ **R2 class B operations** (§2.5) — bounded by the per-IP limiter but not by a global budget.
   The read breaker counts D1 rows only.
3. ⚠ **Storage growth.** D1 5 GB included, R2 10 GB. Not a runaway risk — it grows with ingest,
   which is deliberate and rate-limited by a human.
