import { Check, Plus } from "lucide-react";
import { useState } from "react";
import type { Activity, HouseMember, RewardType } from "@/lib/domain";
import { rewardLabel } from "@/utils/format";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";

export function ActivitiesTab({
  activities,
  kids,
  canAdd,
  activeMember,
  onAddActivity,
}: {
  activities: Activity[];
  kids: HouseMember[];
  canAdd: boolean;
  activeMember?: HouseMember;
  onAddActivity: (activity: Activity) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Activity["frequency"]>("daily");
  const [rewardType, setRewardType] = useState<RewardType>("points");
  const [rewardAmount, setRewardAmount] = useState("10");
  const [requiresApproval, setRequiresApproval] = useState(true);
  const kidMembers = kids.filter((kid) => kid.role === "kid");
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    kidMembers.map((kid) => kid.id),
  );
  const visibleActivities =
    activeMember?.role === "kid"
      ? activities.filter((activity) => activity.assigneeIds.includes(activeMember.id))
      : activities;
  const canSave =
    name.trim().length > 0 &&
    assigneeIds.length > 0 &&
    Number.isFinite(Number(rewardAmount));

  function resetForm() {
    setName("");
    setDescription("");
    setFrequency("daily");
    setRewardType("points");
    setRewardAmount("10");
    setRequiresApproval(true);
    setAssigneeIds(kidMembers.map((kid) => kid.id));
  }

  function toggleAssignee(memberId: string) {
    setAssigneeIds((current) => {
      if (current.includes(memberId)) {
        return current.filter((id) => id !== memberId);
      }

      return [...current, memberId];
    });
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
            onClick={() => setIsAdding(true)}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            <Plus aria-hidden className="size-4" />
            Add Activity
          </button>
        ) : null}
      </div>

      {isAdding ? (
        <form
          className="mb-5 rounded-lg border border-zinc-200 bg-zinc-50 p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSave) {
              return;
            }

            onAddActivity({
              id: `activity-${globalThis.crypto.randomUUID()}`,
              name: name.trim(),
              description: description.trim() || undefined,
              assigneeIds,
              frequency,
              rewardType,
              rewardAmount: Number(rewardAmount),
              requiresApproval,
            });
            resetForm();
            setIsAdding(false);
          }}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Frequency</span>
              <select
                value={frequency}
                onChange={(event) =>
                  setFrequency(event.target.value as Activity["frequency"])
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
            <label className="block lg:col-span-2">
              <span className="mb-2 block text-sm font-semibold">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
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
                      rewardType === type
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-white text-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rewardType"
                      value={type}
                      checked={rewardType === type}
                      onChange={() => setRewardType(type)}
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
                value={rewardAmount}
                onChange={(event) => setRewardAmount(event.target.value)}
                step={rewardType === "money" ? "0.01" : "1"}
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
                      assigneeIds.includes(kid.id)
                        ? "border-zinc-950 bg-white"
                        : "border-zinc-200 bg-white text-zinc-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={assigneeIds.includes(kid.id)}
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
                checked={requiresApproval}
                onChange={(event) => setRequiresApproval(event.target.checked)}
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
              Save Activity
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsAdding(false);
              }}
              className="inline-flex h-10 items-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold transition hover:bg-zinc-100"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="grid gap-3">
        {visibleActivities.map((activity) => (
          <article
            key={activity.id}
            className="grid gap-3 rounded-lg border border-zinc-200 p-4 lg:grid-cols-[1fr_240px]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{activity.name}</h3>
                <Badge>{activity.frequency.replace("-", " ")}</Badge>
                <Badge tone={activity.rewardType === "points" ? "blue" : "green"}>
                  {rewardLabel(activity.rewardType, activity.rewardAmount)}
                </Badge>
              </div>
              {activity.description ? (
                <p className="mt-2 text-sm text-zinc-500">{activity.description}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              {kids
                .filter((kid) => activity.assigneeIds.includes(kid.id))
                .map((kid) => (
                  <span
                    key={kid.id}
                    className="inline-flex items-center gap-2 rounded-md bg-zinc-50 px-2 py-1 text-sm font-medium"
                  >
                    <Avatar member={kid} compact />
                    {kid.name}
                  </span>
                ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
