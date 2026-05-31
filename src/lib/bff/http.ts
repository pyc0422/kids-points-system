export function getSafeInternalPath(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/")) {
    return fallback;
  }

  if (value.includes("://")) {
    return fallback;
  }

  return value;
}

export function getRefererPath(request: Request, fallback: string) {
  const referer = request.headers.get("referer");
  if (!referer) {
    return fallback;
  }

  try {
    const url = new URL(referer);
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}

export function appendQuery(path: string, entries: Record<string, string | undefined>) {
  const url = new URL(path, "https://family-points.local");

  Object.entries(entries).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  return `${url.pathname}${url.search}`;
}
