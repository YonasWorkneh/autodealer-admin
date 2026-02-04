export interface CarView {
  car_id: number;
  user_id: number;
  user__email: string;
  first_name: string;
  last_name: string;
  contact: string;
  viewed_at: string;
  viewer_type: "registered" | "anonymous" | string;
}
