import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { getPublishedOrganizations } from "@/features/content/public.service";

export const dynamic = "force-dynamic";
export const metadata = { title: "Beyond the Screen" };

export default async function BeyondPage() {
  const organizations = await getPublishedOrganizations();

  return <PublicShell>
    <section className="page-intro wrap">
      <p className="eyebrow">Beyond the screen</p>
      <h1>How I work with people.</h1>
      <p>Leadership, collaboration, and the work that happens outside a single project or screen.</p>
    </section>
    <section className="content-list wrap" aria-label="Organizations and activities">
      {organizations.map((organization) => <Link className="list-row" href={`/beyond/${organization.slug}`} key={organization.id}>
        <span>organization</span>
        <h2>{organization.name}</h2>
        <p>{organization.role}{organization.impact ? ` — ${organization.impact}` : ""}</p>
        <b aria-hidden="true">→</b>
      </Link>)}
    </section>
  </PublicShell>;
}
