import { saveHomepage } from "@/app/(admin)/admin/homepage/actions";
import { db } from "@/lib/db";

type Item = { id: string; label: string };

function FeaturedItems({ name, items, ids }: { name: string; items: Item[]; ids?: string[] }) {
  const selected = new Set(ids ?? []);
  const position = (id: string) => Math.max(0, ids?.indexOf(id) ?? -1) + 1;
  return <fieldset><legend>{name.replace("featured", "Featured ").replace("Ids", "")} <small>(lower number appears first)</small></legend>{items.map((item) => <label key={item.id}><input type="checkbox" name={name} value={item.id} defaultChecked={selected.has(item.id)} /> {item.label} <input aria-label={`${item.label} display order`} name={`${name}Order:${item.id}`} type="number" min="0" defaultValue={position(item.id)} /></label>)}</fieldset>;
}

export const dynamic = "force-dynamic";

export default async function HomepageEditor() {
  const [config, projects, experiences, achievements, learning, lenses] = await Promise.all([
    db.homepageConfig.findFirst(),
    db.project.findMany({ where: { deletedAt: null }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
    db.experience.findMany({ where: { deletedAt: null }, orderBy: { company: "asc" }, select: { id: true, company: true, role: true } }),
    db.achievement.findMany({ where: { deletedAt: null }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
    db.learningItem.findMany({ where: { deletedAt: null }, orderBy: { title: "asc" }, select: { id: true, title: true } }),
    db.roleLens.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  const defaults = { heroTagline: "Hi, I’m Alya.", heroHeadline: "I solve problems where business meets technology.", heroSubheadline: "Business analysis, systems, software, and everything in between.", heroCta1Text: "Explore my work", heroCta1Url: "/work" };
  return <><p className="eyebrow">Homepage curation</p><h1>Set the opening and emphasis.</h1><p className="admin-intro">The page structure remains in code. This workspace controls its message and the content intentionally brought forward.</p><form action={saveHomepage} className="editor-form admin-workspace"><label>Hero eyebrow<input name="heroTagline" required defaultValue={config?.heroTagline ?? defaults.heroTagline} /></label><label>Hero headline<input name="heroHeadline" required defaultValue={config?.heroHeadline ?? defaults.heroHeadline} /></label><label>Hero subheadline<textarea name="heroSubheadline" required rows={3} defaultValue={config?.heroSubheadline ?? defaults.heroSubheadline} /></label><label>Primary CTA text<input name="heroCta1Text" required defaultValue={config?.heroCta1Text ?? defaults.heroCta1Text} /></label><label>Primary CTA URL<input name="heroCta1Url" required defaultValue={config?.heroCta1Url ?? defaults.heroCta1Url} /></label><label>Secondary CTA text<input name="heroCta2Text" defaultValue={config?.heroCta2Text ?? ""} /></label><label>Secondary CTA URL<input name="heroCta2Url" type="url" defaultValue={config?.heroCta2Url ?? ""} /></label><FeaturedItems name="featuredProjectIds" items={projects.map((x) => ({ id: x.id, label: x.title }))} ids={config?.featuredProjectIds} /><FeaturedItems name="featuredExperienceIds" items={experiences.map((x) => ({ id: x.id, label: `${x.company} — ${x.role}` }))} ids={config?.featuredExperienceIds} /><FeaturedItems name="featuredAchievementIds" items={achievements.map((x) => ({ id: x.id, label: x.title }))} ids={config?.featuredAchievementIds} /><FeaturedItems name="featuredLearningIds" items={learning.map((x) => ({ id: x.id, label: x.title }))} ids={config?.featuredLearningIds} /><FeaturedItems name="featuredLensIds" items={lenses.map((x) => ({ id: x.id, label: x.name }))} ids={config?.featuredLensIds} /><button className="button">Save homepage curation</button></form></>;
}
