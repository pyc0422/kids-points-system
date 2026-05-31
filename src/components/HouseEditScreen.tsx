import { HomeIcon, Shield, Trash2 } from "lucide-react";
import type { HouseEditData } from "@/lib/bff/family";
import { updateHouseAction } from "@/app/actions";
import type { Role } from "@/lib/domain";
import { Avatar } from "./Avatar";
import { roleLabels } from "@/utils/constants";

const editableRoles: Role[] = ["admin", "parent", "kid"];

export function HouseEditScreen({ house, members, member: currentMember }: HouseEditData) {
  return (
    <section className="mx-auto w-full max-w-4xl rounded-lg border border-zinc-200 bg-white p-6">
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-lg bg-zinc-950 text-white">
            <HomeIcon aria-hidden className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Edit house</p>
            <h1 className="text-2xl font-semibold tracking-normal">{house.name}</h1>
          </div>
        </div>
      </div>

        <form action={updateHouseAction} className="mt-6 space-y-6">
          <input type="hidden" name="houseId" value={house.id} />
          <input type="hidden" name="returnTo" value={`/houses/${house.id}/edit`} />

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield aria-hidden className="size-4 text-zinc-500" />
            <h2 className="text-lg font-semibold">House basics</h2>
          </div>

          <label className="block max-w-xl">
            <span className="mb-2 block text-sm font-semibold">House name</span>
            <input
              name="houseName"
              defaultValue={house.name}
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
            />
          </label>

          <div className="max-w-xl rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm">
            <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Invite code
            </span>
            <span className="font-medium text-zinc-950">{house.inviteCode}</span>
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">House members</h2>
            <p className="text-sm text-zinc-500">
              Update each member&apos;s role. At least one admin must remain.
            </p>
          </div>

          <div className="grid gap-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Avatar member={member} />
                  <div>
                    <p className="font-semibold text-zinc-950">{member.name}</p>
                    <p className="text-sm text-zinc-500">
                      Current role: {roleLabels[member.role]}
                    </p>
                  </div>
                </div>

                  <label className="block sm:w-56">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Role
                    </span>
                  <select
                    name={`role_${member.id}`}
                    defaultValue={member.role}
                    className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
                  >
                    {editableRoles.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                    </select>
                  </label>

                  <button
                    type="submit"
                    formAction={`/api/houses/${house.id}/members/${member.id}/remove`}
                    formMethod="post"
                    disabled={member.id === currentMember.id}
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40 sm:self-end"
                  >
                    <Trash2 aria-hidden className="size-4" />
                    Remove
                  </button>
                </div>
              ))}
            </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Save changes
          </button>
        </div>
      </form>
    </section>
  );
}
