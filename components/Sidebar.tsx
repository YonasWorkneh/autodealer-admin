"use client";

import {
  LayoutDashboard,
  CarFront,
  Users,
  PackageCheck,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  BarChart3,
  Eye,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();
  const router = useRouter();
  const { clearUser } = useUserStore();

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (e) {}
    clearUser();
    router.push("/signin");
  };

  const links = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Cars", href: "/listing", icon: CarFront },
    { label: "Makes", href: "/makes", icon: Tag },
    { label: "Users", href: "/users", icon: Users },
    { label: "Sales", href: "/sales", icon: TrendingUp },
    { label: "Enterprise", href: "/enterprise", icon: PackageCheck },
  ];

  const isAuthPage = pathName.includes("signin") || pathName.includes("signup");
  if (isAuthPage) return null;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-20 bg-black flex-col items-center py-6 space-y-6 fixed left-0 top-0 h-full z-20">
        <Link
          href={"/"}
          className="w-8 h-8 rounded-lg flex flex-col items-center justify-center"
        >
          <Image src={"/wheel copy.png"} alt="logo" width={100} height={100} />
          <p className="text-xs text-white mt-2">DEALER</p>
        </Link>
        <div className="flex flex-col space-y-10 my-30">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathName === link.href
                : pathName.includes(link.href);
            return (
              <Link
                href={link.href}
                key={link.href}
                className={`hover:bg-[#fff] hover:text-black cursor-pointer size-10 rounded-full grid place-items-center ${
                  active ? " bg-white text-black" : "text-white bg-transparent"
                }`}
              >
                <link.icon className="h-6 w-6" />
              </Link>
            );
          })}
        </div>
        <div className="flex gap-10 flex-col text-white absolute bottom-10">
          <Link
            href={"/settings"}
            className="text-white hover:bg-[#fff] hover:text-black cursor-pointer size-10 rounded-full grid place-items-center"
          >
            <Settings className="size-5" />
          </Link>
          <button
            onClick={logout}
            className="text-white hover:bg-[#fff] hover:text-black cursor-pointer size-10 rounded-full grid place-items-center"
          >
            <LogOut className="size-5" />
          </button>
        </div>
      </aside>

      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 left-2 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 bg-black text-white rounded-md"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-64 bg-black flex flex-col py-6 px-4 z-[10000]"
          >
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center space-x-2">
                <Image
                  src={"/wheel copy.png"}
                  alt="logo"
                  width={40}
                  height={40}
                />
                <p className="text-white font-bold">DEALER</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white rounded-md"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="mt-10 flex flex-col space-y-6">
              {links.map((link) => {
                const active =
                  link.href === "/"
                    ? pathName === link.href
                    : pathName.includes(link.href);
                return (
                  <Link
                    href={link.href}
                    key={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                      active
                        ? "bg-white text-black"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-4 px-4 text-white">
              <Link
                href={"/settings"}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 ${
                  pathName.includes("/settings")
                    ? "!bg-white text-black"
                    : "text-white hover:bg-white/10"
                }`}
              >
                <Settings className="h-5 w-5" /> Settings
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10"
              >
                <LogOut className="h-5 w-5" /> Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
