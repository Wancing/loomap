"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

interface ActivityItem {
  id: string;
  type: "verification" | "addition" | "edit" | "report";
  bathroomId: string;
  bathroomName: string;
  userName?: string;
  timestamp: string;
  message: string;
  confirmations?: number;
}

export default function ActivityPage() {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch("/api/activity");
        
        if (!response.ok) {
          throw new Error("Failed to fetch activity");
        }

        const data = await response.json();
        setActivities(data.activities);
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, []);

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "verification":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100">
            <svg className="h-5 w-5 text-teal-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "addition":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-5 w-5 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "edit":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-5 w-5 text-amber-700" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
        );
      case "report":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <svg className="h-5 w-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

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

      <div className="card-surface overflow-hidden">
        <div className="border-b border-zinc-200 bg-gradient-to-r from-teal-50 to-blue-50 p-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Community Activity</h1>
          <p className="mt-1 text-sm text-zinc-600">
            See what the community has been updating and verifying
          </p>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-100"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-100"></div>
                    <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-100"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-4 text-sm text-zinc-600">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-4 cursor-pointer transition hover:opacity-70"
                  onClick={() => router.push(`/bathroom/${activity.bathroomId}`)}
                >
                  {getActivityIcon(activity.type)}
                  
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900">
                      {activity.message}
                    </p>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/bathroom/${activity.bathroomId}`);
                      }}
                      className="mt-1 text-sm text-teal-700 hover:underline"
                    >
                      {activity.bathroomName}
                    </button>
                    
                    {activity.confirmations !== undefined && (
                      <p className="mt-1 text-xs text-zinc-500">
                        {activity.confirmations} {activity.confirmations === 1 ? "confirmation" : "confirmations"}
                      </p>
                    )}
                    
                    <p className="mt-1 text-xs text-zinc-400">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={() => router.push("/add")}
          className="rounded-full bg-teal-700 px-6 py-3 font-medium text-white transition hover:bg-teal-800"
        >
          + Add a bathroom
        </button>
      </div>
    </main>
  );
}