import type { Activity, Completion, HouseMember } from "@/lib/domain";
import { getActivityDayState, isActivityDue } from "@/utils/activity";

export type KindleTodoAssignment = {
  activity: Activity;
  member: HouseMember;
  isDone: boolean;
  completion?: Completion;
};

export function getTodayAssignments({
  activities,
  completions,
  members,
  today,
  todayKey,
}: {
  activities: Activity[];
  completions: Completion[];
  members: HouseMember[];
  today: Date;
  todayKey: string;
}) {
  return members.map((member) => {
    const assignments = activities
      .filter((activity) => activity.assigneeIds.includes(member.id))
      .filter((activity) => isActivityDue(activity, today))
      .map((activity) => {
        const state = getActivityDayState({
          activity,
          completions,
          ledgerEntries: [],
          memberId: member.id,
          dateKey: todayKey,
        });

        return {
          activity,
          member,
          isDone: state.isDone,
          completion: state.completion,
        };
      });

    return {
      member,
      assignments,
      doneCount: assignments.filter((assignment) => assignment.isDone).length,
      totalCount: assignments.length,
    };
  });
}
