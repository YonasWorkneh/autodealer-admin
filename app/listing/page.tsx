"use client";

import { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";
import { useCars } from "@/hooks/cars";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const filters = ["All", "Live", "Pending Review", "Suspended"];

export default function Page() {
  const router = useRouter();
  const [active, setActive] = useState("all");
  const { data: cars, isLoading } = useCars();
  console.log(cars);

  useEffect(() => {}, [active]);

  return (
    <div className="flex h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-4 md:p-6">
          {/* filter header */}
          <div className="flex bg-gray-100 gap-4 p-3 py-2 rounded-full w-fit my-10">
            {filters.map((filter) => (
              <Button
                className={`hover:bg-zinc-900 rounded-full cursor-pointer px-8 hover:text-white ${
                  filter.toLowerCase() === active
                    ? ""
                    : "bg-gray-100 text-black shadow-none"
                }`}
                onClick={() => setActive(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
          {/* Cars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {isLoading && (
              <>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Card key={idx} className="overflow-hidden pt-0">
                    <div className="relative flex justify-center">
                      <Skeleton className="w-full md:w-full h-[200px] md:h-[250px]" />
                    </div>
                    <CardContent className="p-3 md:p-4 pt-0 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <div className="grid grid-cols-3 gap-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <Skeleton className="h-6 w-1/3" />
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
            {!isLoading && cars && cars.length === 0 && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <Card className="p-6 flex flex-col items-center justify-center text-center gap-3">
                  <div className="text-lg md:text-xl font-semibold">
                    No cars found
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    You haven’t added any listings yet. Get started by creating
                    your first car listing.
                  </p>
                  <Link
                    href={"/listing/new"}
                    className="group bg-zinc-800 hover:bg-zinc-900 text-white py-2 text-sm w-fit cursor-pointer flex gap-2 items-center px-3 rounded-full"
                  >
                    <span>Add New</span>
                    <span className="group-hover:translate-x-1 transition-all">
                      →
                    </span>
                  </Link>
                </Card>
              </div>
            )}
            {!isLoading &&
              cars?.map((car) => {
                const image =
                  car.images.find((image) => image.is_featured) ||
                  car.images[0];
                return (
                  <Card
                    key={car.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow relative pt-0 cursor-pointer"
                    onClick={() => router.push(`/listing/${car.id}`)}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        className="absolute top-2 right-2 z-50 cursor-pointer bg-white"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/listing/${car.id}`);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          Export
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="relative flex justify-center">
                      <img
                        src={image.image_url || "/placeholder.svg"}
                        alt={image.caption || ""}
                        className="w-full md:w-full max-h-[250px] object-cover"
                      />
                    </div>
                    <CardContent className="p-3 md:p-4 pt-0">
                      <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-3 capitalize">
                        {car.make + " " + car.model}
                      </h3>
                      <div className="flex flex-col gap-1 md:flex-row md:justify-between text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                        <span>
                          Style:{" "}
                          <span className="text-foreground capitalize">
                            {car.model}
                          </span>
                        </span>
                        <span>
                          Type:{" "}
                          <span className="text-foreground capitalize">
                            {car.body_type}
                          </span>
                        </span>
                        <span>
                          Color:{" "}
                          <span className="text-foreground capitalize">
                            {car.exterior_color}
                          </span>
                        </span>
                      </div>
                      <div className="text-xl md:text-2xl font-bold">
                        {formatPrice(car.price)}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
