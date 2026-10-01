# Eventi test application

Live: https://eventi-test.frosty-queen-607a.workers.dev/

Eventi is the temporary project name. This independently deployable web MVP lives alongside the existing Next.js frontend and Laravel backend. The existing application remains intact. It does not migrate existing users or events, and it does not yet implement the full Laravel API contract.

## Available workflows

- Start a named browser-bound test profile, then optionally upgrade it to a username/password account without losing its data.
- Log in on another device; sessions use opaque hashed tokens in Secure, HttpOnly, SameSite cookies. Passwords use PBKDF2-SHA256 with unique salts and 100,000 iterations.
- Create/edit private events, copy invitation links, join with a link or code.
- Read/write event posts, share compressed JPEG photos, react, remove your own posts.
- Create meetups and rides, join/cancel; ride capacity uses a conditional database insert.
- Request connections within a shared event and accept requests. Accepted connections remain in the network.

The intentionally synthetic `EVENTI-DEMO` invitation is the only publicly advertised event. Private event previews expose event metadata, not members or posts. Membership is checked on all event community and image routes. Untrusted text is escaped before HTML rendering. Mutating requests require a matching Origin and JSON content type; authentication and writes are rate limited.

## Cloudflare resources

- Account: `069722adef64029963cb8fa8697f5881`
- Worker: `eventi-test`
- D1: `eventi-test`, id `7a86c52f-288d-4e5b-97e4-45985ebb8b55`, EU jurisdiction
- Daily scheduled cleanup of expired sessions and rate-limit rows at 03:17 UTC

R2 could not be created because it is not enabled on the account. Test photos are compressed in the browser to less than 240 KB of base64 and stored in D1. This is a bounded test implementation, not the intended long-term media architecture. Each profile is limited to 300 posts and 20 owned events. R2 migration and richer media processing remain future work.

## Build and verify

Requires Node.js 24+ for the test suite's built-in SQLite adapter. No npm dependencies are required for this MVP.

```sh
node eventi-mvp/build.mjs
node --test eventi-mvp/worker.test.mjs
```

The tests exercise the Worker handlers against real SQLite with a thin D1-compatible adapter. They cover event access control, private invitation previews, account upgrade/cross-device login/logout, network acceptance, seat limits, photo authorization, CSRF checks, session expiry and authentication throttling. They complement, rather than replace, live browser checks.

## Deployment

With Wrangler already authenticated, from `eventi-mvp/`:

```sh
node build.mjs
npx wrangler d1 execute eventi-test --remote --file schema.sql
npx wrangler deploy
```

The initial deployment was performed through the authorized Cloudflare API connector. `build.mjs` embeds the HTML, CSS and client JavaScript into `dist/worker.mjs`; no separate asset uploads are needed. Reapplying `schema.sql` preserves existing test data.

The GitHub workflow runs the build and tests. Automatic redeployment is not configured: the Cloudflare Builds repository connection returned error 8000008 (Git account disconnected). Deployment continues through the authorized Cloudflare API connector or Wrangler login. No tokens are committed.

## Test scope / remaining product work

Use only disposable test data. This deployment is not ready to onboard real customers. The demo explicitly labels its synthetic content. Profiles and posts are visible to members of shared events; anybody holding an invitation can join. Anonymous test profiles are browser-bound, so create an account before logging out if they need to be preserved.

Not implemented here: ticket verification/integrations, organizer verification, production email and password recovery, moderation/reporting, account deletion/export, legal operator details, 90-day lifecycle/retention policy, production R2 media storage, reliable offline outbox, real-time chat, push notifications, native iOS/Android apps. Account password login is exercised in integration tests; full native-device and production load testing remain outstanding.

## Live validation

The live browser test verified creation of a test profile, joining the demo, creating a private event, saving a community post, and persistence of session/event membership after reload. The live photo-upload test was interrupted before completion; image authorization and input validation are covered by integration tests. GitHub Actions run 36852233204 passed all six integration tests.
