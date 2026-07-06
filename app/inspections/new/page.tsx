"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Plus,
  FileText,
  X,
  Loader2,
  Car as CarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCars, useCreateInspection } from "@/hooks/cars";
import { useToast } from "@/hooks/use-toast";
import type { FetchedCar } from "@/app/types/Car";
import { formatPrice } from "@/lib/utils";

type ConditionStatus = "Excellent" | "Good" | "Fair" | "Poor";

const EMPTY_FORM = {
  inspection_score: "",
  odometer_verified: false,
  accident_history: false,
  inspection_date: new Date().toISOString().split("T")[0],
  remarks: "",
  condition_status: "Good" as ConditionStatus,
};

export default function NewInspectionPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { data: cars, isLoading } = useCars();

  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState<"info" | "vin">("info");
  const [selectedCar, setSelectedCar] = useState<FetchedCar | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [dialogEl, setDialogEl] = useState<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useCreateInspection(
    () => {
      showToast("success", "Inspection submitted successfully.");
      router.push("/inspections");
    },
    (err) => showToast("error", err.message),
  );

  const filtered = useMemo(() => {
    if (!cars) return [];
    if (!search.trim()) return cars;
    const q = search.trim().toLowerCase();
    if (searchMode === "vin") {
      return cars.filter((c) => c.vin?.toLowerCase().includes(q));
    }
    return cars.filter(
      (c) =>
        c.make?.toLowerCase().includes(q) ||
        c.model?.toLowerCase().includes(q) ||
        String(c.year).includes(q),
    );
  }, [cars, search, searchMode]);

  const openDialog = (car: FetchedCar) => {
    setSelectedCar(car);
    setForm({ ...EMPTY_FORM });
    setPdfFile(null);
    setPdfPreviewUrl(null);
  };

  const closeDialog = () => {
    setSelectedCar(null);
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    setPdfPreviewUrl(null);
    setPdfFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    setPdfFile(file);
    setPdfPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    if (!selectedCar) return;
    if (!form.inspection_score) {
      showToast("error", "Inspection score is required.");
      return;
    }
    if (!form.inspection_date) {
      showToast("error", "Inspection date is required.");
      return;
    }

    const fd = new FormData();
    fd.append("car_id", String(selectedCar.id));
    fd.append("inspection_score", form.inspection_score);
    fd.append("odometer_verified", String(form.odometer_verified));
    fd.append("accident_history", String(form.accident_history));
    fd.append("inspection_date", form.inspection_date);
    fd.append("remarks", form.remarks);
    fd.append("condition_status", form.condition_status);
    if (pdfFile) fd.append("signed_report", pdfFile);

    mutation.mutate(fd);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/inspections"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Inspections
        </Link>
        <h1 className="text-2xl sm:text-3xl font-semibold">New Inspection</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Search for a car and submit an inspection report.
        </p>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Mode toggle */}
        <div className="flex rounded-full border border-input bg-background p-0.5 h-fit shrink-0">
          {(["info", "vin"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setSearchMode(mode); setSearch(""); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                searchMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "info" ? "Make / Model / Year" : "VIN"}
            </button>
          ))}
        </div>

        {/* Input + clear */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
          <input
            type="text"
            placeholder={searchMode === "vin" ? "Enter VIN number…" : "Search by make, model or year…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 py-2.5 w-full rounded-full border border-input bg-background text-sm focus:outline-none focus:border-primary"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Car list */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex gap-3">
                <Skeleton className="w-20 h-16 rounded shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-full mt-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <CarIcon className="h-10 w-10 text-muted-foreground opacity-40" />
            <p className="font-medium text-muted-foreground">No cars found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((car) => (
            <Card key={car.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-3 mb-3">
                  <div className="w-40 h-auto rounded bg-muted overflow-hidden shrink-0 relative">
                    {car.featured_image ? (
                      <Image
                        src={car.featured_image}
                        alt={`${car.make} ${car.model}`}
                        fill
                        className="object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CarIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {car.year} {car.make} {car.model}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatPrice(car.price, true)}
                    </p>
                    <Badge
                      variant="secondary"
                      className="text-[10px] mt-1 capitalize rounded-full"
                    >
                      {car.sale_type?.replace("_", " ") || "—"}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => openDialog(car)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Inspection
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Inspection form dialog */}
      <Dialog
        open={!!selectedCar}
        onOpenChange={(v) => {
          if (!v) closeDialog();
        }}
      >
        <DialogContent ref={setDialogEl} className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Inspection — {selectedCar?.year} {selectedCar?.make}{" "}
              {selectedCar?.model}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Score + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Inspection Score (0–100)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="92"
                  value={form.inspection_score}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, inspection_score: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Inspection Date</Label>
                <Input
                  type="date"
                  value={form.inspection_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, inspection_date: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Condition */}
            <div className="space-y-1.5">
              <Label>Condition Status</Label>
              <Select
                value={form.condition_status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, condition_status: v as ConditionStatus }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent container={dialogEl}>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  className="accent-primary h-4 w-4"
                  checked={form.odometer_verified}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      odometer_verified: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm font-medium">Odometer Verified</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  className="accent-destructive h-4 w-4"
                  checked={form.accident_history}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      accident_history: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm font-medium">Accident History</span>
              </label>
            </div>

            {/* Remarks */}
            <div className="space-y-1.5">
              <Label>Remarks</Label>
              <Textarea
                placeholder="Vehicle passed inspection. Engine, suspension and brakes are in good condition."
                rows={3}
                value={form.remarks}
                onChange={(e) =>
                  setForm((f) => ({ ...f, remarks: e.target.value }))
                }
                className="resize-none"
              />
            </div>

            {/* PDF upload */}
            <div className="space-y-1.5">
              <Label>Signed Report (PDF)</Label>
              <div
                className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {pdfFile ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate max-w-[220px]">
                        {pdfFile.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPdfFile(null);
                        if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
                        setPdfPreviewUrl(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <FileText className="h-8 w-8" />
                    <p className="text-sm font-medium">Click to upload PDF</p>
                    <p className="text-xs">PDF files only</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* PDF preview */}
            {pdfPreviewUrl && (
              <div className="space-y-1.5">
                <Label>Report Preview</Label>
                <iframe
                  src={pdfPreviewUrl}
                  title="Signed report preview"
                  className="w-full h-64 rounded-lg border bg-white"
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-2 gap-2">
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Submit Inspection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
