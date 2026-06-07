import Link from "next/link";
import { redirect } from "next/navigation";
import { markKindleTodoDoneAction } from "@/app/kindle/actions";
import { getKindleSessionHouseId } from "@/lib/kindle/auth";
import { getKindleData } from "@/lib/kindle/data";
import { formatActivitySchedule, getActivityDayState, isActivityDue } from "@/utils/activity";
import { parseDateKey } from "@/utils/date";

export default async function KindleTodoPage({
  searchParams,
}: {
  searchParams: Promise<{ kid?: string }>;
}) {
  const houseId = await getKindleSessionHouseId();
  const { kid } = await searchParams;

  if (!houseId) {
    redirect("/kindle/login");
  }

  const data = await getKindleData(houseId);
  const today = parseDateKey(data.todayKey);
  const kidMembers = data.members.filter((member) => member.role === "kid");
  const selectedKid =
    kidMembers.find((member) => member.id === kid) ?? kidMembers[0] ?? null;

  const assignments = selectedKid
    ? data.activities
        .filter((activity) => activity.assigneeIds.includes(selectedKid.id))
        .filter((activity) => activity.frequency === "as-needed" || isActivityDue(activity, today))
        .map((activity) => {
          const state = getActivityDayState({
            activity,
            completions: data.completions,
            ledgerEntries: data.ledgerEntries,
            memberId: selectedKid.id,
            dateKey: data.todayKey,
          });

          return {
            activity,
            isDone: state.isDone,
          };
        })
    : [];

  return (
    <section>
      <nav className="kindle-kid-selector">
        {kidMembers.map((member) => (
          <Link
            className={`kindle-kid-selector-link ${
              selectedKid?.id === member.id ? "kindle-kid-selector-link-active" : ""
            }`}
            href={`/kindle/todo?kid=${member.id}`}
            key={member.id}
          >
            {member.name}
          </Link>
        ))}
      </nav>

      {selectedKid ? (
        <article className="kindle-todo-card kindle-card border-2 border-black p-4">
          {assignments.length === 0 ? (
            <p className="kindle-empty text-lg font-bold">No tasks today.</p>
          ) : (
            <div className="kindle-todo-list space-y-3">
              {assignments.map(({ activity, isDone }) => (
                <div
                  className="kindle-task grid gap-3 border border-black p-3 sm:grid-cols-[1fr_auto]"
                  key={`${selectedKid.id}-${activity.id}`}
                >
                  <div className="kindle-task-main">
                    <p className={`kindle-task-title text-xl font-black ${isDone ? "kindle-done line-through" : ""}`}>
                      {activity.name}
                    </p>
                    <p className="kindle-task-schedule text-sm font-bold uppercase">
                      {formatActivitySchedule(activity)}
                    </p>
                  </div>
                  <form action={markKindleTodoDoneAction} className="kindle-task-action">
                    <input name="activityId" type="hidden" value={activity.id} />
                    <input name="memberId" type="hidden" value={selectedKid.id} />
                    <button
                      className="kindle-todo-button w-full border-2 border-black px-5 py-3 text-lg font-black disabled:bg-white disabled:text-black"
                      disabled={isDone}
                      type="submit"
                    >
                      Done
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </article>
      ) : (
        <p className="kindle-empty text-lg font-bold">No kids found.</p>
      )}
    </section>
  );
}
