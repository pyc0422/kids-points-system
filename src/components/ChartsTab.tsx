"use client";

import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Activity, Completion, HouseMember, LedgerEntry } from "@/lib/domain";
import { Avatar } from "./Avatar";
import { formatActivitySchedule, getActivityDayState, getAsNeededDoneCount } from "@/utils/activity";
import { formatDate, isoDate } from "@/utils/date";
import { isActivityDue } from "@/utils/activity";

type CellTone = "done" | "missed" | "due" | "upcoming" | "empty";

const boardGridClasses =
  "grid grid-cols-[minmax(5.75rem,7rem)_repeat(7,1.75rem)] gap-1.5 sm:grid-cols-[minmax(8.5rem,11rem)_repeat(7,2rem)] sm:gap-2 lg:grid-cols-[minmax(14rem,18rem)_repeat(7,minmax(0,1fr))] lg:gap-3";

function formatWeekTitle(weekDays: Date[], todayKey: string) {
  if (weekDays.some((date) => isoDate(date) === todayKey)) {
    return "This Week";
  }

  return `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`;
}

function getDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function getAsNeededVisible(weekDays: Date[], activity: Activity, memberId: string, ledgerEntries: LedgerEntry[]) {
  return weekDays.some((date) =>
    getAsNeededDoneCount(ledgerEntries, activity.id, memberId, isoDate(date)) > 0,
  );
}

function getCellTone({
  activity,
  date,
  stateIsDone,
  todayKey,
}: {
  activity: Activity;
  date: Date;
  stateIsDone: boolean;
  todayKey: string;
}): CellTone {
  const dateKey = isoDate(date);

  if (activity.frequency === "as-needed") {
    return stateIsDone ? "done" : "empty";
  }

  const due = isActivityDue(activity, date);

  if (stateIsDone) {
    return "done";
  }

  if (due && dateKey < todayKey) {
    return "missed";
  }

  if (due && dateKey === todayKey) {
    return "due";
  }

  if (dateKey > todayKey) {
    return "upcoming";
  }

  return "empty";
}

function CellIcon({ tone }: { tone: CellTone }) {
  if (tone === "done") {
    return <Check aria-hidden className="size-4" />;
  }

  if (tone === "missed") {
    return <X aria-hidden className="size-4" />;
  }

  if (tone === "due") {
    return <Check aria-hidden className="size-4 opacity-60" />;
  }

  if (tone === "upcoming") {
    return <span aria-hidden className="text-2xl leading-none opacity-70">•</span>;
  }

  return null;
}

function ChartCell({
  activity,
  date,
  tone,
  doneCount,
  clickable,
  onClick,
}: {
  activity: Activity;
  date: Date;
  tone: CellTone;
  doneCount: number;
  clickable: boolean;
  onClick?: () => void;
}) {
  const label = `${activity.name} on ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;

  const toneClasses: Record<CellTone, string> = {
    done: "border-emerald-300 bg-emerald-50 text-emerald-600",
    missed: "border-red-200 bg-white text-red-500",
    due: "border-emerald-200 bg-white text-emerald-500",
    upcoming: "border-zinc-200 bg-zinc-50 text-zinc-400",
    empty: "border-zinc-200 bg-white text-zinc-300",
  };

  return (
    <button
      type="button"
      aria-label={label}
      disabled={!clickable}
      onClick={onClick}
      className={`relative flex h-11 w-full items-center justify-center rounded-2xl border text-sm transition ${
        clickable ? "cursor-pointer hover:border-zinc-300 hover:shadow-sm" : "cursor-default"
      } ${toneClasses[tone]}`}
    >
      <CellIcon tone={tone} />
      {tone === "done" && doneCount > 1 ? (
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-zinc-950 text-[11px] font-semibold text-white">
          {doneCount}
        </span>
      ) : null}
    </button>
  );
}

export function ChartsTab({
  kids,
  activities,
  completions,
  ledgerEntries,
  weekDays,
  todayKey,
  canGoPreviousWeek,
  canGoNextWeek,
  onPreviousWeek,
  onNextWeek,
  onMarkDate,
  onRemoveDate,
}: Readonly<{
  kids: HouseMember[];
  activities: Activity[];
  completions: Completion[];
  ledgerEntries: LedgerEntry[];
  weekDays: Date[];
  todayKey: string;
  canGoPreviousWeek: boolean;
  canGoNextWeek: boolean;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onMarkDate: (activity: Activity, member: HouseMember, completedOn: string) => void;
  onRemoveDate: (activity: Activity, member: HouseMember, completedOn: string) => void;
}>) {
  const weekTitle = formatWeekTitle(weekDays, todayKey);

  function getActivityRowsForKid(memberId: string) {
    return activities.filter((activity) => {
      if (!activity.assigneeIds.includes(memberId)) {
        return false;
      }

      if (activity.frequency !== "as-needed") {
        return true;
      }

      return getAsNeededVisible(weekDays, activity, memberId, ledgerEntries);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPreviousWeek}
          disabled={!canGoPreviousWeek}
          className="inline-flex size-11 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronLeft aria-hidden className="size-6" />
        </button>
        <h2 className="min-w-0 text-center text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
          {weekTitle}
        </h2>
        <button
          type="button"
          onClick={onNextWeek}
          disabled={!canGoNextWeek}
          className="inline-flex size-11 items-center justify-center rounded-full border border-zinc-300 bg-white text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ChevronRight aria-hidden className="size-6" />
        </button>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 bg-white px-3 py-3 sm:px-4">
          <div className={boardGridClasses}>
            <div />
            {weekDays.map((date) => (
              <div key={isoDate(date)} className="flex justify-center">
                <span className="origin-bottom -rotate-45 text-[10px] font-medium uppercase tracking-wide text-zinc-500 sm:text-xs">
                  {getDayLabel(date)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-zinc-200">
          {kids.map((kid) => {
            const kidActivities = getActivityRowsForKid(kid.id);

            return (
              <section key={kid.id} className="px-3 py-4 sm:px-4">
                <div className={boardGridClasses}>
                  <div className="flex items-center gap-3">
                    <Avatar member={kid} compact />
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-zinc-950 sm:text-lg">
                        {kid.name}
                      </p>
                      <p className="text-xs text-zinc-500 sm:text-sm">
                        {kidActivities.length} activity{kidActivities.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-7" />
                </div>

                <div className="mt-3 space-y-2">
                  {kidActivities.map((activity) => {
                    return (
                      <div
                        key={activity.id}
                        className={boardGridClasses}
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-[10px] font-semibold uppercase tracking-wide text-white sm:size-9 sm:text-[11px]">
                            {activity.name.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-2 text-sm font-medium text-zinc-950 sm:text-base">
                              {activity.name}
                            </p>
                            <p className="text-[11px] text-zinc-500 sm:text-xs">
                              {formatActivitySchedule(activity)}
                            </p>
                          </div>
                        </div>

                        {weekDays.map((date) => {
                          const dateKey = isoDate(date);
                          const state = getActivityDayState({
                            activity,
                            completions,
                            ledgerEntries,
                            memberId: kid.id,
                            dateKey,
                          });
                          const tone = getCellTone({
                            activity,
                            date,
                            stateIsDone: state.isDone,
                            todayKey,
                          });
                          const due = isActivityDue(activity, date);
                          const canInteract =
                            activity.frequency === "as-needed" ||
                            state.isDone ||
                            (dateKey <= todayKey && due);

                          return (
                            <ChartCell
                              key={dateKey}
                              activity={activity}
                              date={date}
                              tone={tone}
                              doneCount={state.doneCount}
                              clickable={canInteract}
                              onClick={
                                canInteract
                                  ? () => {
                                      if (state.isDone) {
                                        onRemoveDate(activity, kid, dateKey);
                                      } else {
                                        onMarkDate(activity, kid, dateKey);
                                      }
                                    }
                                  : undefined
                              }
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-700">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500">
              <X aria-hidden className="size-4" />
            </span>
            <span>Incomplete</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-600">
              <Check aria-hidden className="size-4 opacity-60" />
            </span>
            <span>Due today</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-400">
              <span aria-hidden className="text-xl leading-none">
                •
              </span>
            </span>
            <span>Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
}
