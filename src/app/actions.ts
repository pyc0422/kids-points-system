"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Activity, CompletionStatus, HouseMember, RewardType } from "@/lib/domain";
import { createClient } from "@/lib/supabase/server";

async function getUserOrThrow() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("You must be signed in.");
  }

  return { supabase, user };
}

async function getCurrentMember(houseId: string) {
  const { supabase, user } = await getUserOrThrow();
  const { data, error } = await supabase
    .from("house_members")
    .select("*")
    .eq("house_id", houseId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return { supabase, user, member: data };
}

export async function createHouseAction(formData: FormData) {
  const houseName = String(formData.get("houseName") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();

  if (!houseName || !displayName) {
    throw new Error("House name and display name are required.");
  }

  const { supabase } = await getUserOrThrow();
  const { error } = await supabase.rpc("create_house" as never, {
    house_name: houseName,
    display_name: displayName,
  } as never);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  redirect("/");
}

export async function joinHouseAction(formData: FormData) {
  const houseRef = String(formData.get("houseId") ?? "").trim();
  const displayName = String(formData.get("displayName") ?? "").trim();
  const roleValue = String(formData.get("role") ?? "kid").trim();

  if (!houseRef || !displayName) {
    throw new Error("House ID or invite code and display name are required.");
  }

  if (roleValue !== "kid" && roleValue !== "parent") {
    throw new Error("Invalid role.");
  }

  const { supabase } = await getUserOrThrow();
  const { error } = await supabase.rpc("join_house" as never, {
    house_ref: houseRef,
    display_name: displayName,
    role: roleValue,
  } as never);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  redirect("/");
}

export async function switchHouseAction(formData: FormData) {
  const houseId = String(formData.get("houseId") ?? "").trim();

  if (!houseId) {
    throw new Error("House ID is required.");
  }

  const { supabase, user } = await getUserOrThrow();
  const { data: membership, error: membershipError } = await supabase
    .from("house_members")
    .select("id")
    .eq("house_id", houseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  if (!membership) {
    throw new Error("You are not a member of that house.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ active_house_id: houseId })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  redirect("/");
}

export async function createActivityAction(activity: Activity, houseId: string) {
  const { supabase, user } = await getUserOrThrow();
  const { data: insertedActivity, error: activityError } = await supabase
    .from("activities")
    .insert({
      id: activity.id,
      house_id: houseId,
      name: activity.name,
      description: activity.description ?? null,
      frequency: activity.frequency,
      reward_type: activity.rewardType,
      reward_amount: activity.rewardAmount,
      requires_approval: activity.requiresApproval,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (activityError) {
    throw new Error(activityError.message);
  }

  if (activity.assigneeIds.length > 0) {
    const { error: assigneeError } = await supabase
      .from("activity_assignees")
      .insert(
        activity.assigneeIds.map((memberId) => ({
          activity_id: insertedActivity.id,
          member_id: memberId,
        })),
      );

    if (assigneeError) {
      throw new Error(assigneeError.message);
    }
  }

  revalidatePath("/");
}

export async function upsertCompletionAction({
  activity,
  member,
  status,
  completedOn,
  houseId,
}: {
  activity: Activity;
  member: HouseMember;
  status: CompletionStatus;
  completedOn: string;
  houseId: string;
}) {
  const { supabase, member: currentMember } = await getCurrentMember(houseId);
  const now = new Date().toISOString();

  const { error: completionError } = await supabase.from("completions").upsert(
    {
      activity_id: activity.id,
      member_id: member.id,
      completed_on: completedOn,
      status,
      submitted_at: now,
      reviewed_at:
        status === "approved" || status === "rejected" ? now : null,
      reviewer_member_id:
        status === "approved" || status === "rejected" ? currentMember.id : null,
    },
    {
      onConflict: "activity_id,member_id,completed_on",
    },
  );

  if (completionError) {
    throw new Error(completionError.message);
  }

  if (status === "approved") {
    const { error: ledgerError } = await supabase.from("ledger_entries").insert({
      house_id: houseId,
      member_id: member.id,
      activity_id: activity.id,
      type: activity.rewardType,
      amount: activity.rewardAmount,
      created_by_member_id: currentMember.id,
    });

    if (ledgerError) {
      throw new Error(ledgerError.message);
    }
  }

  revalidatePath("/");
}

export async function adjustBalanceAction({
  member,
  type,
  amount,
  note,
  houseId,
}: {
  member: HouseMember;
  type: RewardType;
  amount: number;
  note: string;
  houseId: string;
}) {
  const { supabase, member: currentMember } = await getCurrentMember(houseId);
  const { error } = await supabase.from("ledger_entries").insert({
    house_id: houseId,
    member_id: member.id,
    type,
    amount,
    note: note.trim() || null,
    created_by_member_id: currentMember.id,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}
