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
    <div className="rounded-lg border border-[#1c1c1c]/10 bg-white px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-[#1c1c1c]/45">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-[#1c1c1c]">{value}</div>
      {hint && <div className="text-xs text-[#1c1c1c]/45">{hint}</div>}
    </div>
  );
}
