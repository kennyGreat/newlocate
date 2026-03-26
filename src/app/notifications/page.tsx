"use client";

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data?: string | null;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  PROPERTY_MATCH: "🏠",
  MESSAGE: "💬",
  REVIEW: "⭐",
  ESCROW_UPDATE: "💰",
  SOCIAL_LISTING: "📱",
  GENERAL: "🔔",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => { setNotifications(d.notifications || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PUT" });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getLink = (notification: Notification) => {
    if (!notification.data) return null;
    try {
      const data = JSON.parse(notification.data);
      if (data.propertyId) return `/properties/${data.propertyId}`;
      if (data.chatRoomId) return `/chat?room=${data.chatRoomId}`;
      if (data.escrowId) return `/escrow`;
    } catch { /* ignore */ }
    return null;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <CardContent>
            <div className="animate-pulse space-y-3 py-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        ) : notifications.length === 0 ? (
          <CardContent>
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No notifications yet</p>
            </div>
          </CardContent>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(n => {
              const link = getLink(n);
              const content = (
                <div className={`px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-blue-50 hover:bg-blue-50/80" : ""}`}>
                  <div className="text-2xl flex-shrink-0">{TYPE_ICONS[n.type] || "🔔"}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${!n.isRead ? "text-gray-900" : "text-gray-700"}`}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!n.isRead && (
                          <div className="h-2 w-2 rounded-full bg-blue-600" />
                        )}
                        <span className="text-xs text-gray-400">{formatDate(n.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                  </div>
                </div>
              );

              return link ? (
                <Link key={n.id} href={link}>{content}</Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
