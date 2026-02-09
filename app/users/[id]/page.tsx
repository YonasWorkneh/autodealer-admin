"use client";

import { useState } from "react";
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
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfileById } from "@/lib/profileApi";
import { UserProfile } from "@/app/types/Profile";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { getCredentials } from "@/lib/credential";

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [actionLoading, setActionLoading] = useState(false);

  const { data: user, isLoading, error } = useQuery<UserProfile>({
    queryKey: ["user", userId],
    queryFn: () => getProfileById(parseInt(userId)),
    enabled: !!userId,
  });

  const handleUserAction = async (action: "approve" | "reactivate" | "reject" | "suspend") => {
    // Check if user has broker_profile
    if (!user?.broker_profile) {
      toast({
        title: "Error",
        description: "Actions can only be performed on brokers.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const credential = await getCredentials();
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${API_URL}/brokers/admin/${userId}/${action}/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${credential.access}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const message = errorData?.detail || errorData?.message || `Failed to ${action} user`;
        throw new Error(message);
      }

      toast({
        title: "Success",
        description: `User ${action}d successfully.`,
        variant: "success",
      });

      // Refetch user data
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} user.`,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  console.log("user", user);
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
    const roleInfo = roleMap[role.toLowerCase()] || { label: role, variant: "secondary" };
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
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
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
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="cursor-pointer" disabled={actionLoading}>
                    <MoreVertical className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleUserAction("approve")}>
                    Approve
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUserAction("reactivate")}>
                    Reactivate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUserAction("reject")}>
                    Reject
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleUserAction("suspend")}
                    className="text-destructive"
                  >
                    Suspend
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
