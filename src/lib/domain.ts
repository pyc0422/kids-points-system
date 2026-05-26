export type Role = "admin" | "parent" | "kid";

export type RewardType = "points" | "money";

export type ActivityFrequency =
  | "as-needed"
  | "weekdays"
  | "daily"
  | "weekly"
  | "monthly";

export type CompletionStatus = "pending" | "submitted" | "approved" | "rejected";

export type HouseMember = {
  id: string;
  name: string;
  role: Role;
  avatarColor: string;
};

export type House = {
  id: string;
  name: string;
  inviteCode: string;
};

export type Activity = {
  id: string;
  name: string;
  description?: string;
  assigneeIds: string[];
  frequency: ActivityFrequency;
  rewardType: RewardType;
  rewardAmount: number;
  requiresApproval: boolean;
};

export type Completion = {
  id: string;
  activityId: string;
  memberId: string;
  status: CompletionStatus;
  completedOn?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewerId?: string;
};

export type LedgerEntry = {
  id: string;
  memberId: string;
  activityId?: string;
  type: RewardType;
  amount: number;
  createdAt: string;
  note?: string;
};

export type MemberSummary = {
  member: HouseMember;
  points: number;
  money: number;
  submitted: number;
  approved: number;
};
