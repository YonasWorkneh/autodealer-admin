"use client";

import { useState } from "react";
import {
  Search,
  Grid3X3,
  Calendar,
  Car,
  TrendingUp,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  Bookmark,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const cars = [
  {
    id: 1,
    name: "Volkswagen ID6",
    style: "Volkswagen",
    type: "Auto",
    color: "Orange",
    price: "285,892",
    image: "/id6-orange.png",
  },
  {
    id: 2,
    name: "Suzuki Dzire",
    style: "Dzire",
    type: "Petrol",
    color: "Dark Blue",
    price: "358,174",
    image: "/dzire.webp",
  },
  {
    id: 3,
    name: "Toyota V8",
    style: "V8",
    type: "Petrol",
    color: "Blue Black",
    price: "358,174",
    image: "/v8.png",
  },
  {
    id: 4,
    name: "BYD-Song",
    style: "Song",
    type: "Auto",
    color: "Brown",
    price: "285,892",
    image: "/byd.png",
  },
  {
    id: 5,
    name: "Toyota Invincible",
    style: "Invincible",
    type: "Auto",
    color: "Brown",
    price: "425,000",
    image: "/invincible.png",
  },
  {
    id: 6,
    name: "Jetour-T1",
    style: "T1",
    type: "Auto",
    color: "Green",
    price: "195,500",
    image: "/jetour.png",
  },
];

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="border-b border-border p-4 md:p-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Available Cars
            </h1>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
              <p className="text-muted-foreground text-sm md:text-base">
                Manage your car listings &mdash; Add, edit and delete cars.
              </p>
              <Link
                href={"/listing/new"}
                className="group bg-zinc-800 hover:bg-zinc-900 text-white py-2 text-sm w-full md:w-fit cursor-pointer flex justify-center md:justify-start gap-2 items-center px-3 rounded-full"
              >
                <span>Add New</span>
                <span className="group-hover:translate-x-1 transition-all">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 md:p-6">
          {/* Cars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {cars.map((car) => (
              <Card
                key={car.id}
                className="overflow-hidden hover:shadow-lg transition-shadow relative"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    className="absolute top-2 right-2 z-50 cursor-pointer"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Export</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="relative flex justify-center">
                  <img
                    src={car.image || "/placeholder.svg"}
                    alt={car.name}
                    className="w-2/3 md:w-1/2 h-auto object-cover"
                  />
                </div>
                <CardContent className="p-3 md:p-4">
                  <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3">
                    {car.name}
                  </h3>
                  <div className="flex flex-col gap-1 md:flex-row md:justify-between text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                    <span>
                      Style:{" "}
                      <span className="text-foreground">{car.style}</span>
                    </span>
                    <span>
                      Type: <span className="text-foreground">{car.type}</span>
                    </span>
                    <span>
                      Color:{" "}
                      <span className="text-foreground">{car.color}</span>
                    </span>
                  </div>
                  <div className="text-xl md:text-2xl font-bold">
                    $ {car.price}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
