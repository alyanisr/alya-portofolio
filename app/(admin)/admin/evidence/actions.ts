"use server";

import { DocumentType, MediaType, Visibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const optionalText = z.string().trim().max(1000).transform((value) => value || null);
const mediaSchema = z.object({ id: z.string().uuid().optional(), url: z.string().trim().url().max(2048), type: z.nativeEnum(MediaType), title: optionalText, altText: z.string().trim().min(3).max(300), caption: optionalText, description: optionalText });
const documentSchema = z.object({ id: z.string().uuid().optional(), title: z.string().trim().min(2).max(160), fileUrl: z.string().trim().url().max(2048), type: z.nativeEnum(DocumentType), visibility: z.nativeEnum(Visibility), description: optionalText, version: z.string().trim().max(80).transform((value) => value || null) });

function refreshEvidence() { revalidatePath("/admin/evidence"); revalidatePath("/work"); revalidatePath("/archive"); }

export async function saveMedia(formData: FormData) {
  const user = await requireAdmin(); const parsed = mediaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Media needs a valid source URL and descriptive alt text.");
  const { id, url, ...data } = parsed.data;
  const media = id ? await db.media.update({ where: { id }, data: { ...data, url, storageKey: url } }) : await db.media.create({ data: { ...data, url, storageKey: url } });
  await db.auditLog.create({ data: { userId: user.id, action: id ? "UPDATE" : "CREATE", entityType: "media", entityId: media.id } }); refreshEvidence(); redirect("/admin/evidence");
}

export async function saveDocument(formData: FormData) {
  const user = await requireAdmin(); const parsed = documentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Document metadata is invalid.");
  const { id, fileUrl, ...data } = parsed.data;
  const document = id ? await db.document.update({ where: { id }, data: { ...data, fileUrl, storageKey: fileUrl } }) : await db.document.create({ data: { ...data, fileUrl, storageKey: fileUrl } });
  await db.auditLog.create({ data: { userId: user.id, action: id ? "UPDATE" : "CREATE", entityType: "document", entityId: document.id } }); refreshEvidence(); redirect("/admin/evidence");
}

export async function retireEvidence(formData: FormData) {
  const user = await requireAdmin(); const parsed = z.object({ type: z.enum(["media", "document"]), id: z.string().uuid() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid evidence request.");
  const { type, id } = parsed.data;
  if (type === "media") {
    const counts = await db.$transaction([db.projectMedia.count({ where: { mediaId: id } }), db.experienceMedia.count({ where: { mediaId: id } }), db.achievementMedia.count({ where: { mediaId: id } }), db.trainingMedia.count({ where: { mediaId: id } }), db.organizationMedia.count({ where: { mediaId: id } }), db.activityMedia.count({ where: { mediaId: id } })]);
    if (counts.some(Boolean)) throw new Error("Detach this media from its content before retiring it.");
    await db.media.update({ where: { id }, data: { deletedAt: new Date() } });
  } else {
    const counts = await db.$transaction([db.projectDocument.count({ where: { documentId: id } }), db.experienceDocument.count({ where: { documentId: id } }), db.achievementDocument.count({ where: { documentId: id } }), db.certificationDocument.count({ where: { documentId: id } }), db.trainingDocument.count({ where: { documentId: id } }), db.resumeDocument.count({ where: { documentId: id } })]);
    if (counts.some(Boolean)) throw new Error("Detach this document from its content before retiring it.");
    await db.document.update({ where: { id }, data: { deletedAt: new Date() } });
  }
  await db.auditLog.create({ data: { userId: user.id, action: "DELETE", entityType: type, entityId: id, metadata: { softDeleted: true } } }); refreshEvidence(); redirect("/admin/evidence");
}
