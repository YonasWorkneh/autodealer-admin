"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  Building2,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useDealers, useDealerAction, useRegisterDealer } from "@/hooks/dealers";
import type { DealerActionPayload } from "@/lib/dealersApi";
import type { Enterprise } from "@/app/types/Enterprise";
import { useToast } from "@/components/ui/use-toast";
import type { DealerAction } from "@/app/types/Enterprise";

function enterpriseStatusBadge(status: string) {
  const s = (status || "").toUpperCase();
  if (s.includes("SUSPEND")) {
    return (
      <Badge variant="destructive" className="rounded-full text-xs uppercase">
        {status}
      </Badge>
    );
  }
  if (s.includes("REJECT")) {
    return (
      <Badge variant="destructive" className="rounded-full text-xs uppercase">
        {status}
      </Badge>
    );
  }
  if (s.includes("PENDING") || s.includes("REVIEW")) {
    return (
      <Badge variant="secondary" className="rounded-full text-xs uppercase">
        {status}
      </Badge>
    );
  }
  if (s.includes("ACTIVE") || s.includes("APPROV") || s.includes("VERIF")) {
    return (
      <Badge className="bg-emerald-600 text-white rounded-full text-xs uppercase">
        {status}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-full text-xs uppercase">
      {status || "—"}
    </Badge>
  );
}


function EnterpriseCard({ enterprise }: { enterprise: Enterprise }) {
  const p = enterprise.profile;
  const name = [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "—";

  return (
    <Link href={`/enterprises/${enterprise.id}`}>
      <Card className="border border-primary/10 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden">
                {p?.image ? (
                  <Image
                    src={p.image}
                    alt={name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Building2 className="w-5 h-5 text-primary" />
                )}
              </div>
              <h3 className="font-semibold text-foreground truncate">
                {enterprise.company_name || name}
              </h3>
            </div>
            {enterprise.status && enterpriseStatusBadge(enterprise.status)}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function EnterprisesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: dealers, isLoading, error } = useDealers();
  const actionMutation = useDealerAction();
  const registerMutation = useRegisterDealer();
  const [actingId, setActingId] = useState<number | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newDealerForm, setNewDealerForm] = useState({
    email: "",
    password: "",
    company_name: "",
    license_number: "",
    tax_id: "",
    telebirr_account: "",
  });

  const filteredDealers = useMemo(() => {
    if (!dealers) return [];
    if (!searchQuery.trim()) return dealers;
    const q = searchQuery.toLowerCase();
    return dealers.filter((d) => {
      const name = [d.profile?.first_name, d.profile?.last_name].filter(Boolean).join(" ").toLowerCase();
      const company = (d.company_name || "").toLowerCase();
      const contact = (d.profile?.contact || "").toLowerCase();
      const license = (d.license_number || "").toLowerCase();
      const telebirr = (d.telebirr_account || "").toLowerCase();
      const status = (d.status || "").toLowerCase();
      const role = (d.role || "").toLowerCase();
      return (
        name.includes(q) ||
        company.includes(q) ||
        contact.includes(q) ||
        license.includes(q) ||
        telebirr.includes(q) ||
        status.includes(q) ||
        role.includes(q)
      );
    });
  }, [dealers, searchQuery]);

  const handleAction = async (
    id: number,
    action: DealerAction,
    payload?: DealerActionPayload,
  ) => {
    setActingId(id);
    try {
      await actionMutation.mutateAsync({ id, action, payload });
      toast({
        variant: "success",
        title: "Action successful",
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} successful`,
      });
      if (action === "reject") {
        setRejectTargetId(null);
        setRejectReason("");
      }
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Action failed",
        description: e instanceof Error ? e.message : "Action failed",
      });
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
    const rejection_reason = rejectReason.trim();
    if (!rejection_reason) {
      toast({
        variant: "destructive",
        title: "Rejection reason required",
        description:
          "Please enter a rejection reason before rejecting this enterprise.",
      });
      return;
    }
    handleAction(rejectTargetId, "reject", { rejection_reason });
  };

  const updateNewDealerField = (
    field: keyof typeof newDealerForm,
    value: string,
  ) => {
    setNewDealerForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetNewDealerForm = () => {
    setNewDealerForm({
      email: "",
      password: "",
      company_name: "",
      license_number: "",
      tax_id: "",
      telebirr_account: "",
    });
  };

  const submitCreateDealer = async () => {
    const requiredFields: Array<keyof typeof newDealerForm> = [
      "email",
      "password",
      "company_name",
      "license_number",
      "tax_id",
      "telebirr_account",
    ];

    const hasMissing = requiredFields.some(
      (key) => !newDealerForm[key].trim(),
    );
    if (hasMissing) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all fields",
      });
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email: newDealerForm.email.trim(),
        password: newDealerForm.password,
        company_name: newDealerForm.company_name.trim(),
        license_number: newDealerForm.license_number.trim(),
        tax_id: newDealerForm.tax_id.trim(),
        telebirr_account: newDealerForm.telebirr_account.trim(),
      });
      toast({
        variant: "success",
        title: "Enterprise created",
        description: "Dealer registered successfully.",
      });
      setCreateOpen(false);
      resetNewDealerForm();
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Failed to create enterprise",
        description:
          e instanceof Error ? e.message : "Failed to register dealer",
      });
    }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name, company, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 sm:h-14 rounded-full"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)} className="h-11 sm:h-12">
          <Plus className="h-4 w-4 mr-2" />
          Add new
        </Button>
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetNewDealerForm();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex flex-col items-center gap-2 mb-2">
              <Image
                src="/logo.svg"
                alt="hulucars"
                width={130}
                height={32}
                className="h-8 w-auto object-contain"
              />
            </div>
            <DialogTitle className="text-center">Add New Enterprise</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="new-enterprise-email">Email</Label>
              <Input
                id="new-enterprise-email"
                type="email"
                placeholder="user@example.com"
                value={newDealerForm.email}
                onChange={(e) => updateNewDealerField("email", e.target.value)}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="new-enterprise-password">Password</Label>
              <Input
                id="new-enterprise-password"
                type="password"
                placeholder="Enter password"
                value={newDealerForm.password}
                onChange={(e) => updateNewDealerField("password", e.target.value)}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="new-enterprise-company-name">Company name</Label>
              <Input
                id="new-enterprise-company-name"
                placeholder="Company name"
                value={newDealerForm.company_name}
                onChange={(e) =>
                  updateNewDealerField("company_name", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-enterprise-license">License number</Label>
              <Input
                id="new-enterprise-license"
                placeholder="License number"
                value={newDealerForm.license_number}
                onChange={(e) =>
                  updateNewDealerField("license_number", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-enterprise-tax">Tax ID</Label>
              <Input
                id="new-enterprise-tax"
                placeholder="Tax ID"
                value={newDealerForm.tax_id}
                onChange={(e) => updateNewDealerField("tax_id", e.target.value)}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="new-enterprise-telebirr">Telebirr account</Label>
              <Input
                id="new-enterprise-telebirr"
                placeholder="Telebirr account"
                value={newDealerForm.telebirr_account}
                onChange={(e) =>
                  updateNewDealerField("telebirr_account", e.target.value)
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateOpen(false);
                resetNewDealerForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={submitCreateDealer}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Create enterprise"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              . A rejection reason is required.
            </p>
          )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredDealers.map((enterprise) => (
            <EnterpriseCard
              key={enterprise.id}
              enterprise={enterprise}
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
