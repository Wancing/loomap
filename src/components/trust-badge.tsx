type Props = {
  trustScore: number;
  confirmations: number;
};

export function TrustBadge({ trustScore, confirmations }: Props) {
  const label =
    trustScore >= 80 ? "High trust" : trustScore >= 60 ? "Verified enough" : "Needs review";

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
      <span className="h-2 w-2 rounded-full bg-emerald-600" />
      <span>{label}</span>
      <span className="text-emerald-700/80">· {confirmations} confirmations</span>
    </div>
  );
}