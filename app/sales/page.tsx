"use client";

import { useState } from "react";
import {
  Search,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Car,
  Phone,
  Target,
  CheckCircle2,
  XCircle,
  MessageCircle,
  AlertCircle,
  Users,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useSales, useLeads } from "@/hooks/sales";
import { formatPrice } from "@/lib/utils";
import type { LeadListItem } from "@/app/types/Lead";

// ─── Lead helpers ────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  inquiry:     { label: "Inquiry",     className: "bg-blue-100 text-blue-800 border-blue-200" },
  contacted:   { label: "Contacted",   className: "bg-purple-100 text-purple-800 border-purple-200" },
  negotiation: { label: "Negotiation", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  closed:      { label: "Closed",      className: "bg-green-100 text-green-800 border-green-200" },
  lost:        { label: "Lost",        className: "bg-red-100 text-red-800 border-red-200" },
  cancelled:   { label: "Cancelled",   className: "bg-gray-100 text-gray-600 border-gray-200" },
};

function getStatusCfg(status: string) {
  return statusConfig[status] ?? { label: status, className: "bg-gray-100 text-gray-700 border-gray-200" };
}

function LeadCard({ lead }: { lead: LeadListItem }) {
  const sc = getStatusCfg(lead.status);
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
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

        <div className="space-y-1.5 text-sm">
          {lead.car_info && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Car className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{lead.car_info.make} {lead.car_info.model}</span>
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SalesPage() {
  const [tab, setTab] = useState<"sales" | "leads">("sales");
  const [salesSearch, setSalesSearch] = useState("");
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");

  const { data: sales, isLoading: salesLoading, error: salesError } = useSales();
  const { data: leads, isLoading: leadsLoading, error: leadsError } = useLeads();

  // ── Sales derived data ──────────────────────────────────────────────────
  const filteredSales = sales?.filter((sale) => {
    if (!salesSearch) return true;
    const q = salesSearch.toLowerCase();
    return (
      sale.buyer_info.first_name.toLowerCase().includes(q) ||
      sale.buyer_info.last_name.toLowerCase().includes(q) ||
      sale.buyer_info.email.toLowerCase().includes(q) ||
      sale.price.includes(q)
    );
  });

  const totalSales = sales?.length || 0;
  const totalRevenue = sales?.reduce((sum, s) => sum + parseFloat(s.price), 0) || 0;

  // ── Leads derived data ──────────────────────────────────────────────────
  const leadStatuses = leads ? [...new Set(leads.map((l) => l.status))].sort() : [];

  const filteredLeads = leads?.filter((lead) => {
    const matchesStatus = leadStatusFilter === "all" || lead.status === leadStatusFilter;
    if (!matchesStatus) return false;
    if (!leadSearch) return true;
    const q = leadSearch.toLowerCase();
    return (
      lead.buyer_name?.toLowerCase().includes(q) ||
      lead.name?.toLowerCase().includes(q) ||
      lead.contact?.toLowerCase().includes(q) ||
      lead.car_info?.make?.toLowerCase().includes(q) ||
      lead.car_info?.model?.toLowerCase().includes(q)
    );
  });

  const leadCounts = {
    total:      leads?.length ?? 0,
    active:     leads?.filter((l) => ["inquiry", "contacted", "negotiation"].includes(l.status)).length ?? 0,
    closed:     leads?.filter((l) => l.status === "closed").length ?? 0,
    lost:       leads?.filter((l) => l.status === "lost").length ?? 0,
    cancelled:  leads?.filter((l) => l.status === "cancelled").length ?? 0,
  };

  const tabTrigger = "cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none";

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-1">Sales</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Track transactions and manage sales leads.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "sales" | "leads")}>
        <TabsList className="bg-muted/60 mb-6">
          <TabsTrigger value="sales" className={tabTrigger}>Sales</TabsTrigger>
          <TabsTrigger value="leads" className={tabTrigger}>Leads</TabsTrigger>
        </TabsList>

        {/* ── Sales tab ─────────────────────────────────────────────────── */}
        <TabsContent value="sales">
          {salesLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}><CardContent className="p-6"><Skeleton className="h-6 w-24 mb-2" /><Skeleton className="h-8 w-32" /></CardContent></Card>
                ))}
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}><CardContent className="p-6"><Skeleton className="h-6 w-full mb-2" /><Skeleton className="h-4 w-3/4" /></CardContent></Card>
              ))}
            </div>
          ) : salesError ? (
            <Card className="p-6">
              <CardContent className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Error Loading Sales</h2>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                      <p className="text-2xl font-bold">{totalSales}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatPrice(totalRevenue.toString())}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Sale</p>
                      <p className="text-2xl font-bold">
                        {totalSales > 0 ? formatPrice((totalRevenue / totalSales).toString()) : "$0"}
                      </p>
                    </div>
                    <Car className="h-8 w-8 text-muted-foreground" />
                  </CardContent>
                </Card>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-80 mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search sales…"
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 w-full rounded-full border border-input bg-background text-sm focus:outline-none focus:border-primary"
                />
              </div>

              {/* List */}
              <div className="space-y-4">
                {filteredSales && filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <Card key={sale.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <User className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">
                                  {sale.buyer_info.first_name} {sale.buyer_info.last_name}
                                </h3>
                                <p className="text-sm text-muted-foreground">{sale.buyer_info.email}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-semibold">{formatPrice(sale.price)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-semibold">{new Date(sale.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Car ID:</span>
                                <span className="font-semibold">#{sale.car}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Contact:</span>
                                <span className="font-semibold">{sale.buyer_info.contact}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Completed
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-6">
                    <CardContent className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Sales Found</h3>
                      <p className="text-muted-foreground">
                        {salesSearch ? "No sales match your search." : "No sales recorded yet."}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* ── Leads tab ─────────────────────────────────────────────────── */}
        <TabsContent value="leads">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            {[
              { label: "Total",     value: leadCounts.total,     icon: Target,        className: "text-foreground" },
              { label: "Active",    value: leadCounts.active,    icon: MessageCircle, className: "text-blue-600" },
              { label: "Closed",    value: leadCounts.closed,    icon: CheckCircle2,  className: "text-green-600" },
              { label: "Lost",      value: leadCounts.lost,      icon: XCircle,       className: "text-red-600" },
              { label: "Cancelled", value: leadCounts.cancelled, icon: Users,         className: "text-gray-500" },
            ].map(({ label, value, icon: Icon, className }) => (
              <Card key={label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Icon className={`h-8 w-8 ${className}`} />
                  <div>
                    <p className="text-2xl font-bold">
                      {leadsLoading ? <Skeleton className="h-7 w-8 inline-block" /> : value}
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
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 w-full rounded-full border border-input bg-background text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <Tabs value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
              <TabsList className="bg-muted/60 flex-wrap h-auto gap-0.5">
                <TabsTrigger value="all" className={tabTrigger + " text-xs"}>All</TabsTrigger>
                {leadStatuses.map((s) => (
                  <TabsTrigger key={s} value={s} className={tabTrigger + " text-xs"}>
                    {getStatusCfg(s).label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Leads content */}
          {leadsLoading ? (
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
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : leadsError ? (
            <Card className="p-6">
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="font-semibold">Failed to load leads</p>
                <p className="text-sm text-muted-foreground">Please try again later.</p>
              </CardContent>
            </Card>
          ) : filteredLeads && filteredLeads.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredLeads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          ) : (
            <Card className="p-6">
              <CardContent className="flex flex-col items-center gap-3 text-center">
                <Users className="h-10 w-10 text-muted-foreground opacity-50" />
                <p className="font-semibold">
                  {leadSearch || leadStatusFilter !== "all" ? "No leads match your filters." : "No leads found."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
