"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const optionalText = z.string().trim().max(120).transform((value) => value || null);
const optionalUrl = z.string().trim().url().max(2048).or(z.string().startsWith("/")).or(z.string().startsWith("#")).or(z.literal("")).transform((value) => value || null);
const schema = z.object({ heroTagline: z.string().trim().min(2).max(120), heroHeadline: z.string().trim().min(5).max(240), heroSubheadline: z.string().trim().min(5).max(500), heroCta1Text: z.string().trim().min(2).max(80), heroCta1Url: z.string().trim().url().max(2048).or(z.string().startsWith("/")), heroCta2Text: optionalText, heroCta2Url: optionalUrl, featuredProjectIds: z.array(z.string().uuid()).max(10), featuredExperienceIds: z.array(z.string().uuid()).max(5), featuredAchievementIds: z.array(z.string().uuid()).max(8), featuredLearningIds: z.array(z.string().uuid()).max(8), featuredLensIds: z.array(z.string().uuid()).max(7) });

function values(formData: FormData, key: string) {
  const selected = formData.getAll(key).filter((value): value is string => typeof value === "string");
  return selected.sort((a, b) => Number(formData.get(`${key}Order:${a}`) ?? 0) - Number(formData.get(`${key}Order:${b}`) ?? 0));
}
export async function saveHomepage(formData: FormData) {
  const user = await requireAdmin(); const parsed = schema.safeParse({ ...Object.fromEntries(formData), featuredProjectIds: values(formData, "featuredProjectIds"), featuredExperienceIds: values(formData, "featuredExperienceIds"), featuredAchievementIds: values(formData, "featuredAchievementIds"), featuredLearningIds: values(formData, "featuredLearningIds"), featuredLensIds: values(formData, "featuredLensIds") });
  if (!parsed.success) throw new Error("Homepage curation is invalid.");
  const [projects, experiences, achievements, learning, lenses] = await Promise.all([db.project.count({ where: { id: { in: parsed.data.featuredProjectIds }, deletedAt: null } }), db.experience.count({ where: { id: { in: parsed.data.featuredExperienceIds }, deletedAt: null } }), db.achievement.count({ where: { id: { in: parsed.data.featuredAchievementIds }, deletedAt: null } }), db.learningItem.count({ where: { id: { in: parsed.data.featuredLearningIds }, deletedAt: null } }), db.roleLens.count({ where: { id: { in: parsed.data.featuredLensIds } } })]);
  if ([projects, experiences, achievements, learning, lenses].some((count, index) => count !== [parsed.data.featuredProjectIds, parsed.data.featuredExperienceIds, parsed.data.featuredAchievementIds, parsed.data.featuredLearningIds, parsed.data.featuredLensIds][index].length)) throw new Error("One selected homepage item no longer exists.");
  const current = await db.homepageConfig.findFirst(); const config = current ? await db.homepageConfig.update({ where: { id: current.id }, data: parsed.data }) : await db.homepageConfig.create({ data: parsed.data });
  await db.auditLog.create({ data: { userId: user.id, action: "UPDATE", entityType: "homepage_config", entityId: config.id, metadata: { curated: true } } });
  ["/", "/admin/homepage"].forEach((path) => revalidatePath(path)); redirect("/admin/homepage");
}
