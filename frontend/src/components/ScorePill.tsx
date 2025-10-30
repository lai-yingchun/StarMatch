export const ScorePill = ({ score }: { score: number }) => (
  <div className="px-3 py-1 rounded-full bg-white border shadow-sm text-slate-700 text-sm min-w-[56px] text-center">
    {score.toFixed(1)}/10
  </div>
);