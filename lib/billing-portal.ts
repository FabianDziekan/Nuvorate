type PortalDependencies = {
  getUser(): Promise<{ id: string } | null>;
  getBillingContext(userId: string): Promise<{ billingOwnerId: string } | null>;
  getCustomerId(userId: string): Promise<string | null>;
  createPortal(customerId: string): Promise<{ url: string }>;
};

function redirect(url: URL | string) {
  return new Response(null, { status: 303, headers: { Location: String(url), "Cache-Control": "no-store" } });
}

function failure(status: number, message: string) {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}

export function billingPortalGet(appUrl: string) {
  // Legacy login next=/billing/portal remains harmless.
  return redirect(new URL("/settings", appUrl));
}

export async function billingPortalPost(request: Request, appUrl: string, deps: PortalDependencies) {
  if (request.method !== "POST") return failure(405, "Niedozwolona metoda.");
  if (request.headers.get("origin") !== new URL(appUrl).origin || request.headers.get("sec-fetch-site") === "cross-site") {
    return failure(403, "Niedozwolone pochodzenie żądania.");
  }
  try {
    const user = await deps.getUser();
    if (!user) {
      const login = new URL("/login", appUrl);
      login.searchParams.set("next", "/settings");
      return redirect(login);
    }
    // Canonical resolver proves active membership before resolving the billing owner.
    const context = await deps.getBillingContext(user.id);
    if (!context || context.billingOwnerId !== user.id) {
      return failure(403, "Brak uprawnień do zarządzania rozliczeniami aktywnej firmy.");
    }
    const customerId = await deps.getCustomerId(user.id);
    if (!customerId) return failure(409, "Brak konta rozliczeniowego. Skontaktuj się z pomocą NuvoRate.");
    const session = await deps.createPortal(customerId);
    const url = new URL(session.url);
    if (url.protocol !== "https:" || url.hostname !== "billing.stripe.com" || url.username || url.password || url.port) {
      throw new Error("Invalid portal destination");
    }
    return redirect(session.url);
  } catch {
    return failure(502, "Nie udało się otworzyć portalu rozliczeń. Spróbuj ponownie później.");
  }
}
