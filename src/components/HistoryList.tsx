import { houseMembers } from "@/lib/demo-data";
import type { Activity, LedgerEntry } from "@/lib/domain";
import { rewardLabel } from "@/utils/format";
import { Avatar } from "./Avatar";

export function HistoryList({
  entries,
  activities,
}: {
  entries: LedgerEntry[];
  activities: Activity[];
}) {
  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const member = houseMembers.find((item) => item.id === entry.memberId);
        const activity = activities.find((item) => item.id === entry.activityId);

        return (
          <div key={entry.id} className="flex items-start gap-3 text-sm">
            {member ? <Avatar member={member} compact /> : null}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{activity?.name ?? entry.note ?? "Adjustment"}</p>
              <p className="text-zinc-500">
                {member?.name} {entry.amount >= 0 ? "earned" : "used"}{" "}
                {rewardLabel(entry.type, Math.abs(entry.amount))}
              </p>
            </div>
            <span className="shrink-0 text-xs text-zinc-500">{entry.createdAt}</span>
          </div>
        );
      })}
    </div>
  );
}
