import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

function getServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-only Supabase access.");
  }

  const [, payload] = key.split(".");
  if (payload) {
    try {
      const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
        role?: string;
      };

      if (decoded.role && decoded.role !== "service_role") {
        throw new Error(
          "SUPABASE_SERVICE_ROLE_KEY must be the Supabase service_role secret key, not the anon/publishable key.",
        );
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes("service_role")) {
        throw error;
      }
    }
  }

  return key;
}

export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getServiceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
