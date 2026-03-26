"use client";

import { useEffect, useState } from "react";
import { Shield, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatDate, parseImages } from "@/lib/utils";
import Link from "next/link";

interface Escrow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  documentsVerified: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  property: { id: string; title: string; price: number; images: string };
  buyer?: { id: string; name: string; avatar?: string | null } | null;
  seller?: { id: string; name: string; avatar?: string | null } | null;
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
  INITIATED: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", label: "Initiated" },
  BUYER_CONFIRMED: { icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50", label: "Buyer Confirmed" },
  SELLER_CONFIRMED: { icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50", label: "Seller Confirmed" },
  DOCUMENTS_VERIFIED: { icon: CheckCircle, color: "text-indigo-600", bg: "bg-indigo-50", label: "Documents Verified" },
  PAYMENT_RECEIVED: { icon: Shield, color: "text-green-600", bg: "bg-green-50", label: "Payment Received" },
  COMPLETED: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Completed" },
  DISPUTED: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", label: "Disputed" },
  CANCELLED: { icon: XCircle, color: "text-gray-600", bg: "bg-gray-50", label: "Cancelled" },
};

export default function EscrowPage() {
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/users/me").then(r => r.json()),
      fetch("/api/escrow").then(r => r.json()),
    ]).then(([u, e]) => {
      setUserId(u.user?.id);
      setUserRole(u.user?.role);
      setEscrows(e.escrows || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleAction = async (escrowId: string, action: string) => {
    setUpdating(escrowId);
    const res = await fetch(`/api/escrow/${escrowId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      const data = await res.json();
      setEscrows(prev => prev.map(e => e.id === escrowId ? { ...e, ...data.escrow } : e));
    }
    setUpdating(null);
  };

  const getAvailableActions = (escrow: Escrow) => {
    const actions: { action: string; label: string; variant: "primary" | "secondary" | "danger" | "outline" }[] = [];

    if (escrow.status === "INITIATED" && escrow.buyer?.id === userId && !escrow.buyerConfirmed) {
      actions.push({ action: "buyer_confirm", label: "Confirm as Buyer", variant: "primary" });
    }
    if (escrow.status === "INITIATED" && escrow.seller?.id === userId && !escrow.sellerConfirmed) {
      actions.push({ action: "seller_confirm", label: "Confirm as Seller", variant: "primary" });
    }
    if (["INITIATED", "BUYER_CONFIRMED", "SELLER_CONFIRMED"].includes(escrow.status)) {
      actions.push({ action: "dispute", label: "Raise Dispute", variant: "danger" });
      actions.push({ action: "cancel", label: "Cancel", variant: "outline" });
    }
    if (userRole === "ADMIN") {
      if (escrow.status === "DOCUMENTS_VERIFIED") {
        actions.push({ action: "verify_documents", label: "Mark Payment Received", variant: "secondary" });
      }
      if (escrow.status === "PAYMENT_RECEIVED") {
        actions.push({ action: "complete", label: "Complete Transaction", variant: "primary" });
      }
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-green-100 p-2 rounded-lg">
          <Shield className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Escrow Transactions</h1>
          <p className="text-gray-500 text-sm">Secure payment management</p>
        </div>
      </div>

      {/* How it works */}
      <Card className="mb-8">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">How Escrow Works</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: "1", title: "Initiate", desc: "Buyer starts the escrow process" },
              { step: "2", title: "Confirm", desc: "Both parties confirm the transaction" },
              { step: "3", title: "Verify", desc: "Documents and payment verified by admin" },
              { step: "4", title: "Complete", desc: "Funds released after all confirmations" },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm flex items-center justify-center mx-auto mb-2">
                  {s.step}
                </div>
                <p className="text-sm font-medium text-gray-900">{s.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {escrows.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No escrow transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Initiate one from a property listing</p>
              <Link href="/properties" className="mt-4 inline-block text-blue-600 text-sm hover:text-blue-700">
                Browse Properties →
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {escrows.map(escrow => {
            const config = STATUS_CONFIG[escrow.status] || STATUS_CONFIG.INITIATED;
            const StatusIcon = config.icon;
            const images = parseImages(escrow.property.images);
            const actions = getAvailableActions(escrow);

            return (
              <Card key={escrow.id}>
                <CardContent className="py-5">
                  <div className="flex items-start gap-4">
                    {/* Property thumbnail */}
                    <div className="h-16 w-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {images[0] ? (
                        <img src={images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link href={`/properties/${escrow.property.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                            {escrow.property.title}
                          </Link>
                          <p className="text-blue-600 font-bold text-sm mt-0.5">
                            {formatPrice(escrow.amount, escrow.currency)}
                          </p>
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <span className={`flex items-center gap-1 ${escrow.buyerConfirmed ? "text-green-600" : "text-gray-400"}`}>
                          <CheckCircle className="h-3 w-3" />
                          Buyer confirmed
                        </span>
                        <span className={`flex items-center gap-1 ${escrow.sellerConfirmed ? "text-green-600" : "text-gray-400"}`}>
                          <CheckCircle className="h-3 w-3" />
                          Seller confirmed
                        </span>
                        <span className={`flex items-center gap-1 ${escrow.documentsVerified ? "text-green-600" : "text-gray-400"}`}>
                          <CheckCircle className="h-3 w-3" />
                          Docs verified
                        </span>
                      </div>

                      <p className="text-xs text-gray-400 mt-2">
                        Initiated {formatDate(escrow.createdAt)}
                        {escrow.buyer && ` · Buyer: ${escrow.buyer.name}`}
                        {escrow.seller && ` · Seller: ${escrow.seller.name}`}
                      </p>

                      {actions.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {actions.map(({ action, label, variant }) => (
                            <Button
                              key={action}
                              variant={variant}
                              size="sm"
                              loading={updating === escrow.id}
                              onClick={() => handleAction(escrow.id, action)}
                            >
                              {label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
