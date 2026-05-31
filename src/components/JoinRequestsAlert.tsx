import Link from "next/link";
import type { HouseJoinRequest } from "@/lib/domain";

export function JoinRequestsAlert({
  houseId,
  requests,
}: {
  houseId: string;
  requests: HouseJoinRequest[];
}) {
  if (requests.length === 0) {
    return null;
  }

  if (requests.length === 1) {
    const request = requests[0];

    return (
      <section className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p>
            <span className="font-semibold">{request.displayName}</span> wants to join this house.
          </p>
          <div className="flex gap-2">
            <form action={`/api/houses/${houseId}/join-requests/${request.id}/deny`} method="post">
              <input type="hidden" name="returnTo" value="/" />
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md border border-amber-300 bg-white px-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
              >
                Deny
              </button>
            </form>
            <form action={`/api/houses/${houseId}/join-requests/${request.id}/approve`} method="post">
              <input type="hidden" name="returnTo" value="/" />
              <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                Accept
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p>
          <span className="font-semibold">{requests.length} people</span> want to join this house.
        </p>
        <Link
          href={`/houses/${houseId}/requests`}
          className="inline-flex h-9 items-center rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
        >
          Manage requests
        </Link>
      </div>
    </section>
  );
}
