import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { getSkillCategoryBySlug } from "@/features/content/detail.service";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getSkillCategoryBySlug((await params).slug);
  if (!category) return {};
  return { title: `${category.name} — Capabilities`, description: category.description ?? `Evidence and context for ${category.name}.` };
}

export default async function CapabilityDetailPage({ params }: Props) {
  const category = await getSkillCategoryBySlug((await params).slug);
  if (!category) notFound();

  return <PublicShell>
    <article className="case-study wrap">
      <p className="eyebrow">Capabilities</p>
      <h1>{category.name}</h1>
      {category.description && <p className="lede">{category.description}</p>}
      <div className="case-grid">
        <h2>What I work with</h2>
        <div className="tags">{category.skills.map((skill) => <span key={skill.id}>{skill.name} · {skill.maturity.toLowerCase()}</span>)}</div>
      </div>
      <section className="case-evidence" aria-labelledby="capability-evidence">
        <p className="eyebrow">Evidence</p>
        <h2 id="capability-evidence">Where it has been put to work.</h2>
        <div className="content-list">{category.skills.flatMap((skill) => skill.projectSkills.map(({ project }) => ({ project, skill: skill.name }))).filter(({ project }, index, entries) => entries.findIndex((entry) => entry.project.id === project.id) === index).map(({ project, skill }) => <Link className="list-row" href={`/work/${project.slug}`} key={project.id}><span>{skill}</span><h2>{project.title}</h2><p>{project.overview}</p><b aria-hidden="true">→</b></Link>)}</div>
      </section>
    </article>
  </PublicShell>;
}
