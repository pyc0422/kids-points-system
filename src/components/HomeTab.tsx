import type {
  Activity,
  Completion,
  CompletionStatus,
  HouseMember,
} from "@/lib/domain";
import { demoToday } from "@/utils/constants";
import { isoDate } from "@/utils/date";
import { getCompletion } from "@/utils/activity";
import { ActivityAssignmentRow } from "./ActivityAssignmentRow";
import { Avatar } from "./Avatar";

export function HomeTab({
  kids,
  selectedKid,
  activities,
  completions,
  activeMember,
  canReview,
  dueCountForMember,
  onOpenMember,
  onSubmit,
  onReview,
}: {
  kids: HouseMember[];
  selectedKid?: HouseMember;
  activities: Activity[];
  completions: Completion[];
  activeMember?: HouseMember;
  canReview: boolean;
  dueCountForMember: (memberId: string) => number;
  onOpenMember: (memberId: string) => void;
  onSubmit: (activity: Activity, member: HouseMember) => void;
  onReview: (
    activity: Activity,
    member: HouseMember,
    status: CompletionStatus,
  ) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Household Members</h2>
        <div className="mt-4 grid gap-3">
          {kids.map((kid) => {
            const dueCount = dueCountForMember(kid.id);

            return (
              <button
                key={kid.id}
                type="button"
                onClick={() => onOpenMember(kid.id)}
                className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition ${
                  selectedKid?.id === kid.id
                    ? "border-zinc-950 bg-zinc-50"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar member={kid} />
                  <span>
                    <span className="block font-semibold">{kid.name}</span>
                    <span className="text-sm text-zinc-500">{dueCount} due today</span>
                  </span>
                </span>
                <span className="rounded-md bg-amber-50 px-2 py-1 text-sm font-semibold text-amber-800">
                  {dueCount}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {selectedKid ? `${selectedKid.name}'s Activities` : "Activities"}
            </h2>
            <p className="text-sm text-zinc-500">
              Kids can submit only their own assigned work.
            </p>
          </div>
        </div>
        {selectedKid ? (
          <div className="grid gap-3">
            {activities
              .filter((activity) => activity.assigneeIds.includes(selectedKid.id))
              .map((activity) => (
                <ActivityAssignmentRow
                  key={activity.id}
                  activity={activity}
                  member={selectedKid}
                  activeMember={activeMember}
                  completion={getCompletion(
                    completions,
                    activity.id,
                    selectedKid.id,
                    isoDate(demoToday),
                  )}
                  canReview={canReview}
                  onSubmit={onSubmit}
                  onReview={onReview}
                />
              ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
