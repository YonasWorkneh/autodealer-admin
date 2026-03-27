import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDealers,
  dealerAction,
  registerDealer,
} from "@/lib/dealersApi";
import type { DealerAction as DealerActionType } from "@/app/types/Enterprise";
import type {
  DealerActionPayload,
  RegisterDealerPayload,
} from "@/lib/dealersApi";

export function useDealers() {
  return useQuery({
    queryKey: ["dealers", "admin"],
    queryFn: fetchDealers,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDealerAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      payload,
    }: {
      id: number;
      action: DealerActionType;
      payload?: DealerActionPayload;
    }) => dealerAction(id, action, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealers", "admin"] });
    },
  });
}

export function useRegisterDealer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterDealerPayload) => registerDealer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dealers", "admin"] });
    },
  });
}
