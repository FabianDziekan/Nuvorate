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

/** Uses the oldest membership as the deterministic fallback location. */
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

/**
 * Prefers a persisted selection only when it is still one of the user's
 * current memberships. The UUID is a preference, never an authorization proof.
 */
export function selectPreferredActiveMembership(
  memberships: readonly BusinessMembership[],
  activeBusinessId: string | null | undefined,
): BusinessMembership | null {
  if (activeBusinessId) {
    const preferred = memberships.find(
      (membership) => membership.business_id === activeBusinessId,
    );
    if (preferred) return preferred;
  }

  return selectActiveMembership(memberships);
}

function activeMembershipCandidates(
  memberships: readonly BusinessMembership[],
  activeBusinessId: string | null | undefined,
) {
  const selected = selectPreferredActiveMembership(memberships, activeBusinessId);
  const fallback = selectActiveMembership(memberships);

  if (!selected) return [];
  if (!fallback || selected.business_id === fallback.business_id) return [selected];

  // A referenced business cannot normally disappear while its membership
  // remains because of database FKs. Keeping this fallback makes the resolver
  // safe even if legacy data is stale or a row vanishes between reads.
  return [selected, fallback];
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
  const memberships = await getUserBusinessMemberships(supabase, userId);
  if (memberships.length === 0) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("active_business_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error("Nie udało się odczytać preferowanej firmy.");
  }

  const activeBusinessId = (profile as { active_business_id?: string | null } | null)
    ?.active_business_id;

  for (const membership of activeMembershipCandidates(memberships, activeBusinessId)) {
    const { data: business, error } = await supabase
      .from("businesses")
      .select(fields)
      .eq("id", membership.business_id)
      .maybeSingle();

    if (error) {
      throw new Error("Nie udało się odczytać aktywnej firmy.");
    }

    if (business) {
      return { business: business as TBusiness & { id: string }, membership };
    }
  }

  return null;
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
