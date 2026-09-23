# Deployment runbook

The repository is prepared for Vercel's Git integration. GitHub Actions verifies every pull request and push to `master` against an isolated PostgreSQL service; Vercel deploys only after its own Git integration receives the push.

## One-time manual setup

1. Create a free PostgreSQL project in Neon or Supabase. Keep development, staging, and production databases separate.
2. In Vercel, import `alyanisr/alya-portofolio` from GitHub and select the `master` production branch.
3. In **Settings → Environment Variables**, add values for Production and Preview as appropriate:

   - `DATABASE_URL`
   - `DIRECT_URL`
   - `AUTH_SECRET` — a new random value of at least 32 characters
   - `ADMIN_EMAIL`
   - `ADMIN_NAME`
   - `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_APP_URL` — update to the assigned Vercel URL, then custom domain when available

4. Run the first migration against the production database from a trusted local terminal with production variables loaded:

   ```bash
   pnpm exec prisma migrate deploy
   pnpm db:seed
   ```

   The seed creates/updates the initial administrator only when `ADMIN_PASSWORD` is set.
5. Trigger or wait for the Vercel deployment. Verify:

   - `https://<deployment>/api/health` returns `{ "status": "ok" }`.
   - `/` renders public content.
   - `/login` accepts the configured admin account.
   - `/admin` is inaccessible without an authenticated admin session.

## Ongoing releases

1. Push to a feature branch and open a pull request.
2. Wait for the **CI / Verify application** GitHub check.
3. Merge to `master` only after the check passes.
4. Vercel deploys `master`; run `prisma migrate deploy` for any new migration before or as part of the controlled production release.

## Security

- Do not put real production secrets in GitHub Actions; CI uses an ephemeral local PostgreSQL service.
- Rotate any secret that was pasted or exposed outside the intended secret manager.
- Keep documents private unless they are explicitly cleared for public sharing.
- Configure automated backups in the chosen managed PostgreSQL provider and object-storage provider.
