"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Users, MessageCircle, Star, Search, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PropertyCard } from "@/components/property/PropertyCard";

interface Property {
  id: string;
  title: string;
  price: number;
  priceUnit: string;
  city: string;
  country: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  areaUnit: string;
  propertyType: string;
  listingType: string;
  status: string;
  images: string;
  viewCount: number;
  isFeatured: boolean;
  address: string;
  owner?: { name: string; avatar?: string | null };
}

export default function AgentDashboard() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/me").then(r => r.json()),
      fetch("/api/properties?limit=6").then(r => r.json()),
    ]).then(([u, p]) => {
      setUser(u.user);
      setRecentProperties(p.properties || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;

  const isBuyerAgent = user?.role === "BUYER_AGENT";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Agent Dashboard – {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-gray-500 mt-1">
          {isBuyerAgent ? "Buyer Agent" : "Seller Agent"} – manage your clients and listings
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Clients", value: "—", icon: Users, color: "text-blue-600 bg-blue-50" },
          { label: "Listings", value: recentProperties.length, icon: Building2, color: "text-green-600 bg-green-50" },
          { label: "Pending Escrows", value: "—", icon: DollarSign, color: "text-yellow-600 bg-yellow-50" },
          { label: "Reviews", value: "—", icon: Star, color: "text-purple-600 bg-purple-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 py-4">
              <div className={`p-2.5 rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <h3 className="font-semibold text-gray-900">
                {isBuyerAgent ? "Find Properties for Clients" : "List Properties"}
              </h3>
              <p className="text-sm text-gray-500">
                {isBuyerAgent ? "Browse and match properties for your buyers" : "Create new property listings"}
              </p>
            </div>
            <Link href={isBuyerAgent ? "/properties" : "/properties/new"}>
              <Button size="sm">
                {isBuyerAgent ? <Search className="h-4 w-4 mr-1" /> : <Building2 className="h-4 w-4 mr-1" />}
                {isBuyerAgent ? "Browse" : "List Now"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center justify-between py-5">
            <div>
              <h3 className="font-semibold text-gray-900">Client Chat</h3>
              <p className="text-sm text-gray-500">Anonymous communication with clients</p>
            </div>
            <Link href="/chat">
              <Button size="sm" variant="outline">
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Properties</h2>
          <Link href="/properties" className="text-blue-600 text-sm hover:text-blue-700">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recentProperties.map(p => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Property Request Matching</h2>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm mb-4">
            Submit a property request on behalf of a client to find matching listings using our AI engine.
          </p>
          <Link href="/search">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Submit Client Request
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between py-5">
          <div>
            <h3 className="font-semibold text-gray-900">Escrow Transactions</h3>
            <p className="text-sm text-gray-500">Track and confirm payment transactions</p>
          </div>
          <Link href="/escrow">
            <Button variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              View Escrows
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
