import type { BathroomStatus } from "@/lib/types";

export function getMarkerIcon(status: BathroomStatus) {
  if (typeof window === "undefined") {
    return null;
  }

  const L = require("leaflet");

  const colors = {
    open: "#059669",
    pending_review: "#f59e0b",
    uncertain: "#64748b",
    closed: "#dc2626",
  };

  const color = colors[status] || colors.uncertain;

  const svgIcon = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26C32 7.163 24.837 0 16 0z" fill="${color}"/>
      ircle cx="16" cy="16" r="6" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: "custom-marker",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
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