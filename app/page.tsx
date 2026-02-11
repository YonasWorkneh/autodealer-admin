"use client";

import { useState } from "react";
import { CarFront, Users, Car, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { usePopularCars, useCars } from "@/hooks/cars";
import { useUserProfiles } from "@/hooks/userProfiles";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: popularCars, isLoading: popularCarsLoading } = usePopularCars();
  const { data: cars } = useCars();
  const { data: userProfiles } = useUserProfiles();

  // Filter cars for auctions
  const auctionCars = cars?.filter(
    (car) => car.sale_type?.toLowerCase() === "auction",
  );

  const metrics = [
    {
      title: "Total Cars",
      value: cars?.length || 0,
      change: "",
      positive: true,
      icon: CarFront,
      comparison: "",
    },
    {
      title: "Total Users",
      value: userProfiles?.length || 0,
      change: "",
      positive: false,
      icon: Users,
      comparison: "",
    },
    {
      title: "Total Auctions",
      value: auctionCars?.length || 0,
      change: "",
      positive: true,
      icon: Car,
      comparison: "",
    },
  ];

  const salesData = [
    { month: "Jan", sales: 45, revenue: 1250000 },
    { month: "Feb", sales: 52, revenue: 1450000 },
    { month: "Mar", sales: 48, revenue: 1320000 },
    { month: "Apr", sales: 61, revenue: 1680000 },
    { month: "May", sales: 55, revenue: 1520000 },
    { month: "Jun", sales: 67, revenue: 1850000 },
  ];

  // Process popular cars to get top 3 makes
  const popularMakes = popularCars?.reduce(
    (acc, car) => {
      const make = car.make;
      acc[make] = (acc[make] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const customerData = Object.entries(popularMakes || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([make, count], index) => ({
      segment: make,
      value: count,
      color: index === 0 ? "#522084" : index === 1 ? "#6B3FA3" : "#8459C2",
    }));
  const latestCar = cars?.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )?.[0];

  const router = useRouter();

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex justify-between w-full">
                    <span>{metric.title}</span>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-xl sm:text-2xl font-bold">
                      {metric.value}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span
                      className={`font-medium ${
                        metric.positive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {metric.change}
                    </span>
                    <span>{metric.comparison}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Sales & Revenue Trend</CardTitle>
              <CardDescription>
                Monthly sales volume and revenue performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: { label: "Sales", color: "var(--primary)" },
                  revenue: { label: "Revenue", color: "var(--primary)" },
                }}
                className="h-[250px] sm:h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#522084"
                      strokeOpacity={0.1}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="#522084"
                      strokeOpacity={0.6}
                    />
                    <YAxis stroke="#522084" strokeOpacity={0.6} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="#522084" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Customer Segments */}
          <Card>
            <CardHeader>
              <CardTitle>Popular cars</CardTitle>
              <CardDescription>Distribution of popular cars</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  new: { label: "New Customers", color: "#522084" },
                  returning: { label: "Returning", color: "#6B3FA3" },
                  referrals: { label: "Referrals", color: "#8459C2" },
                }}
                className="h-[250px] sm:h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ segment, value }) => `${segment}: ${value}%`}
                    >
                      {customerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cars & Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Cars */}
          <Card className="p-4 sm:p-6 shadow-none h-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <h3 className="text-base sm:text-lg font-semibold">Top Cars</h3>
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-black/70 rounded-full bg-gray-100"
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 rounded-full"
                >
                  Week
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 rounded-full"
                >
                  Month
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[400px] space-y-3">
                <div className="flex items-center space-x-3 text-xs sm:text-sm">
                  <span className="w-4">#</span>
                  <span className="flex-1">Make/model</span>
                  <span className="hidden sm:inline">Year</span>
                  <span>Price</span>
                </div>

                {popularCarsLoading && (
                  <>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-3 py-2"
                      >
                        <span className="w-4 text-xs sm:text-sm">
                          <Skeleton className="h-3 w-3" />
                        </span>
                        <Skeleton className="w-16 sm:w-20 h-12 rounded-sm" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3 w-40 sm:w-48" />
                          <Skeleton className="h-2 w-24 sm:w-28" />
                        </div>
                        <span className="hidden sm:inline w-10">
                          <Skeleton className="h-3 w-full" />
                        </span>
                        <span className="w-14 sm:w-20">
                          <Skeleton className="h-3 w-full" />
                        </span>
                      </div>
                    ))}
                  </>
                )}
                {popularCars?.map((car, index) => {
                  if (index > 4) return null;
                  const image =
                    car.images.find((image) => image.is_featured) ||
                    car.images[0];
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 py-2"
                    >
                      <span className="w-4 text-xs sm:text-sm">
                        {index + 1}
                      </span>
                      <Image
                        src={image.image_url}
                        alt={image.caption || ""}
                        width={100}
                        height={100}
                        className="w-16 sm:w-20 h-auto object-contain rounded-sm"
                      />
                      <div className="flex-1">
                        <div className="text-xs sm:text-sm font-medium">
                          {car.make + " " + car.model}
                        </div>
                        {/* <div className="text-[10px] sm:text-xs text-gray-500">
                          {car.}
                        </div> */}
                      </div>
                      <span className="hidden sm:inline text-xs sm:text-sm text-gray-500">
                        {car.year}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-500">
                        {formatPrice(car.price, true)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
          {/* Latest Inventory */}

          {latestCar && (
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Latest Inventory</CardTitle>
                <Link
                  href={"/listing"}
                  className="group bg-primary hover:bg-primary-hover text-primary-foreground py-2 text-sm w-fit cursor-pointer flex gap-2 items-center px-3 rounded-full"
                >
                  <span>View more</span>
                  <span className="group-hover:translate-x-1 transition-all">
                    →
                  </span>
                </Link>
              </CardHeader>
              <CardContent>
                {latestCar ? (
                  <>
                    <div
                      className="relative mb-4 cursor-pointer"
                      onClick={() => router.push(`/listing/${latestCar.id}`)}
                    >
                      <img
                        src={
                          latestCar.images && latestCar.images.length > 0
                            ? typeof latestCar.images[0] === "string"
                              ? latestCar.images[0]
                              : latestCar.images[0].image_url
                            : "/placeholder.svg"
                        }
                        alt={`${latestCar.year} ${latestCar.make} ${latestCar.model}`}
                        className="w-3/4 max-h-[225px] object-cover rounded-lg"
                      />
                      <div className="absolute bottom-2 left-2 bg-primary rounded-full p-2">
                        <CarFront className="w-4 h-4 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Model</p>
                        <h3 className="font-semibold">
                          {latestCar.year} {latestCar.make} {latestCar.model}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Price</p>
                        <p className="font-semibold">
                          $
                          {parseFloat(
                            typeof latestCar.price === "string"
                              ? latestCar.price
                              : String(latestCar.price),
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-black text-white rounded-full"
                      >
                        {latestCar.make}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-primary text-primary-foreground rounded-full capitalize"
                      >
                        {latestCar.body_type}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-primary text-primary-foreground rounded-full capitalize"
                      >
                        {latestCar.fuel_type}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-black text-white rounded-full uppercase"
                      >
                        {latestCar.drivetrain}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-primary text-primary-foreground rounded-full capitalize"
                      >
                        {latestCar.condition}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No cars in inventory yet
                    </p>
                    <Link href="/listing/new">
                      <Button>Add Your First Car</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
