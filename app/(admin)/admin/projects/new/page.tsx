import Link from "next/link";
import { createProject } from "@/app/(admin)/admin/projects/actions";

export default function NewProjectPage() {
  return <>
    <p className="eyebrow">New project</p>
    <h1>Start with the evidence.</h1>
    <p className="admin-intro">This creates a private draft. It will not appear on the public portfolio until you intentionally publish it.</p>
    <form action={createProject} className="editor-form">
      <label>Project title<input name="title" required autoFocus /></label>
      <label>Stable URL slug<input name="slug" required placeholder="my-project" pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
      <label>Project type<select name="projectType" defaultValue="ACADEMIC"><option>PROFESSIONAL</option><option>ACADEMIC</option><option>COMPETITION</option><option>PERSONAL</option><option>ORGANIZATIONAL</option><option>EXPERIMENT</option></select></label>
      <label>Concise overview<textarea name="overview" required rows={5} placeholder="What problem did this project address, and what did you do?" /></label>
      <div className="form-actions"><button className="button">Create private draft</button><Link className="text-link" href="/admin/projects">Cancel</Link></div>
    </form>
  </>;
}
