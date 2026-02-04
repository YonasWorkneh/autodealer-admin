import type { UserProfile } from "@/app/types/UserProfile";
import { getCredentials } from "./credential";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL as string;

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const credential = await getCredentials();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${credential.access}`,
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const errorMessage =
      errorData.detail ||
      errorData.message ||
      `API error: ${res.status} ${res.statusText}`;
    throw new Error(errorMessage);
  }

  return res.json() as Promise<T>;
}

export async function fetchUserProfiles(): Promise<UserProfile[]> {
  return fetcher<UserProfile[]>("/users/profiles");
}

export async function fetchUserProfileById(id: number): Promise<UserProfile> {
  return fetcher<UserProfile>(`/users/profiles/${id}`);
}
