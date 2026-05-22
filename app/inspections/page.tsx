"use client";

import { useState } from "react";
import {
  ClipboardList,
  Search,
  Calendar,
  User,
  FileText,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Car,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useInspections, useVerifyInspection } from "@/hooks/cars";
import { useToast } from "@/hooks/use-toast";
import type { Inspection, InspectionCondition, InspectionStatus } from "@/app/types/Inspection";

const conditionConfig: Record<InspectionCondition, { label: string; className: string }> = {
  excellent: { label: "Excellent", className: "bg-green-100 text-green-800 border-green-200" },
  good:      { label: "Good",      className: "bg-blue-100 text-blue-800 border-blue-200" },
  fair:      { label: "Fair",      className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  poor:      { label: "Poor",      className: "bg-red-100 text-red-800 border-red-200" },
};

const statusConfig: Record<InspectionStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending:  { label: "Pending",  icon: Clock,        className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  verified: { label: "Verified", icon: CheckCircle2, className: "bg-green-100 text-green-800 border-green-200" },
  rejected: { label: "Rejected", icon: XCircle,      className: "bg-red-100 text-red-800 border-red-200" },
};

function InspectionCard({ inspection }: { inspection: Inspection }) {
  const { showToast } = useToast();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [adminRemarks, setAdminRemarks] = useState("");

  const verifyMutation = useVerifyInspection(
    () => showToast("success", `Inspection verified successfully.`),
    (err) => showToast("error", err.message || "Failed to verify inspection."),
  );

  const rejectMutation = useVerifyInspection(
    () => {
      showToast("success", "Inspection rejected.");
      setRejectOpen(false);
      setAdminRemarks("");
    },
    (err) => showToast("error", err.message || "Failed to reject inspection."),
  );

  const basePayload = {
    car_id: inspection.car.id,
    inspected_by: inspection.inspected_by ?? "",
    inspection_date: inspection.inspection_date ?? "",
    remarks: inspection.remarks ?? "",
    condition_status: inspection.condition_status,
    report_document: inspection.report_document ?? "",
    admin_remarks: adminRemarks,
  };

  const handleVerify = () => {
    verifyMutation.mutate({ id: inspection.id, payload: { ...basePayload, status: "verified", admin_remarks: "" } });
  };

  const handleReject = () => {
    rejectMutation.mutate({ id: inspection.id, payload: { ...basePayload, status: "rejected", admin_remarks: adminRemarks } });
  };

  const status = statusConfig[inspection.status] ?? statusConfig.pending;
  const condition = conditionConfig[inspection.condition_status] ?? conditionConfig.fair;
  const StatusIcon = status.icon;
  const isBusy = verifyMutation.isPending || rejectMutation.isPending;

  return (
    <>
      <Card className="hover:shadow-md transition-shadow flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground shrink-0" />
              <CardTitle className="text-base capitalize">
                {inspection.car_display || `${inspection.car.make} ${inspection.car.model}`}
              </CardTitle>
            </div>
            <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${status.className}`}>
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </span>
              <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${condition.className}`}>
                {condition.label}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 flex-1 flex flex-col">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate">
                <span className="text-foreground font-medium">Inspector: </span>
                {inspection.inspected_by || "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                <span className="text-foreground font-medium">Date: </span>
                {inspection.inspection_date
                  ? new Date(inspection.inspection_date).toLocaleDateString()
                  : "—"}
              </span>
            </div>
            {inspection.verified_by_email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  <span className="text-foreground font-medium">Verified by: </span>
                  {inspection.verified_by_email}
                </span>
              </div>
            )}
            {inspection.verified_at && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  <span className="text-foreground font-medium">Verified at: </span>
                  {new Date(inspection.verified_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {inspection.remarks && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
              <p className="text-xs font-medium text-muted-foreground mb-1">Remarks</p>
              <p className="text-foreground">{inspection.remarks}</p>
            </div>
          )}

          {inspection.admin_remarks && (
            <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2 text-sm">
              <p className="text-xs font-medium text-blue-600 mb-1">Admin Remarks</p>
              <p className="text-blue-900">{inspection.admin_remarks}</p>
            </div>
          )}

          {inspection.report_url && (
            <a
              href={inspection.report_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <FileText className="h-4 w-4" />
              View Report
              <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <p className="text-xs text-muted-foreground">
            Uploaded {new Date(inspection.uploaded_at).toLocaleString()}
          </p>

          {/* Action buttons — shown unless already in the target state */}
          {inspection.status !== "approved" || inspection.status !== "rejected" ? (
            <div className="flex gap-2 pt-1 mt-auto border-t border-border">
              {inspection.status !== "verified" && (
                <Button
                  size="sm"
                  className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 border border-green-200 cursor-pointer"
                  disabled={isBusy}
                  onClick={handleVerify}
                >
                  {verifyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {verifyMutation.isPending ? "Verifying…" : "Verify"}
                </Button>
              )}
              {inspection.status !== "rejected" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 cursor-pointer"
                  disabled={isBusy}
                  onClick={() => setRejectOpen(true)}
                >
                  {rejectMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {rejectMutation.isPending ? "Rejecting…" : "Reject"}
                </Button>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Reject dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Inspection</DialogTitle>
            <DialogDescription>
              You are about to reject the inspection for{" "}
              <strong>
                {inspection.car_display || `${inspection.car.make} ${inspection.car.model}`}
              </strong>
              . Provide an optional reason for the rejection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Textarea
              placeholder="Admin remarks (optional)…"
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              className="bg-gray-100 hover:bg-gray-200 cursor-pointer"
              onClick={() => { setRejectOpen(false); setAdminRemarks(""); }}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              className="bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 cursor-pointer"
              disabled={rejectMutation.isPending}
              onClick={handleReject}
            >
              {rejectMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Rejecting…</>
              ) : (
                "Confirm Reject"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function InspectionsPage() {
  const [search, setSearch] = useState("");
  const { data: inspections, isLoading, error } = useInspections();

  const filtered = inspections?.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.car_display?.toLowerCase().includes(q) ||
      i.car.make?.toLowerCase().includes(q) ||
      i.car.model?.toLowerCase().includes(q) ||
      i.inspected_by?.toLowerCase().includes(q) ||
      i.status?.toLowerCase().includes(q) ||
      i.condition_status?.toLowerCase().includes(q)
    );
  });

  const counts = {
    total:    inspections?.length ?? 0,
    pending:  inspections?.filter((i) => i.status === "pending").length ?? 0,
    approved: inspections?.filter((i) => i.status === "verified").length ?? 0,
    rejected: inspections?.filter((i) => i.status === "rejected").length ?? 0,
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-1">Car Inspections</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Review and manage all vehicle inspection reports.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",    value: counts.total,    icon: ClipboardList, className: "text-foreground" },
          { label: "Pending",  value: counts.pending,  icon: Clock,         className: "text-yellow-600" },
          { label: "Verified", value: counts.approved, icon: CheckCircle2,  className: "text-green-600" },
          { label: "Rejected", value: counts.rejected, icon: XCircle,       className: "text-red-600" },
        ].map(({ label, value, icon: Icon, className }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <Icon className={`h-8 w-8 ${className}`} />
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? <Skeleton className="h-7 w-8 inline-block" /> : value}
                </p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-96 mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          type="text"
          placeholder="Search by car, inspector, status…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-4 py-2.5 w-full rounded-full border border-input bg-background text-sm focus:outline-none focus:border-primary"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-6">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="font-semibold">Failed to load inspections</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((inspection) => (
            <InspectionCard key={inspection.id} inspection={inspection} />
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <ClipboardList className="h-10 w-10 text-muted-foreground opacity-50" />
            <p className="font-semibold">
              {search ? "No inspections match your search." : "No inspections found."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
