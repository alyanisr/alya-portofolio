import { getExperienceBySlug } from "@/features/content/public.service";

export async function GET(_request: Request, context: RouteContext<"/api/experience/[slug]">) {
  const { slug } = await context.params;
  const experience = await getExperienceBySlug(slug);
  return experience ? Response.json({ data: experience }) : Response.json({ error: "Experience not found" }, { status: 404 });
}
