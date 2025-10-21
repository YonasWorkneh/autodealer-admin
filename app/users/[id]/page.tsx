"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Car,
  CheckCircle,
  User,
  Shield,
  Activity,
} from "lucide-react";
import { useState } from "react";

// Mock data - in real app, this would come from API
const users = [
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
    bio: "Experienced automotive professional with over 5 years in the industry. Specializes in luxury vehicles and has built a strong reputation for quality service.",
    joinDate: "July 3, 2018",
    lastLogin: "2 hours ago",
    totalSales: 45,
    averageRating: 4.8,
    responseTime: "Within 1 hour",
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
    bio: "Passionate car dealer with expertise in both new and used vehicles. Committed to providing excellent customer service and fair pricing.",
    joinDate: "July 3, 2018",
    lastLogin: "1 day ago",
    totalSales: 23,
    averageRating: 4.6,
    responseTime: "Within 2 hours",
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
    bio: "Professional automotive broker connecting buyers and sellers. Known for quick transactions and transparent communication.",
    joinDate: "July 3, 2018",
    lastLogin: "3 hours ago",
    totalSales: 67,
    averageRating: 4.9,
    responseTime: "Within 30 minutes",
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
    bio: "Local dealer with deep knowledge of the Ethiopian automotive market. Specializes in reliable, family-friendly vehicles.",
    joinDate: "July 3, 2018",
    lastLogin: "5 hours ago",
    totalSales: 34,
    averageRating: 4.7,
    responseTime: "Within 1 hour",
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
    bio: "New to the platform but enthusiastic about finding the perfect vehicle. Looking for reliable and affordable options.",
    joinDate: "July 3, 2018",
    lastLogin: "1 hour ago",
    totalSales: 0,
    averageRating: 0,
    responseTime: "Within 4 hours",
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
    bio: "Experienced broker with a focus on commercial vehicles and fleet management. Known for handling complex transactions efficiently.",
    joinDate: "July 3, 2018",
    lastLogin: "4 hours ago",
    totalSales: 89,
    averageRating: 4.8,
    responseTime: "Within 1 hour",
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
    bio: "Local dealer specializing in budget-friendly vehicles. Committed to making car ownership accessible to everyone in the community.",
    joinDate: "July 3, 2018",
    lastLogin: "6 hours ago",
    totalSales: 18,
    averageRating: 4.5,
    responseTime: "Within 2 hours",
  },
];

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [isLoading] = useState(false);

  // Find user by ID
  const user = users.find((u) => u.id === parseInt(userId));

  if (isLoading) {
    return (
      <div className="flex bg-background max-w-7xl mx-auto">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="border-b border-border p-4 md:p-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex-1 p-4 md:p-6 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex bg-background max-w-7xl mx-auto items-center justify-center min-h-screen">
        <Card className="p-6">
          <CardContent className="text-center">
            <h2 className="text-xl font-bold mb-2">User Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/users")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const roleMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" }
    > = {
      Admin: { label: "Admin", variant: "default" },
      Dealer: { label: "Dealer", variant: "secondary" },
      Broker: { label: "Broker", variant: "secondary" },
      User: { label: "User", variant: "secondary" },
    };
    const roleInfo = roleMap[role] || roleMap["User"];
    return (
      <Badge variant={roleInfo.variant} className="capitalize">
        {roleInfo.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className="bg-green-700 text-white rounded-full lowercase">
        {status}
      </Badge>
    );
  };

  return (
    <div className="flex bg-background max-w-7xl mx-auto">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4 md:p-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/users")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
          </Button>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <span className="text-2xl font-medium">{user.initial}</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {user.name}
                </h1>
                <div className="flex items-center gap-2">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Edit User</Button>
              <Button variant="destructive">Suspend</Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{user.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                    <p className="font-semibold">{user.joinDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Active</p>
                    <p className="font-semibold">{user.lastActive}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Listings
                    </p>
                    <p className="font-semibold">{user.totalListings}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Verified Listings
                    </p>
                    <p className="font-semibold">{user.verifiedListings}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="font-semibold">{user.totalSales}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Average Rating
                    </p>
                    <p className="font-semibold">
                      {user.averageRating > 0
                        ? `${user.averageRating}/5.0`
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Response Time
                    </p>
                    <p className="font-semibold">{user.responseTime}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {user.bio && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{user.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">User logged in</p>
                    <p className="text-xs text-muted-foreground">
                      {user.lastActive}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Listed new vehicle</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Updated profile information
                    </p>
                    <p className="text-xs text-muted-foreground">1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
