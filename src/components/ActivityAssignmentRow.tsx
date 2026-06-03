import { Check, Plus, X } from "lucide-react";
import type {
  Activity,
  Completion,
  CompletionStatus,
  HouseMember,
} from "@/lib/domain";
import { rewardLabel } from "@/utils/format";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";

const statusStyles: Record<CompletionStatus, string> = {
  pending: "border-zinc-200 bg-zinc-50 text-zinc-600",
  submitted: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-rose-200 bg-rose-50 text-rose-800",
};

export function ActivityAssignmentRow({
  activity,
  member,
  activeMember,
  completion,
  asNeededDoneCount,
  canReview,
  onSubmit,
  onReview,
}: Readonly<{
  activity: Activity;
  member: HouseMember;
  activeMember?: HouseMember;
  completion?: Completion;
  asNeededDoneCount: number;
  canReview: boolean;
  onSubmit: (activity: Activity, member: HouseMember) => void;
  onReview: (
    activity: Activity,
    member: HouseMember,
    status: CompletionStatus,
  ) => void;
}>) {
  const status = completion?.status ?? "pending";
  const isRepeatable = activity.frequency === "as-needed";
  const isCompleted = status === "submitted" || status === "approved";
  const canKidSubmit =
    activeMember?.role === "kid" &&
    activeMember.id === member.id &&
    (isRepeatable || !isCompleted);
  const canAdultMarkDone = canReview && (isRepeatable || !isCompleted);
  const actionLabel = isRepeatable
    ? asNeededDoneCount > 0
      ? "Done again"
      : "Done"
    : status === "pending"
      ? "Done"
      : "Mark Done";

  return (
    <article
      className={`rounded-lg border p-3 transition ${
        isCompleted && !isRepeatable
          ? "border-zinc-200 bg-zinc-50/70 opacity-70"
          : "border-zinc-200 bg-white hover:border-zinc-950 hover:bg-zinc-50"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`min-w-0 truncate text-sm font-semibold sm:text-base ${
                isCompleted && !isRepeatable ? "line-through" : ""
              }`}
            >
              {activity.name}
            </h3>
            <Badge>{activity.frequency.replace("-", " ")}</Badge>
            <Badge tone={activity.rewardType === "points" ? "blue" : "green"}>
              {rewardLabel(activity.rewardType, activity.rewardAmount)}
            </Badge>
            <span className="rounded-md bg-amber-50 px-2 py-1 text-xs font-medium capitalize text-amber-800">
              {activity.requiresApproval ? "Approval" : "Auto"}
            </span>
          </div>
          {activity.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{activity.description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isRepeatable ? (
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
              {asNeededDoneCount > 0 ? `${asNeededDoneCount} done today` : "Available"}
            </span>
          ) : (
            <span
              className={`rounded-md border px-2 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}
            >
              {status}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar member={member} compact />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{member.name}</p>
            <p className="text-xs text-zinc-500">
              {isRepeatable
                ? asNeededDoneCount > 0
                  ? `Done ${asNeededDoneCount} time${asNeededDoneCount === 1 ? "" : "s"} today`
                  : "Tap as many times as needed"
                : completion?.submittedAt
                  ? `Submitted ${completion.submittedAt}`
                  : "Not submitted yet"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isRepeatable && asNeededDoneCount > 0 ? (
            <div className="flex flex-wrap items-center gap-1">
              {Array.from({ length: Math.min(asNeededDoneCount, 4) }, (_, index) => (
                <span
                  key={index}
                  className="inline-flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                >
                  <Check aria-hidden className="size-4" />
                </span>
              ))}
              {asNeededDoneCount > 4 ? (
                <span className="text-xs font-semibold text-emerald-700">
                  +{asNeededDoneCount - 4}
                </span>
              ) : null}
            </div>
          ) : null}

          {canKidSubmit ? (
            <button
              type="button"
              onClick={() => onSubmit(activity, member)}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
              title="Submit this assigned activity"
            >
              {isRepeatable ? <Plus aria-hidden className="size-4" /> : <Check aria-hidden className="size-4" />}
              {actionLabel}
            </button>
          ) : null}

          {canAdultMarkDone ? (
            <button
              type="button"
              onClick={() => onReview(activity, member, "approved")}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
              title={`Mark ${member.name}'s activity done`}
            >
              <Check aria-hidden className="size-4" />
              {actionLabel}
            </button>
          ) : null}

          {canReview && status === "submitted" ? (
            <>
              <button
                type="button"
                onClick={() => onReview(activity, member, "approved")}
                className="inline-flex size-9 items-center justify-center rounded-md bg-emerald-600 text-white transition hover:bg-emerald-700"
                title="Approve submission"
                aria-label={`Approve ${member.name}'s ${activity.name}`}
              >
                <Check aria-hidden className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => onReview(activity, member, "rejected")}
                className="inline-flex size-9 items-center justify-center rounded-md bg-rose-600 text-white transition hover:bg-rose-700"
                title="Reject submission"
                aria-label={`Reject ${member.name}'s ${activity.name}`}
              >
                <X aria-hidden className="size-4" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
