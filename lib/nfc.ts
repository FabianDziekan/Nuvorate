export type NfcTagInput = {
  destinationUrl: string;
  name: string;
};

const googleHosts = new Set([
  "google.com",
  "g.page",
  "maps.app.goo.gl",
  "share.google",
]);

function isGoogleHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");

  return (
    googleHosts.has(host) ||
    host.endsWith(".google.com") ||
    host.endsWith(".g.page") ||
    host.endsWith(".share.google")
  );
}

export function validateGoogleReviewUrl(value: string) {
  try {
    const url = new URL(value.trim());

    if (url.protocol !== "https:" || !isGoogleHost(url.hostname)) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function validateNfcTagInput(input: NfcTagInput) {
  const name = input.name.trim();
  const destinationUrl = validateGoogleReviewUrl(input.destinationUrl);

  if (!name) {
    return { error: "Podaj nazwę plakietki." } as const;
  }

  if (name.length > 120) {
    return { error: "Nazwa plakietki może mieć maksymalnie 120 znaków." } as const;
  }

  if (!destinationUrl) {
    return {
      error:
        "Podaj prawidłowy link HTTPS do Google Reviews (np. google.com lub g.page).",
    } as const;
  }

  return { destinationUrl, name } as const;
}
