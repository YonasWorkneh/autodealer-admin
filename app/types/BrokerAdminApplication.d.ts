export interface BrokerApplicationProfile {
  id: number;
  first_name: string;
  last_name: string;
  contact: string;
  address: string;
  image: string;
}

export interface BrokerAdminApplication {
  id: number;
  profile: BrokerApplicationProfile;
  national_id: string;
  telebirr_account: string;
  status: string;
  created_at: string;
  updated_at: string;
  role: string;
}

export type BrokerAdminAction = "approve" | "reject";
