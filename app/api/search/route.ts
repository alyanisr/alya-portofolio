import { searchPublicContent } from "@/features/search/search.service";

export async function GET(request: Request) {
  return Response.json({ data: await searchPublicContent(new URL(request.url).searchParams.get("q") ?? "") });
}
