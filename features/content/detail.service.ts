import { ContentStatus, Visibility } from "@prisma/client";
import { db } from "@/lib/db";

const published = { status: ContentStatus.PUBLISHED, visibility: Visibility.PUBLIC, deletedAt: null } as const;

export async function getAchievementBySlug(slug: string) {
  return db.achievement.findFirst({
    where: { ...published, slug },
    include: {
      projects: { include: { project: true } },
      skills: { include: { skill: true } },
      documents: { where: { document: { visibility: Visibility.PUBLIC, deletedAt: null } }, include: { document: true } },
      media: { where: { media: { deletedAt: null } }, include: { media: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getOrganizationBySlug(slug: string) {
  return db.organization.findFirst({
    where: { ...published, slug },
    include: {
      skills: { include: { skill: true } },
      media: { where: { media: { deletedAt: null } }, include: { media: true }, orderBy: { sortOrder: "asc" } },
      activities: { where: published, include: { skills: { include: { skill: true } } }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getLearningBySlug(slug: string) {
  return db.learningItem.findFirst({
    where: { ...published, slug },
    include: { skills: { include: { skill: true } } },
  });
}

export async function getSkillCategoryBySlug(slug: string) {
  return db.skillCategory.findFirst({
    where: { slug, deletedAt: null },
    include: {
      skills: {
        where: { visibility: Visibility.PUBLIC, deletedAt: null },
        include: {
          projectSkills: {
            where: { project: published },
            include: { project: true },
          },
        },
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      },
    },
  });
}
