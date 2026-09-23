"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const text = (max: number) => z.string().trim().max(max).transform((value) => value || null);
const url = z.string().trim().url().max(2048).or(z.literal("")).transform((value) => value || null);
const profileSchema = z.object({ name: z.string().trim().min(2).max(120), tagline: z.string().trim().min(2).max(180), headline: z.string().trim().min(5).max(240), bio: z.string().trim().min(10).max(3000), philosophy: z.string().trim().min(10).max(1500), email: z.string().trim().email(), location: z.string().trim().min(2).max(160), linkedin: url, github: url, availability: text(200), photoUrl: url, cvUrl: url, metaTitle: text(160), metaDescription: text(320), ogImage: url });

export async function saveProfile(formData: FormData) {
  const user = await requireAdmin();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Profile information is incomplete or contains an invalid URL.");
  const current = await db.person.findFirst();
  const person = current ? await db.person.update({ where: { id: current.id }, data: parsed.data }) : await db.person.create({ data: parsed.data });
  await db.auditLog.create({ data: { userId: user.id, action: "UPDATE", entityType: "person", entityId: person.id, metadata: { profile: true } } });
  ["/", "/about", "/contact", "/admin/profile"].forEach((path) => revalidatePath(path));
  redirect("/admin/profile");
}
