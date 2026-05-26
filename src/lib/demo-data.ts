import type { Activity, Completion, HouseMember, LedgerEntry } from "./domain";

export const houseMembers: HouseMember[] = [
  { id: "admin-1", name: "Rain", role: "admin", avatarColor: "bg-sky-500" },
  { id: "parent-1", name: "Mia", role: "parent", avatarColor: "bg-emerald-500" },
  { id: "kid-1", name: "Avery", role: "kid", avatarColor: "bg-amber-500" },
  { id: "kid-2", name: "Noah", role: "kid", avatarColor: "bg-rose-500" },
];

export const activities: Activity[] = [
  {
    id: "activity-reading",
    name: "Read for 20 minutes",
    description: "Independent reading or reading with a parent.",
    assigneeIds: ["kid-1", "kid-2"],
    frequency: "daily",
    rewardType: "points",
    rewardAmount: 20,
    requiresApproval: true,
  },
  {
    id: "activity-math",
    name: "Finish math practice",
    description: "Complete the assigned worksheet or app lesson.",
    assigneeIds: ["kid-1"],
    frequency: "weekdays",
    rewardType: "points",
    rewardAmount: 15,
    requiresApproval: true,
  },
  {
    id: "activity-dishwasher",
    name: "Unload dishwasher",
    description: "Put dishes away carefully after dinner.",
    assigneeIds: ["kid-2"],
    frequency: "daily",
    rewardType: "money",
    rewardAmount: 1.5,
    requiresApproval: true,
  },
  {
    id: "activity-sports",
    name: "Sports practice",
    description: "Practice, class, or active outdoor time.",
    assigneeIds: ["kid-1", "kid-2"],
    frequency: "weekly",
    rewardType: "points",
    rewardAmount: 30,
    requiresApproval: false,
  },
];

export const completions: Completion[] = [
  {
    id: "completion-reading-avery",
    activityId: "activity-reading",
    memberId: "kid-1",
    status: "submitted",
    completedOn: "2026-05-26",
    submittedAt: "Today, 4:30 PM",
  },
  {
    id: "completion-reading-noah",
    activityId: "activity-reading",
    memberId: "kid-2",
    status: "approved",
    completedOn: "2026-05-26",
    submittedAt: "Today, 3:45 PM",
    reviewedAt: "Today, 4:10 PM",
    reviewerId: "parent-1",
  },
  {
    id: "completion-dishwasher-noah",
    activityId: "activity-dishwasher",
    memberId: "kid-2",
    status: "pending",
  },
  {
    id: "completion-sports-avery",
    activityId: "activity-sports",
    memberId: "kid-1",
    status: "approved",
    completedOn: "2026-05-25",
    submittedAt: "Yesterday, 6:20 PM",
    reviewedAt: "Auto-approved",
  },
];

export const ledgerEntries: LedgerEntry[] = [
  {
    id: "ledger-reading-noah",
    activityId: "activity-reading",
    memberId: "kid-2",
    type: "points",
    amount: 20,
    createdAt: "Today, 4:10 PM",
  },
  {
    id: "ledger-sports-avery",
    activityId: "activity-sports",
    memberId: "kid-1",
    type: "points",
    amount: 30,
    createdAt: "Yesterday, 6:20 PM",
  },
  {
    id: "ledger-old-chores-noah",
    activityId: "activity-dishwasher",
    memberId: "kid-2",
    type: "money",
    amount: 4.5,
    createdAt: "This week",
  },
];
