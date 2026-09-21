import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/public-shell";
import { getOrganizationBySlug } from "@/features/content/detail.service";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const organization = await getOrganizationBySlug((await params).slug);
  if (!organization) return {};
  return { title: `${organization.name} — Beyond the Screen`, description: organization.description ?? organization.impact ?? undefined };
}

export default async function OrganizationDetailPage({ params }: Props) {
  const organization = await getOrganizationBySlug((await params).slug);
  if (!organization) notFound();

  return <PublicShell>
    <article className="case-study wrap">
      <p className="eyebrow">Beyond the screen</p>
      <h1>{organization.name}</h1>
      <p className="lede">{organization.role}</p>
      <div className="case-grid">
        {organization.description && <><h2>Story</h2><p>{organization.description}</p></>}
        {organization.responsibilities.length > 0 && <><h2>Responsibilities</h2><div className="tags">{organization.responsibilities.map((responsibility) => <span key={responsibility}>{responsibility}</span>)}</div></>}
        {organization.impact && <><h2>Impact</h2><p>{organization.impact}</p></>}
        {organization.skills.length > 0 && <><h2>Skills</h2><div className="tags">{organization.skills.map(({ skill }) => <span key={skill.id}>{skill.name}</span>)}</div></>}
      </div>
      {organization.activities.length > 0 && <section className="case-evidence" aria-labelledby="organization-activities"><p className="eyebrow">Activity</p><h2 id="organization-activities">Work that moved through the team.</h2><div className="content-list">{organization.activities.map((activity) => <article className="list-row" key={activity.id}><span>{activity.role ?? "activity"}</span><h2>{activity.title}</h2><p>{activity.outcome ?? activity.description}</p><b aria-hidden="true">·</b></article>)}</div></section>}
    </article>
  </PublicShell>;
}
