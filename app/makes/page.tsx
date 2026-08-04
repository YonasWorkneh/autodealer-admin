"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
import {
  Factory,
  Car,
  Search,
  ChevronDown,
  Tag,
  Loader2,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  useMakes,
  useModels,
  useCreateMake,
  useCreateModel,
  useUpdateMake,
  useUpdateModel,
  useDeleteMake,
  useDeleteModel,
  useMakeRequests,
  useApproveMakeRequest,
  useRejectMakeRequest,
  useModelRequests,
  useApproveModelRequest,
  useRejectModelRequest,
} from "@/hooks/cars";
import type { Make } from "@/app/types/Make";
import type { Model } from "@/app/types/Model";
import type { MakeRequest, ModelRequest } from "@/app/types/Requests";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MakesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMakeId, setActiveMakeId] = useState<number | null>(null);
  const [isMakeDialogOpen, setIsMakeDialogOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [makeName, setMakeName] = useState("");
  const [modelName, setModelName] = useState("");
  const [selectedMakeId, setSelectedMakeId] = useState<number | "">("");
  const [editingMake, setEditingMake] = useState<Make | null>(null);
  const [editingMakeName, setEditingMakeName] = useState("");
  const [makeToDelete, setMakeToDelete] = useState<Make | null>(null);
  const [editingModel, setEditingModel] = useState<{
    model: Model;
    make: Make;
  } | null>(null);
  const [editingModelName, setEditingModelName] = useState("");
  const [editingModelMakeId, setEditingModelMakeId] = useState<number | "">("");
  const [modelToDelete, setModelToDelete] = useState<{
    model: Model;
    make: Make;
  } | null>(null);

  // Reject dialogs
  const [rejectingMakeReq, setRejectingMakeReq] = useState<MakeRequest | null>(null);
  const [rejectingModelReq, setRejectingModelReq] = useState<ModelRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: makes, isLoading, error } = useMakes();
  const { data: makeRequests } = useMakeRequests();
  const { data: modelRequests } = useModelRequests();
  const { showToast } = useToast();

  const pendingMakeReqs = makeRequests?.filter((r) => r.status === "pending") ?? [];
  const pendingModelReqs = modelRequests?.filter((r) => r.status === "pending") ?? [];
  const totalPending = pendingMakeReqs.length + pendingModelReqs.length;

  const createMakeMutation = useCreateMake(
    () => {
      showToast("success", "Make created successfully.");
      setMakeName("");
      setIsMakeDialogOpen(false);
    },
    (err) => showToast("error", err.message || "Failed to create make."),
  );
  const updateMakeMutation = useUpdateMake(
    () => {
      showToast("success", "Make updated successfully.");
      setEditingMake(null);
      setEditingMakeName("");
    },
    (err) => showToast("error", err.message || "Failed to update make."),
  );
  const deleteMakeMutation = useDeleteMake(
    () => {
      showToast("success", "Make deleted successfully.");
      setMakeToDelete(null);
    },
    (err) => showToast("error", err.message || "Failed to delete make."),
  );
  const createModelMutation = useCreateModel(
    () => {
      showToast("success", "Model created successfully.");
      setModelName("");
      setSelectedMakeId("");
      setIsModelDialogOpen(false);
    },
    (err) => showToast("error", err.message || "Failed to create model."),
  );
  const updateModelMutation = useUpdateModel(
    () => {
      showToast("success", "Model updated successfully.");
      setEditingModel(null);
      setEditingModelName("");
      setEditingModelMakeId("");
    },
    (err) => showToast("error", err.message || "Failed to update model."),
  );
  const deleteModelMutation = useDeleteModel(
    () => {
      showToast("success", "Model deleted successfully.");
      setModelToDelete(null);
    },
    (err) => showToast("error", err.message || "Failed to delete model."),
  );

  const approveMakeReqMutation = useApproveMakeRequest(
    () => showToast("success", "Make request approved."),
    (err) => showToast("error", err.message || "Failed to approve."),
  );
  const rejectMakeReqMutation = useRejectMakeRequest(
    () => {
      showToast("success", "Make request rejected.");
      setRejectingMakeReq(null);
      setRejectReason("");
    },
    (err) => showToast("error", err.message || "Failed to reject."),
  );
  const approveModelReqMutation = useApproveModelRequest(
    () => showToast("success", "Model request approved."),
    (err) => showToast("error", err.message || "Failed to approve."),
  );
  const rejectModelReqMutation = useRejectModelRequest(
    () => {
      showToast("success", "Model request rejected.");
      setRejectingModelReq(null);
      setRejectReason("");
    },
    (err) => showToast("error", err.message || "Failed to reject."),
  );

  const filteredMakes =
    makes?.filter((make) =>
      make.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((__, ind) => (
                    <Skeleton key={ind} className="h-4 w-full" />
                  ))}
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
      <div className="p-4 sm:p-8 max-w-5xl">
        <Card className="p-6 border border-border">
          <CardContent className="text-center space-y-4">
            <Factory className="h-10 w-10 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Error Loading Makes
              </h2>
              <p className="text-muted-foreground">
                Something went wrong while loading the car makes. Please try
                again later.
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
          Car Makes & Models
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Explore available car makes, models, and pending requests.
        </p>
      </div>

      <Tabs defaultValue="catalog">
        <TabsList className="mb-6">
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="requests" className="gap-2">
            Requests
            {totalPending > 0 && (
              <Badge className="h-5 min-w-5 px-1.5 text-xs">
                {totalPending}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Catalog Tab ── */}
        <TabsContent value="catalog">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search car make..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 w-full rounded-full border border-input bg-background focus:outline-none focus:ring-0 focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsMakeDialogOpen(true)}
                className="cursor-pointer"
              >
                Add Make
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsModelDialogOpen(true)}
                className="cursor-pointer"
              >
                Add Model
              </Button>
            </div>
          </div>

          {filteredMakes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMakes.map((make) => (
                <MakeCard
                  key={make.id}
                  make={make}
                  onOpen={() => setActiveMakeId(make.id)}
                  onEdit={() => {
                    setEditingMake(make);
                    setEditingMakeName(make.name);
                  }}
                  onDelete={() => setMakeToDelete(make)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 border border-border">
              <CardContent className="text-center space-y-2">
                <Car className="h-10 w-10 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No Makes Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No car makes match your search criteria."
                    : "No car makes available at the moment."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Requests Tab ── */}
        <TabsContent value="requests">
          <Tabs defaultValue="makes">
            <TabsList className="mb-6">
              <TabsTrigger value="makes" className="gap-2">
                Make Requests
                {pendingMakeReqs.length > 0 && (
                  <Badge className="h-5 min-w-5 px-1.5 text-xs">
                    {pendingMakeReqs.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="models" className="gap-2">
                Model Requests
                {pendingModelReqs.length > 0 && (
                  <Badge className="h-5 min-w-5 px-1.5 text-xs">
                    {pendingModelReqs.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="makes">
              <RequestsSection
                requests={makeRequests ?? []}
                onApprove={(id) => approveMakeReqMutation.mutate(id)}
                onReject={(req) => {
                  setRejectingMakeReq(req as MakeRequest);
                  setRejectReason("");
                }}
                approvingId={approveMakeReqMutation.isPending ? approveMakeReqMutation.variables : undefined}
              />
            </TabsContent>

            <TabsContent value="models">
              <RequestsSection
                requests={modelRequests ?? []}
                onApprove={(id) => approveModelReqMutation.mutate(id)}
                onReject={(req) => {
                  setRejectingModelReq(req as ModelRequest);
                  setRejectReason("");
                }}
                approvingId={approveModelReqMutation.isPending ? approveModelReqMutation.variables : undefined}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* ── Modals ── */}
      {activeMakeId !== null && (
        <ModelsDialog
          make={makes?.find((m) => m.id === activeMakeId) || null}
          open={activeMakeId !== null}
          onOpenChange={(open) =>
            setActiveMakeId((prev) => (open ? prev : null))
          }
          onEditModel={(model, make) => {
            if (!make) return;
            setEditingModel({ model, make });
            setEditingModelName(model.name);
            if (model.make_id !== undefined) {
              setEditingModelMakeId(model.make_id);
            } else if (typeof model.make === "number") {
              setEditingModelMakeId(model.make);
            } else if (typeof model.make === "object" && model.make !== null) {
              setEditingModelMakeId((model.make as Make).id);
            } else {
              setEditingModelMakeId(make.id);
            }
          }}
          onDeleteModel={(model, make) => {
            if (!make) return;
            setModelToDelete({ model, make });
          }}
        />
      )}

      <MakeDialog
        open={isMakeDialogOpen}
        onOpenChange={(open) => {
          setIsMakeDialogOpen(open);
          if (!open) setMakeName("");
        }}
        name={makeName}
        setName={setMakeName}
        onSubmit={() => {
          const trimmed = makeName.trim();
          if (!trimmed) return;
          createMakeMutation.mutate(trimmed);
        }}
        isSubmitting={createMakeMutation.isPending}
        title="Create New Make"
        description="Provide a name to create a new car make."
        submitLabel="Save Make"
      />

      <MakeDialog
        open={editingMake !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingMake(null);
            setEditingMakeName("");
          } else if (editingMake) {
            setEditingMakeName(editingMake.name);
          }
        }}
        name={editingMakeName}
        setName={setEditingMakeName}
        onSubmit={() => {
          if (!editingMake) return;
          const trimmed = editingMakeName.trim();
          if (!trimmed) return;
          updateMakeMutation.mutate({ id: editingMake.id, name: trimmed });
        }}
        isSubmitting={updateMakeMutation.isPending}
        title="Edit Make"
        description="Update the details for this car make."
        submitLabel="Update Make"
      />

      <ModelDialog
        open={isModelDialogOpen}
        onOpenChange={(open) => {
          setIsModelDialogOpen(open);
          if (!open) {
            setModelName("");
            setSelectedMakeId("");
          }
        }}
        makes={makes || []}
        selectedMakeId={selectedMakeId}
        setSelectedMakeId={setSelectedMakeId}
        name={modelName}
        setName={setModelName}
        onSubmit={() => {
          const trimmed = modelName.trim();
          if (!trimmed || selectedMakeId === "") return;
          createModelMutation.mutate({ name: trimmed, make: selectedMakeId as number });
        }}
        isSubmitting={createModelMutation.isPending}
        title="Create New Model"
        description="Choose a make and provide a model name to create a new model."
        submitLabel="Save Model"
      />

      <ModelDialog
        open={editingModel !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingModel(null);
            setEditingModelName("");
            setEditingModelMakeId("");
          } else if (editingModel) {
            setEditingModelName(editingModel.model.name);
            if (editingModel.model.make_id !== undefined) {
              setEditingModelMakeId(editingModel.model.make_id);
            } else if (typeof editingModel.model.make === "number") {
              setEditingModelMakeId(editingModel.model.make);
            } else if (
              typeof editingModel.model.make === "object" &&
              editingModel.model.make !== null
            ) {
              setEditingModelMakeId((editingModel.model.make as Make).id);
            } else {
              setEditingModelMakeId(editingModel.make.id);
            }
          }
        }}
        makes={makes || []}
        selectedMakeId={
          editingModelMakeId === ""
            ? (editingModel?.make.id ?? "")
            : editingModelMakeId
        }
        setSelectedMakeId={setEditingModelMakeId}
        name={editingModelName}
        setName={setEditingModelName}
        onSubmit={() => {
          if (!editingModel) return;
          const trimmed = editingModelName.trim();
          if (!trimmed) return;
          updateModelMutation.mutate({
            id: editingModel.model.id,
            name: trimmed,
            make: editingModelMakeId === "" ? editingModel.make.id : (editingModelMakeId as number),
          });
        }}
        isSubmitting={updateModelMutation.isPending}
        title="Edit Model"
        description="Update the details for this model."
        submitLabel="Update Model"
      />

      <Dialog
        open={makeToDelete !== null}
        onOpenChange={(open) => { if (!open) setMakeToDelete(null); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Make</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to delete the make "${makeToDelete?.name ?? ""}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => setMakeToDelete(null)}
              className="cursor-pointer bg-gray-100 hover:bg-gray-200"
              disabled={deleteMakeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => { if (!makeToDelete) return; deleteMakeMutation.mutate(makeToDelete.id); }}
              disabled={deleteMakeMutation.isPending}
            >
              {deleteMakeMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
              ) : "Delete Make"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={modelToDelete !== null}
        onOpenChange={(open) => { if (!open) setModelToDelete(null); }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Model</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to delete the model "${modelToDelete?.model.name ?? ""}"${
                modelToDelete?.make ? ` from make "${modelToDelete.make.name}"` : ""
              }? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => setModelToDelete(null)}
              className="cursor-pointer bg-gray-100 hover:bg-gray-200"
              disabled={deleteModelMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => { if (!modelToDelete) return; deleteModelMutation.mutate(modelToDelete.model.id); }}
              disabled={deleteModelMutation.isPending}
            >
              {deleteModelMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
              ) : "Delete Model"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Make Request dialog */}
      <Dialog
        open={rejectingMakeReq !== null}
        onOpenChange={(open) => { if (!open) { setRejectingMakeReq(null); setRejectReason(""); } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Make Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting &quot;{rejectingMakeReq?.requested_name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => { setRejectingMakeReq(null); setRejectReason(""); }}
                className="bg-gray-100 hover:bg-gray-200"
                disabled={rejectMakeReqMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!rejectReason.trim() || rejectMakeReqMutation.isPending}
                onClick={() => {
                  if (!rejectingMakeReq) return;
                  rejectMakeReqMutation.mutate({ id: rejectingMakeReq.id, reason: rejectReason.trim() });
                }}
              >
                {rejectMakeReqMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Rejecting...</>
                ) : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Model Request dialog */}
      <Dialog
        open={rejectingModelReq !== null}
        onOpenChange={(open) => { if (!open) { setRejectingModelReq(null); setRejectReason(""); } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Model Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting &quot;{rejectingModelReq?.requested_name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => { setRejectingModelReq(null); setRejectReason(""); }}
                className="bg-gray-100 hover:bg-gray-200"
                disabled={rejectModelReqMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={!rejectReason.trim() || rejectModelReqMutation.isPending}
                onClick={() => {
                  if (!rejectingModelReq) return;
                  rejectModelReqMutation.mutate({ id: rejectingModelReq.id, reason: rejectReason.trim() });
                }}
              >
                {rejectModelReqMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Rejecting...</>
                ) : "Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Request status badge ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <Badge variant="secondary" className="gap-1 text-yellow-700 bg-yellow-100 border-yellow-200">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  }
  if (status === "approved") {
    return (
      <Badge variant="secondary" className="gap-1 text-green-700 bg-green-100 border-green-200">
        <CheckCircle className="h-3 w-3" />
        Approved
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1 text-red-700 bg-red-100 border-red-200">
      <XCircle className="h-3 w-3" />
      Rejected
    </Badge>
  );
}

// ── Requests section ──────────────────────────────────────────────────────────

function RequestsSection({
  requests,
  onApprove,
  onReject,
  approvingId,
}: {
  requests: MakeRequest[];
  onApprove: (id: number) => void;
  onReject: (req: MakeRequest) => void;
  approvingId?: number;
}) {
  return (
    <div>
      {requests.length === 0 ? (
        <Card className="border border-border">
          <CardContent className="py-10 flex flex-col items-center gap-2 text-muted-foreground">
            <Inbox className="h-8 w-8" />
            <p className="text-sm">No requests yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="border border-border">
              <CardContent className="py-4 px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{req.requested_name}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requested by{" "}
                    <span className="font-medium">{req.requested_by_email}</span>
                    {" · "}
                    {new Date(req.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {req.status === "rejected" && req.rejection_reason && (
                    <p className="text-xs text-destructive mt-0.5">
                      Reason: {req.rejection_reason}
                    </p>
                  )}
                </div>
                {req.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={approvingId === req.id}
                      onClick={() => onApprove(req.id)}
                    >
                      {approvingId === req.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onReject(req)}
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Existing sub-components ───────────────────────────────────────────────────

function MakeCard({
  make,
  onOpen,
  onEdit,
  onDelete,
}: {
  make: Make;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const handleTriggerClick = (event: MouseEvent) => { event.stopPropagation(); };
  const handleItemClick = (event: MouseEvent) => { event.stopPropagation(); };

  return (
    <Card
      className="border border-border overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
      onClick={onOpen}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">{make.name}</CardTitle>
            <p className="text-sm text-muted-foreground">Click to view models</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0"
                onClick={handleTriggerClick}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={handleItemClick}>
              <DropdownMenuItem onClick={onEdit}>Edit Make</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                Delete Make
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
      </CardHeader>
    </Card>
  );
}

function ModelsDialog({
  make,
  open,
  onOpenChange,
  onEditModel,
  onDeleteModel,
}: {
  make: Make | null;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onEditModel: (model: Model, make: Make | null) => void;
  onDeleteModel: (model: Model, make: Make | null) => void;
}) {
  const { data: models, isLoading, error } = useModels(open && make ? make.id : undefined);
  const filteredModels =
    models?.filter((model) => {
      if (!make) return false;
      if (model.make_id !== undefined) return model.make_id === make.id;
      if (typeof model.make === "number") return model.make === make.id;
      if (typeof model.make === "object" && model.make !== null) return (model.make as Make).id === make.id;
      return true;
    }) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full max-h-[70vh] px-0 pb-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Models for {make?.name}</DialogTitle>
          <DialogDescription>
            Browse the list of models associated with this make.
          </DialogDescription>
        </DialogHeader>
        <div className="border-t border-border mt-4 max-h-[55vh] overflow-y-auto px-6 py-4 space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-5 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">
              Failed to load models. Please try again later.
            </p>
          ) : filteredModels.length > 0 ? (
            <ul className="space-y-2">
              {filteredModels.map((model: Model) => (
                <li
                  key={model.id}
                  className="flex items-center justify-between rounded-md border border-dashed border-border px-4 py-2 text-sm"
                >
                  <div className="space-y-1">
                    <span>{model.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-[60000]">
                      <DropdownMenuItem onClick={() => onEditModel(model, make)}>
                        Edit Model
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDeleteModel(model, make)}
                      >
                        Delete Model
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No models available for this make.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MakeDialog({
  open,
  onOpenChange,
  name,
  setName,
  onSubmit,
  isSubmitting,
  title,
  description,
  submitLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: (val: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  title: string;
  description: string;
  submitLabel: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full py-10">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter make name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-0 focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ModelDialog({
  open,
  onOpenChange,
  makes,
  selectedMakeId,
  setSelectedMakeId,
  name,
  setName,
  onSubmit,
  isSubmitting,
  title,
  description,
  submitLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  makes: Make[];
  selectedMakeId: number | "";
  setSelectedMakeId: (val: number | "") => void;
  name: string;
  setName: (val: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  title: string;
  description: string;
  submitLabel: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full py-10">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Select Make</label>
            <Select
              value={selectedMakeId === "" ? "" : String(selectedMakeId)}
              onValueChange={(value) => setSelectedMakeId(value ? Number(value) : "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a make" />
              </SelectTrigger>
              <SelectContent className="z-50001" position="popper">
                {(Array.isArray(makes) ? makes : []).map((make) => (
                  <SelectItem key={make.id} value={String(make.id)}>
                    {make.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Model Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter model name"
              className="w-full rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-0 focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!name.trim() || selectedMakeId === "" || isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
