export interface CarViewAnalytics {
  car_id: number;
  car_make: string;
  car_model: string;
  total_views: number;
}

export interface DealerStats {
  dealer_id: number;
  dealer_name: string;
  total_cars: number;
  sold_cars: number;
  average_price: number;
}

export interface BrokerStats {
  broker_id: number;
  broker_name: string;
  total_cars: number;
  sold_cars: number;
  average_price: number;
}

export interface MakeStats {
  make_name: string;
  total_cars: number;
  average_price: number;
}

export interface CarAnalytics {
  total_cars: number;
  average_price: number;
  dealer_stats: DealerStats[];
  broker_stats: BrokerStats[];
  make_stats: MakeStats[];
}
