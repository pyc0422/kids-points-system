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
  assignees,
  activeMember,
  completion,
  asNeededDoneCount,
  canReview,
  showAssignees = true,
  statusDisplayMode = "full",
  onSubmit,
  onReview,
}: Readonly<{
  activity: Activity;
  member: HouseMember;
  assignees: HouseMember[];
  activeMember?: HouseMember;
  completion?: Completion;
  asNeededDoneCount: number;
  canReview: boolean;
  showAssignees?: boolean;
  statusDisplayMode?: "full" | "pending-only" | "hidden";
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

  const showStatusChip =
    statusDisplayMode === "full"
      ? true
      : statusDisplayMode === "pending-only"
        ? status === "submitted"
        : false;

  return (
    <article
      className={`rounded-lg border p-3 transition sm:p-4 ${
        isCompleted && !isRepeatable
          ? "border-zinc-200 bg-zinc-50/70 opacity-70"
          : "border-zinc-200 bg-white hover:border-zinc-950 hover:bg-zinc-50"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
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
            <span className="rounded-md bg-amber-50 px-2 py-1 text-[10px] font-medium capitalize text-amber-800 sm:text-xs">
              {activity.requiresApproval ? "Approval" : "Auto"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showStatusChip ? (
            isRepeatable ? (
              <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800 sm:text-xs">
                {asNeededDoneCount > 0 ? `${asNeededDoneCount} done today` : "Available"}
              </span>
            ) : (
              <span
                className={`rounded-md border px-2 py-1 text-[10px] font-semibold capitalize sm:text-xs ${statusStyles[status]}`}
              >
                {status === "submitted" && statusDisplayMode === "pending-only" ? "pending" : status}
              </span>
            )
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {showAssignees
            ? assignees.slice(0, 3).map((assignee) => (
                <span
                  key={assignee.id}
                  className="inline-flex items-center justify-center rounded-md bg-zinc-50 p-1"
                  title={assignee.name}
                >
                  <Avatar member={assignee} compact />
                </span>
              ))
            : null}
          {showAssignees && assignees.length > 3 ? (
            <span className="inline-flex size-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-xs font-semibold text-zinc-500">
              ...
            </span>
          ) : null}
          <span className="text-[11px] text-zinc-500 sm:text-xs">
            {isRepeatable
              ? asNeededDoneCount > 0
                ? `Done ${asNeededDoneCount} time${asNeededDoneCount === 1 ? "" : "s"} today`
                : "Tap as many times as needed"
              : completion?.submittedAt
                ? `Submitted ${completion.submittedAt}`
                : "Not submitted yet"}
          </span>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
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
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-700 sm:w-auto"
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
              className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-700 sm:w-auto"
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
