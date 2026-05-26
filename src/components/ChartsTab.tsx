import { Check, ChevronLeft, ChevronRight, Circle, X } from "lucide-react";
import type { Activity, Completion, HouseMember } from "@/lib/domain";
import { getCompletion, isActivityDue } from "@/utils/activity";
import { dayLabels, demoToday } from "@/utils/constants";
import { addDays, formatDate, isoDate } from "@/utils/date";

export function ChartsTab({
  kids,
  selectedKid,
  selectedKidId,
  onSelectedKidChange,
  activities,
  completions,
  weekDays,
  weekStart,
  onPreviousWeek,
  onNextWeek,
}: {
  kids: HouseMember[];
  selectedKid?: HouseMember;
  selectedKidId: string;
  onSelectedKidChange: (kidId: string) => void;
  activities: Activity[];
  completions: Completion[];
  weekDays: Date[];
  weekStart: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}) {
  const chartActivities = selectedKid
    ? activities.filter((activity) => activity.assigneeIds.includes(selectedKid.id))
    : [];

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Completion Chart</h2>
          <p className="text-sm text-zinc-500">
            Each row is an activity for one kid. As-needed activities stay blank
            unless completed.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedKidId}
            onChange={(event) => onSelectedKidChange(event.target.value)}
            className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold outline-none"
          >
            {kids.map((kid) => (
              <option key={kid.id} value={kid.id}>
                {kid.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onPreviousWeek}
            className="inline-flex size-10 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-50"
            aria-label="Previous week"
            title="Previous week"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <span className="min-w-40 text-center text-sm font-semibold">
            {formatDate(weekStart)} - {formatDate(addDays(weekStart, 6))}
          </span>
          <button
            type="button"
            onClick={onNextWeek}
            className="inline-flex size-10 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-50"
            aria-label="Next week"
            title="Next week"
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[220px_repeat(7,minmax(72px,1fr))] border-b border-zinc-200 text-sm font-semibold text-zinc-600">
            <div className="p-3">Activity</div>
            {weekDays.map((date, index) => (
              <div key={isoDate(date)} className="p-3 text-center">
                <span className="block">{dayLabels[index]}</span>
                <span className="text-xs font-medium text-zinc-400">
                  {formatDate(date)}
                </span>
              </div>
            ))}
          </div>

          {chartActivities.map((activity) => (
            <div
              key={activity.id}
              className="grid grid-cols-[220px_repeat(7,minmax(72px,1fr))] border-b border-zinc-100"
            >
              <div className="p-3">
                <p className="font-semibold">{activity.name}</p>
                <p className="text-xs capitalize text-zinc-500">
                  {activity.frequency.replace("-", " ")}
                </p>
              </div>
              {weekDays.map((date) => (
                <ChartCell
                  key={`${activity.id}-${isoDate(date)}`}
                  activity={activity}
                  member={selectedKid}
                  date={date}
                  completions={completions}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChartCell({
  activity,
  member,
  date,
  completions,
}: {
  activity: Activity;
  member?: HouseMember;
  date: Date;
  completions: Completion[];
}) {
  if (!member) {
    return <div className="p-3" />;
  }

  const completion = getCompletion(completions, activity.id, member.id, isoDate(date));
  const isDone = completion?.status === "approved" || completion?.status === "submitted";
  const isDue = isActivityDue(activity, date);
  const isPastOrToday = date <= demoToday;

  if (isDone) {
    return (
      <div className="flex items-center justify-center p-3">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <Check aria-hidden className="size-5" />
        </span>
      </div>
    );
  }

  if (!isDue) {
    return <div className="p-3" />;
  }

  if (isPastOrToday) {
    return (
      <div className="flex items-center justify-center p-3">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <X aria-hidden className="size-5" />
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-3">
      <Circle aria-hidden className="size-6 text-zinc-300" />
    </div>
  );
}
