export type InspectionCondition = "excellent" | "good" | "fair" | "poor";
export type InspectionStatus = "pending" | "verified" | "rejected";

export interface Inspector {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  license_number: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateInspectorPayload {
  email: string;
  first_name: string;
  last_name: string;
  company_name: string;
  license_number: string;
  password: string;
}

export type UpdateInspectorPayload = Partial<Omit<CreateInspectorPayload, "password">>;

export interface Inspection {
  id: number;
  car: {
    id: number;
    make: string;
    model: string;
  };
  car_display: string;
  inspected_by: string;
  inspection_date: string;
  remarks: string;
  condition_status: InspectionCondition;
  report_document: string;
  report_url: string;
  status: InspectionStatus;
  verified_by_email: string;
  verified_at: string;
  admin_remarks: string;
  uploaded_by: number;
  uploaded_at: string;
  created_at: string;
  updated_at: string;
}
