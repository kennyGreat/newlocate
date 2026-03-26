"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PropertySearch } from "@/components/property/PropertySearch";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
        <p className="text-gray-500">Loading map...</p>
      </div>
    </div>
  ),
});

interface Property {
  id: string;
  title: string;
  price: number;
  priceUnit: string;
  address: string;
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  images: string;
  listingType: string;
  propertyType: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
}

function MapPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  const getFilters = useCallback(() => ({
    q: searchParams.get("q") || "",
    city: searchParams.get("city") || "",
    country: searchParams.get("country") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    propertyType: searchParams.get("propertyType") || "",
    listingType: searchParams.get("listingType") || "",
    bedrooms: searchParams.get("bedrooms") || "",
  }), [searchParams]);

  useEffect(() => {
    setLoading(true);
    const filters = getFilters();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set("limit", "100");

    fetch(`/api/properties?${params}`)
      .then(r => r.json())
      .then(d => {
        setProperties((d.properties || []).filter((p: Property) => p.latitude && p.longitude));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [searchParams, getFilters]);

  const handleSearch = (filters: { q?: string; city?: string; country?: string; minPrice?: string; maxPrice?: string; propertyType?: string; listingType?: string; bedrooms?: string }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`/map?${params}`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Search bar */}
      <div className="bg-white border-b border-gray-100 p-4 z-10">
        <PropertySearch initialFilters={getFilters()} onSearch={handleSearch} />
        <p className="text-xs text-gray-400 mt-2">
          Showing {properties.length} properties with location data
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          {!loading && (
            <MapComponent
              properties={properties}
              selectedId={selected?.id}
              onSelect={(p) => setSelected(p as Property)}
            />
          )}
          {loading && (
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
                <p className="text-gray-500">Loading properties...</p>
              </div>
            </div>
          )}
        </div>

        {/* Selected property panel */}
        {selected && (
          <div className="w-72 bg-white border-l border-gray-100 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 text-sm mb-3"
              >
                ✕ Close
              </button>
              <div>
                <div className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-3">
                  {JSON.parse(selected.images || "[]")[0] ? (
                    <img
                      src={JSON.parse(selected.images)[0]}
                      alt={selected.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🏠</div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{selected.title}</h3>
                <p className="text-blue-600 font-bold mt-1">
                  {formatPrice(selected.price, selected.priceUnit)}
                </p>
                <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                  <MapPin className="h-3 w-3" />
                  {selected.city}, {selected.country}
                </div>
                <div className="flex gap-2 mt-2 text-xs text-gray-500">
                  {selected.bedrooms && <span>🛏 {selected.bedrooms}</span>}
                  {selected.bathrooms && <span>🚿 {selected.bathrooms}</span>}
                  <span className={selected.listingType === "SALE" ? "text-blue-600" : "text-green-600"}>
                    {selected.listingType === "SALE" ? "For Sale" : "For Rent"}
                  </span>
                </div>
                <Link
                  href={`/properties/${selected.id}`}
                  className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense>
      <MapPageContent />
    </Suspense>
  );
}
