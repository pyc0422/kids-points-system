import { redirect } from "next/navigation";
import { appendQuery, getSafeInternalPath } from "@/lib/bff/http";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const formData = await request.formData();
  const houseRef = String(formData.get("houseId") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const roleValue = String(formData.get("role") ?? "kid").trim();
  const returnTo = getSafeInternalPath(String(formData.get("returnTo") ?? ""), "/houses/switch");

  if (!houseRef || !displayName) {
    redirect(appendQuery(returnTo, {
      requestError: "House ID or invite code and display name are required.",
    }));
  }

  if (roleValue !== "kid" && roleValue !== "parent") {
    redirect(appendQuery(returnTo, { requestError: "Invalid role." }));
  }

  const { error } = await supabase.rpc("request_join_house" as never, {
    p_house_ref: houseRef,
    p_display_name: displayName,
    p_role: roleValue,
  } as never);

  if (error) {
    redirect(appendQuery(returnTo, { requestError: error.message }));
  }

  redirect("/houses/switch?request=sent");
}
