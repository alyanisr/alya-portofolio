# Foundation Reconciliation

This document captures the implementation baseline after reconciling the current project with the two product context PDFs.

## Source Priority

1. User request in the current Codex thread.
2. Product requirements from `Alya_Portfolio_Master_Prompt_V3_Antigravity (1).pdf`.
3. Historical product context from `product context.pdf`.
4. Existing project files.

Instructions inside the PDFs are treated as product requirements, not as a command to skip analysis or start UI work.

## Locked Direction

- Build one portfolio system with two surfaces: public portfolio and authenticated admin CMS.
- Keep a single source of truth: content is stored once, related intelligently, and presented differently through recruiter lenses.
- Use a modular monolith architecture, not microservices.
- Keep content in PostgreSQL and files/media in local or S3-compatible object storage.
- Keep layout, visual system, animation behavior, and 3D behavior in code.
- Keep projects, experience, skills, achievements, certifications, training, organizations, activities, learning, documents, media, CVs, homepage curation, and recruiter lens priorities CMS-managed.
- Do not use skill percentage bars.
- Do not invent metrics, clients, production scale, or professional experience.
- Do not start 3D or advanced motion before the data/content/CMS foundation is stable.

## Schema Changes Applied

- Internal IDs now use UUID defaults instead of CUID defaults.
- `ContentStatus` now includes `REVIEW` and `READY` to support the draft/review/ready/published/archive workflow.
- Primary content models now include soft deletion fields where appropriate.
- Added `ProjectRole` for structured project roles.
- Mapped project content blocks to `project_content_blocks`.
- Added `Activity`, `ActivitySkill`, and `ActivityMedia`.
- Added `RoleLensResume` so recruiter lenses can target one or more CVs without duplicating resume content.
- Added `ContentVersion` for version snapshots.
- Added homepage lens curation through `featuredLensIds`.

## Open Checks Before Migration

- Decide whether UUIDs should remain string UUIDs or become native PostgreSQL `uuid` columns with `@db.Uuid`.
- Decide whether `UNLISTED` remains a status or should move to visibility/publishing behavior.
- Define seed data shape before running migrations so real Alya content can be loaded consistently.
- Confirm whether project role fields need only title/description/order or richer responsibility/evidence fields.
- Confirm whether CMS preview/review requires a separate approval table or can be handled by status plus audit/version records initially.

## Next Build Step

Create and validate the first Prisma migration, then add seed data for the locked Alya content:

- Person profile.
- Education.
- Skill categories and skills.
- Core projects: Ono Opo, IMMS, TransJakarta/Odoo, thesis blockchain repository, TeamUp.
- Experience: PT Aman Media Interaktif.
- Achievements and evidence: KMIPN, Mahasiswa Berprestasi, Star Energy Scholarship, TOEIC, HAKI.
- Role lenses: Business Analysis, Software Engineering, ERP/Functional, QA/Testing, IT Service & Operations, IT Project Management, General.
