"use server";
import { ContentStatus, Visibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
const schema = z.object({ type: z.enum(["experience", "achievement", "skill"]), id: z.string().uuid(), status: z.nativeEnum(ContentStatus).optional(), visibility: z.nativeEnum(Visibility), featured: z.enum(["true", "false"]).optional() });
export async function updateContentState(formData: FormData) { const user = await requireAdmin(); const parsed = schema.safeParse(Object.fromEntries(formData)); if (!parsed.success) throw new Error("Invalid content update."); const { type, id, status, visibility, featured } = parsed.data; if (type === "experience") await db.experience.update({ where: { id }, data: { status, visibility, featured: featured === "true" } }); if (type === "achievement") await db.achievement.update({ where: { id }, data: { status, visibility, featured: featured === "true" } }); if (type === "skill") await db.skill.update({ where: { id }, data: { visibility, featured: featured === "true" } }); await db.auditLog.create({ data: { userId: user.id, action: "UPDATE", entityType: type, entityId: id, metadata: { status, visibility, featured } } }); revalidatePath("/"); revalidatePath("/experience"); revalidatePath("/capabilities"); revalidatePath("/archive"); redirect(`/admin/content/${type}`); }
