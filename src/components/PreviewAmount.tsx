import type { RewardType } from "@/lib/domain";
import { currency } from "@/utils/format";

export function PreviewAmount({
  label,
  type,
  value,
}: {
  label: string;
  type: RewardType;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">
        {type === "money" ? currency(value) : `${value} pts`}
      </p>
    </div>
  );
}
