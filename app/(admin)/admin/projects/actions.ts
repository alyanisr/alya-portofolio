"use server";

import { BlockType, ContentStatus, DocumentType, MediaType, Prisma, ProjectType, Visibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const optionalText = z.string().trim().max(12000).transform((value) => value || null);
const optionalUrl = z.string().trim().url().max(2048).or(z.literal("")).transform((value) => value || null);
const projectSchema = z.object({
  id: z.string().uuid(), title: z.string().min(2).max(160).trim(), subtitle: z.string().trim().max(240).transform((value) => value || null), projectType: z.nativeEnum(ProjectType), overview: z.string().min(10).max(5000).trim(),
  problem: optionalText, context: optionalText, objective: optionalText, myRole: optionalText, approach: optionalText, process: optionalText, solution: optionalText, implementation: optionalText, collaboration: optionalText, result: optionalText, challenges: optionalText, learnings: optionalText,
  githubUrl: optionalUrl, demoUrl: optionalUrl, metaTitle: z.string().trim().max(160).transform((value) => value || null), metaDescription: z.string().trim().max(320).transform((value) => value || null), canonicalUrl: optionalUrl, ogTitle: z.string().trim().max(160).transform((value) => value || null), ogDescription: z.string().trim().max(320).transform((value) => value || null), ogImage: optionalUrl,
  status: z.nativeEnum(ContentStatus), visibility: z.nativeEnum(Visibility), featured: z.enum(["true", "false"]), noIndex: z.enum(["true", "false"]),
});
const relationSchema = z.object({ projectId: z.string().uuid(), value: z.string().uuid() });
const roleSchema = z.object({ projectId: z.string().uuid(), title: z.string().trim().min(2).max(120), description: z.string().trim().max(2000).optional() });
const blockSchema = z.object({ projectId: z.string().uuid(), type: z.enum(["HEADING", "TEXT", "QUOTE", "LIST"]), content: z.string().trim().min(1).max(8000) });
const mediaSchema = z.object({ projectId: z.string().uuid(), url: z.string().trim().url().max(2048), title: z.string().trim().max(160).optional(), altText: z.string().trim().min(3).max(300), caption: z.string().trim().max(1000).optional(), type: z.nativeEnum(MediaType) });
const documentSchema = z.object({ projectId: z.string().uuid(), title: z.string().trim().min(2).max(160), description: z.string().trim().max(1000).optional(), fileUrl: z.string().trim().url().max(2048), type: z.nativeEnum(DocumentType), visibility: z.nativeEnum(Visibility) });

function snapshot(project: Record<string, unknown>) { return JSON.parse(JSON.stringify(project)) as Prisma.InputJsonValue; }
async function recordProjectChange(userId: string, project: { id: string; slug: string }, action: "CREATE" | "UPDATE" | "PUBLISH" | "ARCHIVE", changeNote: string) {
  const current = await db.project.findUniqueOrThrow({ where: { id: project.id }, include: { roles: true, skills: true, tags: true, contentBlocks: true } });
  const version = await db.contentVersion.count({ where: { contentType: "project", contentId: project.id } }) + 1;
  await db.$transaction([
    db.contentVersion.create({ data: { contentType: "project", contentId: project.id, version, snapshot: snapshot(current), changeNote, createdById: userId } }),
    db.auditLog.create({ data: { userId, action, entityType: "project", entityId: project.id, metadata: { changeNote } } }),
  ]);
}
function refreshProject(slug: string) { revalidatePath("/"); revalidatePath("/work"); revalidatePath(`/work/${slug}`); revalidatePath("/admin/projects"); revalidatePath(`/admin/projects/${slug}`); }

export async function updateProject(formData: FormData) {
  const user = await requireAdmin(); const parsed = projectSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) throw new Error("Project data is invalid.");
  const { id, featured, noIndex, ...data } = parsed.data;
  const project = await db.project.update({ where: { id }, data: { ...data, featured: featured === "true", noIndex: noIndex === "true", publishedAt: data.status === ContentStatus.PUBLISHED ? new Date() : undefined } });
  await recordProjectChange(user.id, project, data.status === ContentStatus.PUBLISHED ? "PUBLISH" : data.status === ContentStatus.ARCHIVED ? "ARCHIVE" : "UPDATE", "Updated project story and editorial settings through CMS."); refreshProject(project.slug); redirect(`/admin/projects/${project.slug}`);
}
export async function addProjectRole(formData: FormData) {
  const user = await requireAdmin(); const parsed = roleSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) throw new Error("Role data is invalid."); const count = await db.projectRole.count({ where: { projectId: parsed.data.projectId } });
  const role = await db.projectRole.create({ data: { ...parsed.data, description: parsed.data.description || null, sortOrder: count } }); const project = await db.project.findUniqueOrThrow({ where: { id: role.projectId } }); await recordProjectChange(user.id, project, "UPDATE", "Added project role."); refreshProject(project.slug);
}
export async function removeProjectRole(formData: FormData) {
  const user = await requireAdmin(); const id = z.string().uuid().parse(formData.get("id")); const role = await db.projectRole.delete({ where: { id } }); const project = await db.project.findUniqueOrThrow({ where: { id: role.projectId } }); await recordProjectChange(user.id, project, "UPDATE", "Removed project role."); refreshProject(project.slug);
}
async function addRelation(formData: FormData, kind: "skill" | "tag") {
  const user = await requireAdmin(); const { projectId, value } = relationSchema.parse(Object.fromEntries(formData));
  if (kind === "skill") await db.projectSkill.upsert({ where: { projectId_skillId: { projectId, skillId: value } }, update: {}, create: { projectId, skillId: value } }); else await db.projectTag.upsert({ where: { projectId_tagId: { projectId, tagId: value } }, update: {}, create: { projectId, tagId: value } });
  const project = await db.project.findUniqueOrThrow({ where: { id: projectId } }); await recordProjectChange(user.id, project, "UPDATE", `Attached ${kind}.`); refreshProject(project.slug);
}
export async function addProjectSkill(formData: FormData) { return addRelation(formData, "skill"); }
export async function addProjectTag(formData: FormData) { return addRelation(formData, "tag"); }
async function removeRelation(formData: FormData, kind: "skill" | "tag") {
  const user = await requireAdmin(); const { projectId, value } = relationSchema.parse(Object.fromEntries(formData));
  if (kind === "skill") await db.projectSkill.delete({ where: { projectId_skillId: { projectId, skillId: value } } }); else await db.projectTag.delete({ where: { projectId_tagId: { projectId, tagId: value } } });
  const project = await db.project.findUniqueOrThrow({ where: { id: projectId } }); await recordProjectChange(user.id, project, "UPDATE", `Removed ${kind}.`); refreshProject(project.slug);
}
export async function removeProjectSkill(formData: FormData) { return removeRelation(formData, "skill"); }
export async function removeProjectTag(formData: FormData) { return removeRelation(formData, "tag"); }
export async function addProjectBlock(formData: FormData) {
  const user = await requireAdmin(); const parsed = blockSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) throw new Error("Story block is invalid."); const count = await db.projectBlock.count({ where: { projectId: parsed.data.projectId } }); const data = parsed.data.type === "LIST" ? { items: parsed.data.content.split("\n").map((item) => item.trim()).filter(Boolean) } : { text: parsed.data.content };
  await db.projectBlock.create({ data: { projectId: parsed.data.projectId, type: parsed.data.type as BlockType, data, sortOrder: count } }); const project = await db.project.findUniqueOrThrow({ where: { id: parsed.data.projectId } }); await recordProjectChange(user.id, project, "UPDATE", "Added structured story block."); refreshProject(project.slug);
}
export async function removeProjectBlock(formData: FormData) {
  const user = await requireAdmin(); const id = z.string().uuid().parse(formData.get("id")); const block = await db.projectBlock.delete({ where: { id } }); const project = await db.project.findUniqueOrThrow({ where: { id: block.projectId } }); await recordProjectChange(user.id, project, "UPDATE", "Removed structured story block."); refreshProject(project.slug);
}
export async function addProjectMedia(formData: FormData) {
  const user = await requireAdmin(); const parsed = mediaSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) throw new Error("Media data is invalid. A descriptive alt text is required.");
  const count = await db.projectMedia.count({ where: { projectId: parsed.data.projectId } }); const media = await db.media.create({ data: { storageKey: parsed.data.url, url: parsed.data.url, type: parsed.data.type, title: parsed.data.title || null, altText: parsed.data.altText, caption: parsed.data.caption || null } });
  await db.projectMedia.create({ data: { projectId: parsed.data.projectId, mediaId: media.id, sortOrder: count, isCover: count === 0, caption: parsed.data.caption || null } }); const project = await db.project.findUniqueOrThrow({ where: { id: parsed.data.projectId } }); await recordProjectChange(user.id, project, "UPDATE", "Attached project media."); refreshProject(project.slug);
}
export async function removeProjectMedia(formData: FormData) {
  const user = await requireAdmin(); const id = z.string().uuid().parse(formData.get("id")); const attachment = await db.projectMedia.delete({ where: { id } }); const project = await db.project.findUniqueOrThrow({ where: { id: attachment.projectId } }); await recordProjectChange(user.id, project, "UPDATE", "Removed project media attachment."); refreshProject(project.slug);
}
export async function addProjectDocument(formData: FormData) {
  const user = await requireAdmin(); const parsed = documentSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) throw new Error("Document data is invalid.");
  const count = await db.projectDocument.count({ where: { projectId: parsed.data.projectId } }); const document = await db.document.create({ data: { title: parsed.data.title, description: parsed.data.description || null, fileUrl: parsed.data.fileUrl, storageKey: parsed.data.fileUrl, type: parsed.data.type, visibility: parsed.data.visibility } });
  await db.projectDocument.create({ data: { projectId: parsed.data.projectId, documentId: document.id, sortOrder: count } }); const project = await db.project.findUniqueOrThrow({ where: { id: parsed.data.projectId } }); await recordProjectChange(user.id, project, "UPDATE", "Attached project document."); refreshProject(project.slug);
}
export async function removeProjectDocument(formData: FormData) {
  const user = await requireAdmin(); const id = z.string().uuid().parse(formData.get("id")); const attachment = await db.projectDocument.delete({ where: { id } }); const project = await db.project.findUniqueOrThrow({ where: { id: attachment.projectId } }); await recordProjectChange(user.id, project, "UPDATE", "Removed project document attachment."); refreshProject(project.slug);
}
