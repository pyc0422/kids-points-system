import { redirect } from "next/navigation";
import {
  addKindleNextItemAction,
  deleteKindleNextItemAction,
} from "@/app/kindle/actions";
import { getKindleSessionHouseId } from "@/lib/kindle/auth";
import { getKindleData } from "@/lib/kindle/data";
import { parseDateKey } from "@/utils/date";

function countdownParts(dateKey: string, todayKey: string) {
  const days = Math.ceil(
    (parseDateKey(dateKey).getTime() - parseDateKey(todayKey).getTime()) / 86_400_000,
  );

  if (days <= 0) {
    return { number: "0", unit: "days to go" };
  }

  return { number: String(days), unit: days === 1 ? "day to go" : "days to go" };
}

function longDateLabel(dateKey: string) {
  return parseDateKey(dateKey).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}

export default async function KindleNextPage() {
  const houseId = await getKindleSessionHouseId();

  if (!houseId) {
    redirect("/kindle/login");
  }

  const data = await getKindleData(houseId);

  return (
    <section className="kindle-stack space-y-5">
      <form action={addKindleNextItemAction} className="kindle-next-form kindle-form grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <div className="kindle-next-form-row">
          <label className="kindle-next-title kindle-field">
            <span className="kindle-label mb-1 block text-sm font-bold uppercase">Name / What</span>
            <input
              className="w-full border-2 border-black px-3 py-3 text-xl font-bold"
              name="title"
              required
            />
          </label>
          <label className="kindle-next-date kindle-field">
            <span className="kindle-label mb-1 block text-sm font-bold uppercase">Date</span>
            <input
              className="w-full border-2 border-black px-3 py-3 text-xl font-bold"
              name="dueOn"
              type="date"
              required
            />
          </label>
        </div>
        <div className="kindle-next-form-row kindle-next-action-row">
          <label className="kindle-next-checkbox">
            <input name="isBirthday" type="checkbox" />
            <span>Birthday</span>
          </label>
          <span className="kindle-add-cell">
            <button className="kindle-add-button self-end bg-black px-5 py-4 text-xl font-black text-white" type="submit">
              Add
            </button>
          </span>
        </div>
      </form>

      <div className="kindle-list space-y-2">
        {data.nextItems.length === 0 ? (
          <p className="kindle-empty border border-black p-4 text-lg font-bold">No dates yet.</p>
        ) : (
          data.nextItems.map((item) => {
            const countdown = countdownParts(item.dueOn, data.todayKey);

            return (
              <article
                className={`kindle-row grid grid-cols-[1fr_auto] gap-3 p-4 text-lg font-bold ${
                  item.completedAt ? "kindle-row-passed line-through" : ""
                }`}
                key={item.id}
              >
                <span className="kindle-row-main">
                  <span className="kindle-row-title">{item.title}</span>
                  <time className="kindle-row-date" dateTime={item.dueOn}>
                    {longDateLabel(item.dueOn)}
                  </time>
                </span>
                <span className="kindle-row-count">
                  <span className="kindle-row-number">{countdown.number}</span>
                  <span className="kindle-row-unit">{countdown.unit}</span>
                </span>
                <form action={deleteKindleNextItemAction} className="kindle-next-delete">
                  <input name="itemId" type="hidden" value={item.id} />
                  <button aria-label={`Delete ${item.title}`} title="Delete" type="submit">
                    ×
                  </button>
                </form>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
