"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserProfiles } from "@/hooks/userProfiles";
import type { UserProfile } from "@/app/types/UserProfile";

export default function Page() {
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { data: userProfiles, isLoading, error } = useUserProfiles();

  // Filter users who are neither brokers nor dealers
  const regularUsers =
    userProfiles?.filter(
      (user) => !user.broker_profile && !user.dealer_profile
    ) || [];

  // Filter users based on search query
  const filteredUsers = regularUsers.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.first_name.toLowerCase().includes(query) ||
      user.last_name.toLowerCase().includes(query) ||
      user.contact.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search query changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedUsers(checked ? paginatedUsers.map((u) => u.id) : []);
  };

  const handleSelectUser = (id: number, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, id] : prev.filter((uid) => uid !== id)
    );
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedUsers([]); // Clear selections when changing pages
    }
  };

  const isAllSelected =
    selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0;
  const isIndeterminate =
    selectedUsers.length > 0 && selectedUsers.length < paginatedUsers.length;

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (isLoading) {
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
                  <Skeleton className="h-8 w-8" />
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

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">All Users</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage users — monitor access & activities.
        </p>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search user..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-12 h-12 sm:h-14 rounded-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-primary/10 rounded-lg overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-primary/5 border-b border-primary/10 px-6 py-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all volunteers"
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
              <span className="text-sm font-medium text-primary/80">Contact</span>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium text-primary/80">Status</span>
            </div>
            <div className="col-span-1">
              <span className="text-sm font-medium text-primary/80">Points</span>
            </div>
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-primary/5">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <div
                key={user.id}
                className={`px-4 sm:px-6 py-4 transition-colors cursor-pointer ${selectedUsers.includes(user.id)
                  ? "bg-primary/5 hover:bg-primary/10"
                  : "hover:bg-primary/5"
                  }`}
                onClick={() => router.push(`/users/${user.id}`)}
              >
                {/* Desktop Grid */}
                <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) =>
                        handleSelectUser(user.id, checked as boolean)
                      }
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
                  <div className="col-span-1">
                    <span className="text-sm font-medium">
                      {user.buyer_profile?.loyalty_points || 0}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                  </div>
                </div>

                {/* Mobile/Tablet Card */}
                <div className="flex flex-col gap-3 lg:hidden">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) =>
                        handleSelectUser(user.id, checked as boolean)
                      }
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/users/${user.id}`)}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                  : "No regular users found (excluding brokers and dealers)."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="p-4 border-t border-primary/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
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
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        key={page}
                        size="sm"
                        variant={currentPage === page ? "default" : "outline"}
                        className={currentPage === page ? "bg-primary text-primary-foreground" : "hover:bg-primary/5 hover:border-primary/30"}
                        onClick={() => handlePageChange(page as number)}
                      >
                        {page}
                      </Button>
                    )
                  ))}
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
    </div>
  );
}
