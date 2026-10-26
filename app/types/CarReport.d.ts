export type CarReportStatus =
  | "pending"
  | "under_review"
  | "investigating"
  | "resolved"
  | "dismissed"
  | "rejected"
  | (string & {});

export type CarReportReason =
  | "suspected_fraud"
  | "incorrect_information"
  | "car_already_sold"
  | "inappropriate_content"
  | "spam"
  | "misleading_price"
  | "fake_photos"
  | "duplicate_listing"
  | "unresponsive_seller"
  | (string & {});

export interface CarReport {
  id: number;
  car_id: number;
  car_title: string;
  reported_by: number | null;
  reporter_email: string;
  reason: CarReportReason;
  description: string;
  status: CarReportStatus;
  reviewed_by: number | null;
  reviewer_email: string | null;
  review_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateCarReportPayload {
  status?: string;
  review_notes?: string;
}

export interface ReviewCarReportPayload {
  status: string;
  review_notes: string;
}

