import { removeRelationship, saveRelationship } from "@/app/(admin)/admin/relationships/actions";
import { db } from "@/lib/db";

type Choice = { value: string; label: string; type: string };

export const dynamic = "force-dynamic";

export default async function RelationshipsPage() {
  const [projects, experiences, achievements, skills, documents, relations] = await Promise.all([
    db.project.findMany({ where: { deletedAt: null }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.experience.findMany({ where: { deletedAt: null }, select: { id: true, company: true, role: true }, orderBy: { company: "asc" } }),
    db.achievement.findMany({ where: { deletedAt: null }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.skill.findMany({ where: { deletedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.document.findMany({ where: { deletedAt: null }, select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.contentRelation.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
  ]);
  const choices: Choice[] = [...projects.map((item) => ({ value: `project:${item.id}`, label: item.title, type: "project" })), ...experiences.map((item) => ({ value: `experience:${item.id}`, label: `${item.company} — ${item.role}`, type: "experience" })), ...achievements.map((item) => ({ value: `achievement:${item.id}`, label: item.title, type: "achievement" })), ...skills.map((item) => ({ value: `skill:${item.id}`, label: item.name, type: "skill" })), ...documents.map((item) => ({ value: `document:${item.id}`, label: item.title, type: "document" }))];
  const labels = new Map(choices.map((choice) => [choice.value, choice.label]));
  return <><p className="eyebrow">Content relationships</p><h1>Connect evidence deliberately.</h1><p className="admin-intro">Relationships describe why content belongs together. They are not keyword recommendations and never duplicate the underlying story.</p>
    <section className="admin-workspace"><h2>Curate a connection</h2><form action={saveRelationship} className="editor-form compact-form"><label>From<select name="source" required defaultValue=""><option disabled value="">Select content</option>{choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.type} — {choice.label}</option>)}</select></label><label>Relationship<select name="relationType" defaultValue="RELATED_TO"><option>RELATED_TO</option><option>PART_OF</option><option>SUPPORTS</option><option>EVIDENCE_FOR</option><option>FOLLOW_UP</option><option>PREREQUISITE</option></select></label><label>To<select name="target" required defaultValue=""><option disabled value="">Select content</option>{choices.map((choice) => <option key={choice.value} value={choice.value}>{choice.type} — {choice.label}</option>)}</select></label><label>Editorial note<textarea name="note" rows={2} placeholder="Explain why this connection helps the reader." /></label><button className="button">Save connection</button></form></section>
    <section className="admin-workspace"><h2>Curated connections</h2><div className="editor-history">{relations.map((relation) => <article key={relation.id}><b>{relation.relationType.toLowerCase()}</b><span>{labels.get(`${relation.sourceType}:${relation.sourceId}`) ?? relation.sourceType} → {labels.get(`${relation.targetType}:${relation.targetId}`) ?? relation.targetType}{relation.note ? ` — ${relation.note}` : ""}</span><form action={removeRelationship}><input name="id" type="hidden" value={relation.id} /><button className="button">Remove</button></form></article>)}{!relations.length && <p className="admin-empty">No editorial connections have been curated yet.</p>}</div></section>
  </>;
}
