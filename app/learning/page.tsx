import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getPublishedLearning } from "@/features/content/public.service";

export const dynamic = "force-dynamic";
export const metadata = { title: "Learning" };

export default async function LearningPage() {
  const learning = await getPublishedLearning();

  return <PublicShell>
    <section className="page-intro wrap">
      <p className="eyebrow">Always learning</p>
      <h1>I&apos;m not done learning.</h1>
      <p>Exploration is shown with its real context and maturity—not turned into a claim of expertise.</p>
    </section>
    <section className="content-list wrap" aria-label="Learning items">
      {learning.map((item) => <Link className="list-row" href={`/learning/${item.slug}`} key={item.id}>
        <span>{item.maturity.toLowerCase()}</span>
        <h2>{item.title}</h2>
        <p>{item.description ?? item.category}</p>
        <b aria-hidden="true">→</b>
      </Link>)}
    </section>
  </PublicShell>;
}
