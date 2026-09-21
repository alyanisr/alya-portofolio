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
