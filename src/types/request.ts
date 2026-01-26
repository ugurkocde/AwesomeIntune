// Tool Request Types

export type RequestStatus = "open" | "in_progress" | "completed" | "closed";

export interface ToolRequest {
  id: string;
  title: string;
  description: string;
  use_case: string | null;
  category: string | null;
  github_issue_number: number;
  github_issue_url: string;
  status: RequestStatus;
  fulfilled_tool_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ToolRequestVoteCount {
  request_id: string;
  vote_count: number;
}

export interface ToolRequestVote {
  id: string;
  request_id: string;
  voter_id: string;
  voted_at: string;
}

// Combined type for display with vote count
export interface ToolRequestWithVotes extends ToolRequest {
  vote_count: number;
}

// API response types
export interface ToolRequestListResponse {
  requests: ToolRequestWithVotes[];
  total: number;
}

export interface ToolRequestCreateResponse {
  success: boolean;
  message: string;
  issueNumber: number;
  issueUrl: string;
  requestId: string;
}

export interface ToolRequestVoteResponse {
  success: boolean;
  result: "voted" | "already_voted";
}
