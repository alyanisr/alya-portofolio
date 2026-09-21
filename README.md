# Alya Nisrina Portfolio

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values before running.

```bash
cp .env.example .env.local
```

## Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS 4 + custom design tokens
- **Animation**: Motion for React
- **Database**: PostgreSQL via Prisma 6 ORM
- **Package Manager**: pnpm 12

## Architecture Direction

This project is a modular monolith with two surfaces:

- **Public Portfolio**: storytelling website, recruiter lens, search, SEO, and public content.
- **Admin CMS**: authenticated content management for projects, experience, skills, achievements, media, documents, CVs, homepage curation, and recruiter lens priorities.

Core principle:

> Content once. Relate intelligently. Present differently.

Code controls layout, typography, animation, interaction, and visual behavior. The CMS controls what Alya's portfolio says.

## Getting Started

```bash
pnpm install
pnpm exec prisma migrate dev
pnpm exec prisma db seed
pnpm dev
```

## Foundation Status

Implemented:

- Next.js, TypeScript, Tailwind, Prisma, PostgreSQL-oriented environment scaffold.
- Prisma schema baseline for the portfolio content system.
- UUID defaults for internal IDs.
- Content status workflow support: `DRAFT`, `REVIEW`, `READY`, `PUBLISHED`, `ARCHIVED`, `UNLISTED`.
- Relationship-first content models for projects, skills, experience, achievements, media, documents, resumes, and recruiter lenses.
- `ContentVersion` baseline for version snapshots.
- `Activity` content model for beyond-the-screen content.
- Design token variables in `app/globals.css`.

Implemented so far:

- Public read services and API routes for homepage, projects, experience, skills, achievements, recruiter lenses, and basic search.
- Database-driven public homepage, work/project case studies, experience, capabilities, archive, recruiter lens, about, and contact pages.
- Relational seed content for the documented projects, skills, achievement, learning, and recruiter priorities.
- Password/session-based admin access and a versioned, audited project editor.
- Basic SEO metadata, `robots.txt`, and dynamic sitemap.

Still to build:

- CMS editors for every remaining content type, media/document upload and ordering, homepage/lens curation UI, and full publish workflow UI.
- Related-content views, interactive archive search UI, analytics, accessible motion system, selective 3D, and full automated test coverage.

See `docs/foundation-reconciliation.md` for the current reconciliation notes and next build step.

## Design System

Palette tokens (defined in `globals.css`):
- `--paper`: #F7F6F2 (warm off-white background)
- `--ink`: #111111 (near-black text)
- `--accent`: #3157FF (cobalt blue signature)
- `--surface`: #FFFFFF (card surfaces)
- `--line`: #D9D9D4 (subtle borders)
- `--muted`: #6F706D (secondary text)

Typography:
- **Display**: Instrument Serif (headlines)
- **UI/Body**: Plus Jakarta Sans (interface text)
- **Technical**: IBM Plex Mono (metadata, tags, metrics)
