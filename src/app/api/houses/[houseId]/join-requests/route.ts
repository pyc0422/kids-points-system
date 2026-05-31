import { NextResponse } from "next/server";
import { getHouseJoinRequestsData } from "@/lib/bff/family";
import { createClient } from "@/lib/supabase/server";

export async function GET(_: Request, ctx: RouteContext<"/api/houses/[houseId]/join-requests">) {
  const { houseId } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getHouseJoinRequestsData(user.id, houseId);
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ requests: data.requests });
}
