import { scoreTier } from "@/lib/leads/scoring";

const TONE_CLASSES: Record<"high" | "medium" | "low", string> = {
  high: "bg-[#1c1c1c] text-white",
  medium: "bg-[#B08D57]/15 text-[#8a6a3d] border border-[#B08D57]/30",
  low: "bg-[#1c1c1c]/5 text-[#1c1c1c]/50 border border-[#1c1c1c]/10",
};

export default function ScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const tier = scoreTier(score);
  const sizeClasses = size === "lg" ? "h-14 w-14 text-xl" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-serif font-semibold ${sizeClasses} ${TONE_CLASSES[tier.tone]}`}
      title={tier.label}
    >
      {score}
    </div>
  );
}
