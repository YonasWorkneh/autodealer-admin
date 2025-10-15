"use client";

import { useParams, useRouter } from "next/navigation";
import { useCar, useApproveCar, useRejectCar } from "@/hooks/cars";
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

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const carId = params.id as string;
  const { data: car, isLoading, error } = useCar(carId);
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
    () => {
      toast({
        title: "✅ Car Approved",
        description: "The car listing has been approved successfully.",
      });
      setShowApproveDialog(false);
    },
    () => {
      toast({
        title: "❌ Error",
        description: "Failed to approve the car. Please try again.",
        variant: "destructive",
      });
    }
  );

  const rejectMutation = useRejectCar(
    () => {
      toast({
        title: "✅ Car Rejected",
        description: "The car listing has been rejected.",
      });
      setShowRejectDialog(false);
      setRejectReason("");
    },
    () => {
      toast({
        title: "❌ Error",
        description: "Failed to reject the car. Please try again.",
        variant: "destructive",
      });
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
                        disabled={approveMutation.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setShowRejectDialog(true)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
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
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white hover:text-white cursor-pointer rounded-full h-10 w-10"
                              onClick={prevImage}
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white hover:text-white cursor-pointer rounded-full h-10 w-10"
                              onClick={nextImage}
                            >
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </>
                        )}

                        {/* Image Counter */}
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
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
              Are you sure you want to approve this car listing? This will make
              it visible to all users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? "Approving..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Car Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this car listing. This will
              be sent to the seller.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Textarea
              placeholder="Enter rejection reason (optional)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
