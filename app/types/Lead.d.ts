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

export type LeadStatus = "inquiry" | string;

export interface Lead {
  id: number;
  name: string;
  contact: string;
  status: LeadStatus;
  assigned_sales: LeadAssignedSales | null;
  car: LeadCarSummary;
  created_at: string;
}

