"use client";

import { useParams, useRouter } from "next/navigation";
import { useCar, useApproveCar, useRejectCar, useCarViews } from "@/hooks/cars";
import { useUserProfile } from "@/hooks/userProfiles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import {
  ArrowLeft,
  Calendar,
  Gauge,
  Fuel,
  Car as CarIcon,
  Palette,
  Settings,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Building2,
  Phone,
  MapPin,
  ShieldCheck,
  CreditCard,
  UserCircle,
  Eye,
  Mail,
} from "lucide-react";
import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CarView } from "@/app/types/CarView";

// Component to display a single view row with user information
function ViewRow({ view }: { view: CarView }) {
  const { data: userProfile, isLoading: isLoadingProfile } = useUserProfile(
    view.user_id || null
  );

  const fullName = `${view.first_name || ""} ${view.last_name || ""}`.trim();
  const displayName =
    fullName || view.user__email?.split("@")[0] || "Unknown User";
  const initials = fullName
    ? `${view.first_name?.[0] || ""}${view.last_name?.[0] || ""}`.toUpperCase()
    : view.user__email?.[0]?.toUpperCase() || "?";

  // Use role from user profile if available, otherwise show N/A
  const viewerType = userProfile?.role || null;

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {initials}
          </div>
          <div>
            <p className="font-medium">{displayName}</p>
            {isLoadingProfile ? (
              <Skeleton className="h-3 w-16 mt-1" />
            ) : viewerType ? (
              <p className="text-xs text-muted-foreground capitalize">
                {viewerType}
              </p>
            ) : null}
          </div>
        </div>
      </TableCell>
      <TableCell>
        {view.contact && !view.contact.includes("@") ? (
          <a
            href={`tel:${view.contact}`}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            <Phone className="h-3 w-3" />
            {view.contact}
          </a>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )}
      </TableCell>
      <TableCell>
        {view.user__email ? (
          <a
            href={`mailto:${view.user__email}`}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            <Mail className="h-3 w-3" />
            {view.user__email}
          </a>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )}
      </TableCell>
      <TableCell>
        {isLoadingProfile ? (
          <Skeleton className="h-5 w-20" />
        ) : viewerType ? (
          <Badge
            variant={
              viewerType === "dealer" ||
              viewerType === "broker" ||
              viewerType === "buyer"
                ? "default"
                : "secondary"
            }
            className="capitalize"
          >
            {viewerType}
          </Badge>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          {new Date(view.viewed_at).toLocaleString()}
        </div>
      </TableCell>
    </TableRow>
  );
}

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const carId = Number(params.id);
  const { data: car, isLoading, error } = useCar(carId.toString());
  const profileId = car?.dealer || car?.broker || null;
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile(
    profileId
  );
  const { data: carViews, isLoading: isLoadingViews } = useCarViews(carId);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Set initial image index to featured image when car data loads
  React.useEffect(() => {
    if (car?.images && car.images.length > 0) {
      const featuredIndex = car.images.findIndex((img) => img.is_featured);
      if (featuredIndex !== -1) {
        setCurrentImageIndex(featuredIndex);
      } else {
        setCurrentImageIndex(0);
      }
    }
  }, [car]);

  const approveMutation = useApproveCar(
    (data) => {
      showToast(
        "success",
        `The car ${car?.make} ${car?.model} has been approved and is now live.`
      );
      setShowApproveDialog(false);
    },
    (error) => {
      showToast(
        "error",
        `${error.message || "Failed to approve car. Please try again."}`
      );
    }
  );

  const rejectMutation = useRejectCar(
    (data) => {
      const isPending = car?.verification_status === "pending";
      showToast(
        "success",
        `The car ${car?.make} ${car?.model} has been ${
          isPending ? "rejected" : "removed from live listings"
        }. ${rejectReason ? "Reason provided to seller." : ""}`
      );
      setShowRejectDialog(false);
      setRejectReason("");
    },
    (error) => {
      const isPending = car?.verification_status === "pending";
      showToast(
        "error",
        `Failed to ${isPending ? "reject" : "remove"} car. ${
          error.message || "Please try again."
        }`
      );
    }
  );

  const handleApprove = () => {
    if (car) {
      approveMutation.mutate(car.id);
    }
  };

  const handleReject = () => {
    if (car) {
      rejectMutation.mutate({ id: car.id, reason: rejectReason });
    }
  };

  if (isLoading) {
    return (
      <div className="flex bg-background max-w-7xl">
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

  if (error || !car) {
    return (
      <div className="flex bg-background max-w-7xl items-center justify-center">
        <Card className="p-6">
          <CardContent className="text-center">
            <h2 className="text-xl font-bold mb-2">Car Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The car you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/listing")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const featuredImage =
    car.images.find((img) => img.is_featured) || car.images[0];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + car.images.length) % car.images.length
    );
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "destructive" }
    > = {
      available: { label: "Available", variant: "default" },
      pending: { label: "Pending Review", variant: "secondary" },
      verified: { label: "Verified", variant: "default" },
      rejected: { label: "Rejected", variant: "destructive" },
      sold: { label: "Sold", variant: "secondary" },
    };
    const statusInfo =
      statusMap[status.toLowerCase()] || statusMap["available"];
    return (
      <Badge variant={statusInfo.variant} className="capitalize">
        {statusInfo.label}
      </Badge>
    );
  };

  const carFeatures = [
    { label: "Bluetooth", value: car.bluetooth },
    { label: "Heated Seats", value: car.heated_seats },
    { label: "Navigation", value: car.navigation_system },
    { label: "Leather Seats", value: car.leather_seats },
    { label: "Sunroof", value: car.sunroof },
    { label: "Parking Sensors", value: car.parking_sensors },
    { label: "Rear Camera", value: car.rear_view_camera },
    { label: "Keyless Entry", value: car.keyless_entry },
    { label: "Climate Control", value: car.climate_control },
    { label: "Power Windows", value: car.power_windows },
    { label: "Cruise Control", value: car.cruise_control },
    { label: "Premium Sound", value: car.premium_sound_system },
  ].filter((feature) => feature.value);

  return (
    <>
      <div className="flex bg-background max-w-7xl">
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-border p-4 md:p-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/listing")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Listings
            </Button>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 capitalize">
                  {car.make} {car.model} {car.year}
                  
                </h1>
                <div className="flex items-center gap-2">
                  {getStatusBadge(car.verification_status)}
                  {getStatusBadge(car.status)}
                </div>
              </div>
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {formatPrice(car.price)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6 space-y-6">
            {/* Action Buttons */}
            {car.verification_status === "pending" && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-blue-900">
                          Pending Review
                        </h3>
                        <p className="text-sm text-blue-700">
                          This car is awaiting verification
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => setShowApproveDialog(true)}
                        disabled={
                          approveMutation.isPending || rejectMutation.isPending
                        }
                      >
                        {approveMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        {approveMutation.isPending ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setShowRejectDialog(true)}
                        disabled={
                          approveMutation.isPending || rejectMutation.isPending
                        }
                      >
                        {rejectMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <X className="mr-2 h-4 w-4" />
                        )}
                        {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reject Button for Approved Cars */}
            {(car.verification_status === "verified" ||
              car.status === "live") && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-900">
                          Car Approved & Live
                        </h3>
                        <p className="text-sm text-green-700">
                          This car is currently live and visible to users
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => setShowRejectDialog(true)}
                        disabled={rejectMutation.isPending}
                      >
                        {rejectMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <X className="mr-2 h-4 w-4" />
                        )}
                        {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Images</CardTitle>
              </CardHeader>
              <CardContent>
                {car.images.length > 0 ? (
                  <div className="flex gap-4">
                    {/* Main Image - Left Side */}
                    <div className="flex-1 relative">
                      <div className="relative overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={car.images[currentImageIndex].image_url}
                          alt={
                            car.images[currentImageIndex].caption ||
                            `${car.make} ${car.model}`
                          }
                          width={100}
                          height={100}
                          className="w-full h-[400px] sm:h-[500px] object-cover"
                        />

                        {/* Navigation Icons */}
                        {car.images.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-primary/50 hover:bg-primary/70 text-primary-foreground hover:text-primary-foreground cursor-pointer rounded-full h-10 w-10"
                              onClick={prevImage}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary/50 hover:bg-primary/70 text-primary-foreground hover:text-primary-foreground cursor-pointer rounded-full h-10 w-10"
                              onClick={nextImage}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </>
                        )}

                        {/* Image Counter */}
                        <div className="absolute bottom-4 right-4 bg-primary/70 text-primary-foreground px-2 py-1 rounded text-sm flex items-center gap-1">
                          <Image
                            src={"/image-count.svg"}
                            alt={`Image ${currentImageIndex + 1}`}
                            width={100}
                            height={100}
                            className="w-5 h-5 opacity-70"
                          />
                          <span className="text-white">
                            {currentImageIndex + 1} / {car.images.length}
                          </span>
                        </div>

                        {/* Featured Badge */}
                        {car.images[currentImageIndex].is_featured && (
                          <Badge className="absolute top-4 left-4 bg-green-600">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Thumbnails - Right Side */}
                    <div className="w-32 space-y-2">
                      {car.images.slice(0, 4).map((image, index) => (
                        <div
                          key={image.id}
                          className={`relative overflow-hidden rounded-lg cursor-pointer transition-all duration-200 ${
                            index === currentImageIndex
                              ? "ring-2 ring-blue-500 scale-105"
                              : "hover:scale-105 opacity-70 hover:opacity-100"
                          }`}
                          onClick={() => selectImage(index)}
                        >
                          <Image
                            src={image.image_url}
                            alt={image.caption || `${car.make} ${car.model}`}
                            width={100}
                            height={100}
                            className="w-full h-20 object-cover"
                          />
                          {image.is_featured && (
                            <Badge className="absolute top-1 left-1 text-xs bg-green-600">
                              ★
                            </Badge>
                          )}
                        </div>
                      ))}

                      {/* Show more indicator if there are more than 4 images */}
                      {car.images.length > 4 && (
                        <div className="relative overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center h-20">
                          <span className="text-sm text-gray-600 font-medium">
                            +{car.images.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                    <p className="text-muted-foreground">No images available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-semibold">{car.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gauge className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mileage</p>
                      <p className="font-semibold">
                        {car.mileage.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Fuel className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel Type</p>
                      <p className="font-semibold capitalize">
                        {car.fuel_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CarIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Body Type</p>
                      <p className="font-semibold capitalize">
                        {car.body_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Palette className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Exterior Color
                      </p>
                      <p className="font-semibold capitalize">
                        {car.exterior_color}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Drivetrain
                      </p>
                      <p className="font-semibold uppercase">
                        {car.drivetrain}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {car.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{car.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {carFeatures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {carFeatures.map((feature) => (
                      <div
                        key={feature.label}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-green-600" />
                        <span>{feature.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dealer/Broker Information */}
            {(car.dealer || car.broker) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {car.dealer ? (
                      <Building2 className="h-5 w-5" />
                    ) : (
                      <UserCircle className="h-5 w-5" />
                    )}
                    {car.dealer ? "Dealer Information" : "Broker Information"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingProfile ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    </div>
                  ) : profile ? (
                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <Image
                            src={
                              profile.image_url ||
                              profile.image ||
                              "/placeholder-user.jpg"
                            }
                            alt={`${profile.first_name} ${profile.last_name}`}
                            width={64}
                            height={64}
                            className="rounded-full object-cover border-2 border-border"
                          />
                          {(profile.dealer_profile?.is_verified ||
                            profile.broker_profile?.is_verified) && (
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                              <ShieldCheck className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold">
                              {profile.first_name} {profile.last_name}
                            </h3>
                            {(profile.dealer_profile?.is_verified ||
                              profile.broker_profile?.is_verified) && (
                              <Badge
                                variant="default"
                                className="bg-green-600 text-white"
                              >
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          {profile.dealer_profile?.company_name && (
                            <p className="text-muted-foreground flex items-center gap-1 mb-2">
                              <Building2 className="h-4 w-4" />
                              {profile.dealer_profile.company_name}
                            </p>
                          )}
                          {(profile.dealer_profile?.role ||
                            profile.broker_profile?.role) && (
                            <p className="text-muted-foreground flex items-center gap-1 mb-2">
                              <UserCircle className="h-4 w-4" />
                              {profile.dealer_profile?.role ||
                                profile.broker_profile?.role}
                            </p>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                            {profile.contact && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Contact:
                                </span>
                                <span className="font-medium">
                                  {profile.contact}
                                </span>
                              </div>
                            )}
                            {profile.address && (
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                  <span className="text-muted-foreground">
                                    Address:
                                  </span>
                                  <span className="font-medium ml-1">
                                    {profile.address}
                                  </span>
                                </div>
                              </div>
                            )}
                            {profile.dealer_profile?.license_number && (
                              <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  License Number:
                                </span>
                                <span className="font-medium">
                                  {profile.dealer_profile.license_number}
                                </span>
                              </div>
                            )}
                            {profile.broker_profile?.national_id && (
                              <div className="flex items-center gap-2 text-sm">
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  National ID:
                                </span>
                                <span className="font-medium">
                                  {profile.broker_profile.national_id}
                                </span>
                              </div>
                            )}
                            {profile.dealer_profile?.tax_id && (
                              <div className="flex items-center gap-2 text-sm">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Tax ID:
                                </span>
                                <span className="font-medium">
                                  {profile.dealer_profile.tax_id}
                                </span>
                              </div>
                            )}
                            {(profile.dealer_profile?.telebirr_account ||
                              profile.broker_profile?.telebirr_account) && (
                              <div className="flex items-center gap-2 text-sm">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Telebirr Account:
                                </span>
                                <span className="font-medium">
                                  {profile.dealer_profile?.telebirr_account ||
                                    profile.broker_profile?.telebirr_account}
                                </span>
                              </div>
                            )}
                            {profile.role && (
                              <div className="flex items-center gap-2 text-sm">
                                <UserCircle className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  User Role:
                                </span>
                                <span className="font-medium capitalize">
                                  {profile.role}
                                </span>
                              </div>
                            )}
                            {profile.created_at && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Profile Created:
                                </span>
                                <span className="font-medium">
                                  {new Date(
                                    profile.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {profile.updated_at && (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Last Updated:
                                </span>
                                <span className="font-medium">
                                  {new Date(
                                    profile.updated_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>
                        {car.dealer
                          ? "Dealer information not available"
                          : "Broker information not available"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Car Views */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Car Views ({carViews?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingViews ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : carViews && carViews.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Viewer</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Viewer Role</TableHead>
                          <TableHead>Viewed At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {carViews.map((view, index) => (
                          <ViewRow
                            key={`${view.user_id}-${view.viewed_at}-${index}`}
                            view={view}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No views yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="font-semibold capitalize">{car.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sale Type</p>
                    <p className="font-semibold capitalize">
                      {car.sale_type.replace("_", " ")}
                    </p>
                  </div>
                  {car.trim && (
                    <div>
                      <p className="text-sm text-muted-foreground">Trim</p>
                      <p className="font-semibold">{car.trim}</p>
                    </div>
                  )}
                  {car.engine && (
                    <div>
                      <p className="text-sm text-muted-foreground">Engine</p>
                      <p className="font-semibold">{car.engine}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Posted</p>
                    <p className="font-semibold">
                      {new Date(car.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>
                    <p className="font-semibold">
                      {new Date(car.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Car Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this car listing for{" "}
              <strong>
                {car?.make} {car?.model}
              </strong>
              ?
              <br />
              <br />
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Mark the listing as verified</li>
                <li>Make it visible to all users</li>
                <li>Allow buyers to contact the seller</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approveMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                "Approve Listing"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {car?.verification_status === "pending"
                ? "Reject Car Listing"
                : "Remove Car from Live Listings"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {car?.verification_status === "pending" ? (
                <>
                  You are about to reject the listing for{" "}
                  <strong>
                    {car?.make} {car?.model}
                  </strong>
                  .
                  <br />
                  <br />
                  This will:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Mark the listing as rejected</li>
                    <li>Hide it from public view</li>
                    <li>Notify the seller with your reason (optional)</li>
                  </ul>
                </>
              ) : (
                <>
                  You are about to remove the listing for{" "}
                  <strong>
                    {car?.make} {car?.model}
                  </strong>{" "}
                  from live listings.
                  <br />
                  <br />
                  This will:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Mark the listing as rejected/suspended</li>
                    <li>Remove it from public view</li>
                    <li>Notify the seller with your reason (optional)</li>
                    <li>
                      Users will no longer be able to see or contact about this
                      car
                    </li>
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <label
              htmlFor="reject-reason"
              className="text-sm font-medium mb-2 block"
            >
              {car?.verification_status === "pending"
                ? "Rejection Reason (Optional)"
                : "Removal Reason (Optional)"}
            </label>
            <Textarea
              id="reject-reason"
              placeholder={
                car?.verification_status === "pending"
                  ? "Enter a reason for rejection that will help the seller understand what needs to be improved..."
                  : "Enter a reason for removing this listing from live view..."
              }
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rejectMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {car?.verification_status === "pending"
                    ? "Rejecting..."
                    : "Removing..."}
                </>
              ) : car?.verification_status === "pending" ? (
                "Reject Listing"
              ) : (
                "Remove from Live"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
