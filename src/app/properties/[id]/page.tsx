"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Bed, Bath, Square, Eye, Calendar, Shield,
  MessageCircle, Heart, Share2, CheckCircle, Star
} from "lucide-react";
import { formatPrice, formatDate, parseImages, parseAmenities } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { StarRating } from "@/components/ui/StarRating";
import { Modal } from "@/components/ui/Modal";

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  areaUnit: string;
  propertyType: string;
  listingType: string;
  status: string;
  images: string;
  amenities: string;
  isVerified: boolean;
  viewCount: number;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    avatar?: string | null;
    bio?: string | null;
    isVerified: boolean;
    role: string;
  };
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: { id: string; name: string; avatar?: string | null };
  }>;
  _count: { reviews: number; savedBy: number };
  _avg?: { rating: number | null };
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetch("/api/users/me").then(r => r.json()).then(d => setUserId(d.user?.id || null));
    fetch(`/api/properties/${id}`)
      .then(r => r.json())
      .then(d => { setProperty(d.property); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-6 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <Link href="/properties" className="text-blue-600 mt-4 inline-block">← Back to Properties</Link>
      </div>
    );
  }

  const images = parseImages(property.images);
  const amenities = parseAmenities(property.amenities);

  const startChat = async () => {
    if (!userId) { router.push("/login"); return; }
    const res = await fetch("/api/chat/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: property.owner.id }),
    });
    const data = await res.json();
    if (data.room) router.push(`/chat?room=${data.room.id}`);
  };

  const handleSave = async () => {
    if (!userId) { router.push("/login"); return; }
    setSaved(!saved);
    await fetch(`/api/properties/${id}/save`, { method: saved ? "DELETE" : "POST" });
  };

  const submitReview = async () => {
    setSubmittingReview(true);
    const res = await fetch(`/api/properties/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
    });
    if (res.ok) {
      setShowReviewModal(false);
      const d = await fetch(`/api/properties/${id}`).then(r => r.json());
      setProperty(d.property);
    }
    setSubmittingReview(false);
  };

  const initEscrow = async () => {
    if (!userId) { router.push("/login"); return; }
    const res = await fetch("/api/escrow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId: id,
        amount: property.price,
        currency: property.priceUnit,
      }),
    });
    if (res.ok) {
      setShowEscrowModal(false);
      router.push("/escrow");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/properties" className="hover:text-blue-600">Properties</Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-48">{property.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="rounded-xl overflow-hidden bg-gray-100">
            {images.length > 0 ? (
              <div>
                <div className="aspect-[16/9] relative">
                  <img
                    src={images[currentImage]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentImage(i)}
                          className={`h-2 w-2 rounded-full transition-all ${i === currentImage ? "bg-white scale-125" : "bg-white/50"}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 p-2 overflow-x-auto">
                    {images.map((img, i) => (
                      <button key={i} onClick={() => setCurrentImage(i)}>
                        <img
                          src={img}
                          alt=""
                          className={`h-16 w-20 object-cover rounded flex-shrink-0 border-2 transition-all ${i === currentImage ? "border-blue-500" : "border-transparent"}`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[16/9] flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                <span className="text-7xl">🏠</span>
              </div>
            )}
          </div>

          {/* Title + Key Info */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${property.listingType === "SALE" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                    {property.listingType === "SALE" ? "For Sale" : "For Rent"}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {property.propertyType}
                  </span>
                  {property.isVerified && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                <div className="flex items-center gap-1 text-gray-500 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{property.address}, {property.city}, {property.country}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-blue-600">
                  {formatPrice(property.price, property.priceUnit)}
                </p>
                {property.listingType === "RENT" && (
                  <p className="text-gray-400 text-sm">/month</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 py-4 border-y border-gray-100">
            {[
              { icon: Bed, value: property.bedrooms ?? "—", label: "Bedrooms" },
              { icon: Bath, value: property.bathrooms ?? "—", label: "Bathrooms" },
              { icon: Square, value: property.area ? `${property.area} ${property.areaUnit}` : "—", label: "Area" },
              { icon: Eye, value: property.viewCount, label: "Views" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <Icon className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                <p className="font-semibold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {amenities.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
                {property._avg?.rating && (
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={property._avg.rating} />
                    <span className="text-sm text-gray-500">
                      {property._avg.rating.toFixed(1)} ({property._count.reviews} reviews)
                    </span>
                  </div>
                )}
              </div>
              {userId && userId !== property.owner.id && (
                <Button variant="outline" size="sm" onClick={() => setShowReviewModal(true)}>
                  <Star className="h-4 w-4 mr-1" />
                  Write Review
                </Button>
              )}
            </div>

            {property.reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {property.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                        {review.reviewer.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.reviewer.name}</p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors flex-1 justify-center ${saved ? "bg-red-50 border-red-200 text-red-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <Heart className={`h-4 w-4 ${saved ? "fill-red-500" : ""}`} />
                {saved ? "Saved" : "Save"}
              </button>
              <button
                onClick={() => navigator.share?.({ title: property.title, url: window.location.href })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-colors flex-1 justify-center"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>

            <Button
              className="w-full"
              onClick={startChat}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat Anonymously
            </Button>

            {userId && userId !== property.owner.id && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setShowEscrowModal(true)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Initiate Secure Escrow
              </Button>
            )}
          </div>

          {/* Owner card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Listed By</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                {property.owner.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-medium text-gray-900">{property.owner.name}</p>
                  {property.owner.isVerified && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">{property.owner.role.replace(/_/g, " ")}</p>
              </div>
            </div>
            {property.owner.bio && (
              <p className="text-sm text-gray-500 mt-3">{property.owner.bio}</p>
            )}
          </div>

          {/* Details card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Property Details</h3>
            <dl className="space-y-2 text-sm">
              {[
                { label: "Type", value: property.propertyType },
                { label: "Status", value: property.status },
                { label: "Listed", value: formatDate(property.createdAt) },
                { label: "Views", value: property.viewCount },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Write a Review">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <StarRating
              rating={reviewRating}
              interactive
              onRate={setReviewRating}
              size="lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Share your experience with this property..."
            />
          </div>
          <Button onClick={submitReview} loading={submittingReview} className="w-full">
            Submit Review
          </Button>
        </div>
      </Modal>

      {/* Escrow Modal */}
      <Modal isOpen={showEscrowModal} onClose={() => setShowEscrowModal(false)} title="Initiate Secure Escrow">
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
            <p className="font-medium mb-2">How Escrow Works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>You initiate the escrow request</li>
              <li>Both buyer and seller must confirm</li>
              <li>Documents are verified by admin</li>
              <li>Payment is only released after all confirmations</li>
            </ol>
          </div>
          <p className="text-gray-600 text-sm">
            Property: <strong>{property.title}</strong>
            <br />
            Amount: <strong>{formatPrice(property.price, property.priceUnit)}</strong>
          </p>
          <Button onClick={initEscrow} className="w-full">
            <Shield className="h-4 w-4 mr-2" />
            Start Escrow Process
          </Button>
        </div>
      </Modal>
    </div>
  );
}
