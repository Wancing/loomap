export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9 text-teal-700"
        fill="none"
        aria-label="Loomap logo"
      >
        <rect x="6" y="6" width="36" height="36" rx="12" stroke="currentColor" strokeWidth="3" />
        <path
          d="M24 14C18.5 14 14 18.4 14 23.8C14 31 24 38 24 38C24 38 34 31 34 23.8C34 18.4 29.5 14 24 14Z"
          fill="currentColor"
          opacity="0.15"
        />
        <circle cx="24" cy="24" r="5" fill="currentColor" />
      </svg>
      <div>
        <p className="text-sm font-semibold tracking-tight">loomap</p>
        <p className="text-xs text-zinc-500">community bathroom map</p>
      </div>
    </div>
  );
}