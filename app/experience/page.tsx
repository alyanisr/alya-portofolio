import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getPublishedExperiences } from "@/features/content/public.service";

export const dynamic = "force-dynamic";
export const metadata = { title: "Experience" };
export default async function ExperiencePage() { const experiences = await getPublishedExperiences(); return <PublicShell><section className="page-intro wrap"><p className="eyebrow">Experience</p><h1>Work is how the thinking gets tested.</h1><p>Roles, responsibilities, project connections, and evidence—not inflated job titles.</p></section><section className="content-list wrap">{experiences.map((item, index) => <Link className="list-row" key={item.id} href={`/experience/${item.slug}`}><span>0{index + 1}</span><h2>{item.company}<br /><small>{item.role}</small></h2><p>{item.summary}</p><b>→</b></Link>)}</section></PublicShell>; }
