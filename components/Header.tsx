"use client";

import React from "react";
import { Input } from "./ui/input";
import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/user";

export default function Header() {
  const pathName = usePathname();
  const isAuthPage = pathName.includes("signin") || pathName.includes("signup");
  const { user } = useUserStore();

  if (isAuthPage) return null;

  return (
    <div
      className="flex items-center justify-between gap-4 sm:gap-6 mb-6 px-4 sm:px-6 fixed top-0 left-0 sm:left-20 w-full sm:w-[calc(100%-80px)] bg-white/70 z-40 py-3 sm:py-4"
      style={{ backdropFilter: "blur(20px)" }}
    >
      {/* Search */}
      <div className="flex-1 max-w-full sm:max-w-[300px] lg:max-w-[400px]">
        <div className="text-gray-600 bg-gray-100 rounded-full px-10 py-2 relative border w-full border-transparent focus-within:border-primary/20">
          <Input
            placeholder="Search for anything..."
            className="bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
          />
          <Search
            className="absolute top-1/2 -translate-y-1/2 left-4 text-primary/70"
            size={18}
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notifications */}
        <Link href={"/"} className="relative">
          <div className="bg-gray-100 size-9 sm:size-10 rounded-full grid place-items-center">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="size-2 bg-primary rounded-full absolute top-1 right-1" />
        </Link>

        {/* User info */}
        <div className="flex items-center gap-3 sm:gap-6 bg-gray-100 rounded-full px-2 sm:px-4 py-1">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww"
            alt="user-img"
            className="size-8 sm:size-10 rounded-full object-cover"
          />
          {/* Hide text on mobile */}
          <div className="hidden sm:flex items-center gap-4">
            <p className="text-sm whitespace-nowrap">
              Hello, {user.first_name}
            </p>
            <div className="text-black bg-primary/10 border border-primary/10 rounded-full px-2 py-1 text-xs sm:text-sm">
              22 May
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
