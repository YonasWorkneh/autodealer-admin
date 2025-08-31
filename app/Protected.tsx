"use client";

import React, { ReactElement, useEffect, useState } from "react";
import Loading from "./loading";
import { useUserStore } from "@/store/user";
import { useRouter } from "next/navigation";

export default function Protected({
  children,
  isLogged,
}: {
  children: ReactElement;
  isLogged: boolean;
}) {
  const [isMounted, setIsMounted] = useState(false);
  const { setUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLogged) router.push("/signin");
    const refreshUserCredentials = async () => {
      try {
        if (!isLogged) return;
        const res = await fetch("/api/me");
        const data = await res.json();
        console.log("data");
        console.log(data);
        if (!data.ok) throw new Error("error refreshing token.");
      } catch (err: any) {
        console.error(err.message);
      }
    };
    refreshUserCredentials();
    setTimeout(() => setIsMounted(true), 2000);
  }, []);
  if (!isMounted) return <Loading />;
  return <div>{children}</div>;
}
