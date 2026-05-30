"use client";

import { ChevronDown, HomeIcon, LogOut } from "lucide-react";
import type { HouseMember } from "@/lib/domain";
import type { JoinedHouse } from "@/lib/bff/family";
import { switchHouseAction } from "@/app/actions";
import type { TabId } from "@/utils/app-types";
import { roleLabels } from "@/utils/constants";
import { Avatar } from "./Avatar";

export function AppHeader({
  activeMember,
  activeHouseId,
  activeHouseLabel,
  activeTab,
  availableTabs,
  joinedHouses,
  viewerEmail,
  viewerFullName,
  onTabChange,
}: {
  activeMember: HouseMember;
  activeHouseId: string;
  activeHouseLabel: string;
  activeTab: TabId;
  availableTabs: Array<{ id: TabId; label: string; icon: React.ReactNode }>;
  joinedHouses: JoinedHouse[];
  viewerEmail: string;
  viewerFullName: string;
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
              <p className="text-sm font-medium text-zinc-500">
                {activeHouseLabel}
              </p>
              <h1 className="text-2xl font-semibold tracking-normal">
                Family Points & Allowance
              </h1>
            </div>
          </div>

          <details className="group relative self-start">
            <summary className="inline-flex h-11 cursor-pointer list-none items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-left transition hover:bg-zinc-100">
              <Avatar member={activeMember} compact />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-zinc-950">
                  {activeMember.name}
                </span>
              </span>
              <ChevronDown
                aria-hidden
                className="size-4 text-zinc-500 transition group-open:rotate-180"
              />
            </summary>

            <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg">
              <div className="border-b pb-3">
                <div className="flex items-center gap-3">
                  <Avatar member={activeMember} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-zinc-950">
                      {viewerFullName}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {viewerEmail}
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between rounded-md px-3 py-2">
                    <span className="text-zinc-500">Role</span>
                    <span className="font-semibold text-zinc-950">
                      {roleLabels[activeMember.role]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-md px-3 py-2">
                    <span className="text-zinc-500">Name</span>
                    <span className="font-semibold text-zinc-950">
                      {activeMember.name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <p className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Switch house
                </p>
                <div className="mt-2 grid gap-1">
                  {joinedHouses.map((entry) => (
                    <form key={entry.house.id} action={switchHouseAction}>
                      <input
                        type="hidden"
                        name="houseId"
                        value={entry.house.id}
                      />
                      <button
                        type="submit"
                        className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition hover:bg-zinc-50 ${
                          entry.house.id === activeHouseId ? "bg-zinc-50" : ""
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-zinc-950">
                            {entry.house.name}
                          </span>
                          <span className="block text-xs text-zinc-500">
                            {roleLabels[entry.member.role]}
                          </span>
                        </span>
                        {entry.house.id === activeHouseId ? (
                          <span className="rounded-md bg-zinc-950 px-2 py-1 text-xs font-semibold text-white">
                            Active
                          </span>
                        ) : null}
                      </button>
                    </form>
                  ))}
                </div>
              </div>

              <form
                action="/auth/signout"
                method="post"
                className="mt-3 border-t border-zinc-200 pt-3"
              >
                <button
                  type="submit"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                >
                  <LogOut aria-hidden className="size-4" />
                  Log out
                </button>
              </form>
            </div>
          </details>
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
