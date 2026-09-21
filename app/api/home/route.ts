import { getHomepage } from "@/features/home/home.service";

export async function GET() {
  return Response.json({ data: await getHomepage() });
}
