"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserProfiles } from "@/hooks/userProfiles";
import type { UserProfile } from "@/app/types/UserProfile";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useBrokerAdminApplications,
  useBrokerAdminActionMutation,
} from "@/hooks/brokerAdmin";
import type {
  BrokerAdminApplication,
  BrokerAdminAction,
} from "@/app/types/BrokerAdminApplication";
import { useToast } from "@/components/ui/use-toast";

type UserListTab = "all" | "buyers" | "brokers" | "applications";

const userTabTriggerActive =
  "cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none";

function isBuyerUser(user: UserProfile) {
  if (user.dealer_profile) return false;
  if (user.buyer_profile != null) return true;
  return user.role?.toLowerCase() === "buyer";
}

function isBrokerUser(user: UserProfile) {
  if (user.broker_profile != null) return true;
  return user.role?.toLowerCase() === "broker";
}

function applicationStatusBadge(status: string) {
  const s = status?.toLowerCase() ?? "";
  if (s === "pending") {
    return (
      <Badge variant="secondary" className="capitalize">
        {status}
      </Badge>
    );
  }
  if (s === "approved" || s === "verified") {
    return (
      <Badge className="bg-emerald-600 text-white capitalize rounded-full">
        {status}
      </Badge>
    );
  }
  if (s === "rejected" || s === "suspended") {
    return (
      <Badge variant="destructive" className="capitalize">
        {status}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="capitalize">
      {status || "—"}
    </Badge>
  );
}

function formatAppDate(iso: string) {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<UserListTab>("all");
  const itemsPerPage = 10;

  const {
    data: userProfiles,
    isLoading: loadingProfiles,
    error: profilesError,
  } = useUserProfiles();

  const {
    data: brokerApplications,
    isLoading: loadingBrokerApps,
    error: brokerAppsError,
    refetch: refetchBrokerApps,
  } = useBrokerAdminApplications(activeTab === "applications");

  const brokerActionMutation = useBrokerAdminActionMutation();

  const [rejectDialogApp, setRejectDialogApp] =
    useState<BrokerAdminApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredUsers = useMemo(() => {
    const list = userProfiles ?? [];
    const byTab = list.filter((user) => {
      if (activeTab === "all") return true;
      if (activeTab === "buyers") return isBuyerUser(user);
      if (activeTab === "brokers") return isBrokerUser(user);
      return false;
    });

    if (!searchQuery) return byTab;
    const query = searchQuery.toLowerCase();
    return byTab.filter((user) => {
      return (
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.contact.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    });
  }, [userProfiles, activeTab, searchQuery]);

  const filteredBrokerApps = useMemo(() => {
    if (activeTab !== "applications") return [];
    const list = brokerApplications ?? [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((app) => {
      const p = app.profile;
      const name = `${p.first_name} ${p.last_name}`.toLowerCase();
      return (
        name.includes(q) ||
        p.contact.toLowerCase().includes(q) ||
        app.national_id.toLowerCase().includes(q) ||
        app.telebirr_account.toLowerCase().includes(q) ||
        app.status.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q)
      );
    });
  }, [brokerApplications, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const brokerAppsTotalPages = Math.ceil(
    filteredBrokerApps.length / itemsPerPage,
  );
  const brokerAppsStart = (currentPage - 1) * itemsPerPage;
  const brokerAppsEnd = brokerAppsStart + itemsPerPage;
  const paginatedBrokerApps = filteredBrokerApps.slice(
    brokerAppsStart,
    brokerAppsEnd,
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as UserListTab);
    setCurrentPage(1);
    setSelectedUsers([]);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedUsers(checked ? paginatedUsers.map((u) => u.id) : []);
  };

  const handleSelectUser = (id: number, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, id] : prev.filter((uid) => uid !== id),
    );
  };

  const handlePageChange = (page: number) => {
    const max =
      activeTab === "applications"
        ? brokerAppsTotalPages
        : totalPages;
    if (page >= 1 && page <= max) {
      setCurrentPage(page);
      setSelectedUsers([]);
    }
  };

  const actionPastTense: Record<BrokerAdminAction, string> = {
    approve: "approved",
    reject: "rejected",
  };

  const handleBrokerApprove = async (app: BrokerAdminApplication) => {
    try {
      await brokerActionMutation.mutateAsync({
        brokerId: app.id,
        action: "approve",
      });
      toast({
        variant: "success",
        title: "Success",
        description: `Application ${actionPastTense.approve} successfully.`,
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          e instanceof Error ? e.message : "Failed to approve application.",
      });
    }
  };

  const submitBrokerReject = async () => {
    if (!rejectDialogApp) return;
    const reason = rejectReason.trim();
    if (!reason) {
      toast({
        variant: "destructive",
        title: "Reason required",
        description: "Please enter a reason before rejecting this application.",
      });
      return;
    }
    try {
      await brokerActionMutation.mutateAsync({
        brokerId: rejectDialogApp.id,
        action: "reject",
        reason,
      });
      toast({
        variant: "success",
        title: "Success",
        description: `Application ${actionPastTense.reject} successfully.`,
      });
      setRejectDialogApp(null);
      setRejectReason("");
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          e instanceof Error ? e.message : "Failed to reject application.",
      });
    }
  };

  const isActingOnBroker = (brokerId: number) =>
    brokerActionMutation.isPending &&
    brokerActionMutation.variables?.brokerId === brokerId;

  const isAllSelected =
    selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0;
  const isIndeterminate =
    selectedUsers.length > 0 && selectedUsers.length < paginatedUsers.length;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    const total =
      activeTab === "applications"
        ? brokerAppsTotalPages
        : totalPages;

    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (currentPage >= total - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 3; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      pages.push(currentPage + 1);
      pages.push("...");
      pages.push(total);
    }
    return pages;
  };

  const showProfilesSkeleton =
    activeTab !== "applications" && loadingProfiles;
  const showBrokerSkeleton =
    activeTab === "applications" && loadingBrokerApps;

  if (showProfilesSkeleton) {
    return (
      <div className="p-4 sm:p-8">
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab !== "applications" && profilesError) {
    return (
      <div className="p-4 sm:p-8">
        <Card className="p-6">
          <CardContent className="text-center">
            <h2 className="text-xl font-bold mb-2">Error Loading Users</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading the user data. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const listLength =
    activeTab === "applications"
      ? filteredBrokerApps.length
      : filteredUsers.length;
  const displayStart =
    activeTab === "applications" ? brokerAppsStart : startIndex;
  const displayEnd =
    activeTab === "applications"
      ? Math.min(brokerAppsEnd, filteredBrokerApps.length)
      : Math.min(endIndex, filteredUsers.length);

  return (
    <div className="p-4 sm:p-8">
      <Dialog
        open={rejectDialogApp !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialogApp(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Reject application</DialogTitle>
          </DialogHeader>
          {rejectDialogApp && (
            <p className="text-sm text-muted-foreground">
              Reject{" "}
              <span className="font-medium text-foreground">
                {rejectDialogApp.profile.first_name}{" "}
                {rejectDialogApp.profile.last_name}
              </span>
              . A reason is required.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="broker-reject-reason">Reason</Label>
            <Textarea
              id="broker-reject-reason"
              placeholder="Explain why this application is rejected..."
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
                setRejectDialogApp(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => submitBrokerReject()}
              disabled={brokerActionMutation.isPending}
            >
              {brokerActionMutation.isPending &&
              brokerActionMutation.variables?.action === "reject" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Rejecting…
                </>
              ) : (
                "Reject application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">All Users</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage users — monitor access & activities. Review broker
          applications in the Applications tab.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
          <TabsList className="bg-muted/60 h-auto flex-wrap justify-start sm:justify-center gap-1">
            <TabsTrigger value="all" className={userTabTriggerActive}>
              All users
            </TabsTrigger>
            <TabsTrigger value="buyers" className={userTabTriggerActive}>
              Buyers
            </TabsTrigger>
            <TabsTrigger value="brokers" className={userTabTriggerActive}>
              Brokers
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className={userTabTriggerActive}
            >
              Broker applications
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-96 shrink-0">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={
              activeTab === "applications"
                ? "Search applications..."
                : "Search user..."
            }
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-12 h-12 sm:h-14 rounded-full"
          />
        </div>
      </div>

      {activeTab === "applications" && brokerAppsError && (
        <Card className="mb-6 border-destructive/30">
          <CardContent className="p-6 text-center">
            <p className="font-medium mb-2">Could not load broker applications</p>
            <p className="text-sm text-muted-foreground mb-4">
              {brokerAppsError instanceof Error
                ? brokerAppsError.message
                : "Something went wrong."}
            </p>
            <Button variant="outline" onClick={() => refetchBrokerApps()}>
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "applications" ? (
        <div className="border border-primary/10 rounded-lg overflow-hidden">
          {showBrokerSkeleton ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <>
              <div className="hidden lg:grid grid-cols-12 gap-4 items-center bg-primary/5 border-b border-primary/10 px-6 py-4">
                <div className="col-span-3 text-sm font-medium text-primary/80">
                  Applicant
                </div>
                <div className="col-span-2 text-sm font-medium text-primary/80">
                  Contact
                </div>
                <div className="col-span-2 text-sm font-medium text-primary/80">
                  National ID
                </div>
                <div className="col-span-2 text-sm font-medium text-primary/80">
                  Telebirr
                </div>
                <div className="col-span-1 text-sm font-medium text-primary/80">
                  Status
                </div>
                <div className="col-span-1 text-sm font-medium text-primary/80">
                  Submitted
                </div>
                <div className="col-span-1 text-sm font-medium text-primary/80 text-right">
                  Actions
                </div>
              </div>

              <div className="divide-y divide-primary/5">
                {paginatedBrokerApps.length > 0 ? (
                  paginatedBrokerApps.map((app) => (
                    <div
                      key={app.id}
                      className="px-4 sm:px-6 py-4 hover:bg-primary/5 transition-colors cursor-pointer"
                      onClick={() =>
                        router.push(`/users/${app.profile.id}`)
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/users/${app.profile.id}`);
                        }
                      }}
                    >
                      <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-3">
                          <div className="font-medium">
                            {app.profile.first_name} {app.profile.last_name}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {app.role}
                          </div>
                        </div>
                        <div className="col-span-2 text-sm">
                          {app.profile.contact}
                        </div>
                        <div className="col-span-2 text-xs font-mono truncate">
                          {app.national_id}
                        </div>
                        <div className="col-span-2 text-sm truncate">
                          {app.telebirr_account}
                        </div>
                        <div className="col-span-1">
                          {applicationStatusBadge(app.status)}
                        </div>
                        <div className="col-span-1 text-sm text-muted-foreground">
                          {formatAppDate(app.created_at)}
                        </div>
                        <div
                          className="col-span-1 flex justify-end"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 cursor-pointer"
                                disabled={isActingOnBroker(app.id)}
                              >
                                {isActingOnBroker(app.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/users/${app.profile.id}`)
                                }
                              >
                                View profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleBrokerApprove(app)}
                              >
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setRejectDialogApp(app);
                                  setRejectReason("");
                                }}
                              >
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:hidden">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-medium">
                              {app.profile.first_name} {app.profile.last_name}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {app.role}
                            </div>
                          </div>
                          {applicationStatusBadge(app.status)}
                        </div>
                        <div className="grid grid-cols-1 gap-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              Contact:{" "}
                            </span>
                            {app.profile.contact}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              National ID:{" "}
                            </span>
                            <span className="font-mono text-xs">
                              {app.national_id}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Telebirr:{" "}
                            </span>
                            {app.telebirr_account}
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Submitted:{" "}
                            </span>
                            {formatAppDate(app.created_at)}
                          </div>
                        </div>
                        <div
                          className="flex justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                disabled={isActingOnBroker(app.id)}
                              >
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/users/${app.profile.id}`)
                                }
                              >
                                View profile
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleBrokerApprove(app)}
                              >
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setRejectDialogApp(app);
                                  setRejectReason("");
                                }}
                              >
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 sm:px-6 py-8 text-center">
                    <h3 className="text-lg font-semibold mb-2">
                      No applications
                    </h3>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "No broker applications match your search."
                        : "There are no broker applications to show."}
                    </p>
                  </div>
                )}
              </div>

              {filteredBrokerApps.length > 0 && (
                <div className="p-4 border-t border-primary/10">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {displayStart + 1} to {displayEnd} of{" "}
                      {filteredBrokerApps.length} applications
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) =>
                          page === "..." ? (
                            <span
                              key={`ellipsis-${index}`}
                              className="px-2 text-muted-foreground"
                            >
                              ...
                            </span>
                          ) : (
                            <Button
                              key={page}
                              size="sm"
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              className={
                                currentPage === page
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-primary/5 hover:border-primary/30"
                              }
                              onClick={() => handlePageChange(page as number)}
                            >
                              {page}
                            </Button>
                          ),
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === brokerAppsTotalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="border border-primary/10 rounded-lg overflow-hidden">
          <div className="hidden lg:block bg-primary/5 border-b border-primary/10 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all users on this page"
                  {...(isIndeterminate && { "data-state": "indeterminate" })}
                />
              </div>
              <div className="col-span-3">
                <span className="text-sm font-medium text-primary/80">Name</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-medium text-primary/80">Role</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-medium text-primary/80">
                  Contact
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-medium text-primary/80">
                  Status
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-sm font-medium text-primary/80">
                  Points
                </span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-primary/5">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className={`px-4 sm:px-6 py-4 transition-colors cursor-pointer ${
                    selectedUsers.includes(user.id)
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-primary/5"
                  }`}
                  onClick={() => router.push(`/users/${user.id}`)}
                >
                  <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) =>
                          handleSelectUser(user.id, checked as boolean)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <span className="text-sm font-medium text-primary">
                          {user.first_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          User ID: #{user.user}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <Badge
                        variant={user.role === "admin" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm">{user.contact}</span>
                    </div>
                    <div className="col-span-2">
                      <Badge className="bg-primary text-primary-foreground rounded-full lowercase">
                        Active
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm font-medium">
                        {user.buyer_profile?.loyalty_points || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:hidden">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) =>
                          handleSelectUser(user.id, checked as boolean)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <span className="text-sm font-medium text-primary">
                          {user.first_name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          User ID: #{user.user}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Role:</span>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                          className="ml-2 capitalize"
                        >
                          {user.role}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact:</span>
                        <span className="ml-2">{user.contact}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className="ml-2 bg-primary text-primary-foreground rounded-full lowercase">
                          Active
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Points:</span>
                        <span className="ml-2 font-medium">
                          {user.buyer_profile?.loyalty_points || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 sm:px-6 py-8 text-center">
                <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No users match your search criteria."
                    : activeTab === "buyers"
                      ? "No buyer users found."
                      : activeTab === "brokers"
                        ? "No broker users found."
                        : "No users found."}
                </p>
              </div>
            )}
          </div>

          {filteredUsers.length > 0 && (
            <div className="p-4 border-t border-primary/10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Showing {displayStart + 1} to {displayEnd} of{" "}
                  {filteredUsers.length} users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-muted-foreground"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          size="sm"
                          variant={currentPage === page ? "default" : "outline"}
                          className={
                            currentPage === page
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-primary/5 hover:border-primary/30"
                          }
                          onClick={() => handlePageChange(page as number)}
                        >
                          {page}
                        </Button>
                      ),
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
