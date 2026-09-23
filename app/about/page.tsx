import { PublicShell } from "@/components/public-shell";
import { db } from "@/lib/db";
import Image from "next/image";

export const dynamic = "force-dynamic";
export const metadata = { title: "About" };
export default async function AboutPage() { const [person, education] = await Promise.all([db.person.findFirst(), db.education.findFirst({ where: { deletedAt: null }, orderBy: { startDate: "desc" } })]); return <PublicShell><section className="profile-intro wrap"><div><p className="eyebrow">The person</p><h1>{person?.name ?? "Alya Nisrina"}</h1><p>{person?.bio}</p></div><figure><Image src={person?.photoUrl ?? "/assets/photos/alya-graduation.jpg"} alt="Alya Nisrina" width={900} height={1200} /><figcaption>Curiosity, clarity, and care—carried into the work.</figcaption></figure></section><section className="case-study wrap"><div className="case-grid"><h2>Philosophy</h2><p>{person?.philosophy}</p>{education && <><h2>Education</h2><p>{education.degree}, {education.field}<br />{education.institution}<br />GPA {education.gpa}/{education.maxGpa}</p>{education.thesisTitle && <><h2>Thesis</h2><p>{education.thesisTitle}</p></>}</>}</div></section></PublicShell>; }
