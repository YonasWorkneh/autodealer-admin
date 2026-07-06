"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  PauseCircle,
  Loader2,
  Maximize2,
  X,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDealer, useDealerAction } from "@/hooks/dealers";
import { useToast } from "@/components/ui/use-toast";
import type { DealerAction } from "@/app/types/Enterprise";
import type { DealerActionPayload } from "@/lib/dealersApi";

function statusBadge(status: string) {
  const s = (status || "").toUpperCase();
  if (s.includes("SUSPEND") || s.includes("REJECT")) {
    return (
      <Badge variant="destructive" className="rounded-full uppercase">
        {status}
      </Badge>
    );
  }
  if (s.includes("PENDING") || s.includes("REVIEW")) {
    return (
      <Badge variant="secondary" className="rounded-full uppercase">
        {status}
      </Badge>
    );
  }
  if (s.includes("ACTIVE") || s.includes("APPROV") || s.includes("VERIF")) {
    return (
      <Badge className="bg-emerald-600 text-white rounded-full uppercase">
        {status}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-full uppercase">
      {status || "—"}
    </Badge>
  );
}

function isImageUrl(url: string) {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext ?? "");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const ACTION_CONFIG: Record<
  DealerAction,
  { label: string; icon: typeof CheckCircle2; variant?: "destructive" }
> = {
  approve: { label: "Approve", icon: CheckCircle2 },
  verify: { label: "Verify", icon: ShieldCheck },
  reactivate: { label: "Reactivate", icon: RefreshCw },
  suspend: { label: "Suspend", icon: PauseCircle },
  reject: { label: "Reject", icon: XCircle, variant: "destructive" },
};

export default function EnterpriseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const { data: enterprise, isLoading, error } = useDealer(numericId);
  const actionMutation = useDealerAction();
  const { toast } = useToast();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actingAction, setActingAction] = useState<DealerAction | null>(null);

  const handleAction = async (
    action: DealerAction,
    payload?: DealerActionPayload,
  ) => {
    setActingAction(action);
    try {
      await actionMutation.mutateAsync({ id: numericId, action, payload });
      toast({
        variant: "success",
        title: "Action successful",
        description: `${ACTION_CONFIG[action].label} completed.`,
      });
      if (action === "reject") {
        setRejectOpen(false);
        setRejectReason("");
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Action failed",
        description: e instanceof Error ? e.message : "Something went wrong.",
      });
    } finally {
      setActingAction(null);
    }
  };

  const submitReject = () => {
    const reason = rejectReason.trim();
    if (!reason) {
      toast({
        variant: "destructive",
        title: "Rejection reason required",
        description: "Please enter a reason before rejecting.",
      });
      return;
    }
    handleAction("reject", { rejection_reason: reason });
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !enterprise) {
    return (
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <Link
          href="/enterprises"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Enterprises
        </Link>
        <Card className="border-destructive/30">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Enterprise not found</h2>
            <p className="text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Could not load this enterprise."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const p = enterprise.profile;
  const fullName =
    [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "—";

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Back */}
      <Link
        href="/enterprises"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Enterprises
      </Link>

      {/* Header card */}
      <Card className="border border-primary/10 overflow-hidden mb-6">
        {/* Business licence banner */}
        {enterprise.business_license && (
          <div className="relative w-full h-52 bg-muted">
            {isImageUrl(enterprise.business_license) ? (
              <>
                <Image
                  src={enterprise.business_license}
                  alt="Business licence"
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="absolute bottom-3 left-3 bg-black/50 hover:bg-black/70 text-white rounded-md p-2 transition-colors"
                  title="View fullscreen"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setLightboxOpen(true)}
                className="flex flex-col items-center justify-center w-full h-full gap-2 hover:bg-muted/80 transition-colors"
              >
                <FileText className="h-12 w-12 text-primary/50" />
                <span className="text-sm font-medium text-muted-foreground">
                  Business License (PDF)
                </span>
                <span className="text-xs text-primary underline">
                  Click to view
                </span>
              </button>
            )}
          </div>
        )}

        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden">
                {p?.image ? (
                  <Image
                    src={p.image}
                    alt={fullName}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-primary" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {enterprise.company_name || fullName}
                </h1>
                {enterprise.company_name && (
                  <p className="text-sm text-muted-foreground">{fullName}</p>
                )}
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {enterprise.status && statusBadge(enterprise.status)}
                  {enterprise.is_verified && (
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200 rounded-full text-xs">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  )}
                  {enterprise.role && (
                    <Badge
                      variant="secondary"
                      className="rounded-full text-xs capitalize"
                    >
                      {enterprise.role}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={actionMutation.isPending}
                >
                  {actionMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Actions
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                {(
                  Object.entries(ACTION_CONFIG) as [
                    DealerAction,
                    typeof ACTION_CONFIG.approve,
                  ][]
                ).map(([action, { label, icon: Icon, variant }]) => (
                  <DropdownMenuItem
                    key={action}
                    variant={variant}
                    className="gap-2"
                    onClick={() =>
                      action === "reject"
                        ? setRejectOpen(true)
                        : handleAction(action)
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info */}
        <Card className="border border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {p?.contact && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary/70" />
                <a
                  href={`tel:${p.contact}`}
                  className="hover:text-primary hover:underline"
                >
                  {p.contact}
                </a>
              </div>
            )}
            {p?.address && (
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary/70 mt-0.5" />
                <span>{p.address}</span>
              </div>
            )}
            {!p?.contact && !p?.address && (
              <p className="text-muted-foreground italic">
                No contact info available.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Business details */}
        <Card className="border border-primary/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {enterprise.license_number && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <FileText className="h-4 w-4 shrink-0 text-primary/70" />
                <div>
                  <p className="text-xs text-muted-foreground/70 uppercase tracking-wide">
                    License
                  </p>
                  <p className="text-foreground font-medium">
                    {enterprise.license_number}
                  </p>
                </div>
              </div>
            )}
            {enterprise.tax_id && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <FileText className="h-4 w-4 shrink-0 text-primary/70" />
                <div>
                  <p className="text-xs text-muted-foreground/70 uppercase tracking-wide">
                    Tax ID
                  </p>
                  <p className="text-foreground font-medium">
                    {enterprise.tax_id}
                  </p>
                </div>
              </div>
            )}
            {enterprise.telebirr_account && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <CreditCard className="h-4 w-4 shrink-0 text-primary/70" />
                <div>
                  <p className="text-xs text-muted-foreground/70 uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-foreground font-medium">
                    {enterprise.telebirr_account}
                  </p>
                </div>
              </div>
            )}
            {!enterprise.license_number &&
              !enterprise.tax_id &&
              !enterprise.telebirr_account && (
                <p className="text-muted-foreground italic">
                  No business details available.
                </p>
              )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card className="border border-primary/10 md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                <div>
                  <p className="text-xs text-muted-foreground/70 uppercase tracking-wide">
                    Registered
                  </p>
                  <p className="text-foreground font-medium">
                    {formatDate(enterprise.created_at)}
                  </p>
                </div>
              </div>
              <Separator
                orientation="vertical"
                className="hidden sm:block h-10 self-center"
              />
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
                <div>
                  <p className="text-xs text-muted-foreground/70 uppercase tracking-wide">
                    Last updated
                  </p>
                  <p className="text-foreground font-medium">
                    {formatDate(enterprise.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reject dialog */}
      <Dialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) setRejectReason("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject enterprise</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Reject{" "}
            <span className="font-medium text-foreground">
              {enterprise.company_name || fullName}
            </span>
            . A rejection reason is required.
          </p>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Rejection reason</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Incomplete documents, invalid license..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-24 resize-y"
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectOpen(false);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={submitReject}
              disabled={actionMutation.isPending}
            >
              {actionMutation.isPending && actingAction === "reject" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxOpen && enterprise.business_license && (
        <div
          className="fixed inset-0 z-[60000] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <div
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {isImageUrl(enterprise.business_license) ? (
              <Image
                src={enterprise.business_license}
                alt="Business licence — fullscreen"
                width={1200}
                height={900}
                className="object-contain w-full h-full max-h-[90vh] rounded-lg"
              />
            ) : (
              <iframe
                src={enterprise.business_license}
                title="Business licence PDF"
                className="w-full h-[85vh] rounded-lg bg-white"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
