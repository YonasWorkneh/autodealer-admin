import { useQuery } from "@tanstack/react-query";
import { fetchCarViewsAnalytics, fetchCarAnalytics } from "@/lib/analyticsApi";
import type { CarViewAnalytics, CarAnalytics } from "@/app/types/Analytics";

export function useCarViewsAnalytics() {
  return useQuery<CarViewAnalytics[]>({
    queryKey: ["car-views-analytics"],
    queryFn: fetchCarViewsAnalytics,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}

export function useCarAnalytics() {
  return useQuery<CarAnalytics>({
    queryKey: ["car-analytics"],
    queryFn: fetchCarAnalytics,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}
