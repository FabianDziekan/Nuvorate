export type BusinessRole = "owner" | "admin" | "member";

export type BusinessMembership = {
  business_id: string;
  created_at: string;
  role: BusinessRole;
};

type SupabaseLike = {
  from: (table: string) => any;
};

export type ActiveBusiness<TBusiness = Record<string, any>> = {
  business: TBusiness & { id: string };
  membership: BusinessMembership;
};

/**
 * Uses the oldest membership as the temporary deterministic active location.
 * ETAP 3 can replace this selection with persisted active_business_id without
 * changing callers.
 */
export function selectActiveMembership(
  memberships: readonly BusinessMembership[],
): BusinessMembership | null {
  return memberships
    .slice()
    .sort(
      (left, right) =>
        new Date(left.created_at).getTime() - new Date(right.created_at).getTime() ||
        left.business_id.localeCompare(right.business_id),
    )[0] ?? null;
}

export function canManageBusiness(role: BusinessRole) {
  return role === "owner" || role === "admin";
}

export function isRequestedBusinessActive(
  activeBusinessId: string,
  requestedBusinessId: string,
) {
  return activeBusinessId === requestedBusinessId;
}

export async function getUserBusinessMemberships(
  supabase: SupabaseLike,
  userId: string,
): Promise<BusinessMembership[]> {
  const { data, error } = await supabase
    .from("business_memberships")
    .select("business_id, role, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Nie udało się odczytać dostępu do firmy.");
  }

  return (data ?? []) as BusinessMembership[];
}

export async function getActiveBusinessForUser<TBusiness = Record<string, any>>(
  supabase: SupabaseLike,
  userId: string,
  fields = "*",
): Promise<ActiveBusiness<TBusiness> | null> {
  const membership = selectActiveMembership(
    await getUserBusinessMemberships(supabase, userId),
  );

  if (!membership) return null;

  const { data: business, error } = await supabase
    .from("businesses")
    .select(fields)
    .eq("id", membership.business_id)
    .maybeSingle();

  if (error) {
    throw new Error("Nie udało się odczytać aktywnej firmy.");
  }

  if (!business) return null;

  return { business: business as TBusiness & { id: string }, membership };
}

export async function requireActiveBusinessForUser<TBusiness = Record<string, any>>(
  supabase: SupabaseLike,
  userId: string,
  fields = "*",
  access: "read" | "manage" = "read",
): Promise<ActiveBusiness<TBusiness>> {
  const active = await getActiveBusinessForUser<TBusiness>(supabase, userId, fields);
  if (!active) throw new Error("Nie znaleziono aktywnej firmy.");
  if (access === "manage" && !canManageBusiness(active.membership.role)) {
    throw new Error("Brak uprawnień do zarządzania aktywną firmą.");
  }
  return active;
}

/** Rejects an ID from request data unless it is the verified active business. */
export async function requireRequestedActiveBusiness(
  supabase: SupabaseLike,
  userId: string,
  requestedBusinessId: string,
  access: "read" | "manage" = "read",
) {
  const active = await requireActiveBusinessForUser(
    supabase,
    userId,
    "id",
    access,
  );
  if (!isRequestedBusinessActive(active.business.id, requestedBusinessId)) {
    throw new Error("Brak dostępu do wskazanej firmy.");
  }
  return active;
}
