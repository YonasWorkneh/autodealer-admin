"use client";

import { useState, useMemo } from "react";
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
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useInspections,
  useInspectors,
  useCreateInspector,
  useUpdateInspector,
  useDeleteInspector,
} from "@/hooks/cars";
import { useToast } from "@/hooks/use-toast";
import type {
  Inspection,
  InspectionCondition,
  InspectionStatus,
  Inspector,
  CreateInspectorPayload,
  UpdateInspectorPayload,
} from "@/app/types/Inspection";

// ── Inspection helpers ──────────────────────────────────────────────────────

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

// ── InspectionCard (read-only — no action buttons) ──────────────────────────

function InspectionCard({ inspection }: { inspection: Inspection }) {
  const status = statusConfig[inspection.status] ?? statusConfig.pending;
  const condition = conditionConfig[inspection.condition_status] ?? conditionConfig.fair;
  const StatusIcon = status.icon;

  return (
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

      <CardContent className="space-y-3 flex-1 flex flex-col text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <div className="rounded-md bg-muted/50 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">Remarks</p>
            <p className="text-foreground">{inspection.remarks}</p>
          </div>
        )}

        {inspection.admin_remarks && (
          <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2">
            <p className="text-xs font-medium text-blue-600 mb-1">Admin Remarks</p>
            <p className="text-blue-900">{inspection.admin_remarks}</p>
          </div>
        )}

        {inspection.report_url && (
          <a
            href={inspection.report_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            <FileText className="h-4 w-4" />
            View Report
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        <p className="text-xs text-muted-foreground mt-auto">
          Uploaded {new Date(inspection.uploaded_at).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

// ── Inspector form dialog ───────────────────────────────────────────────────

const EMPTY_FORM: CreateInspectorPayload = {
  email: "",
  first_name: "",
  last_name: "",
  company_name: "",
  license_number: "",
  password: "",
};

function InspectorDialog({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: Partial<CreateInspectorPayload> | null;
  onSubmit: (data: CreateInspectorPayload | UpdateInspectorPayload) => void;
  isPending: boolean;
}) {
  const isEdit = initial !== null && !("password" in (initial ?? {}));
  const [form, setForm] = useState<CreateInspectorPayload>({ ...EMPTY_FORM, ...initial });
  const [showPassword, setShowPassword] = useState(false);

  const set = (k: keyof CreateInspectorPayload, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (isEdit) {
      const { password: _pw, ...rest } = form;
      onSubmit(rest);
    } else {
      onSubmit(form);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setForm({ ...EMPTY_FORM, ...initial });
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Inspector" : "Create Inspector"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>First name</Label>
            <Input value={form.first_name} onChange={(e) => set("first_name", e.target.value)} placeholder="Abebe" />
          </div>
          <div className="space-y-1">
            <Label>Last name</Label>
            <Input value={form.last_name} onChange={(e) => set("last_name", e.target.value)} placeholder="Kebede" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="inspector@example.com" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>Company name</Label>
            <Input value={form.company_name} onChange={(e) => set("company_name", e.target.value)} placeholder="AA Vehicle Inspection Center" />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>License number</Label>
            <Input value={form.license_number} onChange={(e) => set("license_number", e.target.value)} placeholder="LIC-12345" />
          </div>
          {!isEdit && (
            <div className="col-span-2 space-y-1">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isEdit ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Inspectors tab ──────────────────────────────────────────────────────────

function InspectorsTab() {
  const { showToast } = useToast();
  const { data: inspectors, isLoading, error } = useInspectors();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Inspector | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Inspector | null>(null);

  const createMutation = useCreateInspector(
    () => { showToast("success", "Inspector created."); setCreateOpen(false); },
    (err) => showToast("error", err.message),
  );

  const updateMutation = useUpdateInspector(
    () => { showToast("success", "Inspector updated."); setEditTarget(null); },
    (err) => showToast("error", err.message),
  );

  const deleteMutation = useDeleteInspector(
    () => { showToast("success", "Inspector deleted."); setDeleteTarget(null); },
    (err) => showToast("error", err.message),
  );

  const filtered = useMemo(() => {
    if (!inspectors) return [];
    if (!search) return inspectors;
    const q = search.toLowerCase();
    return inspectors.filter((ins) =>
      ins.first_name.toLowerCase().includes(q) ||
      ins.last_name.toLowerCase().includes(q) ||
      ins.email.toLowerCase().includes(q) ||
      ins.company_name.toLowerCase().includes(q) ||
      ins.license_number.toLowerCase().includes(q),
    );
  }, [inspectors, search]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search inspectors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-full rounded-full border border-input bg-background text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create inspector
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Name", "Email", "Company", "License", "Status", "Created", ""].map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="font-semibold">Failed to load inspectors</p>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-6">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <User className="h-10 w-10 text-muted-foreground opacity-50" />
            <p className="font-semibold">
              {search ? "No inspectors match your search." : "No inspectors found."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ins) => (
                  <TableRow key={ins.id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {ins.first_name} {ins.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ins.email}</TableCell>
                    <TableCell className="text-muted-foreground">{ins.company_name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{ins.license_number || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          ins.is_active
                            ? "bg-green-100 text-green-800 border border-green-200 rounded-full"
                            : "bg-gray-100 text-gray-600 border border-gray-200 rounded-full"
                        }
                      >
                        {ins.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {new Date(ins.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setEditTarget(ins)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setDeleteTarget(ins)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create dialog */}
      <InspectorDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        initial={null}
        onSubmit={(data) => createMutation.mutate(data as CreateInspectorPayload)}
        isPending={createMutation.isPending}
      />

      {/* Edit dialog */}
      {editTarget && (
        <InspectorDialog
          open={!!editTarget}
          onOpenChange={(v) => { if (!v) setEditTarget(null); }}
          initial={{
            email: editTarget.email,
            first_name: editTarget.first_name,
            last_name: editTarget.last_name,
            company_name: editTarget.company_name,
            license_number: editTarget.license_number,
          }}
          onSubmit={(data) => updateMutation.mutate({ id: editTarget.id, payload: data as UpdateInspectorPayload })}
          isPending={updateMutation.isPending}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete inspector</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteTarget?.first_name} {deleteTarget?.last_name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

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
    verified: inspections?.filter((i) => i.status === "verified").length ?? 0,
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
          { label: "Verified", value: counts.verified, icon: CheckCircle2,  className: "text-green-600" },
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

      <Tabs defaultValue="inspections">
        <TabsList className="mb-6">
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="inspectors">Inspectors</TabsTrigger>
        </TabsList>

        {/* ── Inspections tab ── */}
        <TabsContent value="inspections">
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

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3"><Skeleton className="h-5 w-48" /></CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-6">
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="font-semibold">Failed to load inspections</p>
              </CardContent>
            </Card>
          ) : filtered && filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
        </TabsContent>

        {/* ── Inspectors tab ── */}
        <TabsContent value="inspectors">
          <InspectorsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
