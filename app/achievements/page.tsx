import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getPublishedAchievements } from "@/features/content/public.service";

export const dynamic = "force-dynamic";
export const metadata = { title: "Achievements" };

export default async function AchievementsPage() {
  const achievements = await getPublishedAchievements();

  return <PublicShell>
    <section className="page-intro wrap">
      <p className="eyebrow">Proof</p>
      <h1>Things I&apos;m proud of.</h1>
      <p>Recognition, milestones, and work that can be traced back to a real project, effort, or learning journey.</p>
    </section>
    <section className="content-list wrap" aria-label="Achievements">
      {achievements.map((achievement) => <Link className="list-row" href={`/achievements/${achievement.slug}`} key={achievement.id}>
        <span>{achievement.category.toLowerCase()}</span>
        <h2>{achievement.title}</h2>
        <p>{achievement.result ?? achievement.organization}</p>
        <b aria-hidden="true">→</b>
      </Link>)}
    </section>
  </PublicShell>;
}
