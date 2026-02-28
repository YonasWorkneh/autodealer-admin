"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  MoreVertical,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDealers, useDealerAction } from "@/hooks/dealers";
import type { Enterprise } from "@/app/types/Enterprise";
import type { DealerAction } from "@/app/types/Enterprise";
import toast from "react-hot-toast";

const ACTION_CONFIG: Record<
  DealerAction,
  { label: string; icon: typeof CheckCircle2; variant?: "default" | "destructive" }
> = {
  approve: {
    label: "Approve",
    icon: CheckCircle2,
  },
  verify: {
    label: "Verify",
    icon: ShieldCheck,
  },
  reactivate: {
    label: "Reactivate",
    icon: RefreshCw,
  },
  suspend: {
    label: "Suspend",
    icon: PauseCircle,
  },
  reject: {
    label: "Reject",
    icon: XCircle,
    variant: "destructive",
  },
};

function EnterpriseCard({
  enterprise,
  onAction,
  onRejectClick,
  isPending,
}: {
  enterprise: Enterprise;
  onAction: (id: number, action: DealerAction) => void;
  onRejectClick: (id: number) => void;
  isPending: boolean;
}) {
  const p = enterprise.profile;
  const name = [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "—";

  return (
    <Card className="border border-primary/10 overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                {p?.image ? (
                  <Image
                    src={p.image}
                    alt={name}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover w-full h-full"
                  />
                ) : (
                  <Building2 className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {enterprise.company_name || name}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {enterprise.company_name ? name : "—"}
                </p>
                {enterprise.role && (
                  <Badge variant="secondary" className="mt-1 text-xs capitalize">
                    {enterprise.role}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {enterprise.is_verified ? (
                <Badge className="bg-primary text-primary-foreground rounded-full text-xs">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="rounded-full text-xs">
                  Pending
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-primary/20 hover:bg-primary/5"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoreVertical className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-40">
                  {(Object.entries(ACTION_CONFIG) as [DealerAction, typeof ACTION_CONFIG.approve][]).map(
                    ([action, { label, icon: Icon, variant }]) => (
                      <DropdownMenuItem
                        key={action}
                        variant={variant}
                        onClick={() =>
                          action === "reject"
                            ? onRejectClick(enterprise.id)
                            : onAction(enterprise.id, action)
                        }
                        className="gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </DropdownMenuItem>
                    )
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-sm">
            {p?.contact && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary/70" />
                <a href={`tel:${p.contact}`} className="hover:text-primary hover:underline">
                  {p.contact}
                </a>
              </div>
            )}
            {p?.address && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary/70 mt-0.5" />
                <span>{p.address}</span>
              </div>
            )}
            {enterprise.license_number && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4 shrink-0 text-primary/70" />
                <span>License: {enterprise.license_number}</span>
              </div>
            )}
            {enterprise.tax_id && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4 shrink-0 text-primary/70" />
                <span>Tax ID: {enterprise.tax_id}</span>
              </div>
            )}
            {enterprise.telebirr_account && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4 shrink-0 text-primary/70" />
                <span>Telebirr: {enterprise.telebirr_account}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EnterprisesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: dealers, isLoading, error } = useDealers();
  const actionMutation = useDealerAction();
  const [actingId, setActingId] = useState<number | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredDealers = useMemo(() => {
    if (!dealers) return [];
    if (!searchQuery.trim()) return dealers;
    const q = searchQuery.toLowerCase();
    return dealers.filter((d) => {
      const name = [d.profile?.first_name, d.profile?.last_name].filter(Boolean).join(" ").toLowerCase();
      const company = (d.company_name || "").toLowerCase();
      const contact = (d.profile?.contact || "").toLowerCase();
      const license = (d.license_number || "").toLowerCase();
      return (
        name.includes(q) ||
        company.includes(q) ||
        contact.includes(q) ||
        license.includes(q)
      );
    });
  }, [dealers, searchQuery]);

  const handleAction = async (
    id: number,
    action: DealerAction,
    payload?: { reason?: string }
  ) => {
    setActingId(id);
    try {
      await actionMutation.mutateAsync({ id, action, payload });
      toast.success(`${ACTION_CONFIG[action].label} successful`);
      if (action === "reject") {
        setRejectTargetId(null);
        setRejectReason("");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActingId(null);
    }
  };

  const openRejectDialog = (id: number) => {
    setRejectTargetId(id);
    setRejectReason("");
  };

  const submitReject = () => {
    if (rejectTargetId == null) return;
    handleAction(rejectTargetId, "reject", { reason: rejectReason });
  };

  const rejectTargetEnterprise = useMemo(
    () => (dealers ?? []).find((d) => d.id === rejectTargetId),
    [dealers, rejectTargetId]
  );

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8">
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="relative w-full sm:w-96 mb-6">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border border-primary/10">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8">
        <Card className="border-destructive/30">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Error loading enterprises</h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Something went wrong."}
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2 text-primary">
          Enterprises
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage dealer enterprises — approve, verify, suspend, or reject.
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, company, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 sm:h-14 rounded-full"
          />
        </div>
      </div>

      <Dialog
        open={rejectTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTargetId(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject enterprise</DialogTitle>
          </DialogHeader>
          {rejectTargetEnterprise && (
            <p className="text-sm text-muted-foreground">
              Reject{" "}
              <span className="font-medium text-foreground">
                {rejectTargetEnterprise.company_name ||
                  [rejectTargetEnterprise.profile?.first_name, rejectTargetEnterprise.profile?.last_name]
                    .filter(Boolean)
                    .join(" ")}
              </span>
              . Optionally provide a reason (e.g. for the dealer to see).
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason (optional)</Label>
            <Textarea
              id="reject-reason"
              placeholder="e.g. Incomplete documents, invalid license..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-24 resize-y"
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setRejectTargetId(null);
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
              {actionMutation.isPending && actingId === rejectTargetId ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {filteredDealers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDealers.map((enterprise) => (
            <EnterpriseCard
              key={enterprise.id}
              enterprise={enterprise}
              onAction={handleAction}
              onRejectClick={openRejectDialog}
              isPending={actionMutation.isPending && actingId === enterprise.id}
            />
          ))}
        </div>
      ) : (
        <Card className="border border-primary/10">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No enterprises found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No enterprises match your search."
                : "There are no dealer enterprises to show."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
