"use client";

import { useRouter } from "next/navigation";
import type { HouseJoinRequestsData } from "@/lib/bff/family";
import { tabs } from "@/utils/constants";
import { AppHeader } from "./AppHeader";
import { HouseJoinRequestsScreen } from "./HouseJoinRequestsScreen";

export function HouseJoinRequestsPageShell({
  data,
  viewerEmail,
  requestError,
}: {
  data: HouseJoinRequestsData;
  viewerEmail: string;
  requestError?: string | null;
}) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-zinc-950">
      <AppHeader
        activeMember={data.member}
        activeHouseId={data.house.id}
        activeHouseLabel={`${data.house.name} · Invite ${data.house.inviteCode}`}
        activeTab="home"
        availableTabs={tabs}
        joinedHouses={data.joinedHouses}
        viewerEmail={viewerEmail}
        onTabChange={() => {
          router.push("/");
        }}
      />

      <section className="px-4 py-6 sm:px-6 lg:px-8">
        {requestError ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {requestError}
          </div>
        ) : null}

        <HouseJoinRequestsScreen house={data.house} requests={data.requests} />
      </section>
    </main>
  );
}
