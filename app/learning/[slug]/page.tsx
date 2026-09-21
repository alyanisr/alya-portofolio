import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { getLearningBySlug } from "@/features/content/detail.service";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getLearningBySlug((await params).slug);
  if (!item) return {};
  return { title: `${item.title} — Learning`, description: item.description ?? item.why ?? undefined };
}

export default async function LearningDetailPage({ params }: Props) {
  const item = await getLearningBySlug((await params).slug);
  if (!item) notFound();

  return <PublicShell>
    <article className="case-study wrap">
      <p className="eyebrow">{item.maturity.toLowerCase()} · {item.category}</p>
      <h1>{item.title}</h1>
      {item.description && <p className="lede">{item.description}</p>}
      <div className="case-grid">
        {item.why && <><h2>Why I&apos;m exploring it</h2><p>{item.why}</p></>}
        {item.progressNote && <><h2>Current note</h2><p>{item.progressNote}</p></>}
        {item.skills.length > 0 && <><h2>Related skills</h2><div className="tags">{item.skills.map(({ skill }) => <span key={skill.id}>{skill.name}</span>)}</div></>}
        {item.resourceUrl && <><h2>Resource</h2><p><a className="text-link" href={item.resourceUrl} rel="noreferrer" target="_blank">Explore the source ↗</a></p></>}
      </div>
    </article>
  </PublicShell>;
}
