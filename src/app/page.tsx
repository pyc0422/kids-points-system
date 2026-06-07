import { AuthScreen } from "@/components/AuthScreen";
import { HouseSetupScreen } from "@/components/HouseSetupScreen";
import { KidsPointsApp } from "@/components/KidsPointsApp";
import { createClient } from "@/lib/supabase/server";
import { getAppData } from "@/lib/bff/family";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ requestError?: string }>;
}) {
  const { requestError } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AuthScreen />;
  }

  const appData = await getAppData(user.id);

  if (!appData) {
    return (
      <HouseSetupScreen
        defaultDisplayName={user.user_metadata.full_name ?? user.email}
      />
    );
  }

  return (
    <KidsPointsApp
      {...appData}
      viewerEmail={user.email ?? ""}
      requestError={requestError}
    />
  );
}
