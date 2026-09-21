import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { getExperienceBySlug } from "@/features/content/public.service";

export const dynamic = "force-dynamic";
export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) { const experience = await getExperienceBySlug((await params).slug); if (!experience) notFound(); return <PublicShell><article className="case-study wrap"><p className="eyebrow">Experience</p><h1>{experience.company}</h1><p className="lede">{experience.role} — {experience.summary}</p><div className="case-grid"><h2>Responsibilities</h2><div className="tags">{experience.responsibilities.map((item) => <span key={item}>{item}</span>)}</div><h2>Skills</h2><div className="tags">{experience.skills.map(({ skill }) => <span key={skill.id}>{skill.name}</span>)}</div>{experience.impact && <><h2>Impact</h2><p>{experience.impact}</p></>}</div></article></PublicShell>; }
