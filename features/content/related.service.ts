import { ContentStatus, Visibility } from "@prisma/client";
import { db } from "@/lib/db";

export type RelatedContentItem = {
  id: string;
  type: "project" | "experience" | "achievement" | "skill" | "document";
  title: string;
  description: string | null;
  href: string | null;
  note: string | null;
  relation: string;
  sortOrder: number;
};

type ContentType = RelatedContentItem["type"];
const publicContent = { status: ContentStatus.PUBLISHED, visibility: Visibility.PUBLIC, deletedAt: null } as const;

/**
 * Resolves only relationships deliberately curated in the CMS. This avoids
 * misleading keyword-based recommendations and preserves Alya's editorial
 * judgement about why two pieces of evidence belong together.
 */
export async function getRelatedContent(sourceType: ContentType, sourceId: string) {
  const relations = await db.contentRelation.findMany({
    where: {
      OR: [
        { sourceType, sourceId },
        { targetType: sourceType, targetId: sourceId },
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const references = relations.map((relation) => ({
    type: (relation.sourceType === sourceType && relation.sourceId === sourceId
      ? relation.targetType
      : relation.sourceType) as ContentType,
    id: relation.sourceType === sourceType && relation.sourceId === sourceId ? relation.targetId : relation.sourceId,
    note: relation.note,
    relation: relation.relationType,
    sortOrder: relation.sortOrder,
  })).filter((reference) => isSupported(reference.type));

  const idsFor = (type: ContentType) => references.filter((reference) => reference.type === type).map((reference) => reference.id);
  const [projects, experiences, achievements, skills, documents] = await Promise.all([
    db.project.findMany({ where: { ...publicContent, id: { in: idsFor("project") } }, select: { id: true, title: true, overview: true, slug: true } }),
    db.experience.findMany({ where: { ...publicContent, id: { in: idsFor("experience") } }, select: { id: true, company: true, role: true, summary: true, slug: true } }),
    db.achievement.findMany({ where: { ...publicContent, id: { in: idsFor("achievement") } }, select: { id: true, title: true, result: true, slug: true } }),
    db.skill.findMany({ where: { visibility: Visibility.PUBLIC, deletedAt: null, id: { in: idsFor("skill") } }, select: { id: true, name: true, description: true } }),
    db.document.findMany({ where: { visibility: Visibility.PUBLIC, deletedAt: null, id: { in: idsFor("document") } }, select: { id: true, title: true, description: true, fileUrl: true } }),
  ]);

  const records = new Map<string, Omit<RelatedContentItem, "note" | "relation" | "sortOrder">>();
  projects.forEach((item) => records.set(key("project", item.id), { id: item.id, type: "project", title: item.title, description: item.overview, href: `/work/${item.slug}` }));
  experiences.forEach((item) => records.set(key("experience", item.id), { id: item.id, type: "experience", title: `${item.company} — ${item.role}`, description: item.summary, href: `/experience/${item.slug}` }));
  achievements.forEach((item) => records.set(key("achievement", item.id), { id: item.id, type: "achievement", title: item.title, description: item.result, href: "/archive" }));
  skills.forEach((item) => records.set(key("skill", item.id), { id: item.id, type: "skill", title: item.name, description: item.description, href: "/capabilities" }));
  documents.forEach((item) => records.set(key("document", item.id), { id: item.id, type: "document", title: item.title, description: item.description, href: item.fileUrl }));

  return references.flatMap((reference) => {
    const record = records.get(key(reference.type, reference.id));
    return record ? [{ ...record, note: reference.note, relation: reference.relation, sortOrder: reference.sortOrder }] : [];
  });
}

function key(type: ContentType, id: string) { return `${type}:${id}`; }
function isSupported(type: string): type is ContentType { return ["project", "experience", "achievement", "skill", "document"].includes(type); }
