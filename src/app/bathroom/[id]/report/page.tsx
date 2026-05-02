"use client";

import { useParams, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

export default function ReportBathroomPage() {
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
            Report a problem
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Tell the community if this bathroom is closed, inaccurate, unsafe, or missing information.
          </p>
        </div>

        <form className="space-y-4">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-zinc-800">
              What is the issue?
            </legend>

            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm">
              <input type="radio" name="issue" value="closed" />
              Closed or unavailable
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm">
              <input type="radio" name="issue" value="wrong-info" />
              Wrong information
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm">
              <input type="radio" name="issue" value="accessibility" />
              Accessibility issue
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm">
              <input type="radio" name="issue" value="safety" />
              Safety or cleanliness concern
            </label>
          </fieldset>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Details</span>
            <textarea
              rows={5}
              className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-600"
              placeholder="Example: staff said it has been closed for renovation since last week"
            />
          </label>

          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-full bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-700"
            >
              Submit report
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