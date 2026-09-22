"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const optionalText = z.string().trim().max(4000).transform((value) => value || null);
const optionalUrl = z.string().trim().url().max(2048).or(z.literal("")).transform((value) => value || null);
const lensSchema = z.object({ id: z.string().uuid(), headline: z.string().trim().min(5).max(240), intro: z.string().trim().min(10).max(4000), ctaText: optionalText, ctaUrl: optionalUrl, active: z.enum(["true", "false"]), sortOrder: z.coerce.number().int().min(0).max(999) });
const entryTypes = ["project", "experience", "skill", "achievement", "resume"] as const;
const entrySchema = z.object({ lensId: z.string().uuid(), entry: z.string(), priority: z.coerce.number().int().min(0).max(999), highlight: z.enum(["true", "false"]), note: optionalText });
const removeEntrySchema = z.object({ lensId: z.string().uuid(), type: z.enum(entryTypes), itemId: z.string().uuid() });

function parseEntry(value: string) {
  const [type, itemId] = value.split(":");
  if (!entryTypes.includes(type as (typeof entryTypes)[number]) || !z.string().uuid().safeParse(itemId).success) throw new Error("Select a valid content item.");
  return { type: type as (typeof entryTypes)[number], itemId };
}

function refresh(slug?: string) { revalidatePath("/"); revalidatePath("/admin/recruiter-lenses"); revalidatePath("/recruiter/[slug]", "page"); if (slug) revalidatePath(`/recruiter/${slug}`); }

export async function updateLens(formData: FormData) {
  const user = await requireAdmin(); const parsed = lensSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Recruiter lens settings are invalid.");
  const { id, active, ...data } = parsed.data;
  const lens = await db.roleLens.update({ where: { id }, data: { ...data, active: active === "true" } });
  await db.auditLog.create({ data: { userId: user.id, action: "UPDATE", entityType: "role_lens", entityId: lens.id, metadata: { fields: ["headline", "intro", "cta", "active", "sortOrder"] } } });
  refresh(lens.slug); redirect("/admin/recruiter-lenses");
}

export async function saveLensEntry(formData: FormData) {
  const user = await requireAdmin(); const parsed = entrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Lens priority data is invalid.");
  const { lensId, priority, highlight, note } = parsed.data; const { type, itemId } = parseEntry(parsed.data.entry);
  const data = { priority, highlight: highlight === "true", ...(type === "project" || type === "experience" ? { note } : {}) };
  if (type === "project") await db.roleLensProject.upsert({ where: { lensId_projectId: { lensId, projectId: itemId } }, update: data, create: { lensId, projectId: itemId, ...data } });
  if (type === "experience") await db.roleLensExperience.upsert({ where: { lensId_experienceId: { lensId, experienceId: itemId } }, update: data, create: { lensId, experienceId: itemId, ...data } });
  if (type === "skill") await db.roleLensSkill.upsert({ where: { lensId_skillId: { lensId, skillId: itemId } }, update: data, create: { lensId, skillId: itemId, ...data } });
  if (type === "achievement") await db.roleLensAchievement.upsert({ where: { lensId_achievementId: { lensId, achievementId: itemId } }, update: data, create: { lensId, achievementId: itemId, ...data } });
  if (type === "resume") await db.roleLensResume.upsert({ where: { lensId_resumeId: { lensId, resumeId: itemId } }, update: { priority }, create: { lensId, resumeId: itemId, priority } });
  const lens = await db.roleLens.findUniqueOrThrow({ where: { id: lensId } });
  await db.auditLog.create({ data: { userId: user.id, action: "UPDATE", entityType: "role_lens", entityId: lensId, metadata: { type, itemId, priority, highlight: highlight === "true" } } });
  refresh(lens.slug); redirect("/admin/recruiter-lenses");
}

export async function removeLensEntry(formData: FormData) {
  const user = await requireAdmin(); const parsed = removeEntrySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Lens entry is invalid.");
  const { lensId, type, itemId } = parsed.data;
  if (type === "project") await db.roleLensProject.delete({ where: { lensId_projectId: { lensId, projectId: itemId } } });
  if (type === "experience") await db.roleLensExperience.delete({ where: { lensId_experienceId: { lensId, experienceId: itemId } } });
  if (type === "skill") await db.roleLensSkill.delete({ where: { lensId_skillId: { lensId, skillId: itemId } } });
  if (type === "achievement") await db.roleLensAchievement.delete({ where: { lensId_achievementId: { lensId, achievementId: itemId } } });
  if (type === "resume") await db.roleLensResume.delete({ where: { lensId_resumeId: { lensId, resumeId: itemId } } });
  const lens = await db.roleLens.findUniqueOrThrow({ where: { id: lensId } });
  await db.auditLog.create({ data: { userId: user.id, action: "DELETE", entityType: "role_lens", entityId: lensId, metadata: { type, itemId } } });
  refresh(lens.slug); redirect("/admin/recruiter-lenses");
}
