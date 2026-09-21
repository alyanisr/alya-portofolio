import { getProjectBySlug } from "@/features/projects/project.service";

export async function GET(_request: Request, context: RouteContext<"/api/projects/[slug]">) {
  const { slug } = await context.params;
  const project = await getProjectBySlug(slug);
  return project ? Response.json({ data: project }) : Response.json({ error: "Project not found" }, { status: 404 });
}
