import { ContentStatus, Visibility } from "@prisma/client";
import { db } from "@/lib/db";

const published = { status: ContentStatus.PUBLISHED, visibility: Visibility.PUBLIC, deletedAt: null } as const;

export async function searchPublicContent(rawQuery: string) {
  const query = rawQuery.trim();
  if (query.length < 2) return { projects: [], experiences: [], skills: [], achievements: [] };
  const contains = { contains: query, mode: "insensitive" as const };
  const [projects, experiences, skills, achievements] = await Promise.all([
    db.project.findMany({ where: { ...published, OR: [{ title: contains }, { overview: contains }, { subtitle: contains }] }, select: { title: true, slug: true, overview: true }, take: 8 }),
    db.experience.findMany({ where: { ...published, OR: [{ company: contains }, { role: contains }, { summary: contains }] }, select: { company: true, role: true, slug: true, summary: true }, take: 8 }),
    db.skill.findMany({ where: { visibility: Visibility.PUBLIC, deletedAt: null, OR: [{ name: contains }, { description: contains }, { evidence: contains }] }, select: { name: true, slug: true, description: true }, take: 8 }),
    db.achievement.findMany({ where: { ...published, OR: [{ title: contains }, { organization: contains }, { result: contains }] }, select: { title: true, slug: true, result: true }, take: 8 }),
  ]);
  return { projects, experiences, skills, achievements };
}
