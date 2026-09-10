import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadDashboardRequestContext } from "./dashboard-request-context-loader";

// React owns the cache lifetime: one RSC render/request, never a cross-request map.
// userId must come from verified server auth, not a request parameter.
export const getDashboardRequestClient = cache(createClient);
export const getDashboardUser = cache(async () =>
  (await getDashboardRequestClient()).auth.getUser(),
);

export const getDashboardRequestContext = cache(async (userId: string) => {
  const { data: { user } } = await getDashboardUser();
  if (!user || user.id !== userId) throw new Error("Brak autoryzowanej sesji użytkownika.");
  return loadDashboardRequestContext(await getDashboardRequestClient(), createAdminClient, user.id);
});
