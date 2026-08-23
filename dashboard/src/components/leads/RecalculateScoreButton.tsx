import { recalculateScore } from "@/app/leads/[id]/actions";

export default function RecalculateScoreButton({ leadId }: { leadId: string }) {
  const bound = recalculateScore.bind(null, leadId);
  return (
    <form action={bound}>
      <button type="submit" className="text-xs font-medium text-[#8a6a3d] hover:underline">
        Recalculate score
      </button>
    </form>
  );
}
