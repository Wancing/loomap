export function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-lg border border-zinc-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
      <h3 className="mb-2 text-xs font-semibold text-zinc-900">Legend</h3>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-teal-600 shadow-sm"></div>
          <span className="text-zinc-700">Open & verified</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-500 shadow-sm"></div>
          <span className="text-zinc-700">Pending review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-zinc-400 shadow-sm"></div>
          <span className="text-zinc-700">Closed / uncertain</span>
        </div>
      </div>
    </div>
  );
}