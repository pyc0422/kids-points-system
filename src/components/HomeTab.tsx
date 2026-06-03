import type {
  Activity,
  Completion,
  CompletionStatus,
  HouseMember,
  LedgerEntry,
} from "@/lib/domain";
import { getActivityDayState } from "@/utils/activity";
import { ActivityAssignmentRow } from "./ActivityAssignmentRow";
import { Avatar } from "./Avatar";

export function HomeTab({
  kids,
  selectedKid,
  activities,
  completions,
  ledgerEntries,
  activeMember,
  canReview,
  dueCountForMember,
  todayKey,
  onOpenMember,
  onSubmit,
  onReview,
}: {
  kids: HouseMember[];
  selectedKid?: HouseMember;
  activities: Activity[];
  completions: Completion[];
  ledgerEntries: LedgerEntry[];
  activeMember?: HouseMember;
  canReview: boolean;
  dueCountForMember: (memberId: string) => number;
  todayKey: string;
  onOpenMember: (memberId: string) => void;
  onSubmit: (activity: Activity, member: HouseMember) => void;
  onReview: (
    activity: Activity,
    member: HouseMember,
    status: CompletionStatus,
  ) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
        <h2 className="text-lg font-semibold">Household Members</h2>
        <div className="mt-4 grid gap-2">
          {kids.map((kid) => {
            const dueCount = dueCountForMember(kid.id);

            return (
              <button
                key={kid.id}
                type="button"
                onClick={() => onOpenMember(kid.id)}
                className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition ${
                  selectedKid?.id === kid.id
                    ? "border-zinc-950 bg-zinc-50"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar member={kid} />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{kid.name}</span>
                    <span className="text-xs text-zinc-500">{dueCount} due today</span>
                  </span>
                </span>
                <span className="shrink-0 rounded-md bg-amber-50 px-2 py-1 text-sm font-semibold text-amber-800">
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
              .map((activity) => {
                const dayState = getActivityDayState({
                  activity,
                  completions,
                  ledgerEntries,
                  memberId: selectedKid.id,
                  dateKey: todayKey,
                });

                return (
                  <ActivityAssignmentRow
                    key={activity.id}
                    activity={activity}
                    member={selectedKid}
                    assignees={kids.filter((kid) => activity.assigneeIds.includes(kid.id))}
                    activeMember={activeMember}
                    completion={dayState.completion}
                    asNeededDoneCount={dayState.doneCount}
                    canReview={canReview}
                    onSubmit={onSubmit}
                    onReview={onReview}
                  />
                );
              })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
