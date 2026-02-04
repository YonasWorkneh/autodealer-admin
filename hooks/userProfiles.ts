import { useQuery } from "@tanstack/react-query";
import { fetchUserProfiles, fetchUserProfileById } from "@/lib/userProfileApi";
import type { UserProfile } from "@/app/types/UserProfile";

export function useUserProfiles() {
  return useQuery<UserProfile[]>({
    queryKey: ["user-profiles"],
    queryFn: fetchUserProfiles,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}

export function useUserProfile(id: number | null | undefined) {
  return useQuery<UserProfile>({
    queryKey: ["user-profile", id],
    queryFn: () => fetchUserProfileById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}
