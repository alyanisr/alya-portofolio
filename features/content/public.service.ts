import { ContentStatus, Visibility } from "@prisma/client";
import { db } from "@/lib/db";

const published = { status: ContentStatus.PUBLISHED, visibility: Visibility.PUBLIC, deletedAt: null } as const;

export async function getPublishedExperiences() {
  return db.experience.findMany({
    where: published,
    include: {
      skills: { include: { skill: true } },
      projects: { include: { project: true } },
      media: { include: { media: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { startDate: "desc" }],
  });
}

export async function getExperienceBySlug(slug: string) {
  return db.experience.findFirst({
    where: { ...published, slug },
    include: {
      skills: { include: { skill: true } },
      projects: { include: { project: true } },
      documents: { include: { document: true } },
      media: { include: { media: true }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function getPublishedSkillCategories() {
  return db.skillCategory.findMany({
    where: { deletedAt: null },
    include: {
      skills: {
        where: { visibility: Visibility.PUBLIC, deletedAt: null },
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPublishedAchievements() {
  return db.achievement.findMany({
    where: published,
    include: {
      projects: { include: { project: true } },
      skills: { include: { skill: true } },
      documents: { include: { document: true } },
      media: { include: { media: true } },
    },
    orderBy: [{ featured: "desc" }, { featuredOrder: "asc" }, { date: "desc" }],
  });
}

export async function getPublishedLearning() {
  return db.learningItem.findMany({
    where: published,
    include: { skills: { include: { skill: true } } },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getPublishedOrganizations() {
  return db.organization.findMany({
    where: published,
    include: { skills: { include: { skill: true } }, media: { include: { media: true } } },
    orderBy: { sortOrder: "asc" },
  });
}
