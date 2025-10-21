"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Car,
  Users,
  DollarSign,
  Building,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCarAnalytics } from "@/hooks/analytics";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"dealers" | "brokers" | "makes">(
    "dealers"
  );
  const { data: analytics, isLoading, error } = useCarAnalytics();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 max-w-7xl">
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {Array.from({ length: 2 }).map((_, idx) => (
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
              There was an error loading the analytics data. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSoldCars =
    (analytics?.dealer_stats?.reduce(
      (sum, dealer) => sum + dealer.sold_cars,
      0
    ) || 0) +
    (analytics?.broker_stats?.reduce(
      (sum, broker) => sum + broker.sold_cars,
      0
    ) || 0);

  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
          Car Analytics Dashboard
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Comprehensive analytics for cars, dealers, brokers, and makes.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Cars
                </p>
                <p className="text-2xl font-bold">
                  {analytics?.total_cars || 0}
                </p>
              </div>
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Price
                </p>
                <p className="text-2xl font-bold">
                  {formatPrice(analytics?.average_price?.toString() || "0")}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 gap-4 p-3 py-2 rounded-full w-fit mb-8">
        {[
          { key: "dealers", label: "Dealers", icon: Building },
          { key: "brokers", label: "Brokers", icon: UserCheck },
          { key: "makes", label: "Makes", icon: Car },
        ].map((tab) => (
          <Button
            key={tab.key}
            className={`hover:bg-zinc-900 rounded-full cursor-pointer px-8 hover:text-white ${
              activeTab === tab.key ? "" : "bg-gray-100 text-black shadow-none"
            }`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <tab.icon className="mr-2 h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content based on active tab */}
      <div className="space-y-4">
        {activeTab === "dealers" && (
          <>
            {analytics?.dealer_stats && analytics.dealer_stats.length > 0 ? (
              analytics.dealer_stats.map((dealer) => (
                <Card
                  key={dealer.dealer_id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {dealer.dealer_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Dealer ID: #{dealer.dealer_id}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Total Cars:
                            </span>
                            <span className="font-semibold">
                              {dealer.total_cars}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Sold Cars:
                            </span>
                            <span className="font-semibold">
                              {dealer.sold_cars}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Avg Price:
                            </span>
                            <span className="font-semibold">
                              {formatPrice(dealer.average_price.toString())}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-800"
                        >
                          {dealer.sold_cars > 0
                            ? `${Math.round(
                                (dealer.sold_cars / dealer.total_cars) * 100
                              )}% Sold`
                            : "No Sales"}
                        </Badge>
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
                            <DropdownMenuItem>
                              <Building className="mr-2 h-4 w-4" />
                              View Dealer Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-6">
                <CardContent className="text-center">
                  <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Dealer Data</h3>
                  <p className="text-muted-foreground">
                    No dealer statistics available.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === "brokers" && (
          <>
            {analytics?.broker_stats && analytics.broker_stats.length > 0 ? (
              analytics.broker_stats.map((broker) => (
                <Card
                  key={broker.broker_id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {broker.broker_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Broker ID: #{broker.broker_id}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Total Cars:
                            </span>
                            <span className="font-semibold">
                              {broker.total_cars}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Sold Cars:
                            </span>
                            <span className="font-semibold">
                              {broker.sold_cars}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Avg Price:
                            </span>
                            <span className="font-semibold">
                              {formatPrice(broker.average_price.toString())}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          {broker.sold_cars > 0
                            ? `${Math.round(
                                (broker.sold_cars / broker.total_cars) * 100
                              )}% Sold`
                            : "No Sales"}
                        </Badge>
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
                            <DropdownMenuItem>
                              <UserCheck className="mr-2 h-4 w-4" />
                              View Broker Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-6">
                <CardContent className="text-center">
                  <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Broker Data</h3>
                  <p className="text-muted-foreground">
                    No broker statistics available.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === "makes" && (
          <>
            {analytics?.make_stats && analytics.make_stats.length > 0 ? (
              analytics.make_stats.map((make) => (
                <Card
                  key={make.make_name}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                            <Car className="h-6 w-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {make.make_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Car Make
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Total Cars:
                            </span>
                            <span className="font-semibold">
                              {make.total_cars}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Avg Price:
                            </span>
                            <span className="font-semibold">
                              {formatPrice(make.average_price.toString())}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-800"
                        >
                          {make.total_cars} Cars
                        </Badge>
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
                            <DropdownMenuItem>
                              <Car className="mr-2 h-4 w-4" />
                              View Cars
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Analytics
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-6">
                <CardContent className="text-center">
                  <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Make Data</h3>
                  <p className="text-muted-foreground">
                    No make statistics available.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Export Button */}
      <div className="mt-8 flex justify-end">
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Analytics
        </Button>
      </div>
    </div>
  );
}
