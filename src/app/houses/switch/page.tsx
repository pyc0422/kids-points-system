import { AuthScreen } from "@/components/AuthScreen";
import { HouseSetupScreen } from "@/components/HouseSetupScreen";
import { HouseSwitcherScreen } from "@/components/HouseSwitcherScreen";
import { createClient } from "@/lib/supabase/server";
import { getHouseSwitchData } from "@/lib/bff/family";

export default async function HouseSwitchPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AuthScreen />;
  }

  const switchData = await getHouseSwitchData(user.id);

  if (switchData.joinedHouses.length === 0) {
    return (
      <HouseSetupScreen
        defaultDisplayName={user.user_metadata.full_name ?? user.email}
      />
    );
  }

  return (
    <HouseSwitcherScreen
      defaultDisplayName={user.user_metadata.full_name ?? user.email}
      joinedHouses={switchData.joinedHouses}
      activeHouseId={switchData.activeHouseId}
    />
  );
}
