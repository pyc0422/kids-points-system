import type {
  Activity,
  Completion,
  HouseJoinRequest,
  House,
  HouseMember,
  LedgerEntry,
} from "@/lib/domain";
import type { Database } from "./database.types";

export function mapHouse(
  row: Database["public"]["Tables"]["houses"]["Row"],
): House {
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
  };
}

export function mapHouseMember(
  row: Database["public"]["Tables"]["house_members"]["Row"],
): HouseMember {
  return {
    id: row.id,
    name: row.display_name,
    role: row.role,
    avatarColor: row.avatar_color,
  };
}

export function mapActivity(
  row: Database["public"]["Tables"]["activities"]["Row"],
  assigneeIds: string[] = [],
): Activity {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    assigneeIds,
    frequency: row.frequency,
    repeatOn: row.repeat_on ?? null,
    rewardType: row.reward_type,
    rewardAmount: Number(row.reward_amount),
    requiresApproval: row.requires_approval,
  };
}

export function mapCompletion(
  row: Database["public"]["Tables"]["completions"]["Row"],
): Completion {
  return {
    id: row.id,
    activityId: row.activity_id,
    memberId: row.member_id,
    completedOn: row.completed_on,
    status: row.status,
    submittedAt: row.submitted_at
      ? new Date(row.submitted_at).toLocaleString()
      : undefined,
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).toLocaleString() : undefined,
    reviewerId: row.reviewer_member_id ?? undefined,
  };
}

export function mapLedgerEntry(
  row: Database["public"]["Tables"]["ledger_entries"]["Row"],
): LedgerEntry {
  return {
    id: row.id,
    memberId: row.member_id,
    activityId: row.activity_id ?? undefined,
    type: row.type,
    amount: Number(row.amount),
    createdAt: new Date(row.created_at).toLocaleString(),
    note: row.note ?? undefined,
  };
}

export function mapHouseJoinRequest(
  row: Database["public"]["Tables"]["house_join_requests"]["Row"],
): HouseJoinRequest {
  return {
    id: row.id,
    houseId: row.house_id,
    requestedBy: row.requested_by,
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    createdAt: new Date(row.created_at).toLocaleString(),
    reviewedAt: row.reviewed_at ? new Date(row.reviewed_at).toLocaleString() : undefined,
    reviewedByMemberId: row.reviewed_by_member_id ?? undefined,
  };
}
