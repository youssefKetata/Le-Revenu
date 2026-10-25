import "server-only";

export class StrapiError extends Error {
  constructor(
    public status: number,
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = "StrapiError";
  }
}

export async function strapiRequest<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown; token?: string } = {},
): Promise<T> {
  const baseUrl = process.env.STRAPI_URL;
  if (!baseUrl) throw new StrapiError(503, "Service indisponible.");
  let response: Response;
  try {
    response = await fetch(new URL(`/api${path}`, baseUrl), {
      method: options.method ?? "GET",
      headers: {
        ...(options.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body:
        options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
  } catch {
    throw new StrapiError(503, "Service indisponible.");
  }
  if (!response.ok) {
    let field: string | undefined;
    try {
      const failure: { error?: { details?: { field?: unknown } } } =
        await response.json();
      const value = failure.error?.details?.field;
      if (typeof value === "string") field = value;
    } catch {
      /* A non-JSON service error still has a useful HTTP status. */
    }
    throw new StrapiError(response.status, "La requête a échoué.", field);
  }
  try {
    return (await response.json()) as T;
  } catch {
    throw new StrapiError(503, "Réponse du service invalide.");
  }
}

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
