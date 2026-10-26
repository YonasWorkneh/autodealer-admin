"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Flag,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  ExternalLink,
  Car,
  Mail,
  Filter,
  Eye,
  MoreVertical,
  Loader2,
  Calendar,
  MessageSquare,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCarReports, useReviewCarReport } from "@/hooks/reports";
import { useToast } from "@/hooks/use-toast";
import type { CarReport } from "@/app/types/CarReport";

// ─── Status & Reason Helpers ──────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; icon: typeof Clock }
> = {
  pending: {
    label: "Pending",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400",
    icon: Clock,
  },
  under_review: {
    label: "Under Review",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-400",
    icon: Eye,
  },
  investigating: {
    label: "Investigating",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-400",
    icon: Eye,
  },
  resolved: {
    label: "Resolved",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400",
    icon: CheckCircle2,
  },
  dismissed: {
    label: "Dismissed",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300",
    icon: XCircle,
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-400",
    icon: XCircle,
  },
};

const reasonConfig: Record<
  string,
  { label: string; badgeClass: string; icon: typeof AlertTriangle }
> = {
  suspected_fraud: {
    label: "Suspected Fraud",
    badgeClass: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400",
    icon: ShieldAlert,
  },
  incorrect_information: {
    label: "Incorrect Info",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400",
    icon: AlertTriangle,
  },
  car_already_sold: {
    label: "Car Already Sold",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400",
    icon: Car,
  },
  inappropriate_content: {
    label: "Inappropriate Content",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400",
    icon: AlertCircle,
  },
  spam: {
    label: "Spam",
    badgeClass: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
    icon: AlertCircle,
  },
  misleading_price: {
    label: "Misleading Price",
    badgeClass: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400",
    icon: AlertTriangle,
  },
  fake_photos: {
    label: "Fake Photos",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400",
    icon: ShieldAlert,
  },
  duplicate_listing: {
    label: "Duplicate Listing",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
    icon: AlertCircle,
  },
};

function formatReason(reason: string) {
  const norm = reason?.toLowerCase() ?? "";
  if (reasonConfig[norm]) return reasonConfig[norm].label;
  return (reason || "Other")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatStatus(status: string) {
  const norm = status?.toLowerCase() ?? "";
  if (statusConfig[norm]) return statusConfig[norm].label;
  return (status || "Unknown")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusBadge({ status }: { status: string }) {
  const norm = status?.toLowerCase() ?? "";
  const cfg = statusConfig[norm] ?? {
    label: formatStatus(status),
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    icon: Clock,
  };
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.badgeClass}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

function ReasonBadge({ reason }: { reason: string }) {
  const norm = reason?.toLowerCase() ?? "";
  const cfg = reasonConfig[norm] ?? {
    label: formatReason(reason),
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    icon: AlertCircle,
  };
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.badgeClass}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return format(d, "MMM d, yyyy h:mm a");
  } catch {
    return iso;
  }
}

function formatShortDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return format(d, "MMM d, yyyy");
  } catch {
    return iso;
  }
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function ReportsPage() {
  const { data: reports, isLoading, isError, error, refetch, isFetching } =
    useCarReports();
  const { showToast } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reasonFilter, setReasonFilter] = useState<string>("all");

  // View Details Modal State
  const [viewingReport, setViewingReport] = useState<CarReport | null>(null);

  // Review Modal State
  const [reviewingReport, setReviewingReport] = useState<CarReport | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>("investigating");
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [reviewDialogEl, setReviewDialogEl] = useState<HTMLDivElement | null>(null);

  const reviewReportMutation = useReviewCarReport(
    () => {
      showToast("success", "Report review submitted successfully.");
      setReviewingReport(null);
    },
    (err) => {
      showToast("error", err.message || "Failed to submit report review.");
    }
  );

  const openReviewModal = (report: CarReport) => {
    setReviewingReport(report);
    // Initialize review status to "investigating" as requested, or keep existing status if already investigating/under_review
    const current = (report.status || "").toLowerCase();
    if (["investigating", "under_review", "resolved", "dismissed", "rejected"].includes(current)) {
      setReviewStatus(current);
    } else {
      setReviewStatus("investigating");
    }
    setReviewNotes(report.review_notes || "");
  };

  const handleSubmitReview = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reviewingReport) return;
    reviewReportMutation.mutate({
      id: reviewingReport.id,
      payload: {
        status: reviewStatus,
        review_notes: reviewNotes,
      },
    });
  };

  // ── Metrics ───────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const all = reports ?? [];
    return {
      total: all.length,
      pending: all.filter((r) => (r.status || "").toLowerCase() === "pending")
        .length,
      inReview: all.filter((r) => {
        const s = (r.status || "").toLowerCase();
        return s === "under_review" || s === "investigating";
      }).length,
      resolved: all.filter((r) => (r.status || "").toLowerCase() === "resolved")
        .length,
      dismissed: all.filter((r) => {
        const s = (r.status || "").toLowerCase();
        return s === "dismissed" || s === "rejected";
      }).length,
    };
  }, [reports]);

  // Unique reasons for filter
  const uniqueReasons = useMemo(() => {
    if (!reports) return [];
    const set = new Set<string>();
    reports.forEach((r) => {
      if (r.reason) set.add(r.reason);
    });
    return Array.from(set).sort();
  }, [reports]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    if (!reports) return [];
    return reports.filter((report) => {
      // Status filter
      if (statusFilter !== "all") {
        const s = (report.status || "").toLowerCase();
        if (statusFilter === "in_review") {
          if (s !== "under_review" && s !== "investigating") return false;
        } else if (statusFilter === "closed") {
          if (s !== "resolved" && s !== "dismissed" && s !== "rejected")
            return false;
        } else if (s !== statusFilter) {
          return false;
        }
      }

      // Reason filter
      if (reasonFilter !== "all" && report.reason !== reasonFilter) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesCar = report.car_title?.toLowerCase().includes(q);
        const matchesCarId = String(report.car_id).includes(q);
        const matchesEmail = report.reporter_email?.toLowerCase().includes(q);
        const matchesReason = report.reason?.toLowerCase().includes(q);
        const matchesDesc = report.description?.toLowerCase().includes(q);
        const matchesNotes = report.review_notes?.toLowerCase().includes(q);
        const matchesReviewer = report.reviewer_email
          ?.toLowerCase()
          .includes(q);
        const matchesId = String(report.id).includes(q);

        return (
          matchesCar ||
          matchesCarId ||
          matchesEmail ||
          matchesReason ||
          matchesDesc ||
          matchesNotes ||
          matchesReviewer ||
          matchesId
        );
      }

      return true;
    });
  }, [reports, statusFilter, reasonFilter, search]);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Flag className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Customer Reports
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Inspect and review reports from customers regarding car listings
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="cursor-pointer gap-2 border-border"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── Metric Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Reports
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {isLoading ? <Skeleton className="h-8 w-14" /> : metrics.total}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Flag className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-amber-200/80 bg-amber-50/20 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">
                Pending Review
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-700">
                {isLoading ? (
                  <Skeleton className="h-8 w-14" />
                ) : (
                  metrics.pending
                )}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-blue-200/80 bg-blue-50/20 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-blue-700 uppercase tracking-wider">
                In Review
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-700">
                {isLoading ? (
                  <Skeleton className="h-8 w-14" />
                ) : (
                  metrics.inReview
                )}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Eye className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-emerald-200/80 bg-emerald-50/20 shadow-xs hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">
                Resolved
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-700">
                {isLoading ? (
                  <Skeleton className="h-8 w-14" />
                ) : (
                  metrics.resolved
                )}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Filters & Controls ───────────────────────────────────────────────── */}
      <Card className="border border-border">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: "all", label: "All", count: metrics.total },
                { id: "pending", label: "Pending", count: metrics.pending },
                { id: "in_review", label: "In Review", count: metrics.inReview },
                { id: "resolved", label: "Resolved", count: metrics.resolved },
                { id: "dismissed", label: "Dismissed", count: metrics.dismissed },
              ].map((tab) => {
                const active = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-foreground/10 text-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by car title, reporter email, reason, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10 bg-background"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Reason Filter */}
            <div className="w-full sm:w-60">
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="h-10 bg-background">
                  <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Filter by reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  {uniqueReasons.map((r) => (
                    <SelectItem key={r} value={r}>
                      {formatReason(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Content View ─────────────────────────────────────────────────────── */}
      {isLoading ? (
        <Card className="border border-border">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0"
                >
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-8 w-20 ml-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : isError ? (
        <Card className="border border-destructive/30 bg-destructive/5">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <div>
              <h3 className="text-lg font-bold text-destructive">
                Error Loading Reports
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
                {error?.message ||
                  "Could not retrieve customer reports from the server. Please check your network and try again."}
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card className="border border-dashed border-border">
          <CardContent className="p-12 text-center space-y-3">
            <div className="size-12 rounded-full bg-muted/80 text-muted-foreground flex items-center justify-center mx-auto">
              <Flag className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              No reports found
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {search || statusFilter !== "all" || reasonFilter !== "all"
                ? "No customer reports match your current filters. Try resetting the filters or modifying your search keyword."
                : "There are currently no customer car reports in the system."}
            </p>
            {(search || statusFilter !== "all" || reasonFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setReasonFilter("all");
                }}
                className="cursor-pointer"
              >
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* ── TABLE VIEW ───────────────────────────────────────────────────── */
        <Card className="border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead className="min-w-[200px]">Car</TableHead>
                  <TableHead className="min-w-[150px]">Reason</TableHead>
                  <TableHead className="min-w-[180px]">Reporter</TableHead>
                  <TableHead className="min-w-[110px]">Status</TableHead>
                  <TableHead className="min-w-[130px]">Submitted</TableHead>
                  <TableHead className="min-w-[150px]">Reviewer</TableHead>
                  <TableHead className="text-right w-28">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow
                    key={report.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* ID */}
                    <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                      #{report.id}
                    </TableCell>

                    {/* Car Title + Link */}
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/listing/${report.car_id}`}
                          className="font-medium text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
                          title="View Car Listing"
                        >
                          <span className="truncate max-w-[220px]">
                            {report.car_title || `Car #${report.car_id}`}
                          </span>
                          <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary shrink-0" />
                        </Link>
                        <span className="text-[11px] text-muted-foreground">
                          ID: {report.car_id}
                        </span>
                      </div>
                    </TableCell>

                    {/* Reason */}
                    <TableCell>
                      <ReasonBadge reason={report.reason} />
                    </TableCell>

                    {/* Reporter */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground truncate max-w-[180px]">
                          {report.reporter_email || "Anonymous"}
                        </span>
                        {report.reported_by && (
                          <span className="text-[11px] text-muted-foreground">
                            User ID: {report.reported_by}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={report.status} />
                    </TableCell>

                    {/* Submitted Date */}
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatShortDate(report.created_at)}
                    </TableCell>

                    {/* Reviewer */}
                    <TableCell>
                      {report.reviewer_email ? (
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                            {report.reviewer_email}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatShortDate(report.reviewed_at)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Unreviewed
                        </span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openReviewModal(report)}
                          className="h-8 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer font-medium"
                        >
                          Review
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 cursor-pointer"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => setViewingReport(report)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/listing/${report.car_id}`}
                                target="_blank"
                                className="cursor-pointer flex items-center"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Car Listing
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openReviewModal(report)}
                              className="cursor-pointer text-primary focus:text-primary"
                            >
                              <ShieldCheck className="h-4 w-4 mr-2" />
                              Review
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* ── View Details Dialog ────────────────────────────────────────── */}
      <Dialog
        open={!!viewingReport}
        onOpenChange={(open) => !open && setViewingReport(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewingReport && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 mr-6">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <span>Report #{viewingReport.id}</span>
                  </DialogTitle>
                  <StatusBadge status={viewingReport.status} />
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  Submitted on {formatDate(viewingReport.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-2">
                {/* Reported Car Listing */}
                <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Reported Car Listing
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-base text-foreground truncate">
                        {viewingReport.car_title || `Car #${viewingReport.car_id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Listing ID: {viewingReport.car_id}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="shrink-0 cursor-pointer gap-1.5"
                    >
                      <Link
                        href={`/listing/${viewingReport.car_id}`}
                        target="_blank"
                      >
                        <Car className="h-4 w-4" />
                        <span>Open Listing</span>
                        <ExternalLink className="h-3 w-3 ml-0.5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Reporter & Issue Details */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Customer Report
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg border border-border/80 bg-background space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> Reporter Email
                      </span>
                      <p className="font-medium text-foreground truncate">
                        {viewingReport.reporter_email || "Anonymous"}
                      </p>
                      {viewingReport.reported_by && (
                        <p className="text-[11px] text-muted-foreground">
                          User ID: {viewingReport.reported_by}
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-lg border border-border/80 bg-background space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> Report Reason
                      </span>
                      <div>
                        <ReasonBadge reason={viewingReport.reason} />
                      </div>
                    </div>
                  </div>

                  {/* Customer Description */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" /> Customer Description
                    </Label>
                    <div className="p-3.5 rounded-lg border border-border/80 bg-muted/30 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {viewingReport.description || "No description provided."}
                    </div>
                  </div>
                </div>

                {/* Review Info */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Review Status
                  </p>
                  {viewingReport.reviewed_at ? (
                    <div className="p-3.5 rounded-lg border border-border/80 bg-background space-y-2 text-sm">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Reviewed by:</span>
                        <span>{formatDate(viewingReport.reviewed_at)}</span>
                      </div>
                      <p className="font-medium text-foreground">
                        {viewingReport.reviewer_email || "Admin"}
                        {viewingReport.reviewed_by && (
                          <span className="text-muted-foreground font-normal ml-1">
                            (ID: {viewingReport.reviewed_by})
                          </span>
                        )}
                      </p>
                      {viewingReport.review_notes && (
                        <div className="mt-2 pt-2 border-t border-border/60">
                          <p className="text-xs text-muted-foreground mb-1">Review Notes:</p>
                          <p className="text-xs text-foreground/90 whitespace-pre-wrap bg-muted/20 p-2.5 rounded">
                            {viewingReport.review_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
                      This report has not been reviewed yet.
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setViewingReport(null)}
                  className="cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const rep = viewingReport;
                    setViewingReport(null);
                    openReviewModal(rep);
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Review Report</span>
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Review Report Dialog (POST /inventory/car-reports/${id}/review/) ── */}
      <Dialog
        open={!!reviewingReport}
        onOpenChange={(open) => !open && setReviewingReport(null)}
      >
        <DialogContent
          ref={setReviewDialogEl}
          className="max-w-xl max-h-[90vh] overflow-y-auto"
        >
          {reviewingReport && (
            <form onSubmit={handleSubmitReview}>
              <DialogHeader>
                <div className="flex items-center justify-between gap-2 mr-6">
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span>Review Report #{reviewingReport.id}</span>
                  </DialogTitle>
                  <StatusBadge status={reviewingReport.status} />
                </div>
                <DialogDescription className="text-xs text-muted-foreground">
                  Submit a review for car: {reviewingReport.car_title || `Car #${reviewingReport.car_id}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* Context summary */}
                <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate max-w-[280px]">
                      {reviewingReport.car_title || `Car #${reviewingReport.car_id}`}
                    </span>
                    <ReasonBadge reason={reviewingReport.reason} />
                  </div>
                  {reviewingReport.description && (
                    <p className="text-muted-foreground line-clamp-2 italic bg-background/60 p-2 rounded border border-border/40">
                      &ldquo;{reviewingReport.description}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center justify-between text-muted-foreground pt-1">
                    <span>Reported by: {reviewingReport.reporter_email || "Anonymous"}</span>
                    <span>{formatShortDate(reviewingReport.created_at)}</span>
                  </div>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="review-status" className="font-medium text-sm">
                      Status <span className="text-destructive">*</span>
                    </Label>
                    <Select value={reviewStatus} onValueChange={setReviewStatus}>
                      <SelectTrigger id="review-status" className="h-10 w-full cursor-pointer">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent
                        container={reviewDialogEl}
                        className="z-[60000] pointer-events-auto"
                        position="popper"
                      >
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="dismissed">Dismissed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      Set to &quot;investigating&quot;, &quot;under_review&quot;, or finalize with &quot;resolved&quot; / &quot;dismissed&quot;.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="review-notes" className="font-medium text-sm">
                      Review Notes <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="review-notes"
                      placeholder="Enter review notes, findings, or resolution actions..."
                      rows={4}
                      required
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="resize-none"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      This review note will be saved via the review endpoint.
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReviewingReport(null)}
                  disabled={reviewReportMutation.isPending}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={reviewReportMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer gap-2"
                >
                  {reviewReportMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Submit Review</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

