import type { BlockType, Prisma } from "@prisma/client";
import { MediaRenderer } from "@/components/media-renderer";

type Metric = { label: string; value: string; unit?: string };
type Block = { id: string; type: BlockType; data: Prisma.JsonValue };
type MediaItem = { id: string; caption: string | null; media: { url: string; altText: string | null; title: string | null; caption: string | null; type: string } };
type DocumentItem = { id: string; document: { title: string; description: string | null; fileUrl: string } };

export function ProjectEvidence({ metrics, blocks, media, documents }: { metrics: Prisma.JsonValue | null; blocks: Block[]; media: MediaItem[]; documents: DocumentItem[] }) {
  const normalizedMetrics = Array.isArray(metrics) ? metrics.filter(isMetric) : [];
  return <>
    {normalizedMetrics.length > 0 && <section className="case-evidence" aria-labelledby="project-metrics"><p className="eyebrow">Evidence</p><h2 id="project-metrics">The work in numbers.</h2><div className="metric-grid">{normalizedMetrics.map((metric) => <article key={`${metric.label}-${metric.value}`}><b>{metric.value}</b><span>{metric.unit}</span><p>{metric.label}</p></article>)}</div></section>}
    {blocks.length > 0 && <section className="case-evidence project-blocks" aria-label="Project story">{blocks.map((block) => <ContentBlock block={block} key={block.id} />)}</section>}
    {media.length > 0 && <section className="case-evidence" aria-labelledby="project-gallery"><p className="eyebrow">Documentation</p><h2 id="project-gallery">A closer look.</h2><div className="project-gallery">{media.map(({ id, media: item, caption }) => <MediaRenderer key={id} asset={item} caption={caption} />)}</div></section>}
    {documents.length > 0 && <section className="case-evidence documents" aria-labelledby="project-documents"><p className="eyebrow">Documents</p><h2 id="project-documents">Supporting material.</h2>{documents.map(({ id, document }) => <a key={id} href={document.fileUrl} target="_blank" rel="noreferrer"><span>Document</span><b>{document.title}</b>{document.description && <small>{document.description}</small>}<i>↗</i></a>)}</section>}
  </>;
}

function ContentBlock({ block }: { block: Block }) {
  const data = asRecord(block.data);
  if (!data) return null;
  if (block.type === "HEADING" && typeof data.text === "string") return <h2>{data.text}</h2>;
  if (block.type === "TEXT" && typeof data.text === "string") return <p>{data.text}</p>;
  if (block.type === "QUOTE" && typeof data.text === "string") return <blockquote>{data.text}</blockquote>;
  if (block.type === "LIST" && Array.isArray(data.items)) return <ul>{data.items.filter((item): item is string => typeof item === "string").map((item) => <li key={item}>{item}</li>)}</ul>;
  return null;
}

function asRecord(value: Prisma.JsonValue): Record<string, Prisma.JsonValue> | null { return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, Prisma.JsonValue> : null; }
function isMetric(value: Prisma.JsonValue): value is Metric { return Boolean(value && typeof value === "object" && !Array.isArray(value) && typeof (value as Record<string, unknown>).label === "string" && typeof (value as Record<string, unknown>).value === "string"); }
