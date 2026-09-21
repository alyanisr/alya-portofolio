import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getPublishedProjects } from "@/features/projects/project.service";

export const dynamic = "force-dynamic";
export const metadata = { title: "Work" };

export default async function WorkPage() {
  const projects = await getPublishedProjects();
  return <PublicShell><section className="page-intro wrap"><p className="eyebrow">Work</p><h1>Every project starts with a problem.</h1><p>Selected case studies and experiments, connected to the skills, people, evidence, and context behind them.</p></section><section className="content-list wrap">{projects.map((project, index) => <Link className="list-row" key={project.id} href={`/work/${project.slug}`}><span>0{index + 1}</span><h2>{project.title}</h2><p>{project.overview}</p><b>→</b></Link>)}</section></PublicShell>;
}
