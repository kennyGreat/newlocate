"use client";

import { useEffect, useState } from "react";
import { Users, Building2, MessageCircle, DollarSign, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface AdminStats {
  stats: {
    totalUsers: number;
    totalProperties: number;
    totalEscrows: number;
    totalChats: number;
  };
  recentProperties: Array<{
    id: string;
    title: string;
    price: number;
    city: string;
    status: string;
    createdAt: string;
    owner: { name: string };
  }>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
  escrowStats: Array<{ status: string; _count: { status: number } }>;
  usersByRole: Array<{ role: string; _count: { role: number } }>;
  propertiesByType: Array<{ propertyType: string; _count: { propertyType: number } }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p>Not authorized or failed to load.</p>
        <Link href="/login" className="text-blue-600 mt-2 inline-block">Sign in as admin</Link>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: data.stats.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Properties", value: data.stats.totalProperties, icon: Building2, color: "text-green-600 bg-green-50" },
    { label: "Escrows", value: data.stats.totalEscrows, icon: DollarSign, color: "text-yellow-600 bg-yellow-50" },
    { label: "Chat Rooms", value: data.stats.totalChats, icon: MessageCircle, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and management</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Users by Role
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.usersByRole.map(({ role, _count }) => (
                <div key={role} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{role.replace(/_/g, " ")}</span>
                      <span className="font-medium">{_count.role}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, (_count.role / data.stats.totalUsers) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Escrow Stats */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-600" />
              Escrow Status
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.escrowStats.map(({ status, _count }) => (
                <div key={status} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    {status === "COMPLETED" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm text-gray-600">{status.replace(/_/g, " ")}</span>
                  </div>
                  <span className="font-medium text-gray-900">{_count.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Properties */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Properties</h2>
              <Link href="/properties" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {data.recentProperties.map((p) => (
                <div key={p.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <Link href={`/properties/${p.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                      {p.title}
                    </Link>
                    <p className="text-xs text-gray-400">{p.city} · by {p.owner.name}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(p.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Recent Users</h2>
              <Link href="/dashboard/admin/users" className="text-sm text-blue-600 hover:text-blue-700">View all</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {data.recentUsers.map((u) => (
                <div key={u.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {u.role.replace(/_/g, " ")}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(u.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Listings Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Social Media Listings</h2>
            <p className="text-sm text-gray-500">Properties scraped from social media</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">Social media listings will appear here once scraped.</p>
            <p className="text-xs mt-2">Use the API endpoint POST /api/social to add scraped listings.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
