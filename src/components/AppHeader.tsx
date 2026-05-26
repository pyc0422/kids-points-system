import { ChevronDown, HomeIcon, UserRoundCheck } from "lucide-react";
import type { HouseMember } from "@/lib/domain";
import type { TabId } from "@/utils/app-types";
import { roleLabels } from "@/utils/constants";

export function AppHeader({
  activeMemberId,
  activeTab,
  availableTabs,
  members,
  onMemberChange,
  onTabChange,
}: {
  activeMemberId: string;
  activeTab: TabId;
  availableTabs: Array<{ id: TabId; label: string; icon: React.ReactNode }>;
  members: HouseMember[];
  onMemberChange: (memberId: string) => void;
  onTabChange: (tabId: TabId) => void;
}) {
  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-zinc-950 text-white">
              <HomeIcon aria-hidden className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">House ID KITE-4821</p>
              <h1 className="text-2xl font-semibold tracking-normal">
                Family Points & Allowance
              </h1>
            </div>
          </div>

          <label className="flex w-fit items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium">
            <UserRoundCheck aria-hidden className="size-4 text-zinc-500" />
            Viewing as
            <span className="relative">
              <select
                value={activeMemberId}
                onChange={(event) => onMemberChange(event.target.value)}
                className="appearance-none rounded-md border border-zinc-300 bg-white py-2 pl-3 pr-8 font-semibold outline-none transition focus:border-zinc-950"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({roleLabels[member.role]})
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
              />
            </span>
          </label>
        </div>

        <nav className="flex gap-2 overflow-x-auto">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-md px-4 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-zinc-950 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
