"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Heart, MessageCircle, Bell, Plus, Search } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

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

interface Request {
  id: string;
  description: string;
  city?: string | null;
  country?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  createdAt: string;
  matches: Array<{ matchScore: number; property: Property }>;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function BuyerDashboard() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/me").then(r => r.json()),
      fetch("/api/requests").then(r => r.json()),
      fetch("/api/notifications").then(r => r.json()),
    ]).then(([userData, requestData, notifData]) => {
      setUser(userData.user);
      setRequests(requestData.requests || []);
      setNotifications(notifData.notifications || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const matches = requests.flatMap(r => r.matches.map(m => ({ ...m.property, matchScore: m.matchScore })));
  const topMatches = matches.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)).slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
          </h1>
          <p className="text-gray-500 mt-1">Here are your personalized property matches</p>
        </div>
        <div className="flex gap-2">
          <Link href="/properties">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-1" />
              Browse
            </Button>
          </Link>
          <Link href="/map">
            <Button size="sm">View Map</Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Requests", value: requests.length, icon: Search, color: "text-blue-600 bg-blue-50" },
          { label: "Property Matches", value: matches.length, icon: Building2, color: "text-green-600 bg-green-50" },
          { label: "Saved Properties", value: savedProperties.length, icon: Heart, color: "text-red-600 bg-red-50" },
          { label: "Unread Notifications", value: notifications.filter(n => !n.isRead).length, icon: Bell, color: "text-yellow-600 bg-yellow-50" },
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

      {/* Property Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">My Property Requests</h2>
            <Link href="/search">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                New Request
              </Button>
            </Link>
          </div>
        </CardHeader>
        {requests.length === 0 ? (
          <CardContent>
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">No requests yet.</p>
              <Link href="/search" className="text-blue-600 text-sm mt-1 inline-block">Create your first property request →</Link>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {requests.map(req => (
                <div key={req.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{req.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        {req.city && <span>📍 {req.city}</span>}
                        {req.country && <span>🌍 {req.country}</span>}
                        {req.minPrice && <span>💰 from ${req.minPrice?.toLocaleString()}</span>}
                        <span>{formatDate(req.createdAt)}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full ml-3">
                      {req.matches.length} match{req.matches.length !== 1 ? "es" : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* AI Recommendations */}
      {topMatches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">AI-Matched Properties 🤖</h2>
            <Link href="/properties" className="text-blue-600 text-sm hover:text-blue-700">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {topMatches.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-500" />
              Recent Notifications
            </h2>
            <Link href="/notifications" className="text-sm text-blue-600">View all</Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.slice(0, 5).map(n => (
            <div key={n.id} className={`px-6 py-3 border-b border-gray-50 last:border-0 ${!n.isRead ? "bg-blue-50" : ""}`}>
              <p className="text-sm font-medium text-gray-900">{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
            </div>
          ))}
          {notifications.length === 0 && (
            <CardContent>
              <p className="text-gray-400 text-sm text-center py-4">No notifications yet.</p>
            </CardContent>
          )}
        </CardContent>
      </Card>

      {/* Quick Chat */}
      <Card>
        <CardContent className="flex items-center justify-between py-5">
          <div>
            <h3 className="font-semibold text-gray-900">Anonymous Chat</h3>
            <p className="text-sm text-gray-500">Chat with agents and sellers securely</p>
          </div>
          <Link href="/chat">
            <Button>
              <MessageCircle className="h-4 w-4 mr-2" />
              Go to Chat
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
