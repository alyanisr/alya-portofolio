import { Visibility } from "@prisma/client";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { privateDownloadUrl, PRIVATE_BUCKET } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext<"/api/storage/document/[id]">) {
  const { id } = await context.params;
  const document = await db.document.findFirst({ where: { id, deletedAt: null }, select: { storageKey: true, visibility: true } });
  if (!document?.storageKey) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  if (document.visibility === Visibility.PUBLIC) return NextResponse.json({ error: "This document is publicly available at its registered URL." }, { status: 400 });
  const user = await currentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const [bucket, ...keyParts] = document.storageKey.split(":");
  if (bucket !== PRIVATE_BUCKET || !keyParts.length) return NextResponse.json({ error: "Restricted external documents are not served by storage." }, { status: 404 });
  return NextResponse.redirect(await privateDownloadUrl(keyParts.join(":")));
}
