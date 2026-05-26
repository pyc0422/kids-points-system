import { ArrowLeftRight, LogOut, HomeIcon } from "lucide-react";
import type { HouseMember } from "@/lib/domain";
import type { TabId } from "@/utils/app-types";
import { roleLabels } from "@/utils/constants";
import { Avatar } from "./Avatar";
import Link from "next/link";

export function AppHeader({
  activeMember,
  activeTab,
  availableTabs,
  houseLabel,
  onTabChange,
}: {
  activeMember: HouseMember;
  activeTab: TabId;
  availableTabs: Array<{ id: TabId; label: string; icon: React.ReactNode }>;
  houseLabel: string;
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
              <p className="text-sm font-medium text-zinc-500">{houseLabel}</p>
              <h1 className="text-2xl font-semibold tracking-normal">
                Family Points & Allowance
              </h1>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/houses/switch"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              <ArrowLeftRight aria-hidden className="size-4" />
              Switch house
            </Link>

            <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
              <Avatar member={activeMember} compact />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-950">
                  {activeMember.name}
                </p>
                <p className="text-xs text-zinc-500">{roleLabels[activeMember.role]}</p>
              </div>
            </div>

            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                <LogOut aria-hidden className="size-4" />
                Log out
              </button>
            </form>
          </div>
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
