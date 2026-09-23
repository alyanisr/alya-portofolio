# Alya Nisrina — Portfolio System

An evidence-led personal portfolio for Alya Nisrina: a professional story, not a CV copied into pages. It presents how Alya understands problems, connects business and technology, builds solutions, validates them, and works with people.

One PostgreSQL-backed content system provides two surfaces:

- Public portfolio: storytelling, case studies, recruiter lenses, archive, search, and SEO.
- Admin CMS: authenticated content, evidence, CV, homepage, relationship, and recruiter-lens management.

**Content once. Relate intelligently. Present differently.**

## URLs

For local development:

- Public site: http://localhost:3000
- Admin CMS: http://localhost:3000/admin
- Login: http://localhost:3000/login

In production, the CMS is at `https://<your-domain>/admin`. It requires an `ADMIN` account and is excluded from search indexing.

## Product direction

- Positioning: problem solver bridging business and technology.
- Narrative: Understand → Analyze → Design → Build → Validate → Improve.
- Visual direction: premium editorial × technical documentation × human storytelling.
- Recruiter lenses: Business Analysis, Software Engineering, ERP / Functional, QA / Testing, IT Service & Operations, IT Project Management, and General.
- Integrity: no fabricated metrics/experience, no skill-percentage bars, and no confidential company evidence published.

## Current capabilities

- Next.js App Router, TypeScript, Tailwind CSS, Motion, Prisma, and PostgreSQL modular monolith.
- Public pages for home, work, experience, capabilities, achievements, beyond, learning, archive, recruiter lenses, contact, and search.
- Relational models for projects, experience, skills, achievements, certifications, training, organizations, activities, learning, media, documents, resumes, and lenses.
- CMS operations for projects, experience, achievements, capabilities, learning, certifications, and training.
- Lifecycle states, visibility controls, soft deletion, audit logs, and content version snapshots.
- Homepage curation, recruiter-lens priorities, CV management, and editorial cross-content relations.
- Per-project metadata, `robots.txt`, sitemap, and published-public content filtering.

## Setup

```bash
cp .env.example .env.local
pnpm install
pnpm exec prisma migrate deploy
pnpm db:seed
pnpm dev
```

Set `DATABASE_URL`, `DIRECT_URL`, a 32+ character `AUTH_SECRET`, and safe local admin credentials in `.env.local`. Never commit `.env`, private CVs, confidential documents, or storage credentials.

## Content workflow

1. Create a private draft in `/admin`.
2. Add the story, skills, projects, evidence, and editorial relations.
3. Confirm document visibility; public pages only show public evidence.
4. Move content through `DRAFT → REVIEW → READY → PUBLISHED`.
5. Archive instead of deleting; restore returns content to draft.

Code owns layout, visual system, motion, responsiveness, and interaction. The CMS owns the content, evidence metadata, visibility, relationships, ordering, and recruiter priorities.

## Verification

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm exec prisma validate
pnpm exec next build --webpack
```

## Deployment

The target topology is Vercel, managed PostgreSQL, and S3-compatible object storage. Before production deploy, set production environment variables, configure database/media backups and object-storage access control, set the domain, and use a separate staging database.

## Remaining work

Major remaining areas are object-storage upload and signed restricted delivery, preview/restore UI across every content type, organization/activity/education/profile operations, full-text search, generalized structured SEO, tests, analytics, deployment configuration, responsive QA, and intentional motion/3D polish.
