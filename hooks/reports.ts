import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCarReports,
  fetchCarReportById,
  updateCarReport,
  deleteCarReport,
  reviewCarReport,
} from "@/lib/carReportApi";
import type {
  CarReport,
  UpdateCarReportPayload,
  ReviewCarReportPayload,
} from "@/app/types/CarReport";

export function useCarReports() {
  return useQuery<CarReport[]>({
    queryKey: ["car-reports"],
    queryFn: fetchCarReports,
  });
}

export function useCarReport(id: number) {
  return useQuery<CarReport>({
    queryKey: ["car-reports", id],
    queryFn: () => fetchCarReportById(id),
    enabled: id > 0,
  });
}

export function useUpdateCarReport(
  onSuccess?: (data: CarReport) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCarReportPayload;
    }) => updateCarReport(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["car-reports"] });
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

export function useDeleteCarReport(
  onSuccess?: () => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCarReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-reports"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

export function useReviewCarReport(
  onSuccess?: (data: CarReport) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ReviewCarReportPayload;
    }) => reviewCarReport(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["car-reports"] });
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      onError?.(error);
    },
  });
}

