import type { HouseMember } from "@/lib/domain";
import { initials } from "@/utils/format";

export function Avatar({
  member,
  compact = false,
}: {
  member: HouseMember;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white ${member.avatarColor} ${
        compact ? "size-8" : "size-10"
      }`}
    >
      {initials(member.name)}
    </div>
  );
}
