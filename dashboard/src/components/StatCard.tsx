export default function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-white/40">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      {hint && <div className="text-xs text-white/40">{hint}</div>}
    </div>
  );
}
