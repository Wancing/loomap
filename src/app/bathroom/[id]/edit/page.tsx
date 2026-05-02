"use client";

import { useParams, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

export default function EditBathroomPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <main className="container-shell space-y-6">
      <header className="flex items-center justify-between rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
        <Logo />
        <button
          type="button"
          onClick={() => router.push(`/bathroom/${params.id}`)}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Back
        </button>
      </header>

      <section className="card-surface space-y-4 p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Edit bathroom
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Update access details, opening hours, notes, and facility information.
          </p>
        </div>

        <form className="space-y-4">
          <div className="grid gap-4">
            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-800">Name</span>
              <input
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-700"
                placeholder="Bathroom name"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-800">Opening hours</span>
              <input
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-700"
                placeholder="e.g. Mon-Sun 08:00-20:00"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-zinc-800">Notes</span>
              <textarea
                rows={5}
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-700"
                placeholder="Inside the shopping centre, floor 2, near the lifts"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-full bg-teal-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-teal-800"
            >
              Save changes
            </button>

            <button
              type="button"
              onClick={() => router.push(`/bathroom/${params.id}`)}
              className="rounded-full border border-zinc-300 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}