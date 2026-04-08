import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchBrokerApplications,
  postBrokerAdminAction,
} from "@/lib/brokerAdminApi";
import type { BrokerAdminAction } from "@/app/types/BrokerAdminApplication";

export function useBrokerAdminApplications(enabled = true) {
  return useQuery({
    queryKey: ["brokers", "admin", "applications"],
    queryFn: fetchBrokerApplications,
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useBrokerAdminActionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      brokerId,
      action,
      reason,
    }: {
      brokerId: number;
      action: BrokerAdminAction;
      reason?: string;
    }) => postBrokerAdminAction(brokerId, action, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["brokers", "admin", "applications"],
      });
      queryClient.invalidateQueries({ queryKey: ["user-profiles"] });
    },
  });
}
