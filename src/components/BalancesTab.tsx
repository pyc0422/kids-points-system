import { ArrowLeft, CalendarDays, Check, Plus } from "lucide-react";
import { useState } from "react";
import type { Activity, HouseMember, LedgerEntry, MemberSummary, RewardType } from "@/lib/domain";
import type { BalanceMode } from "@/utils/app-types";
import { currency } from "@/utils/format";
import { isoDate } from "@/utils/date";
import { Avatar } from "./Avatar";
import { HistoryList } from "./HistoryList";
import { PreviewAmount } from "./PreviewAmount";

export function BalancesTab({
  kids,
  members,
  summaries,
  ledgerEntries,
  activities,
  selectedKidId,
  mode,
  canAdjustBalances,
  onSelectKid,
  onModeChange,
  onAdjust,
}: {
  kids: HouseMember[];
  members: HouseMember[];
  summaries: MemberSummary[];
  ledgerEntries: LedgerEntry[];
  activities: Activity[];
  selectedKidId: string;
  mode: BalanceMode;
  canAdjustBalances: boolean;
  onSelectKid: (kidId: string) => void;
  onModeChange: (mode: BalanceMode) => void;
  onAdjust: (
    member: HouseMember,
    type: RewardType,
    amount: number,
    note: string,
  ) => void;
}) {
  const [adjustType, setAdjustType] = useState<RewardType>("points");
  const [adjustAmount, setAdjustAmount] = useState("-15");
  const [adjustNote, setAdjustNote] = useState("");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const selectedKid = kids.find((kid) => kid.id === selectedKidId) ?? kids[0];
  const selectedSummary = summaries.find(
    (summary) => summary.member.id === selectedKid?.id,
  );
  const parsedAmount = Number(adjustAmount);
  const currentValue =
    adjustType === "points" ? selectedSummary?.points ?? 0 : selectedSummary?.money ?? 0;
  const previewValue = Number.isFinite(parsedAmount)
    ? currentValue + parsedAmount
    : currentValue;

  function filteredHistoryFor(member: HouseMember) {
    return ledgerEntries
      .filter((entry) => entry.memberId === member.id)
      .filter((entry) => {
        const entryKey = isoDate(new Date(entry.createdAt));
        if (!rangeStart && !rangeEnd) {
          return true;
        }

        const afterStart = rangeStart ? entryKey >= rangeStart : true;
        const beforeEnd = rangeEnd ? entryKey <= rangeEnd : true;

        return afterStart && beforeEnd;
      })
      .slice(0, 20);
  }

  if (mode === "list") {
    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
        <h2 className="text-base font-semibold sm:text-lg">Balances</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {kids.map((kid) => {
            const summary = summaries.find((item) => item.member.id === kid.id);

            return (
              <button
                key={kid.id}
                type="button"
                onClick={() => onSelectKid(kid.id)}
                className="grid gap-3 rounded-lg border border-zinc-200 p-3 text-left transition hover:border-zinc-950 hover:bg-zinc-50"
              >
                <span className="flex items-center gap-3">
                  <Avatar member={kid} />
                  <span>
                    <span className="block text-sm font-semibold sm:text-base">{kid.name}</span>
                    <span className="text-xs text-zinc-500 sm:text-sm">View balance history</span>
                  </span>
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <span className="rounded-lg bg-teal-50 p-3 text-teal-900">
                    <span className="block text-[11px] sm:text-sm">Points</span>
                    <span className="text-lg font-semibold sm:text-xl">{summary?.points ?? 0}</span>
                  </span>
                  <span className="rounded-lg bg-lime-50 p-3 text-lime-900">
                    <span className="block text-[11px] sm:text-sm">Allowance</span>
                    <span className="text-lg font-semibold sm:text-xl">
                      {currency(summary?.money ?? 0)}
                    </span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  if (!selectedKid) {
    return null;
  }

  if (mode === "adjust") {
    if (!canAdjustBalances) {
      return (
        <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
          <button
            type="button"
            onClick={() => onModeChange("detail")}
            className="mb-4 inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold hover:bg-zinc-50"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Back
          </button>
          <h2 className="text-base font-semibold sm:text-lg">Adjust {selectedKid.name}&apos;s Balance</h2>
          <p className="mt-3 text-sm text-zinc-500">Only parents and admins can edit balances.</p>
        </section>
      );
    }

    return (
      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
        <button
          type="button"
          onClick={() => onModeChange("detail")}
          className="mb-4 inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold hover:bg-zinc-50"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back
        </button>
        <h2 className="text-base font-semibold sm:text-lg">Adjust {selectedKid.name}&apos;s Balance</h2>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
                return;
              }
              onAdjust(selectedKid, adjustType, parsedAmount, adjustNote);
              setAdjustNote("");
              setAdjustAmount(adjustType === "points" ? "-15" : "-1");
              onModeChange("detail");
            }}
          >
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Adjustment type</legend>
              <div className="flex flex-wrap gap-2">
                {(["points", "money"] as RewardType[]).map((type) => (
                  <label
                    key={type}
                    className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold capitalize ${
                      adjustType === type
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-white text-zinc-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="adjustType"
                      value={type}
                      checked={adjustType === type}
                      onChange={() => setAdjustType(type)}
                      className="sr-only"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Adjustment amount</span>
              <input
                type="number"
                value={adjustAmount}
                onChange={(event) => setAdjustAmount(event.target.value)}
                step={adjustType === "money" ? "0.01" : "1"}
                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold outline-none focus:border-zinc-950 sm:text-base"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Note</span>
              <textarea
                value={adjustNote}
                onChange={(event) => setAdjustNote(event.target.value)}
                rows={4}
                placeholder="Redeemed for screen time, correction, bonus..."
                className="w-full resize-none rounded-md border border-zinc-300 bg-white p-3 text-sm outline-none focus:border-zinc-950"
              />
            </label>

            <button
              type="submit"
              disabled={!Number.isFinite(parsedAmount) || parsedAmount === 0}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              <Check aria-hidden className="size-4" />
              Save Adjustment
            </button>
          </form>

          <div className="rounded-lg bg-zinc-50 p-4">
            <h3 className="font-semibold">Before / After</h3>
            <div className="mt-4 grid gap-3">
              <PreviewAmount label="Before" type={adjustType} value={currentValue} />
              <PreviewAmount label="After" type={adjustType} value={previewValue} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
        <button
          type="button"
          onClick={() => onModeChange("list")}
          className="mb-4 inline-flex h-9 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold hover:bg-zinc-50"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Members
        </button>
        <div className="flex items-center gap-3">
          <Avatar member={selectedKid} />
          <div>
            <h2 className="text-base font-semibold sm:text-lg">{selectedKid.name}</h2>
            <p className="text-xs text-zinc-500 sm:text-sm">Current balance</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-teal-50 p-4 text-teal-900">
            <p className="text-xs sm:text-sm">Points</p>
            <p className="text-2xl font-semibold sm:text-3xl">{selectedSummary?.points ?? 0}</p>
          </div>
          <div className="rounded-lg bg-lime-50 p-4 text-lime-900">
            <p className="text-xs sm:text-sm">Allowance</p>
            <p className="text-2xl font-semibold sm:text-3xl">
              {currency(selectedSummary?.money ?? 0)}
            </p>
          </div>
        </div>
        {canAdjustBalances ? (
          <button
            type="button"
            onClick={() => onModeChange("adjust")}
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            <Plus aria-hidden className="size-4" />
            Add Adjustment
          </button>
        ) : null}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-base font-semibold sm:text-lg">History</h2>
            <p className="text-xs text-zinc-500 sm:text-sm">Default shows latest 20 entries.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-2 py-2 text-sm">
            <CalendarDays aria-hidden className="size-4 text-zinc-500" />
            <input
              type="date"
              value={rangeStart}
              onChange={(event) => setRangeStart(event.target.value)}
              className="rounded border border-zinc-200 bg-white px-2 py-1"
              aria-label="History start date"
            />
            <span className="text-zinc-400">to</span>
            <input
              type="date"
              value={rangeEnd}
              onChange={(event) => setRangeEnd(event.target.value)}
              className="rounded border border-zinc-200 bg-white px-2 py-1"
              aria-label="History end date"
            />
          </div>
        </div>
        <HistoryList
          entries={filteredHistoryFor(selectedKid)}
          activities={activities}
          members={members}
        />
      </section>
    </div>
  );
}
