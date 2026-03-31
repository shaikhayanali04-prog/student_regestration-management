export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-sm text-slate-500">
      {label}
    </div>
  );
}
