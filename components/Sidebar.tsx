"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  CarFront,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  Tag,
  Building2,
  ClipboardList,
  MoreHorizontal,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user";
import { usePathname } from "next/navigation";

const allLinks = [
  { label: "Dashboard",   href: "/",            icon: LayoutDashboard },
  { label: "Cars",        href: "/listing",      icon: CarFront },
  { label: "Makes",       href: "/makes",        icon: Tag },
  { label: "Users",       href: "/users",        icon: Users },
  { label: "Sales",       href: "/sales",        icon: TrendingUp },
  { label: "Enterprises", href: "/enterprises",  icon: Building2 },
  { label: "Inspections", href: "/inspections",  icon: ClipboardList },
  { label: "Settings",    href: "/settings",     icon: Settings },
];

export default function Sidebar() {
  const pathName = usePathname();
  const router = useRouter();
  const { clearUser, user } = useUserStore();
  const [showMore, setShowMore] = useState(false);

  const isInspector = user.role === "inspector";
  const navLinks = isInspector
    ? allLinks.filter((l) => l.href === "/inspections" || l.href === "/settings")
    : allLinks;
  const primaryLinks = navLinks.slice(0, 4);
  const moreLinks    = navLinks.slice(4);

  const logout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (e) {}
    clearUser();
    router.push("/signin");
  };

  const isAuthPage = pathName.includes("signin") || pathName.includes("signup");
  if (isAuthPage) return null;

  const isActive = (href: string) =>
    href === "/" ? pathName === href : pathName.startsWith(href);

  const moreIsActive = moreLinks.some((l) => isActive(l.href));

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────── */}
      <aside className="hidden md:flex w-24 bg-primary flex-col items-center py-6 fixed left-0 top-0 h-full z-20">
        <Link href="/" className="flex items-center cursor-pointer shrink-0">
          <Image
            src="/logo-white.png"
            alt="hulucars"
            width={140}
            height={40}
            className="h-[80px] w-[100px]!"
          />
        </Link>

        {/* Nav links — scrollable so they never overlap the bottom buttons */}
        <div className="flex flex-col items-center gap-8 mt-10 flex-1 overflow-y-auto py-2 w-full scrollbar-none">
          {navLinks.filter((l) => l.href !== "/settings").map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className={`group relative hover:bg-white hover:text-primary cursor-pointer size-10 rounded-full grid place-items-center transition-colors shrink-0 ${
                isActive(link.href)
                  ? "bg-white text-primary"
                  : "text-primary-foreground bg-transparent"
              }`}
            >
              <link.icon className="h-6 w-6" />
              <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                {link.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Settings + Logout — always visible at the bottom */}
        <div className="flex flex-col items-center gap-6 pb-6 shrink-0">
          <Link
            href="/settings"
            className="group relative text-primary-foreground hover:bg-white hover:text-primary cursor-pointer size-10 rounded-full grid place-items-center transition-colors"
          >
            <Settings className="size-5" />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
              Settings
            </span>
          </Link>
          <button
            onClick={logout}
            className="group relative text-primary-foreground hover:bg-white hover:text-primary cursor-pointer size-10 rounded-full grid place-items-center transition-colors"
          >
            <LogOut className="size-5" />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom tab bar ─────────────────────────────────── */}
      <>
        {/* "More" panel backdrop */}
        {showMore && (
          <div
            className="md:hidden fixed inset-0 z-40"
            onClick={() => setShowMore(false)}
          />
        )}

        {/* "More" panel — slides up above the tab bar */}
        {showMore && (
          <div className="md:hidden fixed bottom-16 left-0 right-0 z-50 bg-primary border-t border-white/10 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-white text-sm font-semibold">More</span>
              <button
                onClick={() => setShowMore(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-0">
              {moreLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setShowMore(false)}
                    className={`flex flex-col items-center justify-center gap-1 py-4 px-2 transition-colors ${
                      active
                        ? "text-white bg-white/15"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <link.icon className={`h-5 w-5 shrink-0 ${active ? "scale-110" : ""} transition-transform`} />
                    <span className="text-[11px] font-medium leading-tight text-center">
                      {link.label}
                    </span>
                  </Link>
                );
              })}
              {/* Logout */}
              <button
                onClick={() => { setShowMore(false); logout(); }}
                className="flex flex-col items-center justify-center gap-1 py-4 px-2 transition-colors text-red-300 hover:text-red-200 hover:bg-white/10"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span className="text-[11px] font-medium leading-tight text-center">Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-primary border-t border-white/10">
          <div className="flex items-stretch">
            {primaryLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 transition-colors ${
                    active
                      ? "text-white bg-white/15"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <link.icon className={`h-5 w-5 shrink-0 ${active ? "scale-110" : ""} transition-transform`} />
                  <span className="text-[10px] font-medium leading-tight">{link.label}</span>
                </Link>
              );
            })}

            {/* More button — only shown when there are overflow links */}
            {moreLinks.length > 0 && <button
              onClick={() => setShowMore((v) => !v)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 px-1 transition-colors ${
                showMore || moreIsActive
                  ? "text-white bg-white/15"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <MoreHorizontal className="h-5 w-5 shrink-0" />
              <span className="text-[10px] font-medium leading-tight">More</span>
            </button>}
          </div>
        </nav>
      </>
    </>
  );
}
