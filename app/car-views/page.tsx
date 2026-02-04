"use client";

import { useState } from "react";
import {
  Search,
  Eye,
  TrendingUp,
  Car,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
  DollarSign,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCarViewsAnalytics } from "@/hooks/analytics";
import { useCar } from "@/hooks/cars";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function CarViewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: views, isLoading, error } = useCarViewsAnalytics();

  const filteredViews = views?.filter((view) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      view.car_make.toLowerCase().includes(query) ||
      view.car_model.toLowerCase().includes(query) ||
      view.car_id.toString().includes(query)
    );
  });

  const totalViews =
    views?.reduce((sum, view) => sum + view.total_views, 0) || 0;
  const averageViews = views?.length ? totalViews / views.length : 0;
  const topViewedCar = views?.reduce(
    (max, view) => (view.total_views > max.total_views ? view : max),
    views[0] || { total_views: 0 }
  );

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl">
        <Card className="p-6">
          <CardContent className="text-center">
            <h2 className="text-xl font-bold mb-2">Error Loading Analytics</h2>
            <p className="text-muted-foreground mb-4">
              There was an error loading the car views data. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
          Car Views Analytics
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Track car view statistics &mdash; Monitor which cars are getting the
          most attention.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Views
                </p>
                <p className="text-2xl font-bold">
                  {totalViews.toLocaleString()}
                </p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Views
                </p>
                <p className="text-2xl font-bold">
                  {Math.round(averageViews).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Top Viewed Car
                </p>
                <p className="text-2xl font-bold">
                  {topViewedCar?.total_views?.toLocaleString() || "0"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {topViewedCar?.car_make} {topViewedCar?.car_model}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by make, model, or car ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 sm:h-14 rounded-full"
          />
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Views List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredViews && filteredViews.length > 0 ? (
          filteredViews
            .sort((a, b) => b.total_views - a.total_views)
            .map((view, index) => (
              <CarViewCard
                key={view.car_id}
                view={view}
                index={index}
                averageViews={averageViews}
              />
            ))
        ) : (
          <Card className="p-6">
            <CardContent className="text-center">
              <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No View Data Found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No cars match your search criteria."
                  : "No car view data has been recorded yet."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {filteredViews && filteredViews.length > 0 && (
        <div className="mt-8">
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
      )}
    </div>
  );
}

// Car View Card Component
function CarViewCard({
  view,
  index,
  averageViews,
}: {
  view: any;
  index: number;
  averageViews: number;
}) {
  const { data: car, isLoading: carLoading } = useCar(view.car_id.toString());

  if (carLoading) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <Skeleton className="h-48 w-full" />
        <CardContent className="p-4">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!car) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-48 bg-gray-100 flex items-center justify-center">
          <Car className="h-12 w-12 text-gray-400" />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2">
            {view.car_make} {view.car_model}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Car details unavailable
          </p>
          <Badge variant="destructive">Car Not Found</Badge>
        </CardContent>
      </Card>
    );
  }

  const featuredImage =
    car.images?.find((img: any) => img.is_featured) || car.images?.[0];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Car Image */}
      <div className="relative h-48 bg-gray-100">
        {featuredImage ? (
          <Image
            src={featuredImage.image_url}
            alt={`${car.make} ${car.model}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Featured Badge */}
        {featuredImage?.is_featured && (
          <Badge className="absolute top-2 left-2 bg-green-600 text-white">
            Featured
          </Badge>
        )}

        {/* View Count Badge */}
        <div className="absolute top-2 right-2 bg-primary/70 text-primary-foreground px-2 py-1 rounded text-sm flex items-center gap-1">
          <Eye className="h-3 w-3" />
          <span>{view.total_views.toLocaleString()}</span>
        </div>

        {/* Rank Badge */}
        <div className="absolute bottom-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
          #{index + 1}
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-4">
        {/* Car Title */}
        <div className="mb-3">
          <h3 className="font-semibold text-lg mb-1">
            {car.make} {car.model} {car.year}
          </h3>
          <p className="text-sm text-muted-foreground">
            {car.body_type} • {car.fuel_type}
          </p>
        </div>

        {/* Car Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-semibold">{formatPrice(car.price)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Mileage:</span>
            <span className="font-semibold">
              {car.mileage.toLocaleString()} km
            </span>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <Badge
              variant={
                car.verification_status === "verified" ? "default" : "secondary"
              }
              className={
                car.verification_status === "verified"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }
            >
              {car.verification_status === "verified" ? "Verified" : "Pending"}
            </Badge>
            <Badge
              variant={car.status === "live" ? "default" : "secondary"}
              className={
                car.status === "live"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {car.status === "live" ? "Live" : car.status}
            </Badge>
          </div>

          <Badge
            variant="secondary"
            className={
              view.total_views > averageViews
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }
          >
            {view.total_views > averageViews ? "High Views" : "Average Views"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
