"use client";

import { useEffect, useMemo, useState } from "react";
import {
  adjustBalanceAction,
  createActivityAction,
  removeCompletionMarkAction,
  updateActivityAction,
  upsertCompletionAction,
} from "@/app/actions";
import type {
  Activity,
  Completion,
  CompletionStatus,
  House,
  HouseJoinRequest,
  HouseMember,
  LedgerEntry,
  MemberSummary,
  RewardType,
} from "@/lib/domain";
import type { JoinedHouse } from "@/lib/bff/family";
import type { BalanceMode, TabId } from "@/utils/app-types";
import { getCompletion, isActivityDue } from "@/utils/activity";
import { tabs } from "@/utils/constants";
import { addDays, isoDate, startOfWeek } from "@/utils/date";
import { ActivitiesTab } from "./ActivitiesTab";
import { AppHeader } from "./AppHeader";
import { BalancesTab } from "./BalancesTab";
import { ChartsTab } from "./ChartsTab";
import { EmptyHouseState } from "./EmptyHouseState";
import { HomeTab } from "./HomeTab";
import { JoinRequestsAlert } from "./JoinRequestsAlert";

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
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [activitiesState, setActivitiesState] = useState<Activity[]>(activities);
  const [completionsState, setCompletionsState] = useState<Completion[]>(completions);
  const [ledgerEntriesState, setLedgerEntriesState] = useState<LedgerEntry[]>(ledgerEntries);
  const kids = members.filter((member) => member.role === "kid");
  const [selectedKidId, setSelectedKidId] = useState(kids[0]?.id ?? "");
  const [selectedBalanceKidId, setSelectedBalanceKidId] = useState(kids[0]?.id ?? "");
  const [balanceMode, setBalanceMode] = useState<BalanceMode>("list");
  const [weekOffset, setWeekOffset] = useState(0);
  const [today, setToday] = useState(() => new Date());
  const todayKey = isoDate(today);

  useEffect(() => {
    const nextMidnight = new Date(today);
    nextMidnight.setHours(24, 0, 0, 0);
    const timeout = window.setTimeout(
      () => setToday(new Date()),
      Math.max(nextMidnight.getTime() - Date.now(), 1000),
    );

    return () => window.clearTimeout(timeout);
  }, [today]);

  const canReview = activeMember.role === "admin" || activeMember.role === "parent";
  const canManageBalances = canReview;
  const visibleKids = activeMember.role === "kid" ? [activeMember] : kids;
  const currentSelectedKid =
    visibleKids.find((kid) => kid.id === selectedKidId) ?? visibleKids[0];
  const availableTabs = canManageBalances
    ? tabs
    : tabs.filter((tab) => tab.id !== "balances");
  const weekStart = addDays(startOfWeek(today), weekOffset * 7);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const canGoPreviousWeek = weekOffset > -3;
  const canGoNextWeek = weekOffset < 0;

  const summaries = useMemo<MemberSummary[]>(() => {
    return kids.map((kid) => {
      const kidLedger = ledgerEntriesState.filter((entry) => entry.memberId === kid.id);
      const kidCompletions = completionsState.filter((completion) => completion.memberId === kid.id);

      return {
        member: kid,
        points: kidLedger
          .filter((entry) => entry.type === "points")
          .reduce((total, entry) => total + entry.amount, 0),
        money: kidLedger
          .filter((entry) => entry.type === "money")
          .reduce((total, entry) => total + entry.amount, 0),
        submitted: kidCompletions.filter((completion) => completion.status === "submitted").length,
        approved: kidCompletions.filter((completion) => completion.status === "approved").length,
      };
    });
  }, [completionsState, kids, ledgerEntriesState]);

  function dueCountForMember(memberId: string) {
    return activitiesState
      .filter((activity) => activity.assigneeIds.includes(memberId))
      .filter((activity) => isActivityDue(activity, today))
      .filter((activity) => {
        const completion = getCompletion(completionsState, activity.id, memberId, todayKey);
        return completion?.status !== "approved";
      }).length;
  }

  function notifyError(error: unknown) {
    window.alert(error instanceof Error ? error.message : "Something went wrong.");
  }

  function submitActivity(activity: Activity, member: HouseMember) {
    const status = activity.requiresApproval ? "submitted" : "approved";
    upsertCompletion(activity, member, status);
  }

  function upsertCompletion(
    activity: Activity,
    member: HouseMember,
    status: CompletionStatus,
    completedOn = todayKey,
  ) {
    const previousCompletions = completionsState;
    const previousLedgerEntries = ledgerEntriesState;
    const markNote = `Marked ${activity.name} on ${completedOn}`;

    const nextCompletion: Completion = {
      id: globalThis.crypto.randomUUID(),
      activityId: activity.id,
      memberId: member.id,
      status,
      completedOn,
      submittedAt: new Date().toLocaleString(),
      reviewedAt: status === "approved" || status === "rejected" ? new Date().toLocaleString() : undefined,
      reviewerId: status === "approved" || status === "rejected" ? activeMember.id : undefined,
    };

    if (activity.frequency !== "as-needed") {
      setCompletionsState((current) => [
        ...current.filter(
          (completion) =>
            !(
              completion.activityId === activity.id &&
              completion.memberId === member.id &&
              completion.completedOn === completedOn
            ),
        ),
        nextCompletion,
      ]);
    }

    if (activity.frequency === "as-needed" || status === "approved") {
      setLedgerEntriesState((current) => [
        ...current.filter(
          (entry) =>
            !(
              entry.activityId === activity.id &&
              entry.memberId === member.id &&
              entry.completedOn === completedOn
            ),
        ),
        {
          id: globalThis.crypto.randomUUID(),
          memberId: member.id,
          activityId: activity.id,
          completedOn,
          type: activity.rewardType,
          amount: activity.rewardAmount,
          createdAt: new Date().toISOString(),
          note: undefined,
        },
        {
          id: globalThis.crypto.randomUUID(),
          memberId: member.id,
          activityId: activity.id,
          completedOn,
          type: activity.rewardType,
          amount: 0,
          createdAt: new Date().toISOString(),
          note: markNote,
        },
      ]);
    }

    void upsertCompletionAction({
      activity,
      member,
      status,
      completedOn,
      houseId: house.id,
    }).catch((error) => {
      setCompletionsState(previousCompletions);
      setLedgerEntriesState(previousLedgerEntries);
      notifyError(error);
    });
  }

  function markActivityOnDate(activity: Activity, member: HouseMember, completedOn: string) {
    const status = canReview ? "approved" : activity.requiresApproval ? "submitted" : "approved";
    upsertCompletion(activity, member, status, completedOn);
  }

  function removeActivityMark(
    activity: Activity,
    member: HouseMember,
    completedOn: string,
  ) {
    const previousCompletions = completionsState;
    const previousLedgerEntries = ledgerEntriesState;
    const removeNote = `Removed ${activity.name} on ${completedOn}`;

    if (activity.frequency !== "as-needed") {
      setCompletionsState((current) =>
        current.filter(
          (completion) =>
            !(
              completion.activityId === activity.id &&
              completion.memberId === member.id &&
              completion.completedOn === completedOn
            ),
        ),
      );
      setLedgerEntriesState((current) =>
        current.filter(
          (entry) =>
            !(
              entry.activityId === activity.id &&
              entry.memberId === member.id &&
              entry.completedOn === completedOn
            ),
        ),
      );
    } else {
      setLedgerEntriesState((current) => {
        const matchIndex = [...current]
          .reverse()
          .findIndex(
            (entry) =>
              entry.activityId === activity.id &&
              entry.memberId === member.id &&
              entry.completedOn === completedOn,
          );

        if (matchIndex === -1) {
          return current;
        }

        const realIndex = current.length - 1 - matchIndex;
        return [
          ...current.filter((_, index) => index !== realIndex),
          {
            id: globalThis.crypto.randomUUID(),
            memberId: member.id,
            activityId: activity.id,
            completedOn,
            type: activity.rewardType,
            amount: 0,
            createdAt: new Date().toISOString(),
            note: removeNote,
          },
        ];
      });
    }

    if (activity.frequency !== "as-needed") {
      setLedgerEntriesState((current) => [
        ...current,
        {
          id: globalThis.crypto.randomUUID(),
          memberId: member.id,
          activityId: activity.id,
          completedOn,
          type: activity.rewardType,
          amount: 0,
          createdAt: new Date().toISOString(),
          note: removeNote,
        },
      ]);
    }

    void removeCompletionMarkAction({
      activity,
      member,
      completedOn,
      houseId: house.id,
    }).catch((error) => {
      setCompletionsState(previousCompletions);
      setLedgerEntriesState(previousLedgerEntries);
      notifyError(error);
    });
  }

  function adjustBalance(
    member: HouseMember,
    type: RewardType,
    amount: number,
    note: string,
  ) {
    const previousLedgerEntries = ledgerEntriesState;
    const nextEntry: LedgerEntry = {
      id: globalThis.crypto.randomUUID(),
      memberId: member.id,
      type,
      amount,
      createdAt: new Date().toISOString(),
      note: note.trim() || undefined,
    };

    setLedgerEntriesState((current) => [nextEntry, ...current]);

    void adjustBalanceAction({
      member,
      type,
      amount,
      note,
      houseId: house.id,
    }).catch((error) => {
      setLedgerEntriesState(previousLedgerEntries);
      notifyError(error);
    });
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
          <JoinRequestsAlert houseId={house.id} requests={pendingJoinRequests} />
        ) : null}

        {activeTab === "home" && kids.length > 0 ? (
          <HomeTab
            kids={visibleKids}
            selectedKid={currentSelectedKid}
            activities={activitiesState}
            completions={completionsState}
            ledgerEntries={ledgerEntriesState}
            activeMember={activeMember}
            canReview={canReview}
            dueCountForMember={dueCountForMember}
            todayKey={todayKey}
            onOpenMember={openMember}
            onSubmit={submitActivity}
            onReview={upsertCompletion}
          />
        ) : null}

        {activeTab === "activities" ? (
          <ActivitiesTab
            activities={activitiesState}
            kids={kids}
            canAdd={canReview}
            activeMember={activeMember}
            onAddActivity={(activity) => {
              const previousActivities = activitiesState;
              setActivitiesState((current) => [...current, activity]);
              void createActivityAction(activity, house.id).catch((error) => {
                setActivitiesState(previousActivities);
                notifyError(error);
              });
            }}
            onUpdateActivity={(activity) => {
              const previousActivities = activitiesState;
              setActivitiesState((current) =>
                current.map((item) => (item.id === activity.id ? activity : item)),
              );
              void updateActivityAction(activity, house.id).catch((error) => {
                setActivitiesState(previousActivities);
                notifyError(error);
              });
            }}
          />
        ) : null}

        {activeTab === "balances" && canManageBalances ? (
          <BalancesTab
            kids={kids}
            members={members}
            summaries={summaries}
            ledgerEntries={ledgerEntriesState}
            activities={activitiesState}
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
            activities={activitiesState}
            completions={completionsState}
            ledgerEntries={ledgerEntriesState}
            weekDays={weekDays}
            todayKey={todayKey}
            canGoPreviousWeek={canGoPreviousWeek}
            canGoNextWeek={canGoNextWeek}
            onPreviousWeek={() =>
              setWeekOffset((current) => (current > -3 ? current - 1 : current))
            }
            onNextWeek={() => setWeekOffset((current) => (current < 0 ? current + 1 : current))}
            onMarkDate={markActivityOnDate}
            onRemoveDate={removeActivityMark}
          />
        ) : null}
      </section>
    </main>
  );
}
