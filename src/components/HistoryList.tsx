import type { Activity, HouseMember, LedgerEntry } from "@/lib/domain";
import { rewardLabel } from "@/utils/format";
import { Avatar } from "./Avatar";

export function HistoryList({
  entries,
  activities,
  members,
}: {
  entries: LedgerEntry[];
  activities: Activity[];
  members: HouseMember[];
}) {
  return (
    <div className="space-y-3">
      {[...entries].sort((a, b) => {
        const aDate = new Date(a.createdAt).getTime();
        const bDate = new Date(b.createdAt).getTime();
        return bDate - aDate;
      }).map((entry) => {
        const member = members.find((item) => item.id === entry.memberId);
        const activity = activities.find((item) => item.id === entry.activityId);
        const entryLabel = new Date(entry.createdAt).toLocaleString();

        return (
          <div key={entry.id} className="flex items-start gap-3 text-sm">
            {member ? <Avatar member={member} compact /> : null}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{activity?.name ?? entry.note ?? "Adjustment"}</p>
              <p className="text-zinc-500">
                {entry.amount === 0
                  ? entry.note ?? "Activity change"
                  : `${member?.name} ${entry.amount >= 0 ? "earned" : "used"} ${rewardLabel(entry.type, Math.abs(entry.amount))}`}
              </p>
            </div>
            <span className="shrink-0 text-xs text-zinc-500">{entryLabel}</span>
          </div>
        );
      })}
    </div>
  );
}
