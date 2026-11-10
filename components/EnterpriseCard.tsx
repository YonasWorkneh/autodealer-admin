"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Building2, FileText, ExternalLink, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Enterprise } from "@/app/types/Enterprise";

export function enterpriseStatusBadge(status: string) {
  const s = (status || "").toUpperCase();
  if (s.includes("SUSPEND")) {
    return (
      <Badge variant="destructive" className="rounded-full text-xs uppercase">
        {status}
      </Badge>
    );
  }
  if (s.includes("REJECT")) {
    return (
      <Badge variant="destructive" className="rounded-full text-xs uppercase">
        {status}
      </Badge>
    );
  }
  if (s.includes("PENDING") || s.includes("REVIEW")) {
    return (
      <Badge variant="secondary" className="rounded-full text-xs uppercase">
        {status}
      </Badge>
    );
  }
  if (s.includes("ACTIVE") || s.includes("APPROV") || s.includes("VERIF")) {
    return (
      <Badge className="bg-emerald-600 text-white rounded-full text-xs uppercase">
        {status}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="rounded-full text-xs uppercase">
      {status || "—"}
    </Badge>
  );
}

export interface EnterpriseCardProps {
  enterprise: Enterprise;
}

export default function EnterpriseCard({ enterprise }: EnterpriseCardProps) {
  const router = useRouter();
  const p = enterprise.profile;
  const name = [p?.first_name, p?.last_name].filter(Boolean).join(" ") || "—";

  return (
    <Card
      onClick={() => router.push(`/enterprises/${enterprise.id}`)}
      className="border border-primary/10 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
    >
      <CardContent className="p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0 overflow-hidden">
              {p?.image ? (
                <Image
                  src={p.image}
                  alt={name}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              ) : (
                <Building2 className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {enterprise.company_name || name}
              </h3>
              {enterprise.company_name && (
                <p className="text-xs text-muted-foreground truncate">{name}</p>
              )}
            </div>
          </div>
          {enterprise.status && enterpriseStatusBadge(enterprise.status)}
        </div>

        {enterprise.business_license && (
          <div
            className="mt-2 pt-3 border-t border-border flex items-center justify-between gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
              <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">License PDF</span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={enterprise.business_license}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium px-2 py-1 rounded-md border border-primary/20 hover:bg-primary/10 transition-colors"
                title="Open business license in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Open</span>
              </a>
              <a
                href={enterprise.business_license}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium px-2 py-1 rounded-md border border-border hover:bg-muted transition-colors"
                title="Download business license PDF"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { EnterpriseCard };
