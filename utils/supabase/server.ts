import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { cookies } from "next/headers";

import {
  getSupabasePublishableKey,
  getSupabaseServerKey,
  getSupabaseUrl,
} from "@/utils/supabase/config";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function createClient(cookieStore: CookieStore) {
  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore cookie writes when called from a Server Component.
        }
      },
    },
  });
}

export function createPublicClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createAdminClient() {
  return createSupabaseClient(getSupabaseUrl(), getSupabaseServerKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
