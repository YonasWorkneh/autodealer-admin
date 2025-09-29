"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile, updateProfile, upgradeProfile } from "@/lib/profileApi"; // adjust path
import { useToast } from "./use-toast";

// Fetch user profile
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });
}

// Upgrade user profile
export function useUpgradeProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: upgradeProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "✅ Success",
        description: "Your profile upgrade have been saved.",
      });
    },
  });
}

export function useUpdateProfile(onError: () => void, onSuccess: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onError: () => onError(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"],
      });
      onSuccess();
    },
  });
}
