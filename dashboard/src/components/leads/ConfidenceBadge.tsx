import { CONFIDENCE_LABEL, type Confidence } from "@/lib/leads/types";

const TONE: Record<Confidence, string> = {
  verified: "text-emerald-700",
  likely: "text-[#8a6a3d]",
  unknown: "text-[#1c1c1c]/35",
  needs_confirmation: "text-red-600",
};

export default function ConfidenceBadge({ value }: { value: Confidence }) {
  return <span className={`text-xs font-medium ${TONE[value]}`}>{CONFIDENCE_LABEL[value]}</span>;
}
