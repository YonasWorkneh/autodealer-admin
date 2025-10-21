export interface LoyaltyProgram {
  id: number;
  points: number;
  reward: string;
  created_at: string;
}

export interface BuyerProfile {
  loyalty_points: number;
  loyalty_programs: LoyaltyProgram[];
}

export interface DealerProfile {
  id: number;
  profile: {
    id: number;
    first_name: string;
    last_name: string;
    contact: string;
    address: string;
    image: string;
  };
  role: string;
  company_name: string;
  license_number: string;
  tax_id: string;
  telebirr_account: string;
  is_verified: boolean;
}

export interface BrokerProfile {
  id: number;
  profile: number;
  national_id: string;
  telebirr_account: string;
  is_verified: boolean;
  role: string;
}

export interface UserProfile {
  id: number;
  user: number;
  first_name: string;
  last_name: string;
  contact: string;
  address: string;
  role: string;
  image: string;
  image_url: string;
  created_at: string;
  updated_at: string;
  buyer_profile: BuyerProfile | null;
  dealer_profile: DealerProfile | null;
  broker_profile: BrokerProfile | null;
}
