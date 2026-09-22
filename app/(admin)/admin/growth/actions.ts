"use server";

import { ContentStatus, Prisma, SkillMaturity, Visibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const optionalText = z.string().trim().max(12000).transform((value) => value || null);
const optionalUrl = z.string().trim().url().max(2048).or(z.literal("")).transform((value) => value || null);
const base = z.object({ id: z.string().uuid().optional(), title: z.string().trim().min(2).max(160), slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), visibility: z.nativeEnum(Visibility), status: z.nativeEnum(ContentStatus), sortOrder: z.coerce.number().int().min(0).max(9999) });
const learningSchema = base.extend({ category: z.string().trim().min(2).max(100), maturity: z.nativeEnum(SkillMaturity), description: optionalText, why: optionalText, progressNote: optionalText, resourceUrl: optionalUrl });
const certificationSchema = base.extend({ issuer: z.string().trim().min(2).max(160), issueDate: z.coerce.date(), expiryDate: z.union([z.coerce.date(), z.literal("")]).transform((value) => value || null), credentialId: z.string().trim().max(160).transform((value) => value || null), credentialUrl: optionalUrl, description: optionalText });
const trainingSchema = base.extend({ organizer: z.string().trim().min(2).max(160), date: z.coerce.date(), duration: z.string().trim().max(120).transform((value) => value || null), description: optionalText, certificate: optionalUrl });
const removeSchema = z.object({ type: z.enum(["learning", "certification", "training"]), id: z.string().uuid() });

function refresh() { ["/learning", "/archive", "/admin/growth"].forEach((path) => revalidatePath(path)); }
async function record(userId: string, type: string, id: string, action: "CREATE" | "UPDATE" | "ARCHIVE" | "RESTORE", snapshot: unknown, note: string) {
  const version = await db.contentVersion.count({ where: { contentType: type, contentId: id } }) + 1;
  await db.$transaction([
    db.contentVersion.create({ data: { contentType: type, contentId: id, version, snapshot: JSON.parse(JSON.stringify(snapshot)) as Prisma.InputJsonValue, changeNote: note, createdById: userId } }),
    db.auditLog.create({ data: { userId, action, entityType: type, entityId: id, metadata: { note } } }),
  ]);
}

export async function saveLearning(formData: FormData) {
  const user = await requireAdmin(); const parsed = learningSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) throw new Error("Learning item data is invalid.");
  const { id, ...data } = parsed.data; const item = id ? await db.learningItem.update({ where: { id }, data }) : await db.learningItem.create({ data });
  await record(user.id, "learning", item.id, id ? "UPDATE" : "CREATE", item, id ? "Updated learning item." : "Created learning item."); refresh(); redirect("/admin/growth");
}

export async function saveCertification(formData: FormData) {
  const user = await requireAdmin(); const parsed = certificationSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) throw new Error("Certification data is invalid.");
  const { id, title, ...data } = parsed.data; const item = id ? await db.certification.update({ where: { id }, data: { ...data, name: title } }) : await db.certification.create({ data: { ...data, name: title } });
  await record(user.id, "certification", item.id, id ? "UPDATE" : "CREATE", item, id ? "Updated certification." : "Created certification."); refresh(); redirect("/admin/growth");
}

export async function saveTraining(formData: FormData) {
  const user = await requireAdmin(); const parsed = trainingSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) throw new Error("Training data is invalid.");
  const { id, ...data } = parsed.data; const item = id ? await db.training.update({ where: { id }, data }) : await db.training.create({ data });
  await record(user.id, "training", item.id, id ? "UPDATE" : "CREATE", item, id ? "Updated training." : "Created training."); refresh(); redirect("/admin/growth");
}

export async function archiveGrowth(formData: FormData) {
  const user = await requireAdmin(); const { type, id } = removeSchema.parse(Object.fromEntries(formData)); const data = { status: ContentStatus.ARCHIVED, deletedAt: new Date() };
  const item = type === "learning" ? await db.learningItem.update({ where: { id }, data }) : type === "certification" ? await db.certification.update({ where: { id }, data }) : await db.training.update({ where: { id }, data });
  await record(user.id, type, id, "ARCHIVE", item, "Archived through growth CMS."); refresh(); redirect("/admin/growth");
}

export async function restoreGrowth(formData: FormData) {
  const user = await requireAdmin(); const { type, id } = removeSchema.parse(Object.fromEntries(formData)); const data = { status: ContentStatus.DRAFT, deletedAt: null };
  const item = type === "learning" ? await db.learningItem.update({ where: { id }, data }) : type === "certification" ? await db.certification.update({ where: { id }, data }) : await db.training.update({ where: { id }, data });
  await record(user.id, type, id, "RESTORE", item, "Restored as a draft through growth CMS."); refresh(); redirect("/admin/growth");
}
