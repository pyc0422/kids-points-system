"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  adjustBalanceAction,
  createActivityAction,
  updateActivityAction,
  upsertCompletionAction,
} from "@/app/actions";
import type {
  Activity,
  Completion,
  CompletionStatus,
  House,
  HouseMember,
  HouseJoinRequest,
  LedgerEntry,
  MemberSummary,
  RewardType,
} from "@/lib/domain";
import type { JoinedHouse } from "@/lib/bff/family";
import type { BalanceMode, TabId } from "@/utils/app-types";
import { getCompletion, isActivityDue } from "@/utils/activity";
import { demoToday, tabs } from "@/utils/constants";
import { addDays, isoDate, startOfWeek } from "@/utils/date";
import { ActivitiesTab } from "./ActivitiesTab";
import { AppHeader } from "./AppHeader";
import { BalancesTab } from "./BalancesTab";
import { ChartsTab } from "./ChartsTab";
import { EmptyHouseState } from "./EmptyHouseState";
import { JoinRequestsAlert } from "./JoinRequestsAlert";
import { HomeTab } from "./HomeTab";

export function KidsPointsApp({
  house,
  activeHouseId,
  activeMember,
  joinedHouses,
  viewerEmail,
  pendingJoinRequests,
  requestError,
  members,
  activities,
  completions,
  ledgerEntries,
}: Readonly<{
  house: House;
  activeHouseId: string;
  activeMember: HouseMember;
  joinedHouses: JoinedHouse[];
  viewerEmail: string;
  pendingJoinRequests: HouseJoinRequest[];
  requestError?: string | null;
  members: HouseMember[];
  activities: Activity[];
  completions: Completion[];
  ledgerEntries: LedgerEntry[];
}>) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const kids = members.filter((member) => member.role === "kid");
  const [selectedKidId, setSelectedKidId] = useState(kids[0]?.id ?? "");
  const [selectedBalanceKidId, setSelectedBalanceKidId] = useState(
    kids[0]?.id ?? "",
  );
  const [balanceMode, setBalanceMode] = useState<BalanceMode>("list");
  const [selectedChartKidId, setSelectedChartKidId] = useState(
    kids[0]?.id ?? "",
  );
  const [weekOffset, setWeekOffset] = useState(0);
  const canReview =
    activeMember.role === "admin" || activeMember.role === "parent";
  const canManageBalances = canReview;
  const visibleKids = activeMember.role === "kid" ? [activeMember] : kids;
  const currentSelectedKid =
    visibleKids.find((kid) => kid.id === selectedKidId) ?? visibleKids[0];
  const currentChartKid =
    visibleKids.find((kid) => kid.id === selectedChartKidId) ?? visibleKids[0];
  const availableTabs = canManageBalances
    ? tabs
    : tabs.filter((tab) => tab.id !== "balances");
  const weekStart = addDays(startOfWeek(demoToday), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index),
  );

  const summaries = useMemo<MemberSummary[]>(() => {
    return kids.map((kid) => {
      const kidLedger = ledgerEntries.filter(
        (entry) => entry.memberId === kid.id,
      );
      const kidCompletions = completions.filter(
        (completion) => completion.memberId === kid.id,
      );

      return {
        member: kid,
        points: kidLedger
          .filter((entry) => entry.type === "points")
          .reduce((total, entry) => total + entry.amount, 0),
        money: kidLedger
          .filter((entry) => entry.type === "money")
          .reduce((total, entry) => total + entry.amount, 0),
        submitted: kidCompletions.filter(
          (completion) => completion.status === "submitted",
        ).length,
        approved: kidCompletions.filter(
          (completion) => completion.status === "approved",
        ).length,
      };
    });
  }, [completions, kids, ledgerEntries]);

  function dueCountForMember(memberId: string) {
    return activities
      .filter((activity) => activity.assigneeIds.includes(memberId))
      .filter((activity) => isActivityDue(activity, demoToday))
      .filter((activity) => {
        const completion = getCompletion(
          completions,
          activity.id,
          memberId,
          isoDate(demoToday),
        );
        return completion?.status !== "approved";
      }).length;
  }

  function refreshAfter(action: Promise<unknown>) {
    startTransition(async () => {
      try {
        await action;
        router.refresh();
      } catch (error) {
        window.alert(
          error instanceof Error ? error.message : "Something went wrong.",
        );
      }
    });
  }

  function submitActivity(activity: Activity, member: HouseMember) {
    const status = activity.requiresApproval ? "submitted" : "approved";
    upsertCompletion(activity, member, status);
  }

  function upsertCompletion(
    activity: Activity,
    member: HouseMember,
    status: CompletionStatus,
    completedOn = isoDate(demoToday),
  ) {
    refreshAfter(
      upsertCompletionAction({
        activity,
        member,
        status,
        completedOn,
        houseId: house.id,
      }),
    );
  }

  function adjustBalance(
    member: HouseMember,
    type: RewardType,
    amount: number,
    note: string,
  ) {
    refreshAfter(
      adjustBalanceAction({
        member,
        type,
        amount,
        note,
        houseId: house.id,
      }),
    );
  }

  function handleTabChange(tabId: TabId) {
    setActiveTab(tabId);
  }

  function openMember(memberId: string) {
    setSelectedKidId(memberId);
    setActiveTab("home");
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-zinc-950">
      <AppHeader
        activeMember={activeMember}
        activeHouseId={activeHouseId}
        activeHouseLabel={`${house.name} · Invite ${house.inviteCode}`}
        activeTab={activeTab}
        availableTabs={availableTabs}
        joinedHouses={joinedHouses}
        viewerEmail={viewerEmail}
        onTabChange={handleTabChange}
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {kids.length === 0 ? <EmptyHouseState /> : null}

        {requestError ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {requestError}
          </div>
        ) : null}

        {activeMember.role === "admin" ? (
          <JoinRequestsAlert
            houseId={house.id}
            requests={pendingJoinRequests}
          />
        ) : null}

        {activeTab === "home" && kids.length > 0 ? (
          <HomeTab
            kids={visibleKids}
            selectedKid={currentSelectedKid}
            activities={activities}
            completions={completions}
            activeMember={activeMember}
            canReview={canReview}
            dueCountForMember={dueCountForMember}
            onOpenMember={openMember}
            onSubmit={submitActivity}
            onReview={upsertCompletion}
          />
        ) : null}

        {activeTab === "activities" ? (
          <ActivitiesTab
            activities={activities}
            kids={kids}
            canAdd={canReview}
            activeMember={activeMember}
            onAddActivity={(activity) =>
              refreshAfter(createActivityAction(activity, house.id))
            }
            onUpdateActivity={(activity) =>
              refreshAfter(updateActivityAction(activity, house.id))
            }
          />
        ) : null}

        {activeTab === "balances" && canManageBalances ? (
          <BalancesTab
            kids={kids}
            summaries={summaries}
            ledgerEntries={ledgerEntries}
            activities={activities}
            selectedKidId={selectedBalanceKidId}
            mode={balanceMode}
            onSelectKid={(kidId) => {
              setSelectedBalanceKidId(kidId);
              setBalanceMode("detail");
            }}
            onModeChange={setBalanceMode}
            onAdjust={adjustBalance}
          />
        ) : null}

        {activeTab === "charts" ? (
          <ChartsTab
            kids={visibleKids}
            selectedKid={currentChartKid}
            selectedKidId={selectedChartKidId}
            onSelectedKidChange={setSelectedChartKidId}
            activities={activities}
            completions={completions}
            weekDays={weekDays}
            weekStart={weekStart}
            onPreviousWeek={() => setWeekOffset((current) => current - 1)}
            onNextWeek={() => setWeekOffset((current) => current + 1)}
          />
        ) : null}
      </section>
    </main>
  );
}
