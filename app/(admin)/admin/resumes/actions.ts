"use server";

import { Visibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const optionalText = z.string().trim().max(80).transform((value) => value || null);
const schema = z.object({ id: z.string().uuid().optional(), title: z.string().trim().min(2).max(160), fileUrl: z.string().trim().url().max(2048), version: optionalText, date: z.string().trim().optional(), active: z.enum(["true", "false"]), visibility: z.nativeEnum(Visibility) });
function refresh() { revalidatePath("/admin/resumes"); revalidatePath("/recruiter/[slug]", "page"); }

export async function saveResume(formData: FormData) {
  const user = await requireAdmin(); const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Resume details are invalid.");
  const { id, date, active, ...data } = parsed.data; const resumeData = { ...data, active: active === "true", date: date ? new Date(date) : null, storageKey: data.fileUrl };
  if (resumeData.date && Number.isNaN(resumeData.date.getTime())) throw new Error("Resume date is invalid.");
  const resume = id ? await db.resume.update({ where: { id }, data: resumeData }) : await db.resume.create({ data: resumeData });
  await db.auditLog.create({ data: { userId: user.id, action: id ? "UPDATE" : "CREATE", entityType: "resume", entityId: resume.id } }); refresh(); redirect("/admin/resumes");
}

export async function retireResume(formData: FormData) {
  const user = await requireAdmin(); const id = z.string().uuid().parse(formData.get("id"));
  const links = await db.roleLensResume.count({ where: { resumeId: id } });
  if (links) throw new Error("Detach this resume from recruiter lenses before retiring it.");
  await db.resume.update({ where: { id }, data: { deletedAt: new Date(), active: false } });
  await db.auditLog.create({ data: { userId: user.id, action: "DELETE", entityType: "resume", entityId: id, metadata: { softDeleted: true } } }); refresh(); redirect("/admin/resumes");
}
