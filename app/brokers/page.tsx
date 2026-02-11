"use client";

import { useMemo, useState } from "react";
import { Search, ZoomIn, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type BrokerRequestStatus = "pending" | "verified" | "rejected";

interface BrokerRequest {
  id: number;
  name: string;
  email: string;
  nationalId: string;
  paymentImageUrl: string;
  status: BrokerRequestStatus;
}

const initialBrokerRequests: BrokerRequest[] = [
  {
    id: 1,
    name: "Erdey Syoum",
    email: "erdey@example.com",
    nationalId: "AB1234567",
    // Unsplash QR / payment style placeholder
    paymentImageUrl:
      "https://my.yegara.com/uploads/knowledgebase/ojAUQZI0z6mKkTl9",
    status: "pending",
  },
  {
    id: 2,
    name: "Abel T.",
    email: "abel.t@example.com",
    nationalId: "CD7654321",
    paymentImageUrl:
      "https://my.yegara.com/uploads/knowledgebase/ojAUQZI0z6mKkTl9",
    status: "pending",
  },
  {
    id: 3,
    name: "Temesgen Siyamregn",
    email: "temesgen@example.com",
    nationalId: "EF9988776",
    paymentImageUrl:
      "https://my.yegara.com/uploads/knowledgebase/ojAUQZI0z6mKkTl9",
    status: "verified",
  },
];

export default function BrokersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [requests, setRequests] = useState<BrokerRequest[]>(
    initialBrokerRequests,
  );

  const filteredRequests = useMemo(() => {
    if (!searchQuery) return requests;
    const query = searchQuery.toLowerCase();
    return requests.filter(
      (req) =>
        req.name.toLowerCase().includes(query) ||
        req.email.toLowerCase().includes(query) ||
        req.nationalId.toLowerCase().includes(query),
    );
  }, [requests, searchQuery]);

  const handleStatusChange = (id: number, status: BrokerRequestStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status } : req)),
    );
  };

  const getStatusBadge = (status: BrokerRequestStatus) => {
    if (status === "verified") {
      return (
        <Badge className="bg-emerald-600 text-white rounded-full flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          Verified
        </Badge>
      );
    }

    if (status === "rejected") {
      return (
        <Badge className="bg-red-500/10 text-red-700 border border-red-500/30 rounded-full flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    }

    return (
      <Badge className="bg-amber-500/10 text-amber-700 border border-amber-500/30 rounded-full">
        Pending
      </Badge>
    );
  };

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">
          Broker Requests
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Review broker requests, verify documents, and manage access.
        </p>
      </div>

      {/* Table-like list */}
      <div className="border border-primary/10 rounded-lg overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden lg:block bg-primary/5 border-b border-primary/10 px-6 py-4">
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-3">
              <span className="text-sm font-medium text-primary/80">
                Broker
              </span>
            </div>
            <div className="col-span-3">
              <span className="text-sm font-medium text-primary/80">Email</span>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium text-primary/80">
                National ID
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-sm font-medium text-primary/80">
                Payment
              </span>
            </div>
            <div className="col-span-1">
              <span className="text-sm font-medium text-primary/80">
                Status
              </span>
            </div>
            <div className="col-span-1" />
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-primary/5">
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <div key={req.id} className="px-4 sm:px-6 py-4 transition-colors">
                {/* Desktop row */}
                <div className="hidden lg:grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-sm font-medium text-primary">
                        {req.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{req.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Request ID: #{req.id}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3">
                    <a
                      href={`mailto:${req.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {req.email}
                    </a>
                  </div>

                  <div className="col-span-2">
                    <span className="text-sm font-mono">{req.nationalId}</span>
                  </div>

                  <div className="col-span-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="group flex items-center gap-2">
                          <div className="relative w-14 h-14 rounded-md overflow-hidden border border-primary/20 bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={req.paymentImageUrl}
                              alt={`Payment proof for ${req.name}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground underline decoration-primary/40 group-hover:decoration-primary">
                            View payment
                          </span>
                          <ZoomIn className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          {/* <DialogTitle>Payment proof</DialogTitle> */}
                        </DialogHeader>
                        <div className="mt-2 rounded-lg overflow-hidden border border-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={req.paymentImageUrl}
                            alt={`Payment proof for ${req.name}`}
                            className="w-full h-full object-contain bg-muted"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="col-span-1">{getStatusBadge(req.status)}</div>

                  <div className="col-span-1 flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10"
                      onClick={() => handleStatusChange(req.id, "verified")}
                    >
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-500/10 text-red-700 hover:bg-red-500/20"
                      onClick={() => handleStatusChange(req.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>

                {/* Mobile / tablet card */}
                <div className="flex flex-col gap-3 lg:hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-sm font-medium text-primary">
                        {req.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{req.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {req.email}
                      </div>
                    </div>
                    <div>{getStatusBadge(req.status)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        National ID:
                      </span>
                      <div className="font-mono mt-0.5">{req.nationalId}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment:</span>
                      <div className="mt-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="inline-flex items-center gap-2 text-xs text-primary underline decoration-primary/40">
                              <span>View payment</span>
                              <ZoomIn className="h-3 w-3" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-sm">
                            <DialogHeader>
                              <DialogTitle>Payment proof</DialogTitle>
                            </DialogHeader>
                            <div className="mt-2 rounded-lg overflow-hidden border border-border">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={req.paymentImageUrl}
                                alt={`Payment proof for ${req.name}`}
                                className="w-full h-full object-contain bg-muted"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10"
                      onClick={() => handleStatusChange(req.id, "verified")}
                    >
                      Verify
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-500/10 text-red-700 hover:bg-red-500/20"
                      onClick={() => handleStatusChange(req.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 sm:px-6 py-8 text-center">
              <h3 className="text-lg font-semibold mb-2">No Broker Requests</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No broker requests match your search."
                  : "There are currently no broker requests to review."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
