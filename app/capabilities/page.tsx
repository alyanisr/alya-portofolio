import { PublicShell } from "@/components/public-shell";
import { getPublishedSkillCategories } from "@/features/content/public.service";

export const dynamic = "force-dynamic";
export const metadata = { title: "Capabilities" };
export default async function CapabilitiesPage() { const categories = await getPublishedSkillCategories(); return <PublicShell><section className="page-intro wrap"><p className="eyebrow">Capabilities</p><h1>Evidence over percentage bars.</h1><p>Skills are presented as context, not a claim of mastery without proof.</p></section><section className="content-list wrap">{categories.map((category) => <article className="case-grid" key={category.id}><h2>{category.name}</h2><div className="tags">{category.skills.map((skill) => <span key={skill.id}>{skill.name} · {skill.maturity.toLowerCase()}</span>)}</div></article>)}</section></PublicShell>; }
