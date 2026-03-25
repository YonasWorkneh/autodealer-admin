import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdvertisements,
  createAdvertisement,
} from "@/lib/advertisementsApi";
import type { CreateAdvertisementPayload } from "@/app/types/Advertisement";

export function useAdvertisements() {
  return useQuery({
    queryKey: ["advertisements"],
    queryFn: fetchAdvertisements,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateAdvertisement(
  onSuccess?: (data: unknown) => void,
  onError?: (error: Error) => void
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdvertisementPayload) =>
      createAdvertisement(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
      onSuccess?.(data);
    },
    onError: (error: Error) => onError?.(error),
  });
}
