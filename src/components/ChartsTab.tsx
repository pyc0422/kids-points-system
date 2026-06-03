import { Check, ChevronLeft, ChevronRight, Circle, Plus, X } from "lucide-react";
import type { Activity, Completion, HouseMember, LedgerEntry } from "@/lib/domain";
import {
  formatActivitySchedule,
  getActivityDayState,
  isActivityDue,
} from "@/utils/activity";
import { dayLabels } from "@/utils/constants";
import { addDays, formatDate, isoDate, parseDateKey } from "@/utils/date";

export function ChartsTab({
  kids,
  selectedKid,
  selectedKidId,
  onSelectedKidChange,
  activities,
  completions,
  ledgerEntries,
  weekDays,
  weekStart,
  todayKey,
  canGoPreviousWeek,
  canGoNextWeek,
  onPreviousWeek,
  onNextWeek,
  onMarkDate,
  onRemoveDate,
}: {
  kids: HouseMember[];
  selectedKid?: HouseMember;
  selectedKidId: string;
  onSelectedKidChange: (kidId: string) => void;
  activities: Activity[];
  completions: Completion[];
  ledgerEntries: LedgerEntry[];
  weekDays: Date[];
  weekStart: Date;
  todayKey: string;
  canGoPreviousWeek: boolean;
  canGoNextWeek: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onMarkDate: (activity: Activity, member: HouseMember, dateKey: string) => void;
  onRemoveDate: (activity: Activity, member: HouseMember, dateKey: string) => void;
}) {
  const chartActivities = selectedKid
    ? activities.filter((activity) => activity.assigneeIds.includes(selectedKid.id))
    : [];
  const editableStartKey = isoDate(addDays(parseDateKey(todayKey), -27));

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Completion Chart</h2>
          <p className="text-sm text-zinc-500">
            Edit the last 4 weeks. Tap a cell to add or remove a mark.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <select
            value={selectedKidId}
            onChange={(event) => onSelectedKidChange(event.target.value)}
            className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold outline-none sm:w-auto"
          >
            {kids.map((kid) => (
              <option key={kid.id} value={kid.id}>
                {kid.name}
              </option>
            ))}
          </select>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onPreviousWeek}
              disabled={!canGoPreviousWeek}
              className="inline-flex size-10 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous week"
              title="Previous week"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <span className="min-w-0 flex-1 text-center text-sm font-semibold">
              {formatDate(weekStart)} - {formatDate(addDays(weekStart, 6))}
            </span>
            <button
              type="button"
              onClick={onNextWeek}
              disabled={!canGoNextWeek}
              className="inline-flex size-10 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next week"
              title="Next week"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="grid gap-3">
          {chartActivities.map((activity) => (
            <article key={activity.id} className="rounded-lg border border-zinc-200 bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{activity.name}</p>
                  <p className="text-xs capitalize text-zinc-500">
                    {formatActivitySchedule(activity)}
                  </p>
                </div>
                <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
                  4 weeks
                </span>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1">
                {weekDays.map((date, index) => (
                  <div key={isoDate(date)} className="min-w-0">
                    <span className="mb-1 block text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                      {dayLabels[index]}
                    </span>
                    <div className="flex aspect-square items-center justify-center rounded-md border border-zinc-200 bg-zinc-50">
                      <ChartCell
                        activity={activity}
                        member={selectedKid}
                        date={date}
                        completions={completions}
                        ledgerEntries={ledgerEntries}
                        todayKey={todayKey}
                        editableStartKey={editableStartKey}
                        onMarkDate={onMarkDate}
                        onRemoveDate={onRemoveDate}
                        compact
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="hidden overflow-x-auto lg:block">
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
                  {formatActivitySchedule(activity)}
                </p>
              </div>
              {weekDays.map((date) => (
                <ChartCell
                  key={`${activity.id}-${isoDate(date)}`}
                  activity={activity}
                  member={selectedKid}
                  date={date}
                  completions={completions}
                  ledgerEntries={ledgerEntries}
                  todayKey={todayKey}
                  editableStartKey={editableStartKey}
                  onMarkDate={onMarkDate}
                  onRemoveDate={onRemoveDate}
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
  ledgerEntries,
  todayKey,
  editableStartKey,
  onMarkDate,
  onRemoveDate,
  compact = false,
}: {
  activity: Activity;
  member?: HouseMember;
  date: Date;
  completions: Completion[];
  ledgerEntries: LedgerEntry[];
  todayKey: string;
  editableStartKey: string;
  onMarkDate: (activity: Activity, member: HouseMember, dateKey: string) => void;
  onRemoveDate: (activity: Activity, member: HouseMember, dateKey: string) => void;
  compact?: boolean;
}) {
  if (!member) {
    return compact ? <div className="aspect-square" /> : <div className="p-3" />;
  }

  const dateKey = isoDate(date);
  const dayState = getActivityDayState({
    activity,
    completions,
    ledgerEntries,
    memberId: member.id,
    dateKey,
  });
  const isDone = dayState.isDone;
  const isDue = isActivityDue(activity, date);
  const isEditableDate = dateKey >= editableStartKey && dateKey <= todayKey;
  const isRepeatable = activity.frequency === "as-needed";
  const canAdd = isEditableDate && (isRepeatable || isDue);
  const canRemove = isEditableDate && (isDone || (isRepeatable && dayState.doneCount > 0));

  if (!canAdd && !canRemove) {
    if (isDone) {
      return (
        <div
          className={
            compact
              ? "flex h-full items-center justify-center"
              : "flex items-center justify-center p-3"
          }
        >
          <span
            className={`inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ${
              compact ? "size-6" : "size-8"
            }`}
          >
            <Check aria-hidden className={compact ? "size-4" : "size-5"} />
          </span>
        </div>
      );
    }

    if (!isDue) {
      return compact ? <div className="aspect-square" /> : <div className="p-3" />;
    }

    return (
      <div
        className={
          compact
            ? "flex h-full items-center justify-center"
            : "flex items-center justify-center p-3"
        }
      >
        <Circle aria-hidden className={compact ? "size-4 text-zinc-300" : "size-6 text-zinc-300"} />
      </div>
    );
  }

  const action = isDone || (isRepeatable && dayState.doneCount > 0) ? "undo" : "mark";
  const handleClick = () => {
    if (action === "undo") {
      onRemoveDate(activity, member, dateKey);
      return;
    }

    onMarkDate(activity, member, dateKey);
  };

  const label = action === "undo" ? "Remove mark" : isRepeatable ? "Add activity" : "Mark done";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        compact
          ? "flex h-full w-full items-center justify-center rounded-md outline-none transition hover:bg-zinc-100 focus:bg-zinc-100"
          : "flex h-full w-full items-center justify-center rounded-md outline-none transition hover:bg-zinc-50 focus:bg-zinc-50"
      }
      title={label}
      aria-label={label}
    >
      {action === "undo" ? (
        <span className="relative inline-flex items-center justify-center">
          <span
            className={`inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ${
              compact ? "size-6" : "size-8"
            }`}
          >
            <Check aria-hidden className={compact ? "size-4" : "size-5"} />
          </span>
          <span className="absolute -right-1 -top-1 inline-flex size-4 items-center justify-center rounded-full bg-white text-rose-600 shadow ring-1 ring-zinc-200">
            <X aria-hidden className="size-3" />
          </span>
        </span>
      ) : isRepeatable ? (
        <span className="relative inline-flex items-center justify-center">
          {dayState.doneCount > 0 ? (
            <span
              className={`inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ${
                compact ? "size-6" : "size-8"
              }`}
            >
              <Check aria-hidden className={compact ? "size-4" : "size-5"} />
            </span>
          ) : (
            <span
              className={`inline-flex items-center justify-center rounded-full border border-dashed border-zinc-300 bg-white text-zinc-400 ${
                compact ? "size-6" : "size-8"
              }`}
            >
              <Plus aria-hidden className={compact ? "size-4" : "size-5"} />
            </span>
          )}
          {dayState.doneCount > 1 ? (
            <span className="absolute -right-2 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-zinc-950 px-1 text-[10px] font-semibold text-white">
              {dayState.doneCount}
            </span>
          ) : null}
        </span>
      ) : (
        <span
          className={`inline-flex items-center justify-center rounded-full ${
            isDue ? "border border-dashed border-zinc-300 bg-white text-zinc-500" : "bg-zinc-50 text-zinc-300"
          } ${compact ? "size-6" : "size-8"}`}
        >
          <Plus aria-hidden className={compact ? "size-4" : "size-5"} />
        </span>
      )}
    </button>
  );
}
