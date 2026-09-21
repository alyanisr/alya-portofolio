import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { SectionHeading } from "@/components/section-heading";
import { getHomepage } from "@/features/home/home.service";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { config, person, projects, experiences, achievements, skillCategories, learning } = await getHomepage();
  const headline = config?.heroHeadline ?? person?.headline ?? "I solve problems where business meets technology.";
  return <PublicShell>
    <section className="hero wrap">
      <p className="eyebrow">{config?.heroTagline ?? "Hi, I’m Alya."}</p>
      <h1>{headline}</h1>
      <p className="hero-copy">{config?.heroSubheadline ?? "Business analysis, systems, software, and everything in between."}</p>
      <div className="hero-actions"><Link className="button" href={config?.heroCta1Url ?? "/work"}>{config?.heroCta1Text ?? "Explore my work"}</Link><Link className="text-link" href="/about">How I think <span>↓</span></Link></div>
      <p className="hero-note">Problem → Understand → Analyze → Design → Build → Validate → Improve</p>
    </section>
    <Reveal><section className="philosophy wrap"><p className="eyebrow">How I think</p><blockquote>“{person?.philosophy ?? "Done is not the goal. Solving the right problem is."}”</blockquote><p>I start by understanding what needs to be solved, then connect people, process, and technology into something useful.</p></section></Reveal>
    <Reveal><section className="wrap section-space"><SectionHeading eyebrow="Selected work" title="Proof, not promises."><p>Projects are not a gallery here. Each is a record of a problem, the thinking behind it, and the work that followed.</p></SectionHeading><div className="project-grid">{projects.map((project, index) => <Link className="project-card" href={`/work/${project.slug}`} key={project.id}><span>0{index + 1} / {project.projectType.toLowerCase()}</span><h3>{project.title}</h3><p>{project.overview}</p><b>Read case study →</b></Link>)}</div><Link className="text-link" href="/work">View all work <span>→</span></Link></section></Reveal>
    <section className="dark-band"><div className="wrap"><SectionHeading eyebrow="Experience" title="Where I put it into practice." />{experiences.map((experience) => <Link key={experience.id} className="experience-row" href={`/experience/${experience.slug}`}><div><p>{experience.company}</p><h3>{experience.role}</h3></div><p>{experience.summary}</p><span>→</span></Link>)}</div></section>
    <section className="wrap section-space"><SectionHeading eyebrow="Capabilities" title="A bridge, not a list of percentages."><p>Capabilities are grouped by the kind of problem they help solve and presented honestly by maturity and evidence.</p></SectionHeading><div className="capability-grid">{skillCategories.map((category) => <div key={category.id}><h3>{category.name}</h3><p>{category.skills.map((skill) => skill.name).join(" · ")}</p></div>)}</div><Link className="text-link" href="/capabilities">Explore capabilities <span>→</span></Link></section>
    <section className="wrap section-space split"><div><SectionHeading eyebrow="Proof" title="Things I’m proud of." /></div><div className="proof-list">{achievements.map((achievement) => <article key={achievement.id}><p>{achievement.category.toLowerCase()}</p><h3>{achievement.title}</h3>{achievement.result && <span>{achievement.result}</span>}</article>)}</div></section>
    <section className="learning-band wrap"><SectionHeading eyebrow="Always learning" title="Still figuring things out." /><div>{learning.map((item) => <article key={item.id}><p>{item.maturity.toLowerCase()}</p><h3>{item.title}</h3><span>{item.description}</span></article>)}</div></section>
    <section className="closing wrap"><p className="eyebrow">What&apos;s next</p><h2>Got something worth solving?</h2><Link className="button" href="/contact">Let&apos;s talk</Link></section>
  </PublicShell>;
}
