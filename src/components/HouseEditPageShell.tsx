"use client";

import { useRouter } from "next/navigation";
import { AppHeader } from "./AppHeader";
import { HouseEditScreen } from "./HouseEditScreen";
import type { AppData, HouseEditData } from "@/lib/bff/family";
import { tabs } from "@/utils/constants";

export function HouseEditPageShell({
  appData,
  editData,
  viewerEmail,
}: {
  appData: AppData;
  editData: HouseEditData;
  viewerEmail: string;
}) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-zinc-950">
      <AppHeader
        activeMember={appData.activeMember}
        activeHouseId={appData.activeHouseId}
        activeHouseLabel={`${appData.house.name} · Invite ${appData.house.inviteCode}`}
        activeTab="home"
        availableTabs={tabs}
        joinedHouses={appData.joinedHouses}
        viewerEmail={viewerEmail}
        onTabChange={() => {
          router.push("/");
        }}
      />

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <HouseEditScreen {...editData} />
      </section>
    </main>
  );
}
