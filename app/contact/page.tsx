import { PublicShell } from "@/components/public-shell";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Contact" };
export default async function ContactPage() { const person = await db.person.findFirst(); return <PublicShell><section className="closing wrap"><p className="eyebrow">What&apos;s next</p><h2>Let&apos;s figure something out.</h2><p className="hero-copy">For a role, project, or conversation, the best place to start is a direct hello.</p>{person?.email && <a className="button" href={`mailto:${person.email}`}>Email Alya</a>}</section></PublicShell>; }
