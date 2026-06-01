"use client";

import { useState } from "react";
import {
  Search,
  Target,
  Phone,
  Car,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MessageCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeads } from "@/hooks/sales";
import type { LeadListItem, LeadStatus } from "@/app/types/Lead";

type StatusFilter = "all" | LeadStatus;

const statusConfig: Record<string, { label: string; className: string }> = {
  inquiry:     { label: "Inquiry",     className: "bg-blue-100 text-blue-800 border-blue-200" },
  contacted:   { label: "Contacted",   className: "bg-purple-100 text-purple-800 border-purple-200" },
  qualified:   { label: "Qualified",   className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  proposal:    { label: "Proposal",    className: "bg-orange-100 text-orange-800 border-orange-200" },
  negotiation: { label: "Negotiation", className: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  closed_won:  { label: "Closed Won",  className: "bg-green-100 text-green-800 border-green-200" },
  closed_lost: { label: "Closed Lost", className: "bg-red-100 text-red-800 border-red-200" },
};

function getStatusConfig(status: string) {
  return statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-700 border-gray-200" };
}

const tabTriggerClass =
  "cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none text-xs";

function LeadCard({ lead }: { lead: LeadListItem }) {
  const sc = getStatusConfig(lead.status);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-semibold uppercase">
              {(lead.buyer_name || lead.name || "?")[0]}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">
                {lead.buyer_name || lead.name || "—"}
              </p>
              {lead.buyer_name && lead.name && lead.buyer_name !== lead.name && (
                <p className="text-xs text-muted-foreground truncate">{lead.name}</p>
              )}
            </div>
          </div>
          <span className={`shrink-0 inline-flex text-xs font-medium px-2 py-0.5 rounded-full border ${sc.className}`}>
            {sc.label}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-1.5 text-sm">
          {lead.car_info && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Car className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{lead.car_info}</span>
            </div>
          )}
          {lead.contact && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <a
                href={lead.contact.includes("@") ? `mailto:${lead.contact}` : `tel:${lead.contact}`}
                className="truncate text-primary hover:underline"
              >
                {lead.contact}
              </a>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{new Date(lead.created_at).toLocaleDateString()}</span>
          </div>
          {lead.closed_at && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Closed {new Date(lead.closed_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { data: leads, isLoading, error } = useLeads();

  const statuses = leads
    ? [...new Set(leads.map((l) => l.status))].sort()
    : [];

  const filtered = leads?.filter((lead) => {
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    if (!matchesStatus) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      lead.buyer_name?.toLowerCase().includes(q) ||
      lead.name?.toLowerCase().includes(q) ||
      lead.contact?.toLowerCase().includes(q) ||
      lead.car_info?.toLowerCase().includes(q) ||
      lead.status?.toLowerCase().includes(q)
    );
  });

  const counts = {
    total:      leads?.length ?? 0,
    open:       leads?.filter((l) => !["closed_won", "closed_lost"].includes(l.status)).length ?? 0,
    closed_won: leads?.filter((l) => l.status === "closed_won").length ?? 0,
    closed_lost:leads?.filter((l) => l.status === "closed_lost").length ?? 0,
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-1">Leads</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Track and manage all sales leads.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Leads",  value: counts.total,       icon: Target,       className: "text-foreground" },
          { label: "Open",         value: counts.open,        icon: MessageCircle,className: "text-blue-600" },
          { label: "Closed Won",   value: counts.closed_won,  icon: CheckCircle2, className: "text-green-600" },
          { label: "Closed Lost",  value: counts.closed_lost, icon: XCircle,      className: "text-red-600" },
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

      {/* Search + status filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search by name, car, contact…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 w-full rounded-full border border-input bg-background text-sm focus:outline-none focus:border-primary"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <TabsList className="bg-muted/60 flex-wrap h-auto gap-0.5">
            <TabsTrigger value="all" className={tabTriggerClass}>All</TabsTrigger>
            {statuses.map((s) => (
              <TabsTrigger key={s} value={s} className={tabTriggerClass}>
                {getStatusConfig(s).label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-6">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="font-semibold">Failed to load leads</p>
            <p className="text-sm text-muted-foreground">Please try again later.</p>
          </CardContent>
        </Card>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      ) : (
        <Card className="p-6">
          <CardContent className="flex flex-col items-center gap-3 text-center">
            <Users className="h-10 w-10 text-muted-foreground opacity-50" />
            <p className="font-semibold">
              {search || statusFilter !== "all" ? "No leads match your filters." : "No leads found."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
