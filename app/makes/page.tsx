"use client";

import { useState } from "react";
import {
  Factory,
  Car,
  Search,
  ChevronDown,
  ChevronUp,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMakes, useModels } from "@/hooks/cars";
import type { Make } from "@/app/types/Make";
import type { Model } from "@/app/types/Model";

export default function MakesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedMakeId, setExpandedMakeId] = useState<number | null>(null);
  const { data: makes, isLoading, error } = useMakes();

  const filteredMakes =
    makes?.filter((make) =>
      make.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const toggleMake = (id: number) => {
    setExpandedMakeId((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((__, ind) => (
                    <Skeleton key={ind} className="h-4 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8 max-w-5xl">
        <Card className="p-6 border border-border">
          <CardContent className="text-center space-y-4">
            <Factory className="h-10 w-10 text-muted-foreground mx-auto" />
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Error Loading Makes
              </h2>
              <p className="text-muted-foreground">
                Something went wrong while loading the car makes. Please try
                again later.
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
          Car Makes & Models
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Explore available car makes and their associated models.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search car make..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 w-full rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
      </div>

      {/* Makes List */}
      {filteredMakes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMakes.map((make) => (
            <MakeCard
              key={make.id}
              make={make}
              isExpanded={expandedMakeId === make.id}
              onToggle={() => toggleMake(make.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-6 border border-border">
          <CardContent className="text-center space-y-2">
            <Car className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No Makes Found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No car makes match your search criteria."
                : "No car makes available at the moment."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MakeCard({
  make,
  isExpanded,
  onToggle,
}: {
  make: Make;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { data: models, isLoading, error } = useModels(
    isExpanded ? make.id : undefined
  );

  return (
    <Card className="border border-border overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">{make.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {isExpanded
                ? models?.length
                  ? `${models.length} model${models.length === 1 ? "" : "s"}`
                  : "No models available"
                : "Tap to view models"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onToggle}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      {isExpanded && (
        <CardContent className="border-t border-border p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="h-4 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-destructive">
              Failed to load models. Please try again later.
            </div>
          ) : models && models.length > 0 ? (
            <ul className="divide-y divide-border">
              {models.map((model: Model) => (
                <li key={model.id} className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Car className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Model ID: #{model.id}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              No models available for this make.
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

