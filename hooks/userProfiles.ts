import { useQuery } from "@tanstack/react-query";
import { fetchUserProfiles } from "@/lib/userProfileApi";
import type { UserProfile } from "@/app/types/UserProfile";

export function useUserProfiles() {
  return useQuery<UserProfile[]>({
    queryKey: ["user-profiles"],
    queryFn: fetchUserProfiles,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });
}
