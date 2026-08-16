export type Pick = {
  month: string;
  winnerName: string;
  winnerLinkedIn: string;
  postUrl: string;
  contribution: string;
  postAvailable?: boolean;
};

/** Add one entry per announced Pick. Each month can have up to three entries. */
export const picks: readonly Pick[] = [];
