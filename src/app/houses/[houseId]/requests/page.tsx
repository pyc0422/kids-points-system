import { redirect } from "next/navigation";
import { HouseJoinRequestsPageShell } from "@/components/HouseJoinRequestsPageShell";
import { createClient } from "@/lib/supabase/server";
import { getHouseJoinRequestsData } from "@/lib/bff/family";

export default async function HouseJoinRequestsPage({
  params,
  searchParams,
}: {
  params: Promise<{ houseId: string }>;
  searchParams: Promise<{ requestError?: string }>;
}) {
  const { houseId } = await params;
  const { requestError } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const data = await getHouseJoinRequestsData(user.id, houseId);

  if (!data) {
    redirect("/houses/switch");
  }

  return (
    <HouseJoinRequestsPageShell
      data={data}
      viewerEmail={user.email ?? ""}
      requestError={requestError}
    />
  );
}
