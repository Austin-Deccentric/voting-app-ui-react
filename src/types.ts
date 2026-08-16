export type Tvoter = string;
export type Tcandidate = "lillian" | "victor" | "ifeanyi";
/** Only stores candidates who have received votes (undefined means 0 votes) */
export type Tpoll = Partial<Record<Tcandidate, number>>;
/** Result winner is the leading candidate, or undefined if no votes yet. */
export interface Result {
  totalVotes: number;
  /** Leading candidate; undefined only when no votes have been cast */
  winner: Tcandidate | undefined;
  /** Vote count of the leading candidate */
  winnerVotes: number;
  /** True when two or more candidates have the same top vote count */
  isTied: boolean;
}

export type CastVoteResult =
  | { success: true }
  | { success: false; reason: "empty-name" | "already-voted" | "invalid-candidate" };