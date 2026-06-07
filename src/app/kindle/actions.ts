"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearKindleSessionCookie, getKindleSessionHouseId, setKindleSessionCookie, verifyKindlePin } from "@/lib/kindle/auth";
import { getKindleActorMember, getKindleData } from "@/lib/kindle/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { isoDate } from "@/utils/date";

async function requireKindleHouseId() {
  const houseId = await getKindleSessionHouseId();

  if (!houseId) {
    redirect("/kindle/login");
  }

  return houseId;
}

export async function kindleLoginAction(formData: FormData) {
  const pin = String(formData.get("pin") ?? "");

  if (!verifyKindlePin(pin)) {
    redirect("/kindle/login?error=1");
  }

  await setKindleSessionCookie();
  redirect("/kindle");
}

export async function kindleSignOutAction() {
  await clearKindleSessionCookie();
  redirect("/kindle/login");
}

export async function markKindleTodoDoneAction(formData: FormData) {
  const houseId = await requireKindleHouseId();
  const activityId = String(formData.get("activityId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const todayKey = isoDate(new Date());

  if (!activityId || !memberId) {
    throw new Error("Activity and member are required.");
  }

  const data = await getKindleData(houseId);
  const activity = data.activities.find((item) => item.id === activityId);
  const targetMember = data.members.find((member) => member.id === memberId);
  const actorMember = getKindleActorMember(data.members);

  if (!activity || !targetMember || !actorMember || !activity.assigneeIds.includes(memberId)) {
    throw new Error("Todo item was not found for this family.");
  }

  const status: "submitted" | "approved" = activity.requiresApproval ? "submitted" : "approved";
  const supabase = createAdminClient();

  if (activity.frequency === "as-needed") {
    const { error: ledgerError } = await supabase.from("ledger_entries").insert([
      {
        house_id: houseId,
        member_id: targetMember.id,
        activity_id: activity.id,
        completed_on: todayKey,
        type: activity.rewardType,
        amount: activity.rewardAmount,
        created_by_member_id: actorMember.id,
      },
      {
        house_id: houseId,
        member_id: targetMember.id,
        activity_id: activity.id,
        completed_on: todayKey,
        type: activity.rewardType,
        amount: 0,
        note: `Kindle marked ${activity.name} on ${todayKey}`,
        created_by_member_id: actorMember.id,
      },
    ]);

    if (ledgerError) {
      throw new Error(ledgerError.message);
    }

    revalidatePath("/kindle");
    revalidatePath("/kindle/todo");
    return;
  }

  const { error: completionError } = await supabase.from("completions").upsert(
    {
      activity_id: activity.id,
      member_id: targetMember.id,
      completed_on: todayKey,
      status,
      submitted_at: new Date().toISOString(),
      reviewed_at: status === "approved" ? new Date().toISOString() : null,
      reviewer_member_id: status === "approved" ? actorMember.id : null,
    },
    { onConflict: "activity_id,member_id,completed_on" },
  );

  if (completionError) {
    throw new Error(completionError.message);
  }

  if (status === "approved") {
    const { error: deleteLedgerError } = await supabase
      .from("ledger_entries")
      .delete()
      .eq("house_id", houseId)
      .eq("member_id", targetMember.id)
      .eq("activity_id", activity.id)
      .eq("completed_on", todayKey);

    if (deleteLedgerError) {
      throw new Error(deleteLedgerError.message);
    }

    const { error: ledgerError } = await supabase.from("ledger_entries").insert([
      {
        house_id: houseId,
        member_id: targetMember.id,
        activity_id: activity.id,
        completed_on: todayKey,
        type: activity.rewardType,
        amount: activity.rewardAmount,
        created_by_member_id: actorMember.id,
      },
      {
        house_id: houseId,
        member_id: targetMember.id,
        activity_id: activity.id,
        completed_on: todayKey,
        type: activity.rewardType,
        amount: 0,
        note: `Kindle marked ${activity.name} on ${todayKey}`,
        created_by_member_id: actorMember.id,
      },
    ]);

    if (ledgerError) {
      throw new Error(ledgerError.message);
    }
  }

  revalidatePath("/kindle");
  revalidatePath("/kindle/todo");
}

export async function addKindleNextItemAction(formData: FormData) {
  const houseId = await requireKindleHouseId();
  const title = String(formData.get("title") ?? "").trim();
  const dueOn = String(formData.get("dueOn") ?? "");
  const isBirthday = formData.get("isBirthday") === "on";

  if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(dueOn)) {
    throw new Error("A name/title and date are required.");
  }

  if (!isBirthday && dueOn < isoDate(new Date())) {
    throw new Error("Next dates must be today or later.");
  }

  const birthDate = new Date(`${dueOn}T12:00:00`);
  const todayKey = isoDate(new Date());
  const today = new Date(`${todayKey}T12:00:00`);
  let finalDueOn = dueOn;
  let finalTitle = title;
  let originalDate: string | null = null;

  if (isBirthday) {
    let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate(), 12);

    if (isoDate(nextBirthday) < todayKey) {
      nextBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate(), 12);
    }

    const age = nextBirthday.getFullYear() - birthDate.getFullYear();
    finalDueOn = isoDate(nextBirthday);
    finalTitle = `${title} ${age} Birthday`;
    originalDate = dueOn;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("kindle_next_items").insert({
    house_id: houseId,
    title: finalTitle,
    due_on: finalDueOn,
    kind: isBirthday ? "birthday" : "event",
    original_date: originalDate,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/kindle");
  revalidatePath("/kindle/next");
}

export async function deleteKindleNextItemAction(formData: FormData) {
  const houseId = await requireKindleHouseId();
  const itemId = String(formData.get("itemId") ?? "");

  if (!itemId) {
    throw new Error("Next item is required.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("kindle_next_items")
    .delete()
    .eq("house_id", houseId)
    .eq("id", itemId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/kindle");
  revalidatePath("/kindle/next");
}
