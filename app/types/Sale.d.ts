export interface BuyerInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  contact: string;
  loyalty_points: number;
}

export interface Sale {
  id: number;
  buyer: number;
  buyer_info: BuyerInfo;
  car: number;
  broker: number;
  dealer: number;
  price: string;
  date: string;
}
