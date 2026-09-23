"use server";

import { Prisma, SkillMaturity, Visibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const slug = z.string().trim().min(2).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const optionalText = z.string().trim().max(4000).transform((value) => value || null);
const categorySchema = z.object({ name: z.string().trim().min(2).max(120), slug, description: optionalText, sortOrder: z.coerce.number().int().min(0).max(9999) });
const skillSchema = z.object({ id: z.string().uuid().optional(), name: z.string().trim().min(2).max(120), slug, categoryId: z.string().uuid(), maturity: z.nativeEnum(SkillMaturity), description: optionalText, evidence: optionalText, visibility: z.nativeEnum(Visibility), featured: z.enum(["true", "false"]), sortOrder: z.coerce.number().int().min(0).max(9999) });
function refresh() { ["/", "/capabilities", "/archive", "/admin/capabilities"].forEach((path) => revalidatePath(path)); }
function snapshot(value: unknown) { return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue; }
async function record(userId: string, id: string, action: "CREATE" | "UPDATE" | "ARCHIVE" | "RESTORE", note: string) { const item = await db.skill.findUniqueOrThrow({ where: { id }, include: { category: true } }); const version = await db.contentVersion.count({ where: { contentType: "skill", contentId: id } }) + 1; await db.$transaction([db.contentVersion.create({ data: { contentType: "skill", contentId: id, version, snapshot: snapshot(item), changeNote: note, createdById: userId } }), db.auditLog.create({ data: { userId, action, entityType: "skill", entityId: id, metadata: { note } } })]); }
export async function saveCategory(formData: FormData) { await requireAdmin(); const parsed = categorySchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) throw new Error("Category data is invalid."); const exists = await db.skillCategory.findUnique({ where: { slug: parsed.data.slug } }); if (exists) throw new Error("That category slug is already in use."); await db.skillCategory.create({ data: parsed.data }); refresh(); redirect("/admin/capabilities"); }
export async function saveSkill(formData: FormData) { const user = await requireAdmin(); const parsed = skillSchema.safeParse(Object.fromEntries(formData)); if (!parsed.success) throw new Error("Capability data is invalid."); const { id, featured, ...data } = parsed.data; const duplicate = await db.skill.findFirst({ where: { slug: data.slug, ...(id ? { NOT: { id } } : {}) }, select: { id: true } }); if (duplicate) throw new Error("That capability slug is already in use."); const item = id ? await db.skill.update({ where: { id }, data: { ...data, featured: featured === "true" } }) : await db.skill.create({ data: { ...data, featured: featured === "true" } }); await record(user.id, item.id, id ? "UPDATE" : "CREATE", id ? "Updated capability." : "Created capability."); refresh(); redirect("/admin/capabilities"); }
export async function archiveSkill(formData: FormData) { const user = await requireAdmin(); const id = z.string().uuid().parse(formData.get("id")); await db.skill.update({ where: { id }, data: { deletedAt: new Date(), visibility: Visibility.PRIVATE } }); await record(user.id, id, "ARCHIVE", "Archived capability."); refresh(); redirect("/admin/capabilities"); }
export async function restoreSkill(formData: FormData) { const user = await requireAdmin(); const id = z.string().uuid().parse(formData.get("id")); await db.skill.update({ where: { id }, data: { deletedAt: null } }); await record(user.id, id, "RESTORE", "Restored capability."); refresh(); redirect("/admin/capabilities"); }
