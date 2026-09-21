import { ContentStatus, Visibility } from "@prisma/client";
import { db } from "@/lib/db";

const publicProjectFilter = {
  status: ContentStatus.PUBLISHED,
  visibility: Visibility.PUBLIC,
  deletedAt: null,
} as const;

const projectInclude = {
  roles: { orderBy: { sortOrder: "asc" as const } },
  skills: { include: { skill: true } },
  tags: { include: { tag: true } },
  media: { where: { media: { deletedAt: null } }, include: { media: true }, orderBy: { sortOrder: "asc" as const } },
  documents: { where: { document: { deletedAt: null, visibility: Visibility.PUBLIC } }, include: { document: true }, orderBy: { sortOrder: "asc" as const } },
  contentBlocks: { orderBy: { sortOrder: "asc" as const } },
  experiences: {
    include: {
      experience: {
        include: { skills: { include: { skill: true } } },
      },
    },
  },
} as const;

export async function getPublishedProjects() {
  return db.project.findMany({
    where: publicProjectFilter,
    include: projectInclude,
    orderBy: [{ featuredOrder: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getFeaturedProjects() {
  return db.project.findMany({
    where: { ...publicProjectFilter, featured: true },
    include: projectInclude,
    orderBy: [{ featuredOrder: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getProjectBySlug(slug: string) {
  return db.project.findFirst({ where: { ...publicProjectFilter, slug }, include: projectInclude });
}

export async function getProjectsForLens(slug: string) {
  const lens = await db.roleLens.findFirst({
    where: { slug, active: true },
    include: {
      projects: {
        orderBy: { priority: "asc" },
        include: { project: { include: projectInclude } },
      },
      skills: { orderBy: { priority: "asc" }, include: { skill: true } },
      experiences: { orderBy: { priority: "asc" }, include: { experience: true } },
      achievements: { orderBy: { priority: "asc" }, include: { achievement: true } },
      resumes: { where: { active: true }, orderBy: { priority: "asc" }, include: { resume: true } },
    },
  });
  if (!lens) return null;
  return {
    ...lens,
    projects: lens.projects.filter(({ project }) => isPublic(project)),
    experiences: lens.experiences.filter(({ experience }) => isPublic(experience)),
    achievements: lens.achievements.filter(({ achievement }) => isPublic(achievement)),
    resumes: lens.resumes.filter(({ resume }) => resume.visibility === Visibility.PUBLIC && !resume.deletedAt),
    skills: lens.skills.filter(({ skill }) => skill.visibility === Visibility.PUBLIC && !skill.deletedAt),
  };
}

function isPublic(content: { status: ContentStatus; visibility: Visibility; deletedAt: Date | null }) {
  return content.status === ContentStatus.PUBLISHED && content.visibility === Visibility.PUBLIC && !content.deletedAt;
}
