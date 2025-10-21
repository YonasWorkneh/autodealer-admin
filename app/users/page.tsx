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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const volunteers = [
  {
    id: 1,
    name: "Beza Tesfaye",
    email: "beza.tesfaye@example.et",
    phone: "+251 91 123 4567",
    role: "Admin",
    location: "Addis Ababa, Ethiopia",
    initial: "B",
    status: "Active",
    enrolled: "July 3, 2018",
    lastActive: "2 hours ago",
    totalListings: 15,
    verifiedListings: 12,
  },
  {
    id: 2,
    name: "Yonatan",
    email: "yonatan@example.et",
    phone: "+251 92 234 5678",
    role: "Dealer",
    location: "Bahir Dar, Ethiopia",
    initial: "Y",
    status: "Active",
    enrolled: "July 3, 2018",
    lastActive: "1 day ago",
    totalListings: 8,
    verifiedListings: 6,
  },
  {
    id: 3,
    name: "Wube",
    email: "wube@example.et",
    phone: "+251 93 345 6789",
    role: "Broker",
    location: "Hawassa, Ethiopia",
    initial: "W",
    status: "Active",
    enrolled: "July 3, 2018",
    lastActive: "3 hours ago",
    totalListings: 22,
    verifiedListings: 18,
  },
  {
    id: 4,
    name: "Bisrat Yohannes",
    email: "bisrat.yohannes@example.et",
    phone: "+251 94 456 7890",
    role: "Dealer",
    location: "Mekelle, Ethiopia",
    initial: "B",
    status: "Active",
    enrolled: "July 3, 2018",
    lastActive: "5 hours ago",
    totalListings: 11,
    verifiedListings: 9,
  },
  {
    id: 5,
    name: "Mekdes",
    email: "mekdes@example.et",
    phone: "+251 95 567 8901",
    role: "User",
    location: "Dire Dawa, Ethiopia",
    initial: "M",
    status: "Active",
    enrolled: "July 3, 2018",
    lastActive: "1 hour ago",
    totalListings: 3,
    verifiedListings: 2,
  },
  {
    id: 6,
    name: "Ahadu Sefefe",
    email: "ahadu.sefefe@example.et",
    phone: "+251 96 678 9012",
    role: "Broker",
    location: "Gondar, Ethiopia",
    initial: "A",
    status: "Active",
    enrolled: "July 3, 2018",
    lastActive: "4 hours ago",
    totalListings: 19,
    verifiedListings: 16,
  },
  {
    id: 7,
    name: "Lidya Sefefe",
    email: "lidya.sefefe@example.et",
    phone: "+251 97 789 0123",
    role: "Dealer",
    location: "Jimma, Ethiopia",
    initial: "L",
    status: "Active",
    enrolled: "July 3, 2018",
    lastActive: "6 hours ago",
    totalListings: 7,
    verifiedListings: 5,
  },
];

export default function Page() {
  const router = useRouter();
  const [selectedVolunteers, setSelectedVolunteers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectAll = (checked: boolean) => {
    setSelectedVolunteers(checked ? volunteers.map((v) => v.id) : []);
  };

  const handleSelectVolunteer = (id: number, checked: boolean) => {
    setSelectedVolunteers((prev) =>
      checked ? [...prev, id] : prev.filter((vid) => vid !== id)
    );
  };

  const isAllSelected = selectedVolunteers.length === volunteers.length;
  const isIndeterminate =
    selectedVolunteers.length > 0 &&
    selectedVolunteers.length < volunteers.length;

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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 sm:h-14 rounded-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-muted/50 border-b border-border px-6 py-4">
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
              <span className="text-sm font-medium">Name</span>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium">Role</span>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium">Phone</span>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium">Status</span>
            </div>
            <div className="col-span-1">
              <span className="text-sm font-medium">Listings</span>
            </div>
            <div className="col-span-1"></div>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border">
          {volunteers.map((volunteer) => (
            <div
              key={volunteer.id}
              className="px-4 sm:px-6 py-4 hover:bg-muted/30 transition-colors"
            >
              {/* Desktop Grid */}
              <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1">
                  <Checkbox
                    checked={selectedVolunteers.includes(volunteer.id)}
                    onCheckedChange={(checked) =>
                      handleSelectVolunteer(volunteer.id, checked as boolean)
                    }
                  />
                </div>
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {volunteer.initial}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{volunteer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {volunteer.email}
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <Badge
                    variant={
                      volunteer.role === "Admin" ? "default" : "secondary"
                    }
                    className="capitalize"
                  >
                    {volunteer.role}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-sm">{volunteer.phone}</span>
                </div>
                <div className="col-span-2">
                  <Badge className="bg-green-700 text-white rounded-full lowercase">
                    {volunteer.status}
                  </Badge>
                </div>
                <div className="col-span-1">
                  <span className="text-sm font-medium">
                    {volunteer.totalListings}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/users/${volunteer.id}`)}
                      >
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Mobile/Tablet Card */}
              <div className="flex flex-col gap-3 lg:hidden">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedVolunteers.includes(volunteer.id)}
                    onCheckedChange={(checked) =>
                      handleSelectVolunteer(volunteer.id, checked as boolean)
                    }
                  />
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {volunteer.initial}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{volunteer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {volunteer.email}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/users/${volunteer.id}`)}
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
                        volunteer.role === "Admin" ? "default" : "secondary"
                      }
                      className="ml-2 capitalize"
                    >
                      {volunteer.role}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2">{volunteer.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="ml-2 bg-green-700 text-white rounded-full lowercase">
                      {volunteer.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Listings:</span>
                    <span className="ml-2 font-medium">
                      {volunteer.totalListings}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-primary text-white">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
