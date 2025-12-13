import type { Make } from "./Make";

export interface Model {
  id: number;
  name: string;
  make?: Make | number;
  make_id?: number;
}
