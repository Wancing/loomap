import React from "react";
import { ShieldCheck, AlertTriangle, HelpCircle, Sparkles } from "lucide-react";

type TrustState = "community_verified" | "likely_accurate" | "data_uncertain" | "new_location";

type TrustBadgeProps = {
  state: TrustState;
  confirmations?: number;
  reports?: number;
  lastVerifiedAt?: string | null; // ISO string from API
  className?: string;
};

function formatLastVerified(dateString?: string | null) {
  if (!dateString) return "Last verified: unknown";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Last verified: unknown";

  return `Last verified: ${date.toLocaleDateString()}`;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  state,
  confirmations,
  reports,
  lastVerifiedAt,
  className = "",
}) => {
  let label = "";
  let description = "";
  let Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> = ShieldCheck;
  let colorClasses = "";

  switch (state) {
    case "community_verified":
      label = "Community verified";
      description = "Many recent confirmations, no major open issues.";
      Icon = ShieldCheck;
      colorClasses = "border-emerald-600 text-emerald-700 bg-emerald-50";
      break;
    case "likely_accurate":
      label = "Likely accurate";
      description = "Some confirmations, but data may be older or mixed.";
      Icon = AlertTriangle;
      colorClasses = "border-amber-500 text-amber-700 bg-amber-50";
      break;
    case "data_uncertain":
      label = "Data uncertain";
      description = "Few confirmations or conflicting reports.";
      Icon = HelpCircle;
      colorClasses = "border-slate-400 text-slate-700 bg-slate-50";
      break;
    case "new_location":
      label = "New location";
      description = "Recently added, not much community data yet.";
      Icon = Sparkles;
      colorClasses = "border-sky-500 text-sky-700 bg-sky-50";
      break;
  }

  const metaParts: string[] = [];

  if (typeof confirmations === "number") {
    metaParts.push(`${confirmations} confirmation${confirmations === 1 ? "" : "s"}`);
  }
  if (typeof reports === "number" && reports > 0) {
    metaParts.push(`${reports} report${reports === 1 ? "" : "s"}`);
  }

  const meta = metaParts.join(" · ");

  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium shadow-sm ${colorClasses} ${className}`}
      aria-label={`${label}. ${description}${
        meta ? `. ${meta}.` : ""
      } ${formatLastVerified(lastVerifiedAt)}.`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>

      {meta && (
        <span className="h-4 w-px bg-current/30" aria-hidden="true" />
      )}

      {meta && <span className="text-[0.7rem] opacity-80">{meta}</span>}
    </button>
  );
};