import type { Activity, Completion } from "@/lib/domain";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ordinal(value: number) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) {
    return `${value}th`;
  }

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

export function getCompletion(
  completions: Completion[],
  activityId: string,
  memberId: string,
  completedOn?: string,
) {
  return completions.find((completion) => {
    const sameAssignment =
      completion.activityId === activityId && completion.memberId === memberId;

    if (!completedOn) {
      return sameAssignment;
    }

    return sameAssignment && completion.completedOn === completedOn;
  });
}

export function isActivityDue(activity: Activity, date: Date) {
  if (activity.frequency === "as-needed") {
    return false;
  }

  if (activity.frequency === "daily") {
    return true;
  }

  if (activity.frequency === "weekdays") {
    return date.getDay() >= 1 && date.getDay() <= 5;
  }

  if (activity.frequency === "weekly") {
    return date.getDay() === (activity.repeatOn ?? 1);
  }

  if (activity.frequency === "monthly") {
    return date.getDate() === (activity.repeatOn ?? 1);
  }

  return false;
}

export function formatActivitySchedule(activity: Activity) {
  if (activity.frequency === "weekly") {
    return `Weekly on ${weekdayLabels[activity.repeatOn ?? 1] ?? "Mon"}`;
  }

  if (activity.frequency === "monthly") {
    const day = activity.repeatOn ?? 1;
    return `Monthly on ${ordinal(day)}`;
  }

  return activity.frequency.replace("-", " ");
}

export function getActivityRepeatOptions(frequency: Activity["frequency"]) {
  if (frequency === "weekly") {
    return weekdayLabels.map((label, value) => ({ label, value }));
  }

  if (frequency === "monthly") {
    return Array.from({ length: 31 }, (_, index) => {
      const value = index + 1;
      return {
        label: ordinal(value),
        value,
      };
    });
  }

  return [];
}
