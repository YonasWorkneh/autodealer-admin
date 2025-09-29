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
import { usePopularCars } from "@/hooks/cars";
import { formatPrice } from "@/lib/utils";

export default function Page() {
  const metrics = [
    {
      title: "Total Cars",
      value: "5056",
      change: "+8.04%",
      positive: true,
      icon: CarFront,
      comparison: "vs last week",
    },
    {
      title: "Total Users",
      value: "128",
      change: "-3.06%",
      positive: false,
      icon: Users,
      comparison: "vs last week",
    },
    {
      title: "Total Sold Cars",
      value: "84",
      change: "+8.04%",
      positive: true,
      icon: Car,
      comparison: "vs last week",
    },
    {
      title: "Total Profit",
      value: "600,543,000",
      change: "+8.04%",
      positive: true,
      icon: DollarSign,
      comparison: "vs last week",
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

  const customerData = [
    { segment: "Volkswagen", value: 35, color: "silver" },
    { segment: "BYD", value: 45, color: "black" },
    { segment: "Hyundai", value: 20, color: "#222" },
  ];

  const { data: popularCars } = usePopularCars();

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
                  sales: { label: "Sales", color: "var(--chart-1)" },
                  revenue: { label: "Revenue", color: "var(--chart-2)" },
                }}
                className="h-[250px] sm:h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="black" />
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
                  new: { label: "New Customers", color: "black" },
                  returning: { label: "Returning", color: "#222" },
                  referrals: { label: "Referrals", color: "#000" },
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

                {popularCars?.map((car, index) => {
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
          <Card className="h-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle>Latest Inventory</CardTitle>
              <Link
                href={"/listing"}
                className="group bg-zinc-800 hover:bg-zinc-900 text-white py-2 text-xs sm:text-sm w-fit cursor-pointer flex gap-2 items-center px-3 rounded-full"
              >
                <span>View more</span>
                <span className="group-hover:translate-x-1 transition-all">
                  →
                </span>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <img
                  src="/id6-orange.png"
                  alt="Volkwagen ID6 Electric"
                  className="w-full max-h-[200px] sm:max-h-[225px] object-cover rounded-lg"
                />
                <div className="absolute bottom-2 left-2 bg-black rounded-full p-2">
                  <CarFront className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <div>
                  <p className="text-xs sm:text-sm text-black/70">Model</p>
                  <h3 className="font-semibold">Volkswagen ID6</h3>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-black/70">Price</p>
                  <p className="font-semibold">5,000,000</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Volkswagen", "Smart AC", "Diesel", "Electric", "5"].map(
                  (tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-black text-white rounded-full text-xs sm:text-sm"
                    >
                      {tag}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
