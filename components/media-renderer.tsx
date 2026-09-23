import Image from "next/image";
import type { MediaType } from "@prisma/client";

type MediaAsset = { url: string; type: MediaType | string; altText?: string | null; title?: string | null; caption?: string | null };

export function MediaRenderer({ asset, caption }: { asset: MediaAsset; caption?: string | null }) {
  const title = asset.title ?? "Portfolio evidence"; const mediaType = asset.type as MediaType; const source = resolveMediaUrl(asset.url, mediaType); const openUrl = normalizeGoogleDriveOpenUrl(asset.url);
  return <figure className={`media-item media-${mediaType.toLowerCase()}`}>
    {mediaType === "IMAGE" && <Image src={source} alt={asset.altText ?? title} width={1600} height={1200} unoptimized />}
    {mediaType === "VIDEO" && <video controls preload="metadata"><source src={source} />Your browser does not support this video. <a href={openUrl} target="_blank" rel="noreferrer">Open it directly.</a></video>}
    {mediaType === "AUDIO" && <audio controls preload="metadata"><source src={source} />Your browser does not support audio. <a href={openUrl} target="_blank" rel="noreferrer">Open it directly.</a></audio>}
    {mediaType === "PDF_PREVIEW" && <iframe src={resolvePdfUrl(asset.url)} title={title} loading="lazy" />}
    {mediaType === "OTHER" && <div className="media-other"><span>External evidence</span><b>{title}</b></div>}
    <figcaption>{caption ?? asset.caption ?? title} <a href={openUrl} target="_blank" rel="noreferrer">Open ↗</a></figcaption>
  </figure>;
}
function googleDriveId(url: string) { const fromPath = url.match(/drive\.google\.com\/file\/d\/([^/]+)/); const fromQuery = url.match(/[?&]id=([^&]+)/); return fromPath?.[1] ?? fromQuery?.[1] ?? null; }
export function normalizeGoogleDriveOpenUrl(url: string) { const id = googleDriveId(url); return id ? `https://drive.google.com/file/d/${id}/view` : url; }
export function resolveMediaUrl(url: string, type: MediaType) { const id = googleDriveId(url); if (!id) return url; if (type === "IMAGE") return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`; return `https://drive.google.com/uc?export=download&id=${id}`; }
export function resolvePdfUrl(url: string) { const id = googleDriveId(url); return id ? `https://drive.google.com/file/d/${id}/preview` : url; }
