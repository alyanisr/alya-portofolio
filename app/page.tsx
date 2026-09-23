import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { SectionHeading } from "@/components/section-heading";
import { getHomepage } from "@/features/home/home.service";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { config, person, projects, experiences, lenses } = await getHomepage();
  const headline = config?.heroHeadline ?? person?.headline ?? "I solve problems where business meets technology.";
  return <PublicShell>
    <section className="hero wrap">
      <p className="eyebrow">{config?.heroTagline ?? "Hi, I’m Alya."}</p>
      <h1>{headline}</h1>
      <p className="hero-copy">{config?.heroSubheadline ?? "Business analysis, systems, software, and everything in between."}</p>
      <div className="hero-actions"><Link className="button" href={config?.heroCta1Url ?? "/work"}>{config?.heroCta1Text ?? "Explore my work"}</Link><Link className="text-link" href={config?.heroCta2Url ?? "/about"}>{config?.heroCta2Text ?? "How I think"} <span>↓</span></Link></div>
      <p className="hero-note">Problem → Understand → Analyze → Design → Build → Validate → Improve</p>
    </section>
    <Reveal><section className="philosophy wrap"><p className="eyebrow">How I think</p><blockquote>“{person?.philosophy ?? "Done is not the goal. Solving the right problem is."}”</blockquote><p>I start by understanding what needs to be solved, then connect people, process, and technology into something useful.</p></section></Reveal>
    <Reveal><section className="wrap section-space"><SectionHeading eyebrow="Selected work" title="Proof, not promises."><p>Projects are not a gallery here. Each is a record of a problem, the thinking behind it, and the work that followed.</p></SectionHeading><div className="project-grid">{projects.map((project, index) => <Link className="project-card" href={`/work/${project.slug}`} key={project.id}><span>0{index + 1} / {project.projectType.toLowerCase()}</span><h3>{project.title}</h3><p>{project.overview}</p><b>Read case study →</b></Link>)}</div><Link className="text-link" href="/work">View all work <span>→</span></Link></section></Reveal>
    <section className="dark-band"><div className="wrap"><SectionHeading eyebrow="Experience" title="Where I put it into practice." />{experiences.map((experience) => <Link key={experience.id} className="experience-row" href={`/experience/${experience.slug}`}><div><p>{experience.company}</p><h3>{experience.role}</h3></div><p>{experience.summary}</p><span>→</span></Link>)}</div></section>
    {lenses.length > 0 && <Reveal><section className="lens-band"><div className="wrap"><SectionHeading eyebrow="Recruiter lens" title="See the right evidence first."><p>Choose a role perspective when you need a faster, focused evaluation—not a separate portfolio.</p></SectionHeading><div className="lens-grid">{lenses.slice(0, 3).map((lens) => <Link href={`/recruiter/${lens.slug}`} key={lens.id}><span>Recruiter lens</span><h3>{lens.name}</h3><p>{lens.intro}</p><b>See this perspective →</b></Link>)}</div><Link className="text-link" href="/recruiter">See all recruiter lenses <span>→</span></Link></div></section></Reveal>}
    <section className="closing wrap"><p className="eyebrow">What&apos;s next</p><h2>Got something worth solving?</h2><Link className="button" href="/contact">Let&apos;s talk</Link></section>
  </PublicShell>;
}
