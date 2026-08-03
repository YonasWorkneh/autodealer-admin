export interface MakeRequest {
  id: number;
  requested_name: string;
  status: "pending" | "approved" | "rejected";
  requested_by: number;
  requested_by_email: string;
  reviewed_by: number | null;
  reviewed_by_email: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export type ModelRequest = MakeRequest;
