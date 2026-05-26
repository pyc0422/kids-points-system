import type { Activity, Completion } from "@/lib/domain";

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
    return date.getDay() === 1;
  }

  if (activity.frequency === "monthly") {
    return date.getDate() === 1;
  }

  return false;
}
