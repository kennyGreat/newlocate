"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Eye, Plus, TrendingUp, DollarSign, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDate, parseImages } from "@/lib/utils";

interface Property {
  id: string;
  title: string;
  price: number;
  priceUnit: string;
  city: string;
  country: string;
  status: string;
  images: string;
  viewCount: number;
  createdAt: string;
  listingType: string;
  _count?: { reviews: number; savedBy: number };
}

export default function SellerDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/me").then(r => r.json()),
      fetch("/api/properties?limit=20").then(r => r.json()),
    ]).then(([u, p]) => {
      setUser(u.user);
      // Filter to user's own properties - we'll need a different endpoint
      setProperties(p.properties || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3" /></div>;

  const totalViews = properties.reduce((sum, p) => sum + p.viewCount, 0);
  const activeListings = properties.filter(p => p.status === "ACTIVE").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Seller Dashboard{user?.name ? ` – ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="text-gray-500 mt-1">Manage your property listings</p>
        </div>
        <Link href="/properties/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Listings", value: activeListings, icon: Building2, color: "text-blue-600 bg-blue-50" },
          { label: "Total Views", value: totalViews.toLocaleString(), icon: Eye, color: "text-green-600 bg-green-50" },
          { label: "Total Properties", value: properties.length, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
          { label: "Escrow Deals", value: 0, icon: DollarSign, color: "text-yellow-600 bg-yellow-50" },
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">My Listings</h2>
            <Link href="/properties/new">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Add Listing
              </Button>
            </Link>
          </div>
        </CardHeader>
        {properties.length === 0 ? (
          <CardContent>
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No listings yet</p>
              <Link href="/properties/new">
                <Button className="mt-3" size="sm">Create First Listing</Button>
              </Link>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Property</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Views</th>
                    <th className="px-6 py-3 text-left">Listed</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {properties.map(p => {
                    const images = parseImages(p.images);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {images[0] ? (
                              <img src={images[0]} alt="" className="h-10 w-14 object-cover rounded" />
                            ) : (
                              <div className="h-10 w-14 bg-gray-100 rounded flex items-center justify-center text-lg">🏠</div>
                            )}
                            <div>
                              <Link href={`/properties/${p.id}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                                {p.title}
                              </Link>
                              <p className="text-xs text-gray-400">{p.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">{formatPrice(p.price, p.priceUnit)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">{p.viewCount}</td>
                        <td className="px-6 py-4 text-gray-400">{formatDate(p.createdAt)}</td>
                        <td className="px-6 py-4">
                          <Link href={`/properties/${p.id}`} className="text-blue-600 hover:text-blue-700 text-xs">View</Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between py-5">
          <div>
            <h3 className="font-semibold text-gray-900">Escrow Management</h3>
            <p className="text-sm text-gray-500">Track secure payment transactions</p>
          </div>
          <Link href="/escrow">
            <Button variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              View Escrows
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between py-5">
          <div>
            <h3 className="font-semibold text-gray-900">Chat with Buyers</h3>
            <p className="text-sm text-gray-500">Anonymous secure communication</p>
          </div>
          <Link href="/chat">
            <Button>
              <MessageCircle className="h-4 w-4 mr-2" />
              Open Chat
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
