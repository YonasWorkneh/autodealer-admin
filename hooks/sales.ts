import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchSales,
  fetchSaleById,
  createSale,
  updateSale,
  deleteSale,
  fetchLeadsByCarId,
} from "@/lib/salesApi";
import type { Sale } from "@/app/types/Sale";
import type { Lead } from "@/app/types/Lead";

export function useSales() {
  return useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: fetchSales,
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ["sale", id],
    queryFn: () => fetchSaleById(id),
    enabled: !!id,
  });
}

export function useCreateSale(
  onSuccess?: (data: Sale) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (saleData: Partial<Sale>) => createSale(saleData),
    onSuccess: (data) => {
      onSuccess?.(data);
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: (error: Error) => onError?.(error),
  });
}

export function useUpdateSale(
  onSuccess?: (data: Sale) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Sale> }) =>
      updateSale(id, data),
    onSuccess: (data) => {
      onSuccess?.(data);
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sale"] });
    },
    onError: (error: Error) => onError?.(error),
  });
}

export function useDeleteSale(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSale(id),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
    onError: (error: Error) => onError?.(error),
  });
}

export function useLeadsByCarId(carId: number | null) {
  return useQuery<Lead[]>({
    queryKey: ["leads", carId],
    queryFn: () => fetchLeadsByCarId(carId as number),
    enabled: !!carId,
    staleTime: 2 * 60 * 1000,
  });
}
