# B.E.G.I.N — Business Expansion & Growth Initiative

Applicant portal for the Ministry of Commerce (Loveworld Kingdom) $1M
interest-free business fund. Applicants register, complete a 5-step funding
application, and track committee decisions in real time. The Review Committee
works from the `/admin` panel.

Built on the **TinyZipper** platform:

| Concern | Service | Notes |
|---|---|---|
| Hosting / SSR | **The Stage** | Next.js standalone SSR container, git-connected deploys |
| Data | **The Cellar** | Sealed Postgres (`users`, `applications`, `password_resets`) |
| Email | **Zipper Mail** | Transactional HTTP API with SMTP fallback |

## Quick start (local)

```bash
npm install
cp .env.local.example .env.local   # fill in Cellar + Mail credentials
npm run dev
```

With no Cellar credentials the app falls back to a local JSON store under
`.data/` — the interface is identical either way.

## Production environment (The Stage)

The app **refuses to serve production traffic without these**:

| Variable | Purpose | Generate with |
|---|---|---|
| `SESSION_SECRET` | HMAC key for session cookies | `openssl rand -hex 32` |
| `COMMITTEE_PASSPHRASE` | Committee panel (/admin) login | `openssl rand -hex 24` |
| `APP_URL` | Public base URL used in email links | e.g. `https://begin.example.com` |

Plus the Cellar credentials (`CELLAR_REST_URL`, `CELLAR_SEAL`) and Zipper
Mail keys (`ZIPPER_EMAIL_*`, `ZIPPER_SMTP_*`) from the TinyZipper dashboard.

### Database schema (The Cellar)

Created once via the Cellar sealed-SQL hatch:

```sql
CREATE TABLE users (
  id text PRIMARY KEY, full_name text, email text NOT NULL UNIQUE,
  phone text, business_name text, password_hash text NOT NULL,
  created_at timestamptz, session_epoch timestamptz);

CREATE TABLE applications (
  id text PRIMARY KEY, user_id text NOT NULL, status text, tier int,
  reference text, amount_requested numeric, loan_purpose text,
  business_name text, submitted_at timestamptz, updated_at timestamptz,
  review_note text, timeline jsonb, data jsonb);

CREATE TABLE password_resets (
  id text PRIMARY KEY, user_id text NOT NULL, token_hash text NOT NULL,
  expires_at timestamptz NOT NULL, used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL);
```

`session_epoch` powers revocation: a password reset bumps it and every
existing session for that account stops verifying immediately.

## Application status flow

```
draft ──submit──▶ submitted ──committee──▶ under_review
                        ▲                        │
                        │      ┌─────────────────┤
                        │      ▼                 ▼
                        └─ resubmit ◀─ more_info_required   approved / rejected
```

- Draft saves never change a non-draft status.
- Only `draft` and `more_info_required` applications can be (re)submitted.
- Tier funding bands are enforced server-side (tier 1: GHS 10k–50k,
  tier 2: 50k–100k, tier 3: 100k+).

## Security notes

- Sessions are HMAC-signed, constant-time verified, and revocable per user.
- Auth endpoints are rate-limited in-process (the Stage runs one SSR
  container, so the limiter is shared across requests).
- `?next=` redirect targets are validated to same-site paths only.
- Password-reset tokens are SHA-256 hashed at rest, single-use, 60-minute
  expiry, consumed atomically.
- Email templates HTML-escape all user-controlled values.

## Scripts

```bash
npm run dev     # local dev server
npm run build   # production build (standalone output for The Stage)
npm run start   # run the built server
npm run lint    # eslint
node scripts/migrate-local-to-cellar.mjs  # one-off JSON → Cellar migration
```

## Deploys

Pushes to `main` on GitHub trigger the Stage build automatically (webhook).
The panel at `/admin` uses a single shared passphrase — share it with
committee members over a secure channel only.
