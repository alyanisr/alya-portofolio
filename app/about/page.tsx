import { PublicShell } from "@/components/public-shell";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "About" };
export default async function AboutPage() { const [person, education] = await Promise.all([db.person.findFirst(), db.education.findFirst({ where: { deletedAt: null }, orderBy: { startDate: "desc" } })]); return <PublicShell><section className="page-intro wrap"><p className="eyebrow">The person</p><h1>{person?.name ?? "Alya Nisrina"}</h1><p>{person?.bio}</p></section><section className="case-study wrap"><div className="case-grid"><h2>Philosophy</h2><p>{person?.philosophy}</p>{education && <><h2>Education</h2><p>{education.degree}, {education.field}<br />{education.institution}<br />GPA {education.gpa}/{education.maxGpa}</p>{education.thesisTitle && <><h2>Thesis</h2><p>{education.thesisTitle}</p></>}</>}</div></section></PublicShell>; }
