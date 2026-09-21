import { getPublishedProjects } from "@/features/projects/project.service";

export async function GET() {
  return Response.json({ data: await getPublishedProjects() });
}
