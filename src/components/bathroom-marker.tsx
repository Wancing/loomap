import type { BathroomStatus } from "@/lib/types";

export function getMarkerIcon(status: BathroomStatus) {
  if (typeof window === "undefined") {
    return null;
  }

  const L = require("leaflet");

  const colors = {
    open: "#0f9f78",
    pending_review: "#d97706",
    uncertain: "#64748b",
    closed: "#dc2626",
  };

  const color = colors[status] || colors.uncertain;

  const svgIcon = `
    <svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M13 1.5C6.649 1.5 1.5 6.649 1.5 13c0 8.783 11.5 19.5 11.5 19.5S24.5 21.783 24.5 13C24.5 6.649 19.351 1.5 13 1.5Z"
        fill="${color}"
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

export function getStatusLabel(status: BathroomStatus): string {
  const labels = {
    open: "Open",
    pending_review: "Pending review",
    uncertain: "Status uncertain",
    closed: "Closed",
  };

  return labels[status] || "Unknown";
}

export function getStatusColor(status: BathroomStatus): string {
  const colors = {
    open: "text-emerald-700 bg-emerald-50 border-emerald-200",
    pending_review: "text-amber-700 bg-amber-50 border-amber-200",
    uncertain: "text-slate-700 bg-slate-50 border-slate-200",
    closed: "text-rose-700 bg-rose-50 border-rose-200",
  };

  return colors[status] || colors.uncertain;
}