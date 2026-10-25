import { isStrapiAvailable } from "@/lib/strapi";

export async function GET() {
  const available = await isStrapiAvailable();

  return Response.json(
    { frontend: "ok", strapi: available ? "ok" : "unavailable" },
    {
      status: available ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
