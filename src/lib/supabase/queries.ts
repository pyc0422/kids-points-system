import type { Activity, Completion, House, HouseMember, LedgerEntry } from "@/lib/domain";
import { createClient } from "./server";
import {
  mapActivity,
  mapCompletion,
  mapHouse,
  mapHouseMember,
  mapLedgerEntry,
} from "./mappers";

export type AppData = {
  house: House;
  activeMember: HouseMember;
  members: HouseMember[];
  activities: Activity[];
  completions: Completion[];
  ledgerEntries: LedgerEntry[];
};

export type JoinedHouse = {
  house: House;
  member: HouseMember;
};

export type HouseSwitchData = {
  activeHouseId: string | null;
  joinedHouses: JoinedHouse[];
};

export async function getAppData(userId: string): Promise<AppData | null> {
  const supabase = await createClient();

  const [profileResult, membershipsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("active_house_id")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("house_members").select("*").eq("user_id", userId),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }
  if (membershipsResult.error) {
    throw new Error(membershipsResult.error.message);
  }

  const memberships = membershipsResult.data;
  if (memberships.length === 0) {
    return null;
  }

  const preferredHouseId =
    profileResult.data?.active_house_id &&
    memberships.some((membership) => membership.house_id === profileResult.data?.active_house_id)
      ? profileResult.data.active_house_id
      : memberships[0].house_id;

  const activeMembership = memberships.find((membership) => membership.house_id === preferredHouseId);

  if (!activeMembership) {
    return null;
  }

  const [houseResult, membersResult, activitiesResult, ledgerResult] =
    await Promise.all([
      supabase.from("houses").select("*").eq("id", activeMembership.house_id).single(),
      supabase
        .from("house_members")
        .select("*")
        .eq("house_id", activeMembership.house_id)
        .order("created_at", { ascending: true }),
      supabase
        .from("activities")
        .select("*")
        .eq("house_id", activeMembership.house_id)
        .order("created_at", { ascending: false }),
      supabase
        .from("ledger_entries")
        .select("*")
        .eq("house_id", activeMembership.house_id)
        .order("created_at", { ascending: false }),
    ]);

  if (houseResult.error) {
    throw new Error(houseResult.error.message);
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
      ? supabase.from("completions").select("*").in("member_id", memberIds)
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

  return {
    house: mapHouse(houseResult.data),
    activeMember: mapHouseMember(activeMembership),
    members: membersResult.data.map(mapHouseMember),
    activities: activitiesResult.data.map((activity) =>
      mapActivity(activity, assigneesByActivity.get(activity.id) ?? []),
    ),
    completions: completionsResult.data.map(mapCompletion),
    ledgerEntries: ledgerResult.data.map(mapLedgerEntry),
  };
}

export async function getHouseSwitchData(userId: string): Promise<HouseSwitchData> {
  const supabase = await createClient();

  const [profileResult, membershipsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("active_house_id")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("house_members").select("*").eq("user_id", userId).order("created_at", {
      ascending: true,
    }),
  ]);

  if (profileResult.error) {
    throw new Error(profileResult.error.message);
  }
  if (membershipsResult.error) {
    throw new Error(membershipsResult.error.message);
  }

  const memberships = membershipsResult.data;
  const joinedHouseIds = memberships.map((membership) => membership.house_id);

  if (joinedHouseIds.length === 0) {
    return {
      activeHouseId: profileResult.data?.active_house_id ?? null,
      joinedHouses: [],
    };
  }

  const { data: housesResult, error: housesError } = await supabase
    .from("houses")
    .select("*")
    .in("id", joinedHouseIds);

  if (housesError) {
    throw new Error(housesError.message);
  }

  const housesById = new Map(housesResult.map((house) => [house.id, house]));

  return {
    activeHouseId: profileResult.data?.active_house_id ?? null,
    joinedHouses: memberships
      .map((membership) => {
        const house = housesById.get(membership.house_id);
        if (!house) {
          return null;
        }

        return {
          house: mapHouse(house),
          member: mapHouseMember(membership),
        };
      })
      .filter((entry): entry is JoinedHouse => entry !== null),
  };
}
