import Link from "next/link";
import type { RelatedContentItem } from "@/features/content/related.service";

export function RelatedContent({ items }: { items: RelatedContentItem[] }) {
  if (!items.length) return null;

  return <section className="related-content" aria-labelledby="related-content-title">
    <p className="eyebrow">Connected evidence</p>
    <h2 id="related-content-title">Follow the thread.</h2>
    <div className="related-content-grid">
      {items.map((item) => {
        const content = <><span>{item.type}</span><b>{item.title}</b>{item.description && <small>{item.description}</small>}{item.note && <em>{item.note}</em>}</>;
        return item.href ? <Link key={`${item.type}-${item.id}`} href={item.href} className="related-card">{content}</Link> : <article key={`${item.type}-${item.id}`} className="related-card">{content}</article>;
      })}
    </div>
  </section>;
}
