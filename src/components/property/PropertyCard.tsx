"use client";

import Link from "next/link";
import { Heart, MapPin, Bed, Bath, Square, Eye } from "lucide-react";
import { formatPrice, parseImages } from "@/lib/utils";
import { StarRating } from "@/components/ui/StarRating";
import { useState } from "react";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    priceUnit: string;
    address: string;
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
    owner?: { name: string; avatar?: string | null };
    _avg?: { rating: number | null };
    _count?: { reviews: number };
  };
  compact?: boolean;
}

export function PropertyCard({ property, compact = false }: PropertyCardProps) {
  const images = parseImages(property.images);
  const mainImage = images[0] || null;
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
    await fetch(`/api/properties/${property.id}/save`, {
      method: saved ? "DELETE" : "POST",
    }).catch(() => {});
  };

  const listingBadge =
    property.listingType === "SALE" ? "For Sale" : "For Rent";
  const badgeColor =
    property.listingType === "SALE"
      ? "bg-blue-100 text-blue-700"
      : "bg-green-100 text-green-700";

  return (
    <Link href={`/properties/${property.id}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
              <span className="text-blue-300 text-5xl">🏠</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
              {listingBadge}
            </span>
            {property.isFeatured && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                Featured
              </span>
            )}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors"
          >
            <Heart
              className={`h-4 w-4 ${saved ? "fill-red-500 text-red-500" : "text-gray-400"}`}
            />
          </button>

          {/* View count */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            <Eye className="h-3 w-3" />
            {property.viewCount}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {property.title}
            </h3>
          </div>

          <p className="text-blue-600 font-bold text-lg mt-1">
            {formatPrice(property.price, property.priceUnit)}
            {property.listingType === "RENT" && (
              <span className="text-gray-400 text-sm font-normal">/mo</span>
            )}
          </p>

          {!compact && (
            <>
              <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {property.city}, {property.country}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-3 text-gray-600 text-xs">
                {property.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="h-3 w-3" />
                    {property.bedrooms} bed
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-3 w-3" />
                    {property.bathrooms} bath
                  </div>
                )}
                {property.area && (
                  <div className="flex items-center gap-1">
                    <Square className="h-3 w-3" />
                    {property.area} {property.areaUnit}
                  </div>
                )}
              </div>

              {property._avg?.rating && (
                <div className="flex items-center gap-1 mt-2">
                  <StarRating rating={property._avg.rating} size="sm" />
                  <span className="text-xs text-gray-500">
                    ({property._count?.reviews ?? 0})
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
