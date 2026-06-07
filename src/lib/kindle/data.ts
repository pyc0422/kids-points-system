import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { mapActivity, mapCompletion, mapHouse, mapHouseMember, mapLedgerEntry } from "@/lib/supabase/mappers";
import type { Activity, Completion, House, HouseMember, LedgerEntry } from "@/lib/domain";
import { isoDate } from "@/utils/date";

export type KindleNextItem = {
  id: string;
  title: string;
  dueOn: string;
  completedAt?: string;
  kind: "event" | "birthday";
  originalDate?: string;
};

export type KindleData = {
  house: House;
  members: HouseMember[];
  activities: Activity[];
  completions: Completion[];
  ledgerEntries: LedgerEntry[];
  nextItems: KindleNextItem[];
  todayKey: string;
};

type NextItemRow = {
  id: string;
  title: string;
  due_on: string;
  completed_at: string | null;
  kind: "event" | "birthday";
  original_date: string | null;
};

export function mapNextItem(row: NextItemRow): KindleNextItem {
  return {
    id: row.id,
    title: row.title,
    dueOn: row.due_on,
    completedAt: row.completed_at ?? undefined,
    kind: row.kind,
    originalDate: row.original_date ?? undefined,
  };
}

export async function getKindleData(houseId: string): Promise<KindleData> {
  const supabase = createAdminClient();
  const todayKey = isoDate(new Date());

  const passResult = await supabase
    .from("kindle_next_items")
    .update({ completed_at: new Date().toISOString() })
    .eq("house_id", houseId)
    .eq("kind", "event")
    .lt("due_on", todayKey)
    .is("completed_at", null);

  if (passResult.error) {
    throw new Error(passResult.error.message);
  }

  const [houseResult, membersResult, activitiesResult, ledgerResult, nextResult] =
    await Promise.all([
      supabase.from("houses").select("*").eq("id", houseId).maybeSingle(),
      supabase
        .from("house_members")
        .select("*")
        .eq("house_id", houseId)
        .order("created_at", { ascending: true }),
      supabase
        .from("activities")
        .select("*")
        .eq("house_id", houseId)
        .order("created_at", { ascending: true }),
      supabase
        .from("ledger_entries")
        .select("*")
        .eq("house_id", houseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("kindle_next_items")
        .select("id,title,due_on,completed_at,kind,original_date")
        .eq("house_id", houseId)
        .order("due_on", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

  if (houseResult.error) {
    throw new Error(houseResult.error.message);
  }
  if (!houseResult.data) {
    throw new Error(
      `No house found for KINDLE_FAMILY_HOUSE_ID=${houseId}. Use the id column from Supabase public.houses, not the invite code or house name.`,
    );
  }
  if (membersResult.error) {
    throw new Error(membersResult.error.message);
  }
  if (activitiesResult.error) {
    throw new Error(activitiesResult.error.message);
  }
  if (ledgerResult.error) {
    throw new Error(ledgerResult.error.message);
  }
  if (nextResult.error) {
    throw new Error(nextResult.error.message);
  }

  const activityIds = activitiesResult.data.map((activity) => activity.id);
  const memberIds = membersResult.data.map((member) => member.id);

  const [assigneesResult, completionsResult] = await Promise.all([
    activityIds.length > 0
      ? supabase
          .from("activity_assignees")
          .select("activity_id, member_id")
          .in("activity_id", activityIds)
      : Promise.resolve({ data: [], error: null }),
    memberIds.length > 0
      ? supabase
          .from("completions")
          .select("*")
          .in("member_id", memberIds)
          .gte("completed_on", todayKey)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (assigneesResult.error) {
    throw new Error(assigneesResult.error.message);
  }
  if (completionsResult.error) {
    throw new Error(completionsResult.error.message);
  }

  const assigneesByActivity = new Map<string, string[]>();
  assigneesResult.data.forEach((assignee) => {
    const existing = assigneesByActivity.get(assignee.activity_id) ?? [];
    assigneesByActivity.set(assignee.activity_id, [...existing, assignee.member_id]);
  });

  const members = membersResult.data.map(mapHouseMember);
  const nextItems = nextResult.data.map(mapNextItem).sort((left, right) =>
    left.dueOn === right.dueOn ? left.title.localeCompare(right.title) : left.dueOn.localeCompare(right.dueOn),
  );

  return {
    house: mapHouse(houseResult.data),
    members,
    activities: activitiesResult.data.map((activity) =>
      mapActivity(activity, assigneesByActivity.get(activity.id) ?? []),
    ),
    completions: completionsResult.data.map(mapCompletion),
    ledgerEntries: ledgerResult.data.map(mapLedgerEntry),
    nextItems,
    todayKey,
  };
}

export function getBalanceTotals(ledgerEntries: LedgerEntry[], memberId: string) {
  return ledgerEntries
    .filter((entry) => entry.memberId === memberId)
    .reduce(
      (totals, entry) => ({
        points: totals.points + (entry.type === "points" ? entry.amount : 0),
        money: totals.money + (entry.type === "money" ? entry.amount : 0),
      }),
      { points: 0, money: 0 },
    );
}

export function getKindleActorMember(members: HouseMember[]) {
  const configuredActorId = process.env.KINDLE_ACTOR_MEMBER_ID;
  const configuredActor = configuredActorId
    ? members.find((member) => member.id === configuredActorId)
    : undefined;

  return (
    configuredActor ??
    members.find((member) => member.role === "admin" || member.role === "parent") ??
    members[0]
  );
}
