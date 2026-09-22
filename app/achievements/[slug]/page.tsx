import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { getAchievementBySlug } from "@/features/content/detail.service";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const achievement = await getAchievementBySlug((await params).slug);
  if (!achievement) return {};
  return { title: achievement.metaTitle ?? achievement.title, description: achievement.metaDescription ?? achievement.context ?? achievement.result ?? undefined };
}

export default async function AchievementDetailPage({ params }: Props) {
  const achievement = await getAchievementBySlug((await params).slug);
  if (!achievement) notFound();

  return <PublicShell>
    <article className="case-study wrap">
      <p className="eyebrow">{achievement.category.toLowerCase()} · {achievement.organization}</p>
      <h1>{achievement.title}</h1>
      {achievement.result && <p className="lede">{achievement.result}</p>}
      <div className="case-grid">
        {achievement.context && <><h2>Context</h2><p>{achievement.context}</p></>}
        {achievement.myRole && <><h2>My role</h2><p>{achievement.myRole}</p></>}
        {achievement.significance && <><h2>Why it matters</h2><p>{achievement.significance}</p></>}
        {achievement.credential && <><h2>Credential</h2><p>{achievement.credential}</p></>}
        {achievement.skills.length > 0 && <><h2>Skills</h2><div className="tags">{achievement.skills.map(({ skill }) => <span key={skill.id}>{skill.name}</span>)}</div></>}
        {achievement.projects.length > 0 && <><h2>Related work</h2><div className="tags">{achievement.projects.map(({ project }) => <Link key={project.id} href={`/work/${project.slug}`}>{project.title} →</Link>)}</div></>}
      </div>
      {achievement.documents.length > 0 && <section className="case-evidence documents" aria-labelledby="achievement-documents"><p className="eyebrow">Evidence</p><h2 id="achievement-documents">Supporting material.</h2>{achievement.documents.map(({ id, document }) => <a href={document.fileUrl} key={id} rel="noreferrer" target="_blank"><span>{document.type.toLowerCase()}</span><b>{document.title}</b>{document.description && <small>{document.description}</small>}<i>↗</i></a>)}</section>}
      {achievement.media.length > 0 && <section className="case-evidence" aria-labelledby="achievement-gallery"><p className="eyebrow">Documentation</p><h2 id="achievement-gallery">The moment behind the milestone.</h2><div className="project-gallery">{achievement.media.filter(({ media }) => media.type === "IMAGE").map(({ id, media }) => <figure key={id}><Image src={media.url} alt={media.altText ?? media.title ?? "Achievement documentation"} width={1200} height={900} unoptimized /><figcaption>{media.caption ?? media.title}</figcaption></figure>)}</div></section>}
    </article>
  </PublicShell>;
}
