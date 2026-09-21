import { getProjectsForLens } from "@/features/projects/project.service";

export async function GET(_request: Request, context: RouteContext<"/api/recruiter-lens/[slug]">) {
  const { slug } = await context.params;
  const lens = await getProjectsForLens(slug);
  return lens ? Response.json({ data: lens }) : Response.json({ error: "Recruiter lens not found" }, { status: 404 });
}
