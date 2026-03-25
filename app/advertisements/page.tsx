"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Search,
  Megaphone,
  Plus,
  Calendar,
  MousePointerClick,
  Eye,
  CircleAlert,
  RefreshCw,
  LayoutDashboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { useAdvertisements } from "@/hooks/advertisements";
import { Skeleton } from "@/components/ui/skeleton";
import type { Advertisement } from "@/app/types/Advertisement";

function formatDate(iso: string) {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "active" || s === "approved") {
    return (
      <Badge className="bg-emerald-600 text-white rounded-full capitalize">
        {status}
      </Badge>
    );
  }
  if (s === "pending") {
    return (
      <Badge
        variant="secondary"
        className="rounded-full capitalize border-amber-500/40 text-amber-800"
      >
        {status}
      </Badge>
    );
  }
  if (s === "rejected" || s === "expired") {
    return (
      <Badge variant="destructive" className="rounded-full capitalize">
        {status}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-full capitalize">
      {status}
    </Badge>
  );
}

export default function AdvertisementsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: ads, isLoading, error, refetch } = useAdvertisements();

  const filtered = useMemo(() => {
    if (!ads?.length) return [];
    if (!searchQuery.trim()) return ads;
    const q = searchQuery.toLowerCase();
    return ads.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q) ||
        a.owner_type.toLowerCase().includes(q) ||
        a.target_type.toLowerCase().includes(q)
    );
  }, [ads, searchQuery]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-8 w-56 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-6">
                <Skeleton className="h-24 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    const technical =
      error instanceof Error ? error.message : "Something went wrong.";
    return (
      <div className="p-4 sm:p-8 min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center">
        <Card className="w-full max-w-md overflow-hidden border-border/80 shadow-md">
          <div className="relative bg-linear-to-b from-muted/60 to-muted/20 px-8 pt-12 pb-8 text-center border-b border-border/50">
            <div className="pointer-events-none absolute inset-0 bg-primary/[0.06]" />
            <div className="relative mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-background/80 text-destructive shadow-sm ring-1 ring-border backdrop-blur-sm">
              <CircleAlert className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <h2 className="relative text-xl font-semibold tracking-tight mb-2">
              Couldn&apos;t load advertisements
            </h2>
            <p className="relative text-sm text-muted-foreground leading-relaxed max-w-[280px] mx-auto">
              We couldn&apos;t reach the server. Check your connection, then try
              again. If the problem continues, the service may be temporarily
              unavailable.
            </p>
          </div>
          <CardContent className="p-6 space-y-4">
            <Button
              className="w-full h-11"
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: ["advertisements"],
                });
                refetch();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <details className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-left transition-colors hover:bg-muted/45 open:bg-muted/40">
              <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground flex items-center justify-between gap-2 py-1 select-none [&::-webkit-details-marker]:hidden">
                <span>Technical details</span>
              </summary>
              <p className="mt-2 mb-1 text-xs font-mono text-muted-foreground/90 wrap-break-word leading-relaxed border-t border-border/40 pt-2">
                {technical}
              </p>
            </details>
            <Button variant="ghost" className="w-full text-muted-foreground" asChild>
              <Link href="/">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" />
            Advertisements
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage campaigns, dates, and performance.
          </p>
        </div>
        <Button asChild>
          <Link href="/advertisements/new">
            <Plus className="h-4 w-4 mr-2" />
            Create advert
          </Link>
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by title, status, owner or target…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {!filtered.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {ads?.length === 0
              ? "No advertisements yet. Create one to get started."
              : "No ads match your search."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((ad: Advertisement) => (
            <Card
              key={ad.id}
              className="overflow-hidden border-border/60 hover:border-border transition-colors"
            >
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-44 h-40 sm:h-auto shrink-0 bg-muted relative">
                    {ad.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ad.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-4 sm:p-6 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h2 className="text-lg font-semibold leading-tight pr-2">
                        {ad.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2">
                        {statusBadge(ad.status)}
                        {ad.is_active ? (
                          <Badge variant="outline" className="rounded-full">
                            Live
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="rounded-full">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {ad.description}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <span className="capitalize">
                        {ad.owner_type} · ID {ad.owner_id}
                      </span>
                      <span className="capitalize">
                        {ad.target_type} · ID {ad.target_id}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(ad.start_date)} – {formatDate(ad.end_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {ad.views.toLocaleString()} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="h-3.5 w-3.5" />
                        {ad.clicks.toLocaleString()} clicks
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
