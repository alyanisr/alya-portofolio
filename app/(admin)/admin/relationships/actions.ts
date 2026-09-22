"use server";

import { RelationType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const types = ["project", "experience", "achievement", "skill", "document"] as const;
type ContentType = typeof types[number];
const relationSchema = z.object({ source: z.string().min(3), target: z.string().min(3), relationType: z.nativeEnum(RelationType), note: z.string().trim().max(1000).transform((value) => value || null) });

function parseReference(value: string) {
  const [type, id] = value.split(":");
  if (!types.includes(type as ContentType) || !z.string().uuid().safeParse(id).success) throw new Error("Select valid content items.");
  return { type: type as ContentType, id };
}
async function exists({ type, id }: { type: ContentType; id: string }) {
  if (type === "project") return db.project.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (type === "experience") return db.experience.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (type === "achievement") return db.achievement.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  if (type === "skill") return db.skill.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
  return db.document.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
}
function refreshRelationships() { ["/", "/work", "/experience", "/achievements", "/capabilities", "/archive", "/admin/relationships"].forEach((path) => revalidatePath(path)); }

export async function saveRelationship(formData: FormData) {
  const user = await requireAdmin(); const parsed = relationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Relationship data is invalid.");
  const source = parseReference(parsed.data.source); const target = parseReference(parsed.data.target);
  if (source.type === target.type && source.id === target.id) throw new Error("Content cannot be related to itself.");
  if (!(await exists(source)) || !(await exists(target))) throw new Error("One selected content item no longer exists.");
  const existing = await db.contentRelation.findFirst({ where: { sourceType: source.type, sourceId: source.id, targetType: target.type, targetId: target.id, relationType: parsed.data.relationType } });
  const relation = existing ? await db.contentRelation.update({ where: { id: existing.id }, data: { note: parsed.data.note } }) : await db.contentRelation.create({ data: { sourceType: source.type, sourceId: source.id, targetType: target.type, targetId: target.id, relationType: parsed.data.relationType, note: parsed.data.note } });
  await db.auditLog.create({ data: { userId: user.id, action: existing ? "UPDATE" : "CREATE", entityType: "content_relation", entityId: relation.id, metadata: { source, target, relationType: relation.relationType } } }); refreshRelationships(); redirect("/admin/relationships");
}

export async function removeRelationship(formData: FormData) {
  const user = await requireAdmin(); const id = z.string().uuid().parse(formData.get("id")); const relation = await db.contentRelation.delete({ where: { id } });
  await db.auditLog.create({ data: { userId: user.id, action: "DELETE", entityType: "content_relation", entityId: relation.id, metadata: { sourceType: relation.sourceType, targetType: relation.targetType } } }); refreshRelationships(); redirect("/admin/relationships");
}
