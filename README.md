# FunClient website

The download page, admin login and access-approval panel for FunClient — ready to deploy to **Vercel** with **Postgres**.

Pages (plain HTML):
- `/download` → `download.html` — the public download page.
- `/login` → `login.html` — admin sign-in.
- `/admin` → `admin.html` — review and approve/deny/revoke access requests.

API (Vercel serverless functions in `/api`):
- `GET  /api/verify?username=NAME` → `{ allowed, status }` — **called by the FunClient launcher** (keep compatible).
- `POST /api/request` `{ username, hwid, note }` → `201` new / `409` exists — **called by the launcher**.
- `POST /api/login` `{ password }` → sets an HttpOnly admin cookie.
- `POST /api/logout`
- `GET  /api/requests` → all requests (admin cookie required).
- `POST /api/decide` `{ username, action }` — `approve` | `deny` | `revoke` | `delete` (admin cookie required).

## Deploy

1. **Create the project** — push this `website/` folder to a Git repo and import it in Vercel (or `vercel` CLI from this folder). It's a static site + serverless functions; no build step.
2. **Add Postgres** — in the Vercel dashboard, Storage → create a **Postgres** database (or connect **Neon** via the integration) and attach it to the project. This sets `POSTGRES_URL` automatically. The `access` table is created on first use (or run `schema.sql`).
3. **Set environment variables** (Settings → Environment Variables):
   - `ADMIN_PASSWORD` — a long, random password for `/login`.
   - `SESSION_SECRET` — any long random string (optional; falls back to `ADMIN_PASSWORD`).
4. **Add the jar** — `funclient-1.0.0.jar` lives in this folder and is served at `/funclient-1.0.0.jar`, which the download button links to. Replace it whenever you ship a new build.
5. **Deploy.**

The FunClient launcher points at `https://funclientoffcial.vercel.app` (see `FunClientAuth.java` → `BASE_URL`). Deploy this site to that domain so the client works, or change `BASE_URL` to a different domain and rebuild the mod.

## How approval works

1. A player launches FunClient. It `POST`s `/api/request` → a **pending** row appears in `/admin`.
2. You open `/admin`, sign in, and click **Approve**.
3. Their client re-checks `/api/verify` about once a second, so it unlocks almost immediately — no restart. **Revoke** or **Deny** locks it again just as fast; **Delete** removes the row (they can request again). (That's one request per second per running client — if it gets costly, raise `POLL_MILLIS` in `FunClientAuth.java`.)

## Local notes

- Node 18+. `npm install` to pull `@vercel/postgres`. Local dev with `vercel dev` needs the Postgres env vars set.
- The admin session is a signed, HttpOnly, 12-hour cookie — the login is checked on the **server**, so it can't be bypassed from the browser.
