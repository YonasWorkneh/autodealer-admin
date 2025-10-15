"use client";

import React, { ReactElement, useEffect } from "react";
import { useUserStore } from "@/store/user";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function Protected({
  children,
  isLogged,
}: {
  children: ReactElement;
  isLogged: boolean;
}) {
  const { setUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // Redirect to signin if not logged in
    if (!isLogged) {
      router.push("/signin");
      return;
    }

    // Refresh user credentials in the background
    const refreshUserCredentials = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (!data.ok) throw new Error("error refreshing token.");
        if (!data.user) throw new Error("Error refreshing user.");
        console.log(data.user);
        setUser(data.user);
      } catch (err: any) {
        console.error(err.message);
        // Optionally redirect to signin on error
        // router.push("/signin");
      }
    };

    // Execute in background without blocking render
    refreshUserCredentials();
  }, [isLogged, router, setUser]);

  // Render immediately without waiting
  return (
    <div>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </div>
  );
}
