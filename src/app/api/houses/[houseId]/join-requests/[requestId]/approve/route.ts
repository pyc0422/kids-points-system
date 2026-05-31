import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { appendQuery, getRefererPath, getSafeInternalPath } from "@/lib/bff/http";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/houses/[houseId]/join-requests/[requestId]/approve">,
) {
  const { houseId, requestId } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const formData = await request.formData();
  const returnTo = getSafeInternalPath(
    String(formData.get("returnTo") ?? getRefererPath(request, "/")),
    "/",
  );

  const { error } = await supabase.rpc("approve_join_request" as never, {
    p_house_id: houseId,
    p_request_id: requestId,
  } as never);

  if (error) {
    redirect(appendQuery(returnTo, { requestError: error.message }));
  }

  revalidatePath("/");
  revalidatePath(`/houses/${houseId}/requests`);
  revalidatePath(`/houses/${houseId}/edit`);

  redirect(returnTo);
}
