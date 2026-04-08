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
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProfileById } from "@/lib/profileApi";
import { UserProfile } from "@/app/types/Profile";
import { formatDistanceToNow } from "date-fns";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const { data: user, isLoading, error } = useQuery<UserProfile>({
    queryKey: ["user", userId],
    queryFn: () => getProfileById(parseInt(userId)),
    enabled: !!userId,
  });

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

  if (error || !user) {
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
      admin: { label: "Admin", variant: "default" },
      dealer: { label: "Dealer", variant: "secondary" },
      broker: { label: "Broker", variant: "secondary" },
      buyer: { label: "User", variant: "secondary" },
    };
    // Default to secondary if role is not in map
    const roleInfo = roleMap[role?.toLowerCase()] || { label: role, variant: "secondary" };
    return (
      <Badge variant={roleInfo.variant} className="capitalize">
        {roleInfo.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string | boolean) => {
    // Handling boolean or string status if API differs
    const statusText = status === true ? "Active" : status === false ? "Inactive" : status;
    return (
      <Badge className="bg-green-700 text-white rounded-full lowercase">
        {statusText || "Active"}
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
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {user.image ? (
                <img src={user.image} alt={user.first_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-medium">{user.first_name?.[0]}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                {user.first_name} {user.last_name}
              </h1>
              <div className="flex items-center gap-2">
                {getRoleBadge(user.role)}
                {getStatusBadge("Active")}
              </div>
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
                    <p className="font-semibold">{user.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{user.contact || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-semibold">{user.address || "N/A"}</p>
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
                    <p className="font-semibold">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Active</p>
                    <p className="font-semibold">
                      {user.updated_at ? formatDistanceToNow(new Date(user.updated_at), { addSuffix: true }) : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Car className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Listings
                    </p>
                    <p className="font-semibold">0</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Verified Listings
                    </p>
                    <p className="font-semibold">0</p>
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
