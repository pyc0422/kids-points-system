"use client";

import { ChevronDown, HomeIcon, LogOut, PencilLine } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { switchHouseAction } from "@/app/actions";
import type { HouseMember } from "@/lib/domain";
import type { JoinedHouse } from "@/lib/bff/family";
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
  onTabChange,
}: {
  activeMember: HouseMember;
  activeHouseId: string;
  activeHouseLabel: string;
  activeTab: TabId;
  availableTabs: Array<{ id: TabId; label: string; icon: React.ReactNode }>;
  joinedHouses: JoinedHouse[];
  viewerEmail: string;
  onTabChange: (tabId: TabId) => void;
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showHouseList, setShowHouseList] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const canEditHouse = activeMember.role === "admin";

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
        setShowHouseList(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function handleUserMenuToggle() {
    setUserMenuOpen((current) => {
      const nextOpen = !current;
      if (!nextOpen) {
        setShowHouseList(false);
      }
      return nextOpen;
    });
  }

  return (
    <section className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-3 py-3 sm:px-6 sm:py-5 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white sm:size-11">
              <HomeIcon aria-hidden className="size-4 sm:size-5" />
            </div>
            <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
              {canEditHouse ? (
                <Link
                  href={`/houses/${activeHouseId}/edit`}
                  aria-label="Edit house"
                  title="Edit house"
                  className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 sm:size-8"
                >
                  <PencilLine aria-hidden className="size-3.5 sm:size-4" />
                </Link>
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-[10px] font-medium text-zinc-500 sm:text-sm">
                  {activeHouseLabel}
                </p>
                <h1 className="truncate text-base font-semibold tracking-tight sm:text-xl lg:text-2xl">
                  Family Points & Allowance
                </h1>
              </div>
            </div>
          </div>

          <div className="relative shrink-0 self-start" ref={menuRef}>
            <button
              type="button"
              onClick={handleUserMenuToggle}
              className="inline-flex h-10 max-w-[10rem] items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2 text-left transition hover:bg-zinc-100 sm:h-11 sm:max-w-none sm:gap-3 sm:px-3"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <Avatar member={activeMember} compact />
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-zinc-950 sm:text-sm">
                  {activeMember.name}
                </span>
              </span>
              <ChevronDown
                aria-hidden
                className={`size-3.5 shrink-0 text-zinc-500 transition sm:size-4 ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {userMenuOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-[18rem] rounded-lg border border-zinc-200 bg-white p-3 shadow-lg sm:w-80">
                <div className="border-b border-zinc-200 pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar member={activeMember} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-950">
                        {activeMember.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {viewerEmail}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Display name</span>
                      <span className="font-semibold text-zinc-950">
                        {activeMember.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Role</span>
                      <span className="font-semibold text-zinc-950">
                        {roleLabels[activeMember.role]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="px-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Switch house
                  </div>
                  {joinedHouses.length <= 3 ? (
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
                              entry.house.id === activeHouseId
                                ? "bg-zinc-50"
                                : ""
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
                  ) : (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setShowHouseList((current) => !current)}
                        className="flex w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                      >
                        <span>Choose house</span>
                        <ChevronDown
                          aria-hidden
                          className={`size-4 transition ${showHouseList ? "rotate-180" : ""}`}
                        />
                      </button>
                      {showHouseList ? (
                        <div className="mt-2 grid gap-1 rounded-md border border-zinc-200 p-1">
                          {joinedHouses.map((entry) => (
                            <form
                              key={entry.house.id}
                              action={switchHouseAction}
                            >
                              <input
                                type="hidden"
                                name="houseId"
                                value={entry.house.id}
                              />
                              <button
                                type="submit"
                                className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition hover:bg-zinc-50 ${
                                  entry.house.id === activeHouseId
                                    ? "bg-zinc-50"
                                    : ""
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
                      ) : null}
                    </div>
                  )}
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
            ) : null}
          </div>
        </div>

        <nav className="grid grid-cols-4 gap-2 pb-1 sm:flex sm:gap-2 sm:overflow-x-auto sm:px-0">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`inline-flex h-14 w-14 min-w-0 flex-col items-center justify-center gap-1 rounded-md px-0 text-[12px] font-semibold leading-none transition sm:h-10 sm:w-auto sm:shrink-0 sm:flex-row sm:gap-2 sm:px-4 sm:text-xl ${
                activeTab === tab.id
                  ? "bg-zinc-950 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              {tab.icon}
              <span className="text-xs sm:text-lg">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
