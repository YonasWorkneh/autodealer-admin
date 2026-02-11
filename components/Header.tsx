"use client";

import React from "react";
import { Input } from "./ui/input";
import { Bell, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/user";
import { useNotifications } from "@/hooks/use-notifications";
import { Notification } from "@/app/types/notification";

import { useProfile } from "@/hooks/useProfile";

export default function Header() {
  const pathName = usePathname();
  const isAuthPage = pathName.includes("signin") || pathName.includes("signup");
  const { user } = useUserStore();
  const { notifications } = useNotifications();
  const { profile } = useProfile();

  const unreadNotifications =
    notifications?.filter(
      (notification: Notification) => !notification.is_read,
    ) ?? [];

  if (isAuthPage) return null;

  return (
    <div
      className="flex items-center justify-between gap-4 sm:gap-6 mb-6 px-4 sm:px-6 fixed top-0 left-0 sm:left-20 w-full sm:w-[calc(100%-80px)] bg-white/70 z-40 py-3 sm:py-4"
      style={{ backdropFilter: "blur(20px)" }}
    >
      <div />{/* Right section */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notifications */}
        <Link href={"/notifications"} className="relative">
          <div className="bg-gray-100 size-9 sm:size-10 rounded-full grid place-items-center">
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          {unreadNotifications.length > 0 && (
            <div className="size-2 bg-primary rounded-full absolute top-1 right-1" />
          )}
        </Link>

        {/* User info */}
        <div className="flex items-center gap-3 sm:gap-6 bg-gray-100 rounded-full px-2 sm:px-4 py-1">
          {profile?.image ? (
            <img
              src={profile?.image}
              alt="user-img"
              className="size-8 sm:size-10 rounded-full object-cover"
            />
          ) : user.first_name ? (
            <User className="size-4 sm:size-5 text-primary">
              {user.first_name?.charAt(0)}
              {user.last_name?.charAt(0)}
            </User>
          ) : (
            <User className="size-4 sm:size-5 text-primary" />
          )}

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
