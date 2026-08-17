import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Tvoter, Tcandidate, Tpoll, Result, CastVoteResult } from "../types";

interface VoteState {
  candidates: readonly Tcandidate[];
  votingRecord: Record<Tvoter, Tcandidate>;
  castVote: (voter: Tvoter, votedFor: string) => CastVoteResult;
  reset: () => void;
}

const isCandidate = (value: string, candidates: readonly Tcandidate[]): value is Tcandidate =>
  candidates.includes(value as Tcandidate);

/** Derive the per-candidate tally from the single source of truth. */
const tallyVotes = (votingRecord: Record<Tvoter, Tcandidate>): Tpoll => {
  const tally: Tpoll = {};
  for (const candidate of Object.values(votingRecord)) {
    tally[candidate] = (tally[candidate] ?? 0) + 1;
  }
  return tally;
};

/**
 * Derives the full election result (total, winner, winner's votes, tie flag)
 * from `votingRecord`, the single source of truth.
 *
 * ⚠️ SUBSCRIBE WITH `useShallow` — NOT directly.
 * This selector returns a NEW object on every call, and Zustand's default
 * equality check is `Object.is` (reference equality). A fresh object is never
 * reference-equal to the previous one, so a plain subscription re-renders on
 * EVERY store update — and on Zustand v5 it can crash with:
 * "The result of getSnapshot should be cached to avoid an infinite loop".
 *
 * Safe because `Result` is flat (all primitive values): `useShallow` compares
 * the keys one level deep by value, so the component re-renders only when
 * totalVotes / winner / winnerVotes / isTied actually changes.
 *
 * @example
 * // ✅ Correct — in the result modal:
 * const result = useVoteStore(useShallow(selectResult));
 *
 * // ❌ Wrong — infinite-loop / re-render churn risk:
 * const result = useVoteStore(selectResult);
 *
 * Rule of thumb:
 * - Selector returns a primitive (number, string) → subscribe directly.
 * - Selector returns a fresh object/array        → wrap in `useShallow`.
 */
export const selectResult = (state: VoteState): Result => {
  const { votingRecord } = state;
  const tally = tallyVotes(votingRecord);

  let winner: Tcandidate | undefined;
  let winnerCount = -Infinity;
  let isTied = false;

  for (const [contestant, value] of Object.entries(tally)) {
    const newCount = Number(value);
    if (newCount > winnerCount) {
      winner = contestant as Tcandidate;
      winnerCount = newCount;
      isTied = false;
    } else if (newCount === winnerCount) {
      isTied = true;
    }
  }

  return {
    totalVotes: Object.keys(votingRecord).length,
    winner: isTied ? "No winner yet" : winner,
    winnerVotes: winner ? (tally[winner] ?? 0) : 0,
    isTied,
  };
};

export const selectTotalVotes = (state: VoteState) => Object.keys(state.votingRecord).length;

export const useVoteStore = create<VoteState>()(
  persist(
    (set, get) => ({
      candidates: ["lillian", "victor", "ifeanyi"] as const,
      votingRecord: {},

      castVote: (voter, votedFor) => {
        const trimmedVoter = voter.trim();
        const candidate = votedFor.toLowerCase().trim();
        const { candidates, votingRecord } = get();

        if (trimmedVoter === "") return { success: false, reason: "empty-name" };
        if (votingRecord[trimmedVoter]) return { success: false, reason: "already-voted" };
        if (!isCandidate(candidate, candidates)) return { success: false, reason: "invalid-candidate" };

        set({ votingRecord: { ...votingRecord, [trimmedVoter]: candidate } });
        return { success: true };
      },

      reset: () => set({ votingRecord: {} }),
    }),
    {
      name: "vote-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ votingRecord: state.votingRecord }),
    }
  )
);
