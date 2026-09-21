import type { Metadata } from "next";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { getProjectBySlug } from "@/features/projects/project.service";
import { getRelatedContent } from "@/features/content/related.service";
import { RelatedContent } from "@/components/related-content";
import { ProjectEvidence } from "@/components/project-evidence";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> { const project = await getProjectBySlug((await params).slug); return project ? { title: project.metaTitle ?? project.title, description: project.metaDescription ?? project.overview, robots: project.noIndex ? { index: false } : undefined } : {}; }
export default async function ProjectPage({ params }: Props) {
  const project = await getProjectBySlug((await params).slug); if (!project) notFound();
  const relatedContent = await getRelatedContent("project", project.id);
  const sections = [["Problem",project.problem],["Context",project.context],["Objective",project.objective],["My role",project.myRole],["Approach",project.approach],["Process",project.process],["Solution",project.solution],["Implementation",project.implementation],["Collaboration",project.collaboration],["Result",project.result],["Challenges",project.challenges],["Learning",project.learnings]] as const;
  return <PublicShell><article className="case-study wrap"><p className="eyebrow">{project.projectType.toLowerCase()} case study</p><h1>{project.title}</h1>{project.subtitle && <p className="hero-copy">{project.subtitle}</p>}<p className="lede">{project.overview}</p><div className="case-grid"><h2>Skills</h2><div className="tags">{project.skills.map(({ skill }) => <span key={skill.id}>{skill.name}</span>)}</div>{project.roles.length > 0 && <><h2>Roles</h2><div className="tags">{project.roles.map((role) => <span key={role.id}>{role.title}</span>)}</div></>}{sections.map(([title, content]) => content && <Fragment key={title}><h2>{title}</h2><p>{content}</p></Fragment>)}</div><ProjectEvidence metrics={project.metrics} blocks={project.contentBlocks} media={project.media} documents={project.documents} /><RelatedContent items={relatedContent} />{project.githubUrl && <a className="text-link" href={project.githubUrl} rel="noreferrer" target="_blank">View source ↗</a>}{project.demoUrl && <a className="text-link external-link" href={project.demoUrl} rel="noreferrer" target="_blank">View project ↗</a>}</article></PublicShell>;
}
