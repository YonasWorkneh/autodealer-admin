export interface LeadAssignedSales {
  id: number;
  email: string;
  full_name: string;
}

export interface LeadCarSummary {
  id: number;
  make: string;
  model: string;
}

export type LeadStatus =
  | "inquiry"
  | "contacted"
  | "negotiation"
  | "closed"
  | "lost"
  | "cancelled"
  | string;

export interface Lead {
  id: number;
  name: string;
  contact: string;
  status: LeadStatus;
  assigned_sales: LeadAssignedSales | null;
  car: LeadCarSummary;
  created_at: string;
}

export interface LeadListItem {
  id: number;
  buyer_name: string;
  car_info: { id: number; make: string; model: string } | null;
  name: string;
  contact: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  buyer: number;
  assigned_sales: number;
  car: number;
  closed_by: number | null;
}

