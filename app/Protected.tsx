"use client";

import React, { ReactElement, useEffect, useState } from "react";
import { useUserStore } from "@/store/user";
import { useRouter, usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const queryClient = new QueryClient();

const authRoutes = ["/signin", "/signup", "/forgot-password", "/reset"];

export default function Protected({
  children,
  isLogged,
}: {
  children: ReactElement;
  isLogged: boolean;
}) {
  const { setUser } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const isAuthRoute = authRoutes.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    setMounted(true);
    
    // Allow auth routes without redirecting
    if (isAuthRoute) {
      return;
    }

    // Redirect to signin if not logged in and not on auth route
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
  }, [isLogged, router, setUser, isAuthRoute]);

  // Render immediately without waiting
  if (!mounted) return null;

  // For auth routes, render children directly without sidebar/header
  if (isAuthRoute) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  // For protected routes, render with sidebar and header
  return (
    <QueryClientProvider client={queryClient}>
      <Sidebar />
      <main className="flex-1 md:ml-16 max-h-screen p-4 py-0 bg-white pt-20">
        <Header />
        <div className="root">{children}</div>
      </main>
    </QueryClientProvider>
  );
}
