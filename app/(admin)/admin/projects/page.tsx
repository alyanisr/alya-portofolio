import Link from "next/link";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function AdminProjectsPage() { const projects = await db.project.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" } }); return <><p className="eyebrow">Projects</p><h1>Case-study library</h1><p className="admin-intro">Create a private draft first, then build its evidence and publish only when its story is ready.</p><Link className="button" href="/admin/projects/new">New project</Link><div className="admin-list">{projects.map((project) => <Link href={`/admin/projects/${project.slug}`} key={project.id}><div><b>{project.title}</b><span>{project.status.toLowerCase()} · {project.projectType.toLowerCase()}</span></div><span>→</span></Link>)}</div></>; }
