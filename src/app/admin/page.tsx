"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

type Report = {
  id: string;
  bathroom_id: string;
  bathroom_name: string;
  reason: string;
  notes: string | null;
  created_at: string;
  bathroom_status: string;
  report_count: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/admin/reports");

        if (!response.ok) {
          console.error("Failed to fetch reports");
          return;
        }

        const data = await response.json();
        setReports(data.reports || []);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  return (
    <main className="container-shell space-y-6">
      <header className="flex items-center justify-between rounded-[28px] border border-zinc-200 bg-white/80 p-4 shadow-sm">
        <Logo />

        <button
          onClick={() => router.push("/")}
          className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          ← Back to map
        </button>
      </header>

      <div className="card-surface p-6">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-semibold">Moderation Dashboard</h1>
          <p className="text-sm text-zinc-600">
            Review community reports and manage bathroom listings.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded-lg bg-zinc-100"></div>
            <div className="h-20 animate-pulse rounded-lg bg-zinc-100"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
            <p className="text-sm text-zinc-600">No reports yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 transition hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <button
                      onClick={() => router.push(`/bathroom/${report.bathroom_id}`)}
                      className="text-base font-semibold text-teal-700 hover:underline"
                    >
                      {report.bathroom_name}
                    </button>
                    <p className="mt-1 text-xs text-zinc-500">
                      Reported: {new Date(report.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      report.bathroom_status === "closed"
                        ? "bg-rose-100 text-rose-800"
                        : report.bathroom_status === "uncertain"
                        ? "bg-slate-100 text-slate-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {report.bathroom_status}
                    </span>

                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
                      {report.report_count} {report.report_count === 1 ? "report" : "reports"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-zinc-700">Reason: </span>
                    <span className="text-zinc-600">{report.reason}</span>
                  </div>

                  {report.notes && (
                    <div>
                      <span className="font-medium text-zinc-700">Notes: </span>
                      <span className="text-zinc-600">{report.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}