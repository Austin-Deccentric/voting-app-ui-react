import { selectTotalVotes, useVoteStore } from "../store/useVoteStore";

export default function VoteCount() {
  const totalVotes = useVoteStore(selectTotalVotes);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex size-20 items-center justify-center rounded-full bg-amber-400 text-3xl font-bold text-slate-900 shadow-lg ">
        {totalVotes}
      </div>
      <span className="text-sm font-medium text-slate-400">Votes Cast</span>
    </div>
  );
}