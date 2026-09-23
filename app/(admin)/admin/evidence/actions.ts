"use server";

import { DocumentType, MediaType, Visibility } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { PRIVATE_BUCKET, PUBLIC_BUCKET, publicObjectUrl, uploadObject } from "@/lib/storage";

const optionalText = z.string().trim().max(1000).transform((value) => value || null);
const mediaSchema = z.object({ id: z.string().uuid().optional(), url: z.string().trim().url().max(2048), type: z.nativeEnum(MediaType), title: optionalText, altText: z.string().trim().min(3).max(300), caption: optionalText, description: optionalText });
const documentSchema = z.object({ id: z.string().uuid().optional(), title: z.string().trim().min(2).max(160), fileUrl: z.string().trim().url().max(2048), type: z.nativeEnum(DocumentType), visibility: z.nativeEnum(Visibility), description: optionalText, version: z.string().trim().max(80).transform((value) => value || null) });

function refreshEvidence() { revalidatePath("/admin/evidence"); revalidatePath("/work"); revalidatePath("/archive"); }

const maxUploadBytes = 20 * 1024 * 1024;
const unsafeMimeTypes = new Set(["text/html", "application/javascript", "text/javascript", "image/svg+xml"]);

function uploadedFile(formData: FormData) {
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) throw new Error("Choose a non-empty file to upload.");
  if (file.size > maxUploadBytes) throw new Error("Files must be 20 MB or smaller. Use a direct external URL for larger media.");
  const mimeType = file.type || "application/octet-stream";
  if (unsafeMimeTypes.has(mimeType)) throw new Error("HTML, JavaScript, and SVG uploads are not accepted as evidence files.");
  return { file, mimeType };
}

function safeExtension(fileName: string) {
  const extension = fileName.toLowerCase().match(/\.([a-z0-9]{1,10})$/)?.[1];
  return extension ? `.${extension}` : "";
}

function mediaMatchesType(type: MediaType, mimeType: string) {
  if (type === MediaType.IMAGE) return mimeType.startsWith("image/");
  if (type === MediaType.VIDEO) return mimeType.startsWith("video/");
  if (type === MediaType.AUDIO) return mimeType.startsWith("audio/");
  if (type === MediaType.PDF_PREVIEW) return mimeType === "application/pdf";
  return true;
}

export async function uploadMedia(formData: FormData) {
  const user = await requireAdmin();
  const parsed = z.object({ type: z.nativeEnum(MediaType), title: optionalText, altText: z.string().trim().min(3).max(300), caption: optionalText, description: optionalText }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Media needs a type and descriptive alt text.");
  const { file, mimeType } = uploadedFile(formData);
  if (!mediaMatchesType(parsed.data.type, mimeType)) throw new Error("The selected media type does not match the uploaded file.");
  const key = `media/${new Date().toISOString().slice(0, 7)}/${randomUUID()}${safeExtension(file.name)}`;
  await uploadObject({ bucket: PUBLIC_BUCKET, key, body: new Uint8Array(await file.arrayBuffer()), contentType: mimeType });
  const media = await db.media.create({ data: { ...parsed.data, storageKey: `${PUBLIC_BUCKET}:${key}`, url: publicObjectUrl(key), mimeType, fileSize: file.size, metadata: { originalFileName: file.name, bucket: PUBLIC_BUCKET } } });
  await db.auditLog.create({ data: { userId: user.id, action: "CREATE", entityType: "media", entityId: media.id, metadata: { upload: true, bucket: PUBLIC_BUCKET, key } } });
  refreshEvidence(); redirect("/admin/evidence");
}

export async function uploadDocument(formData: FormData) {
  const user = await requireAdmin();
  const parsed = z.object({ title: z.string().trim().min(2).max(160), type: z.nativeEnum(DocumentType), visibility: z.nativeEnum(Visibility), description: optionalText, version: z.string().trim().max(80).transform((value) => value || null) }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Document metadata is invalid.");
  const { file, mimeType } = uploadedFile(formData);
  const bucket = parsed.data.visibility === Visibility.PUBLIC ? PUBLIC_BUCKET : PRIVATE_BUCKET;
  const key = `documents/${new Date().toISOString().slice(0, 7)}/${randomUUID()}${safeExtension(file.name)}`;
  await uploadObject({ bucket, key, body: new Uint8Array(await file.arrayBuffer()), contentType: mimeType });
  const id = randomUUID();
  const document = await db.document.create({ data: { id, ...parsed.data, storageKey: `${bucket}:${key}`, fileUrl: bucket === PUBLIC_BUCKET ? publicObjectUrl(key) : `/api/storage/document/${id}`, mimeType, fileSize: file.size } });
  await db.auditLog.create({ data: { userId: user.id, action: "CREATE", entityType: "document", entityId: document.id, metadata: { upload: true, bucket, key } } });
  refreshEvidence(); redirect("/admin/evidence");
}

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
