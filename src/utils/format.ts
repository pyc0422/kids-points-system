import type { RewardType } from "@/lib/domain";

export function currency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function rewardLabel(type: RewardType, amount: number) {
  return type === "money" ? currency(amount) : `${amount} pts`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
