export type AdvertOwnerType = "broker" | "dealer";

export type AdvertTargetType = "car" | string;

export interface Advertisement {
  id: number;
  owner_type: string;
  owner_id: number;
  target_type: string;
  target_id: number;
  title: string;
  description: string;
  image: string;
  status: string;
  start_date: string;
  end_date: string;
  views: number;
  clicks: number;
  is_active: boolean;
  created_at: string;
  created_by: number;
}

export interface CreateAdvertisementPayload {
  owner_type: string;
  owner_id: number;
  target_type: string;
  target_id: number;
  title: string;
  description: string;
  image: string;
  status: string;
  start_date: string;
  end_date: string;
  views: number;
  clicks: number;
}
