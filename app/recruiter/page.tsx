import Link from "next/link";
import { PublicShell } from "@/components/public-shell";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Recruiter Lenses" };

export default async function RecruiterLensesPage() {
  const lenses = await db.roleLens.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  return <PublicShell><section className="page-intro wrap"><p className="eyebrow">Recruiter lenses</p><h1>One story. The right emphasis.</h1><p>Choose a perspective to see the same portfolio evidence prioritized for a particular role—not duplicated into separate portfolios.</p></section><section className="wrap section-space"><div className="lens-grid">{lenses.map((lens) => <Link href={`/recruiter/${lens.slug}`} key={lens.id}><span>Recruiter lens</span><h2>{lens.name}</h2><p>{lens.intro}</p><b>Explore this lens →</b></Link>)}</div></section></PublicShell>;
}
