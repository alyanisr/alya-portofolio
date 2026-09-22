"use server";

import { ContentStatus, EmploymentType, Prisma, Visibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const optionalText = z.string().trim().max(12000).transform((value) => value || null);
const slug = z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens.");
const baseSchema = z.object({
  company: z.string().trim().min(2).max(160), role: z.string().trim().min(2).max(160), slug,
  employmentType: z.nativeEnum(EmploymentType), location: z.string().trim().max(160).transform((value) => value || null), locationType: z.string().trim().max(80).transform((value) => value || null),
  startDate: z.coerce.date(), endDate: z.union([z.coerce.date(), z.literal("")]).transform((value) => value || null), isCurrent: z.enum(["true", "false"]), summary: z.string().trim().min(10).max(5000),
  responsibilities: z.string().trim().max(12000).transform((value) => value.split("\n").map((item) => item.trim()).filter(Boolean)), impact: optionalText, metrics: optionalText,
  status: z.nativeEnum(ContentStatus), visibility: z.nativeEnum(Visibility), featured: z.enum(["true", "false"]),
});
const createSchema = baseSchema.pick({ company: true, role: true, slug: true, employmentType: true, startDate: true, summary: true }).extend({ employmentType: z.nativeEnum(EmploymentType).default(EmploymentType.INTERNSHIP) });
const updateSchema = baseSchema.extend({ id: z.string().uuid() });
const attachmentSchema = z.object({ experienceId: z.string().uuid(), value: z.string().uuid() });
const removeSchema = z.object({ id: z.string().uuid() });

function normalizeMetrics(value: string | null) {
  if (!value) return Prisma.JsonNull;
  try { return JSON.parse(value) as Prisma.InputJsonValue; } catch { throw new Error("Metrics must be valid JSON."); }
}
function toSnapshot(value: unknown) { return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue; }
async function record(userId: string, experienceId: string, action: "CREATE" | "UPDATE" | "PUBLISH" | "ARCHIVE" | "RESTORE", note: string) {
  const current = await db.experience.findUniqueOrThrow({ where: { id: experienceId }, include: { skills: true, projects: true, media: true, documents: true } });
  const version = await db.contentVersion.count({ where: { contentType: "experience", contentId: experienceId } }) + 1;
  await db.$transaction([
    db.contentVersion.create({ data: { contentType: "experience", contentId: experienceId, version, snapshot: toSnapshot(current), changeNote: note, createdById: userId } }),
    db.auditLog.create({ data: { userId, action, entityType: "experience", entityId: experienceId, metadata: { note } } }),
  ]);
}
function refresh(slug: string) { ["/", "/experience", `/experience/${slug}`, "/archive", "/admin/experiences", `/admin/experiences/${slug}`, "/admin/content/experience"].forEach((path) => revalidatePath(path)); }

export async function createExperience(formData: FormData) {
  const user = await requireAdmin(); const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Experience needs a company, role, stable slug, start date, and concise summary.");
  if (await db.experience.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } })) throw new Error("That experience slug is already in use.");
  const experience = await db.experience.create({ data: { ...parsed.data, responsibilities: [], status: ContentStatus.DRAFT, visibility: Visibility.PRIVATE, featured: false, isCurrent: false } });
  await record(user.id, experience.id, "CREATE", "Created a private experience draft."); refresh(experience.slug); redirect(`/admin/experiences/${experience.slug}`);
}

export async function updateExperience(formData: FormData) {
  const user = await requireAdmin(); const parsed = updateSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) throw new Error("Experience data is invalid.");
  const { id, isCurrent, featured, metrics, ...data } = parsed.data;
  const experience = await db.experience.update({ where: { id }, data: { ...data, isCurrent: isCurrent === "true", featured: featured === "true", metrics: normalizeMetrics(metrics), endDate: isCurrent === "true" ? null : data.endDate } });
  await record(user.id, id, data.status === ContentStatus.PUBLISHED ? "PUBLISH" : data.status === ContentStatus.ARCHIVED ? "ARCHIVE" : "UPDATE", "Updated experience story and editorial settings through CMS."); refresh(experience.slug); redirect(`/admin/experiences/${experience.slug}`);
}

async function attach(formData: FormData, type: "skill" | "project" | "media" | "document") {
  const user = await requireAdmin(); const { experienceId, value } = attachmentSchema.parse(Object.fromEntries(formData));
  if (type === "skill") await db.experienceSkill.upsert({ where: { experienceId_skillId: { experienceId, skillId: value } }, update: {}, create: { experienceId, skillId: value } });
  if (type === "project") await db.experienceProject.upsert({ where: { experienceId_projectId: { experienceId, projectId: value } }, update: {}, create: { experienceId, projectId: value } });
  if (type === "media") { const sortOrder = await db.experienceMedia.count({ where: { experienceId } }); await db.experienceMedia.create({ data: { experienceId, mediaId: value, sortOrder, isCover: sortOrder === 0 } }); }
  if (type === "document") await db.experienceDocument.create({ data: { experienceId, documentId: value } });
  const experience = await db.experience.findUniqueOrThrow({ where: { id: experienceId } }); await record(user.id, experienceId, "UPDATE", `Attached ${type}.`); refresh(experience.slug);
}
async function detach(formData: FormData, type: "skill" | "project" | "media" | "document") {
  const user = await requireAdmin(); const { experienceId, value } = attachmentSchema.parse(Object.fromEntries(formData));
  if (type === "skill") await db.experienceSkill.delete({ where: { experienceId_skillId: { experienceId, skillId: value } } });
  if (type === "project") await db.experienceProject.delete({ where: { experienceId_projectId: { experienceId, projectId: value } } });
  if (type === "media") await db.experienceMedia.delete({ where: { id: value } });
  if (type === "document") { const link = await db.experienceDocument.findFirstOrThrow({ where: { experienceId, documentId: value } }); await db.experienceDocument.delete({ where: { id: link.id } }); }
  const experience = await db.experience.findUniqueOrThrow({ where: { id: experienceId } }); await record(user.id, experienceId, "UPDATE", `Detached ${type}.`); refresh(experience.slug);
}
export const attachExperienceSkill = (data: FormData) => attach(data, "skill"); export const detachExperienceSkill = (data: FormData) => detach(data, "skill");
export const attachExperienceProject = (data: FormData) => attach(data, "project"); export const detachExperienceProject = (data: FormData) => detach(data, "project");
export const attachExperienceMedia = (data: FormData) => attach(data, "media"); export const detachExperienceMedia = (data: FormData) => detach(data, "media");
export const attachExperienceDocument = (data: FormData) => attach(data, "document"); export const detachExperienceDocument = (data: FormData) => detach(data, "document");

export async function archiveExperience(formData: FormData) { const user = await requireAdmin(); const { id } = removeSchema.parse(Object.fromEntries(formData)); const item = await db.experience.update({ where: { id }, data: { status: ContentStatus.ARCHIVED, deletedAt: new Date() } }); await record(user.id, id, "ARCHIVE", "Archived through the experience CMS."); refresh(item.slug); redirect("/admin/experiences"); }
export async function restoreExperience(formData: FormData) { const user = await requireAdmin(); const { id } = removeSchema.parse(Object.fromEntries(formData)); const item = await db.experience.update({ where: { id }, data: { status: ContentStatus.DRAFT, deletedAt: null } }); await record(user.id, id, "RESTORE", "Restored as a private draft."); refresh(item.slug); redirect(`/admin/experiences/${item.slug}`); }
