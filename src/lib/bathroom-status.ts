import type { Bathroom } from "@/lib/types";

export type VerificationLegendStatus =
  | "verified"
  | "pending_review"
  | "uncertain"
  | "reported_closed";

export function getVerificationStatus(
  bathroom: Pick<
    Bathroom,
    "number_of_confirmations" | "report_count" | "last_verified_at" | "status" | "source"
  >
): VerificationLegendStatus {
  const confirmations = bathroom.number_of_confirmations ?? 0;
  const reports = bathroom.report_count ?? 0;

  const lastVerifiedAt = bathroom.last_verified_at
    ? new Date(bathroom.last_verified_at).getTime()
    : null;

  const now = Date.now();
  const ninetyDays = 1000 * 60 * 60 * 24 * 90;
  const isStale =
    lastVerifiedAt === null || Number.isNaN(lastVerifiedAt)
      ? true
      : now - lastVerifiedAt > ninetyDays;

  if (bathroom.status === "closed" || reports >= 3) {
    return "reported_closed";
  }

  if (confirmations >= 3 && reports === 0 && !isStale) {
    return "verified";
  }

  if ((confirmations >= 1 && reports >= 1) || isStale) {
    return "uncertain";
  }

  return "pending_review";
}

export function getTrustScore(
  bathroom: Pick<
    Bathroom,
    "number_of_confirmations" | "report_count" | "last_verified_at" | "status"
  >
): number {
  const confirmations = bathroom.number_of_confirmations ?? 0;
  const reports = bathroom.report_count ?? 0;

  let score = 35;
  score += Math.min(confirmations * 18, 54);
  score -= Math.min(reports * 25, 75);

  const lastVerifiedAt = bathroom.last_verified_at
    ? new Date(bathroom.last_verified_at).getTime()
    : null;

  if (!lastVerifiedAt || Number.isNaN(lastVerifiedAt)) {
    score -= 10;
  } else {
    const daysOld = (Date.now() - lastVerifiedAt) / (1000 * 60 * 60 * 24);
    if (daysOld > 90) score -= 15;
    if (daysOld > 180) score -= 10;
  }

  if (bathroom.status === "closed") {
    score = Math.min(score, 15);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}