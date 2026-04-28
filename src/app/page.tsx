"use client";

import { useState } from "react";
import { bathrooms } from "@/lib/mock-data";
import { Logo } from "@/components/logo";
import { TrustBadge } from "@/components/trust-badge";
import SimpleMap from "@/components/map/simple-map";
import { Bathroom } from "@/lib/types";

export default function HomePage() {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  return (
    <main className="container-shell space-y-6">
      <header className="flex flex-col gap-4 rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
        <Logo />
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Find a bathroom fast</h1>
          <p className="max-w-xl text-sm text-zinc-600">
            Loomap helps people find trustworthy public bathrooms nearby, with accessibility and
            community trust signals built in.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {["Wheelchair", "Baby changing", "Gender-neutral", "Free", "Open now"].map((item) => (
            <button
              key={item}
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
            >
              {item}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <SimpleMap />

        <div className="space-y-4">
          {bathrooms.map((bathroom: Bathroom) => (
            <article key={bathroom.id} className="card-surface p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{bathroom.name}</h3>
                    <p className="text-sm text-zinc-600">{bathroom.place_description}</p>
                  </div>
                  <span className="rounded-full bg-teal-700 px-2.5 py-1 text-xs font-semibold text-white">
                    {bathroom.free_or_paid}
                  </span>
                </div>

                <TrustBadge
                  trustScore={bathroom.trust_score}
                  confirmations={bathroom.number_of_confirmations}
                />

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-2xl bg-zinc-50 p-3">
                    <p className="text-xs text-zinc-500">Cleanliness</p>
                    <p className="font-semibold">{bathroom.cleanliness_avg}</p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 p-3">
                    <p className="text-xs text-zinc-500">Safety</p>
                    <p className="font-semibold">{bathroom.safety_avg}</p>
                  </div>
                  <div className="rounded-2xl bg-zinc-50 p-3">
                    <p className="text-xs text-zinc-500">Access</p>
                    <p className="font-semibold">{bathroom.accessibility_avg}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}