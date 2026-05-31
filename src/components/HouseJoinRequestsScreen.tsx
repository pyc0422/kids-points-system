import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import type { HouseJoinRequestsData } from "@/lib/bff/family";
import { roleLabels } from "@/utils/constants";
import { Avatar } from "./Avatar";

export function HouseJoinRequestsScreen({
  house,
  requests,
}: Pick<HouseJoinRequestsData, "house" | "requests">) {
  return (
    <section className="mx-auto w-full max-w-4xl rounded-lg border border-zinc-200 bg-white p-6">
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <Users aria-hidden className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Join requests</p>
            <h1 className="text-2xl font-semibold tracking-normal">{house.name}</h1>
          </div>
        </div>

        <Link
          href={`/houses/${house.id}/edit`}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back to edit
        </Link>
      </div>

      <div className="mt-6">
        {requests.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-sm text-zinc-500">
            There are no pending join requests.
          </div>
        ) : (
          <div className="grid gap-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-lg border border-zinc-200 bg-white p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      member={{
                        id: request.id,
                        name: request.displayName,
                        role: request.role,
                        avatarColor: "bg-sky-500",
                      }}
                    />
                    <div>
                      <p className="font-semibold text-zinc-950">{request.displayName}</p>
                      <p className="text-sm text-zinc-500">
                        Wants to join as {roleLabels[request.role]}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <form
                      action={`/api/houses/${house.id}/join-requests/${request.id}/deny`}
                      method="post"
                    >
                      <input type="hidden" name="returnTo" value={`/houses/${house.id}/requests`} />
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
                      >
                        Deny
                      </button>
                    </form>

                    <form
                      action={`/api/houses/${house.id}/join-requests/${request.id}/approve`}
                      method="post"
                    >
                      <input type="hidden" name="returnTo" value={`/houses/${house.id}/requests`} />
                      <button
                        type="submit"
                        className="inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
                      >
                        Accept
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
