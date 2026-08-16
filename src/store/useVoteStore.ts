import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Tvoter, Tcandidate, Tpoll, Result, CastVoteResult } from "../types";

interface VoteState {
  candidates: readonly Tcandidate[];
  poll: Tpoll;
  votingRecord: Record<Tvoter, Tcandidate>;
  castVote: (voter: Tvoter, votedFor: string) => CastVoteResult;
  reset: () => void;
}

const isCandidate = (value: string, candidates: readonly Tcandidate[]): value is Tcandidate =>
  candidates.includes(value as Tcandidate);

export const selectResult = (state: VoteState): Result => {
  const { votingRecord } = state;

  const tally: Tpoll = {};
  for (const candidate of Object.values(votingRecord)) {
    tally[candidate] = (tally[candidate] ?? 0) + 1;
  }

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
    winner,
    winnerVotes: winner ? (tally[winner] ?? 0) : 0,
    isTied,
  };
};

export const useVoteStore = create<VoteState>()(
  persist(
    (set, get) => ({
      candidates: ["lillian", "victor", "ifeanyi"] as const,
      poll: {},
      votingRecord: {},

      castVote: (voter, votedFor) => {
        const trimmedVoter = voter.trim();
        const candidate = votedFor.toLowerCase().trim();
        const { candidates, votingRecord, poll } = get();

        if (trimmedVoter === "") return { success: false, reason: "empty-name" };
        if (votingRecord[trimmedVoter]) return { success: false, reason: "already-voted" };
        if (!isCandidate(candidate, candidates)) return { success: false, reason: "invalid-candidate" };

        set({
          votingRecord: { ...votingRecord, [trimmedVoter]: candidate },
          poll: { ...poll, [candidate]: (poll[candidate] ?? 0) + 1 },
        });
        return { success: true };
      },

      reset: () => set({ poll: {}, votingRecord: {} }),
    }),
    {
      name: "vote-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        poll: state.poll,
        votingRecord: state.votingRecord,
      }),
      version: 1,
      migrate: (persistedState) => {
        const state = persistedState as {
          poll?: Tpoll;
          votingRecord: Record<Tvoter, Tcandidate>;
        };
        const tally: Tpoll = {};
        for (const candidate of Object.values(state.votingRecord ?? {})) {
          tally[candidate] = (tally[candidate] ?? 0) + 1;
        }
        return { poll: tally, votingRecord: state.votingRecord ?? {} };
      },
    }
  )
);

export const selectTotalVotes = (state: VoteState) => Object.keys(state.votingRecord).length;