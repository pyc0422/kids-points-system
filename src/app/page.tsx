"use client";

import { useMemo, useState } from "react";
import { ActivitiesTab } from "@/components/ActivitiesTab";
import { AppHeader } from "@/components/AppHeader";
import { BalancesTab } from "@/components/BalancesTab";
import { ChartsTab } from "@/components/ChartsTab";
import { HomeTab } from "@/components/HomeTab";
import {
  activities as initialActivities,
  completions as initialCompletions,
  houseMembers,
  ledgerEntries as initialLedgerEntries,
} from "@/lib/demo-data";
import type {
  Activity,
  Completion,
  CompletionStatus,
  HouseMember,
  LedgerEntry,
  MemberSummary,
  RewardType,
} from "@/lib/domain";
import type { BalanceMode, TabId } from "@/utils/app-types";
import { getCompletion, isActivityDue } from "@/utils/activity";
import { demoToday, tabs } from "@/utils/constants";
import { addDays, isoDate, startOfWeek } from "@/utils/date";

export default function Home() {
  const [activeMemberId, setActiveMemberId] = useState("admin-1");
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [activities, setActivities] = useState(initialActivities);
  const [selectedKidId, setSelectedKidId] = useState("kid-1");
  const [selectedBalanceKidId, setSelectedBalanceKidId] = useState("kid-1");
  const [balanceMode, setBalanceMode] = useState<BalanceMode>("list");
  const [selectedChartKidId, setSelectedChartKidId] = useState("kid-1");
  const [weekOffset, setWeekOffset] = useState(0);
  const [completions, setCompletions] = useState(initialCompletions);
  const [ledgerEntries, setLedgerEntries] = useState(initialLedgerEntries);

  const activeMember = houseMembers.find((member) => member.id === activeMemberId);
  const kids = houseMembers.filter((member) => member.role === "kid");
  const canReview = activeMember?.role === "admin" || activeMember?.role === "parent";
  const canManageBalances = canReview;
  const visibleKids =
    activeMember?.role === "kid"
      ? kids.filter((kid) => kid.id === activeMember.id)
      : kids;
  const currentSelectedKid =
    visibleKids.find((kid) => kid.id === selectedKidId) ?? visibleKids[0];
  const currentChartKid =
    visibleKids.find((kid) => kid.id === selectedChartKidId) ?? visibleKids[0];
  const availableTabs = canManageBalances
    ? tabs
    : tabs.filter((tab) => tab.id !== "balances");
  const weekStart = addDays(startOfWeek(demoToday), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  const summaries = useMemo<MemberSummary[]>(() => {
    return kids.map((kid) => {
      const kidLedger = ledgerEntries.filter((entry) => entry.memberId === kid.id);
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

  function upsertCompletion(
    activity: Activity,
    member: HouseMember,
    status: CompletionStatus,
    completedOn = isoDate(demoToday),
  ) {
    const existing = getCompletion(completions, activity.id, member.id, completedOn);
    const nextCompletion: Completion = {
      id: existing?.id ?? `completion-${activity.id}-${member.id}-${completedOn}`,
      activityId: activity.id,
      memberId: member.id,
      completedOn,
      status,
      submittedAt: existing?.submittedAt ?? "Just now",
      reviewedAt: status === "approved" || status === "rejected" ? "Just now" : undefined,
      reviewerId:
        status === "approved" || status === "rejected" ? activeMember?.id : undefined,
    };

    setCompletions((current) => {
      if (existing) {
        return current.map((completion) =>
          completion.id === existing.id ? nextCompletion : completion,
        );
      }

      return [...current, nextCompletion];
    });

    if (status === "approved") {
      addLedgerAward(activity, member);
    }
  }

  function addLedgerAward(activity: Activity, member: HouseMember) {
    setLedgerEntries((current) => {
      const alreadyAwarded = current.some(
        (entry) =>
          entry.activityId === activity.id &&
          entry.memberId === member.id &&
          entry.createdAt === "Just now",
      );

      if (alreadyAwarded) {
        return current;
      }

      const entry: LedgerEntry = {
        id: `ledger-${activity.id}-${member.id}-${Date.now()}`,
        activityId: activity.id,
        memberId: member.id,
        type: activity.rewardType,
        amount: activity.rewardAmount,
        createdAt: "Just now",
      };

      return [entry, ...current];
    });
  }

  function submitActivity(activity: Activity, member: HouseMember) {
    const status = activity.requiresApproval ? "submitted" : "approved";
    upsertCompletion(activity, member, status);
  }

  function adjustBalance(
    member: HouseMember,
    type: RewardType,
    amount: number,
    note: string,
  ) {
    const entry: LedgerEntry = {
      id: `manual-${member.id}-${type}-${Date.now()}`,
      memberId: member.id,
      type,
      amount,
      createdAt: "Just now",
      note: note.trim() || (amount < 0 ? "Manual redemption" : "Manual adjustment"),
    };

    setLedgerEntries((current) => [entry, ...current]);
  }

  function handleMemberChange(memberId: string) {
    const member = houseMembers.find((item) => item.id === memberId);

    setActiveMemberId(memberId);
    if (member?.role === "kid") {
      setSelectedKidId(member.id);
      setSelectedChartKidId(member.id);
      if (activeTab === "balances") {
        setActiveTab("home");
        setBalanceMode("list");
      }
    }
  }

  function openMember(memberId: string) {
    setSelectedKidId(memberId);
    setActiveTab("home");
  }

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-zinc-950">
      <AppHeader
        activeMemberId={activeMemberId}
        activeTab={activeTab}
        availableTabs={availableTabs}
        members={houseMembers}
        onMemberChange={handleMemberChange}
        onTabChange={setActiveTab}
      />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "home" ? (
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
              setActivities((current) => [activity, ...current])
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
