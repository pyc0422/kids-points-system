import { Check, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Activity, HouseMember, RewardType } from "@/lib/domain";
import { formatActivitySchedule, getActivityRepeatOptions } from "@/utils/activity";
import { rewardLabel } from "@/utils/format";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";

type ActivityDraft = {
  id: string;
  name: string;
  description: string;
  frequency: Activity["frequency"];
  repeatOn: string;
  rewardType: RewardType;
  rewardAmount: string;
  requiresApproval: boolean;
  assigneeIds: string[];
};

function createDraft(kidIds: string[], activity?: Activity): ActivityDraft {
  if (activity) {
    return {
      id: activity.id,
      name: activity.name,
      description: activity.description ?? "",
      frequency: activity.frequency,
      repeatOn:
        activity.repeatOn?.toString() ??
        (activity.frequency === "weekly" || activity.frequency === "monthly" ? "1" : ""),
      rewardType: activity.rewardType,
      rewardAmount: activity.rewardAmount.toString(),
      requiresApproval: activity.requiresApproval,
      assigneeIds: [...activity.assigneeIds],
    };
  }

  return {
    id: globalThis.crypto.randomUUID(),
    name: "",
    description: "",
    frequency: "daily",
    repeatOn: "",
    rewardType: "points",
    rewardAmount: "10",
    requiresApproval: true,
    assigneeIds: [...kidIds],
  };
}

export function ActivitiesTab({
  activities,
  kids,
  canAdd,
  activeMember,
  onAddActivity,
  onUpdateActivity,
}: {
  activities: Activity[];
  kids: HouseMember[];
  canAdd: boolean;
  activeMember?: HouseMember;
  onAddActivity: (activity: Activity) => void;
  onUpdateActivity: (activity: Activity) => void;
}) {
  const kidMembers = useMemo(() => kids.filter((kid) => kid.role === "kid"), [kids]);
  const [draft, setDraft] = useState<ActivityDraft>(() =>
    createDraft(kidMembers.map((kid) => kid.id)),
  );
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const visibleActivities =
    activeMember?.role === "kid"
      ? activities.filter((activity) => activity.assigneeIds.includes(activeMember.id))
      : activities;

  const repeatOptions = getActivityRepeatOptions(draft.frequency);
  const needsRepeatOn = draft.frequency === "weekly" || draft.frequency === "monthly";
  const canSave =
    draft.name.trim().length > 0 &&
    draft.assigneeIds.length > 0 &&
    Number.isFinite(Number(draft.rewardAmount)) &&
    (!needsRepeatOn || draft.repeatOn.length > 0);

  const resetDraft = useCallback((activity?: Activity) => {
    setDraft(createDraft(kidMembers.map((kid) => kid.id), activity));
  }, [kidMembers]);

  function openCreateForm() {
    setEditingActivityId(null);
    resetDraft();
    setIsFormOpen(true);
  }

  function openEditForm(activity: Activity) {
    setEditingActivityId(activity.id);
    resetDraft(activity);
    setIsFormOpen(true);
  }

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingActivityId(null);
    resetDraft();
  }, [resetDraft]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isFormOpen) {
        closeForm();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFormOpen, closeForm]);

  function toggleAssignee(memberId: string) {
    setDraft((current) => {
      if (current.assigneeIds.includes(memberId)) {
        return { ...current, assigneeIds: current.assigneeIds.filter((id) => id !== memberId) };
      }

      return { ...current, assigneeIds: [...current.assigneeIds, memberId] };
    });
  }

  function saveActivity() {
    const repeatOn =
      draft.frequency === "weekly" || draft.frequency === "monthly"
        ? Number(draft.repeatOn)
        : null;

    const activity: Activity = {
      id: draft.id,
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      assigneeIds: draft.assigneeIds,
      frequency: draft.frequency,
      repeatOn,
      rewardType: draft.rewardType,
      rewardAmount: Number(draft.rewardAmount),
      requiresApproval: draft.requiresApproval,
    };

    if (editingActivityId) {
      onUpdateActivity(activity);
    } else {
      onAddActivity(activity);
    }

    closeForm();
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Activities</h2>
          <p className="text-sm text-zinc-500">
            Recurring goals and chores can pay points or allowance.
          </p>
        </div>
        {canAdd ? (
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            <Plus aria-hidden className="size-4" />
            Add Activity
          </button>
        ) : null}
      </div>

      {isFormOpen ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-end justify-center bg-zinc-950/40 p-3 sm:items-center sm:p-6"
          onClick={closeForm}
        >
          <form
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 shadow-2xl sm:p-5"
            onClick={(event) => event.stopPropagation()}
            onSubmit={(event) => {
              event.preventDefault();
              if (!canSave) {
                return;
              }

              saveActivity();
            }}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">
                  {editingActivityId ? "Edit Activity" : "Add Activity"}
                </h3>
                <p className="text-sm text-zinc-500">
                  {editingActivityId ? "Update the schedule or assignees." : "Create a new goal or chore."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="inline-flex h-9 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold transition hover:bg-zinc-100"
              >
                Cancel
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Name</span>
                <input
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Frequency</span>
                <select
                  value={draft.frequency}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      frequency: event.target.value as Activity["frequency"],
                      repeatOn:
                        event.target.value === "weekly"
                          ? "1"
                          : event.target.value === "monthly"
                            ? "1"
                            : "",
                    }))
                  }
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
                >
                  <option value="as-needed">As needed</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </label>

              {needsRepeatOn ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    {draft.frequency === "weekly" ? "Repeat on" : "Repeat day"}
                  </span>
                  <select
                    value={draft.repeatOn}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, repeatOn: event.target.value }))
                    }
                    className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
                  >
                    {repeatOptions.map((option) => (
                      <option key={option.value} value={String(option.value)}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="block lg:col-span-2">
                <span className="mb-2 block text-sm font-semibold">Description</span>
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={3}
                  className="w-full resize-none rounded-md border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-zinc-950"
                />
              </label>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold">Reward type</legend>
                <div className="flex gap-2">
                  {(["points", "money"] as RewardType[]).map((type) => (
                    <label
                      key={type}
                      className={`inline-flex h-10 cursor-pointer items-center rounded-md border px-3 text-sm font-semibold capitalize ${
                        draft.rewardType === type
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-white text-zinc-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="rewardType"
                        value={type}
                        checked={draft.rewardType === type}
                        onChange={() => setDraft((current) => ({ ...current, rewardType: type }))}
                        className="sr-only"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Reward amount</span>
                <input
                  type="number"
                  value={draft.rewardAmount}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, rewardAmount: event.target.value }))
                  }
                  step={draft.rewardType === "money" ? "0.01" : "1"}
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
                />
              </label>

              <fieldset className="lg:col-span-2">
                <legend className="mb-2 text-sm font-semibold">Assignees</legend>
                <div className="flex flex-wrap gap-2">
                  {kidMembers.map((kid) => (
                    <label
                      key={kid.id}
                      className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold ${
                        draft.assigneeIds.includes(kid.id)
                          ? "border-zinc-950 bg-white"
                          : "border-zinc-200 bg-white text-zinc-500"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={draft.assigneeIds.includes(kid.id)}
                        onChange={() => toggleAssignee(kid.id)}
                        className="size-4"
                      />
                      <Avatar member={kid} compact />
                      {kid.name}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="inline-flex w-fit items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={draft.requiresApproval}
                  onChange={(event) =>
                    setDraft((current) => ({ ...current, requiresApproval: event.target.checked }))
                  }
                  className="size-4"
                />
                Requires approval
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={!canSave}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                <Check aria-hidden className="size-4" />
                {editingActivityId ? "Save Changes" : "Save Activity"}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="grid gap-3">
        {visibleActivities.map((activity) => (
          <article
            key={activity.id}
            role={canAdd ? "button" : undefined}
            tabIndex={canAdd ? 0 : undefined}
            onClick={canAdd ? () => openEditForm(activity) : undefined}
            onKeyDown={
              canAdd
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openEditForm(activity);
                    }
                  }
                : undefined
            }
            className={`grid gap-3 rounded-lg border p-4 lg:grid-cols-[1fr_240px] ${
              canAdd ? "cursor-pointer border-zinc-200 hover:border-zinc-950 hover:bg-zinc-50" : "border-zinc-200"
            }`}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold sm:text-lg">{activity.name}</h3>
                <Badge>{formatActivitySchedule(activity)}</Badge>
                <Badge tone={activity.rewardType === "points" ? "blue" : "green"}>
                  {rewardLabel(activity.rewardType, activity.rewardAmount)}
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {kids
                .filter((kid) => activity.assigneeIds.includes(kid.id))
                .map((kid) => (
                  <span
                    key={kid.id}
                    className="inline-flex items-center gap-2 rounded-md bg-zinc-50 px-2 py-1 text-sm font-medium"
                    title={kid.name}
                  >
                    <Avatar member={kid} compact />
                    <span className="sr-only">{kid.name}</span>
                  </span>
                ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
