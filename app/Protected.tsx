"use client";

import React, { ReactElement, useEffect, useState } from "react";
import { useUserStore } from "@/store/user";
import { useRouter, usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const queryClient = new QueryClient();

const authRoutes = ["/signin", "/signup", "/forgot-password", "/reset"];
const INSPECTOR_ALLOWED = ["/inspections", "/settings"];

export default function Protected({
  children,
  isLogged,
}: {
  children: ReactElement;
  isLogged: boolean;
}) {
  const { setUser, user } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  const isAuthRoute = authRoutes.some((route) => pathname?.startsWith(route));

  useEffect(() => {
    setMounted(true);

    if (isAuthRoute) return;

    if (!isLogged) {
      router.push("/signin");
      return;
    }

    const refreshUserCredentials = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (!data.ok) throw new Error("error refreshing token.");
        if (!data.user) throw new Error("Error refreshing user.");
        setUser(data.user);
      } catch (err: any) {
        console.error(err.message);
      } finally {
        setUserLoaded(true);
      }
    };

    refreshUserCredentials();
  }, [isLogged, router, setUser, isAuthRoute]);

  // Role-based route guard — runs whenever the role or path changes
  useEffect(() => {
    if (!userLoaded || isAuthRoute) return;
    if (user.role === "inspector") {
      const allowed = INSPECTOR_ALLOWED.some((p) => pathname?.startsWith(p));
      if (!allowed) router.replace("/inspections");
    }
  }, [userLoaded, user.role, pathname, isAuthRoute, router]);

  if (!mounted) return null;

  if (isAuthRoute) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  // While we don't yet know the role, show nothing to prevent a flash of
  // restricted content before the redirect fires.
  if (!userLoaded) return null;

  // Inspector trying to access a restricted page — hold until redirect fires
  if (
    user.role === "inspector" &&
    !INSPECTOR_ALLOWED.some((p) => pathname?.startsWith(p))
  ) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Sidebar />
      <main className="flex-1 md:ml-16 max-h-screen p-4 py-0 bg-white pt-20 pb-20 md:pb-0">
        <Header />
        <div className="root">{children}</div>
      </main>
    </QueryClientProvider>
  );
}
