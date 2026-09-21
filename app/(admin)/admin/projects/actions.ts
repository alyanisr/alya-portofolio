"use server";
import { ContentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const projectSchema = z.object({ id: z.string().uuid(), title: z.string().min(2).max(160).trim(), overview: z.string().min(10).max(5000).trim(), status: z.nativeEnum(ContentStatus), featured: z.enum(["true", "false"]) });
export async function updateProject(formData: FormData) { const user = await requireAdmin(); const result = projectSchema.safeParse(Object.fromEntries(formData)); if (!result.success) throw new Error("Project data is invalid."); const { id, title, overview, status, featured } = result.data; const project = await db.project.update({ where: { id }, data: { title, overview, status, featured: featured === "true", publishedAt: status === ContentStatus.PUBLISHED ? new Date() : undefined } }); await db.contentVersion.create({ data: { contentType: "project", contentId: project.id, version: (await db.contentVersion.count({ where: { contentType: "project", contentId: project.id } })) + 1, snapshot: { title, overview, status, featured: featured === "true" }, changeNote: "Updated through CMS", createdById: user.id } }); await db.auditLog.create({ data: { userId: user.id, action: "UPDATE", entityType: "project", entityId: project.id } }); revalidatePath("/"); revalidatePath("/work"); revalidatePath(`/work/${project.slug}`); revalidatePath("/admin/projects"); redirect(`/admin/projects/${project.slug}`); }
