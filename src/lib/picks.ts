export type Pick = {
  month: string;
  winnerName: string;
  winnerLinkedIn: string;
  postUrl: string;
  contribution: string;
};

/** Add monthly winners here. The page renders the launch state while empty. */
export const picks: readonly Pick[] = [];
