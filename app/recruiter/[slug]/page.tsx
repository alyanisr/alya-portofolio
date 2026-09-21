import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { getProjectsForLens } from "@/features/projects/project.service";

export const dynamic = "force-dynamic";
export default async function RecruiterLensPage({ params }: { params: Promise<{ slug: string }> }) { const lens = await getProjectsForLens((await params).slug); if (!lens) notFound(); return <PublicShell><section className="page-intro wrap"><p className="eyebrow">Recruiter lens / {lens.name}</p><h1>{lens.headline}</h1><p>{lens.intro}</p></section><section className="content-list wrap"><h2 className="eyebrow">Prioritized work</h2>{lens.projects.map(({ project, note }) => <Link className="list-row" key={project.id} href={`/work/${project.slug}`}><span>Work</span><h2>{project.title}</h2><p>{note ?? project.overview}</p><b>→</b></Link>)}<h2 className="eyebrow" style={{ marginTop: "4rem" }}>Relevant capabilities</h2><div className="tags">{lens.skills.map(({ skill }) => <span key={skill.id}>{skill.name}</span>)}</div></section></PublicShell>; }
