import { Check, X } from "lucide-react";
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
  canReview,
  onSubmit,
  onReview,
}: {
  activity: Activity;
  member: HouseMember;
  activeMember?: HouseMember;
  completion?: Completion;
  canReview: boolean;
  onSubmit: (activity: Activity, member: HouseMember) => void;
  onReview: (
    activity: Activity,
    member: HouseMember,
    status: CompletionStatus,
  ) => void;
}) {
  const status = completion?.status ?? "pending";
  const isRepeatable = activity.frequency === "as-needed";
  const isCompleted = status === "submitted" || status === "approved";
  const canKidSubmit =
    activeMember?.role === "kid" &&
    activeMember.id === member.id &&
    (isRepeatable || !isCompleted);
  const canAdultMarkDone = canReview && (isRepeatable || !isCompleted);

  return (
    <article
      className={`rounded-lg border p-3 sm:p-4 ${
        isCompleted && !isRepeatable
          ? "border-zinc-200 bg-zinc-50/70 opacity-70"
          : "border-zinc-200"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className={`font-semibold ${isCompleted && !isRepeatable ? "line-through" : ""}`}>
              {activity.name}
            </h3>
            <Badge>{activity.frequency.replace("-", " ")}</Badge>
            <Badge tone={activity.rewardType === "points" ? "blue" : "green"}>
              {rewardLabel(activity.rewardType, activity.rewardAmount)}
            </Badge>
          </div>
          {activity.description ? (
            <p className="mt-1 text-sm text-zinc-500">{activity.description}</p>
          ) : null}
        </div>
        <span className="text-sm font-medium text-zinc-500">
          {activity.requiresApproval ? "Approval required" : "Auto-approve"}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-lg bg-zinc-50 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar member={member} compact />
          <div>
            <p className="font-medium">{member.name}</p>
            <p className="text-sm text-zinc-500">
              {completion?.submittedAt
                ? `Submitted ${completion.submittedAt}`
                : "Not submitted yet"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isRepeatable ? (
            <span className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-600">
              Repeatable
            </span>
          ) : (
            <span
              className={`rounded-md border px-2 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}
            >
              {status}
            </span>
          )}
          {canKidSubmit ? (
            <button
              type="button"
              onClick={() => onSubmit(activity, member)}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
              title="Submit this assigned activity"
            >
              <Check aria-hidden className="size-4" />
              Done
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
              Mark Done
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
