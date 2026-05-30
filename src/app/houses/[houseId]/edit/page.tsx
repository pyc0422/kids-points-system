import { redirect } from "next/navigation";
import { HouseEditPageShell } from "@/components/HouseEditPageShell";
import { createClient } from "@/lib/supabase/server";
import { getAppData, getHouseEditData } from "@/lib/bff/family";

export default async function HouseEditPage({
  params,
}: {
  params: Promise<{ houseId: string }>;
}) {
  const { houseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const [appData, editData] = await Promise.all([
    getAppData(user.id),
    getHouseEditData(user.id, houseId),
  ]);

  if (!appData || !editData) {
    redirect("/houses/switch");
  }

  return <HouseEditPageShell appData={appData} editData={editData} viewerEmail={user.email ?? ""} />;
}
