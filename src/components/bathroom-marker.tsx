import type { BathroomStatus } from "@/lib/types";
import type { VerificationLegendStatus } from "@/lib/bathroom-status";

type AnyMarkerStatus =
  | VerificationLegendStatus
  | BathroomStatus
  | string
  | undefined
  | null;

export function mapLegacyBathroomStatus(
  status: BathroomStatus | string | undefined | null
): VerificationLegendStatus {
  if (status === "closed") return "reported_closed";
  if (status === "pending_review") return "pending_review";
  if (status === "uncertain") return "uncertain";
  if (status === "open") return "verified";
  return "pending_review";
}

export function getStatusPalette(status: AnyMarkerStatus) {
  const normalizedStatus: VerificationLegendStatus =
    status === "verified" ||
    status === "pending_review" ||
    status === "uncertain" ||
    status === "reported_closed"
      ? status
      : mapLegacyBathroomStatus(status as BathroomStatus);

  const palette = {
    verified: {
      marker: "#0f9f78",
      chip: "text-emerald-700 bg-emerald-50 border-emerald-200",
      label: "Verified 3+ times",
    },
    pending_review: {
      marker: "#d97706",
      chip: "text-amber-700 bg-amber-50 border-amber-200",
      label: "Pending review",
    },
    uncertain: {
      marker: "#64748b",
      chip: "text-slate-700 bg-slate-50 border-slate-200",
      label: "Uncertain / outdated",
    },
    reported_closed: {
      marker: "#dc2626",
      chip: "text-rose-700 bg-rose-50 border-rose-200",
      label: "Reported closed",
    },
  } as const;

  return palette[normalizedStatus];
}

export function getMarkerIcon(status: AnyMarkerStatus) {
  if (typeof window === "undefined") {
    return null;
  }

  const L = require("leaflet");
  const palette = getStatusPalette(status);

  const svgIcon = `
    <svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M13 1.5C6.649 1.5 1.5 6.649 1.5 13c0 8.783 11.5 19.5 11.5 19.5S24.5 21.783 24.5 13C24.5 6.649 19.351 1.5 13 1.5Z"
        fill="${palette.marker}"
        stroke="white"
        stroke-width="2.5"
        stroke-linejoin="round"
      />
      <circle cx="13" cy="13" r="3.25" fill="white" />
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: "custom-marker",
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  });
}

export function getStatusLabel(status: AnyMarkerStatus): string {
  return getStatusPalette(status).label;
}

export function getStatusColor(status: AnyMarkerStatus): string {
  return getStatusPalette(status).chip;
}