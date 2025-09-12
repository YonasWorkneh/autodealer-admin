"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import EnterpriseCard from "@/components/EnterpriseCard";

const contacts = [
  {
    id: 1,
    name: "Addis Car",
    subtitle: "temsgen",
    phone: "+251921280194",
    email: "temsgenselam00@gmail.com",
    address: "Mexico, KCare Building",
    status: "ACTIVE" as const,
  },
  {
    id: 2,
    name: "Magnus Car Import and Sales",
    subtitle: "HHHHHH",
    phone: "09089876",
    email: "henokabebe5522@gmail.com",
    address: "Bole, Atlas",
    status: "ACTIVE" as const,
  },
  {
    id: 3,
    name: "Altaye Car",
    subtitle: "Temesgen Getye",
    phone: "+251920240194",
    email: "temsgenselam1995@gmail.com",
    address: "Bole, Gazebo",
    status: "ACTIVE" as const,
  },
  {
    id: 4,
    name: "GTR Cars",
    subtitle: "Yonas Workneh",
    phone: "+251986261979",
    email: "yonas.workneh.d@gmail.com",
    address: "Megnagna Salite Mehiret",
    status: "ACTIVE" as const,
  },
];

export default function ContactsPage() {
  const [search, setSearch] = useState("");

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Enterprise plans
          </h1>
          <p className="text-muted-foreground">
            Manage enterprises — monitor access & activities of enterprise plan
            users.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Enterprise
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-96 mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search enterprises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-full h-12"
        />
      </div>

      {/* Grid */}
      {filteredContacts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredContacts.map((contact) => (
            <EnterpriseCard key={contact.id} contact={contact} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed rounded-lg text-muted-foreground">
          No enterprises found matching your search.
        </div>
      )}
    </div>
  );
}
