-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'REVIEW', 'READY', 'PUBLISHED', 'ARCHIVED', 'UNLISTED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'RESTRICTED', 'PRIVATE');

-- CreateEnum
CREATE TYPE "SkillMaturity" AS ENUM ('CORE', 'USED', 'FAMILIAR', 'EXPLORING', 'LEARNING');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'PDF_PREVIEW', 'AUDIO', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BRD', 'FRD', 'SRS', 'BPMN', 'CERTIFICATE', 'HAKI', 'PRESENTATION', 'REPORT', 'RESUME', 'OTHER');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('HEADING', 'TEXT', 'IMAGE', 'GALLERY', 'METRIC', 'QUOTE', 'LIST', 'DOCUMENT', 'EMBED');

-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('RELATED_TO', 'PART_OF', 'SUPPORTS', 'EVIDENCE_FOR', 'FOLLOW_UP', 'PREREQUISITE');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'PREVIEW', 'REVIEW', 'PUBLISH', 'ARCHIVE', 'DELETE', 'LOGIN', 'RESTORE');

-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('COMPETITION', 'AWARD', 'SCHOLARSHIP', 'RECOGNITION', 'HAKI', 'CERTIFICATION');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('PROFESSIONAL', 'ACADEMIC', 'COMPETITION', 'PERSONAL', 'ORGANIZATIONAL', 'EXPERIMENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "philosophy" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "linkedin" TEXT,
    "github" TEXT,
    "location" TEXT NOT NULL,
    "availability" TEXT,
    "photoUrl" TEXT,
    "cvUrl" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education" (
    "id" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION,
    "maxGpa" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "thesisTitle" TEXT,
    "thesisTitleEn" TEXT,
    "description" TEXT,
    "location" TEXT,
    "achievements" TEXT[],
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "skill_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "maturity" "SkillMaturity" NOT NULL DEFAULT 'FAMILIAR',
    "description" TEXT,
    "evidence" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "location" TEXT,
    "locationType" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT NOT NULL,
    "responsibilities" TEXT[],
    "impact" TEXT,
    "metrics" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_documents" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "experience_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_skills" (
    "experienceId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "experience_skills_pkey" PRIMARY KEY ("experienceId","skillId")
);

-- CreateTable
CREATE TABLE "experience_media" (
    "id" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "caption" TEXT,

    CONSTRAINT "experience_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experience_projects" (
    "experienceId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "experience_projects_pkey" PRIMARY KEY ("experienceId","projectId")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "projectType" "ProjectType" NOT NULL DEFAULT 'ACADEMIC',
    "slug" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "problem" TEXT,
    "context" TEXT,
    "objective" TEXT,
    "myRole" TEXT,
    "teamSize" INTEGER,
    "teamDescription" TEXT,
    "approach" TEXT,
    "process" TEXT,
    "solution" TEXT,
    "implementation" TEXT,
    "collaboration" TEXT,
    "result" TEXT,
    "challenges" TEXT,
    "learnings" TEXT,
    "metrics" JSONB,
    "coverImage" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "githubUrl" TEXT,
    "demoUrl" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "canonicalUrl" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_roles" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_content_blocks" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "BlockType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_content_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_skills" (
    "projectId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "project_skills_pkey" PRIMARY KEY ("projectId","skillId")
);

-- CreateTable
CREATE TABLE "project_media" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "caption" TEXT,

    CONSTRAINT "project_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_documents" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "project_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_tags" (
    "projectId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "project_tags_pkey" PRIMARY KEY ("projectId","tagId")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "category" "AchievementCategory" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "context" TEXT,
    "myRole" TEXT,
    "result" TEXT,
    "significance" TEXT,
    "credential" TEXT,
    "credentialUrl" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER NOT NULL DEFAULT 0,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_projects" (
    "achievementId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "achievement_projects_pkey" PRIMARY KEY ("achievementId","projectId")
);

-- CreateTable
CREATE TABLE "achievement_skills" (
    "achievementId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "achievement_skills_pkey" PRIMARY KEY ("achievementId","skillId")
);

-- CreateTable
CREATE TABLE "achievement_media" (
    "id" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "achievement_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_documents" (
    "id" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "achievement_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "description" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_skills" (
    "certificationId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "certification_skills_pkey" PRIMARY KEY ("certificationId","skillId")
);

-- CreateTable
CREATE TABLE "certification_documents" (
    "id" TEXT NOT NULL,
    "certificationId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "certification_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trainings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" TEXT,
    "description" TEXT,
    "certificate" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_skills" (
    "trainingId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "training_skills_pkey" PRIMARY KEY ("trainingId","skillId")
);

-- CreateTable
CREATE TABLE "training_documents" (
    "id" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "training_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_media" (
    "id" TEXT NOT NULL,
    "trainingId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "training_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "responsibilities" TEXT[],
    "initiatives" TEXT[],
    "impact" TEXT,
    "memberCount" INTEGER,
    "departmentCount" INTEGER,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_skills" (
    "organizationId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "organization_skills_pkey" PRIMARY KEY ("organizationId","skillId")
);

-- CreateTable
CREATE TABLE "organization_media" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "organization_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "organizationId" TEXT,
    "role" TEXT,
    "date" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "outcome" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_skills" (
    "activityId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "activity_skills_pkey" PRIMARY KEY ("activityId","skillId")
);

-- CreateTable
CREATE TABLE "activity_media" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "activity_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "maturity" "SkillMaturity" NOT NULL DEFAULT 'EXPLORING',
    "description" TEXT,
    "why" TEXT,
    "progressNote" TEXT,
    "resourceUrl" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "learning_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_skills" (
    "learningId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "learning_skills_pkey" PRIMARY KEY ("learningId","skillId")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "title" TEXT,
    "altText" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "metadata" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "fileUrl" TEXT NOT NULL,
    "storageKey" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "version" TEXT,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "storageKey" TEXT,
    "version" TEXT,
    "date" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_documents" (
    "resumeId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,

    CONSTRAINT "resume_documents_pkey" PRIMARY KEY ("resumeId","documentId")
);

-- CreateTable
CREATE TABLE "role_lenses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "intro" TEXT NOT NULL,
    "ctaText" TEXT,
    "ctaUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_lenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_lens_resumes" (
    "lensId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "role_lens_resumes_pkey" PRIMARY KEY ("lensId","resumeId")
);

-- CreateTable
CREATE TABLE "role_lens_projects" (
    "lensId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,

    CONSTRAINT "role_lens_projects_pkey" PRIMARY KEY ("lensId","projectId")
);

-- CreateTable
CREATE TABLE "role_lens_experiences" (
    "lensId" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "highlight" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,

    CONSTRAINT "role_lens_experiences_pkey" PRIMARY KEY ("lensId","experienceId")
);

-- CreateTable
CREATE TABLE "role_lens_skills" (
    "lensId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "highlight" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_lens_skills_pkey" PRIMARY KEY ("lensId","skillId")
);

-- CreateTable
CREATE TABLE "role_lens_achievements" (
    "lensId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "highlight" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_lens_achievements_pkey" PRIMARY KEY ("lensId","achievementId")
);

-- CreateTable
CREATE TABLE "content_relations" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "relationType" "RelationType" NOT NULL DEFAULT 'RELATED_TO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_versions" (
    "id" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "changeNote" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homepage_configs" (
    "id" TEXT NOT NULL,
    "heroTagline" TEXT NOT NULL,
    "heroHeadline" TEXT NOT NULL,
    "heroSubheadline" TEXT NOT NULL,
    "heroCta1Text" TEXT NOT NULL,
    "heroCta1Url" TEXT NOT NULL,
    "heroCta2Text" TEXT,
    "heroCta2Url" TEXT,
    "featuredProjectIds" TEXT[],
    "featuredExperienceIds" TEXT[],
    "featuredAchievementIds" TEXT[],
    "featuredSkillIds" TEXT[],
    "featuredLearningIds" TEXT[],
    "featuredLensIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "homepage_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_name_key" ON "skill_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skill_categories_slug_key" ON "skill_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "experiences_slug_key" ON "experiences"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "projects"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_slug_key" ON "achievements"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "certifications_slug_key" ON "certifications"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "trainings_slug_key" ON "trainings"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "activities_slug_key" ON "activities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "learning_items_slug_key" ON "learning_items"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "role_lenses_slug_key" ON "role_lenses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "content_relations_sourceType_sourceId_targetType_targetId_r_key" ON "content_relations"("sourceType", "sourceId", "targetType", "targetId", "relationType");

-- CreateIndex
CREATE INDEX "content_versions_contentType_contentId_idx" ON "content_versions"("contentType", "contentId");

-- CreateIndex
CREATE UNIQUE INDEX "content_versions_contentType_contentId_version_key" ON "content_versions"("contentType", "contentId", "version");

-- AddForeignKey
ALTER TABLE "skills" ADD CONSTRAINT "skills_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "skill_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_documents" ADD CONSTRAINT "experience_documents_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_documents" ADD CONSTRAINT "experience_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_skills" ADD CONSTRAINT "experience_skills_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_skills" ADD CONSTRAINT "experience_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_media" ADD CONSTRAINT "experience_media_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_media" ADD CONSTRAINT "experience_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_projects" ADD CONSTRAINT "experience_projects_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experience_projects" ADD CONSTRAINT "experience_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_roles" ADD CONSTRAINT "project_roles_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_content_blocks" ADD CONSTRAINT "project_content_blocks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_media" ADD CONSTRAINT "project_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_tags" ADD CONSTRAINT "project_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_projects" ADD CONSTRAINT "achievement_projects_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_projects" ADD CONSTRAINT "achievement_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_skills" ADD CONSTRAINT "achievement_skills_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_skills" ADD CONSTRAINT "achievement_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_media" ADD CONSTRAINT "achievement_media_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_media" ADD CONSTRAINT "achievement_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_documents" ADD CONSTRAINT "achievement_documents_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_documents" ADD CONSTRAINT "achievement_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_skills" ADD CONSTRAINT "certification_skills_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_skills" ADD CONSTRAINT "certification_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_documents" ADD CONSTRAINT "certification_documents_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_documents" ADD CONSTRAINT "certification_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_skills" ADD CONSTRAINT "training_skills_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_skills" ADD CONSTRAINT "training_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_documents" ADD CONSTRAINT "training_documents_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_documents" ADD CONSTRAINT "training_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_media" ADD CONSTRAINT "training_media_trainingId_fkey" FOREIGN KEY ("trainingId") REFERENCES "trainings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_media" ADD CONSTRAINT "training_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_skills" ADD CONSTRAINT "organization_skills_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_skills" ADD CONSTRAINT "organization_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_media" ADD CONSTRAINT "organization_media_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_media" ADD CONSTRAINT "organization_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_skills" ADD CONSTRAINT "activity_skills_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_skills" ADD CONSTRAINT "activity_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_media" ADD CONSTRAINT "activity_media_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_media" ADD CONSTRAINT "activity_media_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_skills" ADD CONSTRAINT "learning_skills_learningId_fkey" FOREIGN KEY ("learningId") REFERENCES "learning_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_skills" ADD CONSTRAINT "learning_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_documents" ADD CONSTRAINT "resume_documents_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_documents" ADD CONSTRAINT "resume_documents_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_lens_resumes" ADD CONSTRAINT "role_lens_resumes_lensId_fkey" FOREIGN KEY ("lensId") REFERENCES "role_lenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_lens_resumes" ADD CONSTRAINT "role_lens_resumes_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_lens_projects" ADD CONSTRAINT "role_lens_projects_lensId_fkey" FOREIGN KEY ("lensId") REFERENCES "role_lenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_lens_projects" ADD CONSTRAINT "role_lens_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_lens_experiences" ADD CONSTRAINT "role_lens_experiences_lensId_fkey" FOREIGN KEY ("lensId") REFERENCES "role_lenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_lens_experiences" ADD CONSTRAINT "role_lens_experiences_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "experiences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_lens_skills" ADD CONSTRAINT "role_lens_skills_lensId_fkey" FOREIGN KEY ("lensId") REFERENCES "role_lenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_lens_skills" ADD CONSTRAINT "role_lens_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_lens_achievements" ADD CONSTRAINT "role_lens_achievements_lensId_fkey" FOREIGN KEY ("lensId") REFERENCES "role_lenses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_lens_achievements" ADD CONSTRAINT "role_lens_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_versions" ADD CONSTRAINT "content_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

