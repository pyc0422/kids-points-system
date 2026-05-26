"use client";

import { useState } from "react";
import { createHouseAction, joinHouseAction } from "@/app/actions";

export function HouseSetupScreen({
  defaultDisplayName,
}: {
  defaultDisplayName?: string | null;
}) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const isCreateMode = mode === "create";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-4 text-zinc-950">
      <section className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-6">
        <p className="text-sm font-medium text-zinc-500">Family Points & Allowance</p>
        <h1 className="mt-2 text-2xl font-semibold">
          {isCreateMode ? "Create your house" : "Join a house"}
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          {isCreateMode
            ? "The first member becomes the house admin."
            : "Enter the house ID or invite code and join with your own display name."}
        </p>

        <div className="mt-6 flex rounded-md border border-zinc-200 p-1">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={`h-10 flex-1 rounded-md text-sm font-semibold transition ${
              isCreateMode ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Create new
          </button>
          <button
            type="button"
            onClick={() => setMode("join")}
            className={`h-10 flex-1 rounded-md text-sm font-semibold transition ${
              !isCreateMode ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            Join existing
          </button>
        </div>

        {mode === "create" ? (
          <form action={createHouseAction} className="mt-6 space-y-4">
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
              Create House
            </button>
          </form>
        ) : (
          <form action={joinHouseAction} className="mt-6 space-y-4">
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
            <p className="text-sm text-zinc-500">
              The admin role stays with the house creator.
            </p>
            <button
              type="submit"
              className="inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              Join House
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
