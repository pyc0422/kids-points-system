"use client";

import { useState } from "react";
import {
  createHouseAction,
  joinHouseAction,
  switchHouseAction,
} from "@/app/actions";
import type { JoinedHouse } from "@/lib/bff/family";

export function HouseSwitcherScreen({
  defaultDisplayName,
  joinedHouses,
  activeHouseId,
}: {
  defaultDisplayName?: string | null;
  joinedHouses: JoinedHouse[];
  activeHouseId: string | null;
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedHouseId, setSelectedHouseId] = useState(
    activeHouseId ?? joinedHouses[0]?.house.id ?? "",
  );

  return (
    <main className="min-h-screen bg-[#f7f5ef] px-4 py-10 text-zinc-950">
      <section className="mx-auto w-full max-w-3xl rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-sm font-medium text-zinc-500">Family Points & Allowance</p>
        <h1 className="mt-2 text-2xl font-semibold">Switch house</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Pick a house you already joined, join another one by ID or invite code, or create a new house.
        </p>

        <form action={switchHouseAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Joined houses</span>
            <select
              name="houseId"
              value={selectedHouseId}
              onChange={(event) => setSelectedHouseId(event.target.value)}
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
            >
              {joinedHouses.map((entry) => (
                <option key={entry.house.id} value={entry.house.id}>
                  {entry.house.name} ({entry.member.role})
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
          >
            Switch house
          </button>
        </form>

        <div className="mt-8 border-t border-zinc-200 pt-6">
          <h2 className="text-lg font-semibold">Join another house</h2>
          <form action={joinHouseAction} className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">House ID or invite code</span>
              <input
                name="houseId"
                placeholder="Paste the house UUID or invite code here"
                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Your display name</span>
              <input
                name="displayName"
                defaultValue={defaultDisplayName ?? ""}
                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Join as</span>
              <select
                name="role"
                defaultValue="kid"
                className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
              >
                <option value="kid">Kid</option>
                <option value="parent">Parent</option>
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Join and switch
            </button>
          </form>
        </div>

        <div className="mt-8 border-t border-zinc-200 pt-6">
          <button
            type="button"
            onClick={() => setShowCreateForm((value) => !value)}
            className="inline-flex h-10 items-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Create new house
          </button>

          {showCreateForm ? (
            <form action={createHouseAction} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">House name</span>
                <input
                  name="houseName"
                  defaultValue="Our Family"
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Your display name</span>
                <input
                  name="displayName"
                  defaultValue={defaultDisplayName ?? ""}
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-950"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                Create house
              </button>
            </form>
          ) : null}
        </div>

      </section>
    </main>
  );
}
