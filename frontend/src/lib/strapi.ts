import "server-only";

export async function isStrapiAvailable(): Promise<boolean> {
  try {
    const baseUrl = process.env.STRAPI_URL;
    if (!baseUrl) return false;

    const response = await fetch(new URL("/_health", baseUrl), {
      cache: "no-store",
      signal: AbortSignal.timeout(3_000),
    });
    return response.status === 204;
  } catch {
    return false;
  }
}
