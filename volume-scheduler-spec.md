**Soundtrack Volume Scheduler Extension – Kick‑off Spec (v1.0)**
_Prepared for Norbert (BMAsia) – June 2025_

---

## 1. Objective

Build a lightweight extension that lets staff pre‑programme master volume changes in any Sound Zone, e.g.:

| Time window | Desired level |
|-------------|---------------|
| 12:00 – 14:00 | **+2 steps** |
| 22:00 – 23:00 | **‑3 steps** |

The service will **read a schedule → call `setVolume` on the zone → log the result**.

---

## 2. Key Soundtrack API facts

| Item | Detail |
|------|--------|
| Endpoint | `https://api.soundtrackyourbrand.com/v2` |
| Auth | `Authorization: Basic <API‑token>` (base‑64 string delivered by SYB) |
| GraphQL operation | `mutation setVolume(input : { soundZone, volume })` |
| Volume scalar range | **0 – 16** inclusive (integer) |
| Rate‑limit | 3 600 tokens; +50 tokens/s back‑fill (1 simple mutation ≈ <20 tokens) |

---

## 3. Minimal data model

```jsonc
{
  "soundZoneId": "U291bmRabwsMWNhedTc1Nm8v",
  "rules": [
    { "from": "12:00", "to": "14:00", "volume": 11 },
    { "from": "22:00", "to": "23:00", "volume": 6 }
  ],
  "timeZone": "Asia/Bangkok"
}
```

---

## 4. Suggested architecture

```
┌───────────────┐        cron / node‑schedule        ┌────────────────────┐
│ Volume JSON   │  ───►  every minute (or finer) ───►│  scheduler worker  │
│ (S3 / local)  │                                   │  (Claude‑generated) │
└───────────────┘                                   │  ↳ setVolume()      │
                                                    │  ↳ write log        │
                                                    └─────────┬──────────┘
                                                              │
                      HTTPS POST (GraphQL)                    ▼
                                                    ┌────────────────────┐
                                                    │ Soundtrack API     │
                                                    │  mutation          │
                                                    └────────────────────┘
```

* **Language**: TypeScript / Node 20 (good GraphQL tooling & cron libs).  
* **Scheduler**:  
  * _Local PoC_: `node‑schedule` plus `pm2`.  
  * _Prod_: Cloud Run, AWS Fargate, or Fly.io.  
* **Secrets**: store token in a secret manager.

---

## 5. Core API snippets

### 5.1 Get your first Sound Zone ID
```graphql
query {
  me {
    ... on PublicAPIClient {
      accounts(first:1) {
        edges { node {
          locations(first:1) {
            edges { node {
              soundZones(first:5) {
                edges { node { id name } }
  }}}}}}}
}
```

### 5.2 Immediate volume change
```graphql
mutation setLunchVolume {
  setVolume(
    input: { soundZone: "U291bmRabwsMWNhedTc1Nm8v", volume: 11 }
  ) { volume }
}
```

_Curl test:_
```bash
curl -XPOST https://api.soundtrackyourbrand.com/v2   -H "Authorization: Basic $SYB_TOKEN"   -H "Content-Type: application/json"   -d '{"query":"mutation { setVolume(input:{soundZone:"U291bmRabwsMWNhedTc1Nm8v", volume:11}){volume} }"}'
```

---

## 6. Implementation checklist

| Phase | Tasks |
|-------|-------|
| **Setup** | ☐ Create Claude project repo<br>☐ Add GraphQL client (`graphql-request`) |
| **Config** | ☐ Decide baseline volume<br>☐ Build JSON schedule loader with Zod validation |
| **Scheduler** | ☐ Parse venue TZ<br>☐ If `desired ≠ current`, call mutation |
| **Error handling** | ☐ Retry with back‑off<br>☐ Alert via Slack/MS Teams |
| **Rate‑limit safety** | ☐ Deduplicate identical calls<br>☐ Respect `x-ratelimiting-*` headers |
| **Logging** | ☐ Console + Cloud logs<br>☐ Optional: push to BigQuery |
| **Unit tests** | ☐ Mock GraphQL endpoint (`nock`) |

---

## 7. Road‑map ideas (post‑MVP)

1. **Ramp‑up curve** – fade over N minutes.  
2. **Per‑day presets** – brunch vs weekdays.  
3. **GUI frontend** – React + SYB OAuth.  
4. **Multi‑Zone support** – array of zones.  
5. **Context triggers** – footfall sensor links.

---

## 8. Security & compliance notes

* Rotate API token every 90 days.  
* Do **not** expose volume control to public.  
* Validate volume range (0‑16).  
* Store only zone IDs; no PII.

---

## 9. Quick next step for Claude

> **Prompt starter**  
> _“Create a TypeScript file `scheduler.ts` that reads a `schedule.json`, determines the current target volume, and calls `setVolume` via GraphQL‑request. Include dotenv support for `SYB_TOKEN`.”_

---

### References

* Soundtrack API — basic request format & endpoint  
* `setVolume` mutation example & rate‑limit notes  
* `Volume` scalar definition (0 – 16)

---

**Happy coding!** Ping once the PoC is ready.
