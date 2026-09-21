import { getPublishedSkillCategories } from "@/features/content/public.service";

export async function GET() {
  return Response.json({ data: await getPublishedSkillCategories() });
}
