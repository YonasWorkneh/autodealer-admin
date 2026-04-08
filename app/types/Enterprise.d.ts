export interface EnterpriseProfile {
  id: number;
  first_name: string;
  last_name: string;
  contact: string;
  address: string;
  /** May be null when no avatar is set */
  image: string | null;
}

export interface Enterprise {
  id: number;
  profile: EnterpriseProfile;
  company_name: string;
  license_number: string;
  tax_id: string;
  telebirr_account: string;
  /** e.g. "SUSPENDED", "PENDING", "ACTIVE" — backend-defined */
  status: string;
  is_verified: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

export type DealerAction = "approve" | "reactivate" | "reject" | "suspend" | "verify";
