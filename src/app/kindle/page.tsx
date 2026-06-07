import { redirect } from "next/navigation";
import { getKindleSessionHouseId } from "@/lib/kindle/auth";
import { getBalanceTotals, getKindleData } from "@/lib/kindle/data";
import { getTodayAssignments } from "@/lib/kindle/todo";
import { parseDateKey } from "@/utils/date";

function countdownParts(dateKey: string, todayKey: string) {
  const days = Math.ceil(
    (parseDateKey(dateKey).getTime() - parseDateKey(todayKey).getTime()) / 86_400_000,
  );

  if (days <= 0) {
    return { number: "0", unit: "days to go" };
  }

  return { number: String(days), unit: days === 1 ? "day to go" : "days to go" };
}

function longDateLabel(dateKey: string) {
  return parseDateKey(dateKey).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}

export default async function KindleDashboardPage() {
  const houseId = await getKindleSessionHouseId();

  if (!houseId) {
    redirect("/kindle/login");
  }

  const data = await getKindleData(houseId);
  const today = parseDateKey(data.todayKey);
  const kidMembers = data.members.filter((member) => member.role === "kid");
  const summaries = getTodayAssignments({
    activities: data.activities,
    completions: data.completions,
    members: kidMembers,
    today,
    todayKey: data.todayKey,
  });

  return (
    <div className="kindle-stack space-y-6">
      <section>
        <div className="kindle-kid-grid grid gap-3 sm:grid-cols-2">
          {summaries.map(({ member, doneCount, totalCount, assignments }) => {
            const balances = getBalanceTotals(data.ledgerEntries, member.id);
            const remainingAssignments = assignments.filter((assignment) => !assignment.isDone);
            const remainingNames = remainingAssignments.map((assignment) => assignment.activity.name);

            return (
              <article className="kindle-kid-card" key={member.id}>
                <div className="kindle-kid-head">
                  <h2 className="kindle-kid-name">{member.name}</h2>
                  <p className="kindle-due-count">{doneCount}/{totalCount}</p>
                </div>
                <p className="kindle-kid-balance">
                  {balances.points}points ${balances.money.toFixed(2)}
                </p>
                <div className="kindle-reminder-list">
                  {remainingNames.length > 0 ? (
                    remainingNames.map((name) => (
                      <div className="kindle-reminder-row" key={`${member.id}-${name}`}>
                        {name}
                      </div>
                    ))
                  ) : (
                    <div className="kindle-reminder-empty">All done</div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="kindle-dashboard-next">
        {data.nextItems.length === 0 ? (
          <p className="kindle-empty border border-black p-4 text-lg font-bold">No future dates.</p>
        ) : (
          data.nextItems.slice(0, 6).map((item) => {
            const countdown = countdownParts(item.dueOn, data.todayKey);

            return (
              <div
                className={`kindle-row grid grid-cols-[1fr_auto] gap-3 text-lg font-bold ${
                  item.completedAt ? "kindle-row-passed line-through" : ""
                }`}
                key={item.id}
              >
                <span className="kindle-row-main">
                  <span className="kindle-row-title">{item.title}</span>
                  <span className="kindle-row-date">{longDateLabel(item.dueOn)}</span>
                </span>
                <span className="kindle-row-count">
                  <span className="kindle-row-number">{countdown.number}</span>
                  <span className="kindle-row-unit">{countdown.unit}</span>
                </span>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
