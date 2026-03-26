"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertySearch } from "@/components/property/PropertySearch";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight, PlusCircle } from "lucide-react";
import Link from "next/link";

interface Property {
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
}

function PropertiesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const currentPage = parseInt(searchParams.get("page") || "1");

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
    fetch("/api/users/me")
      .then(r => r.json())
      .then(d => setUserRole(d.user?.role || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const filters = getFilters();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set("page", String(currentPage));

    fetch(`/api/properties?${params}`)
      .then(r => r.json())
      .then(d => {
        setProperties(d.properties || []);
        setTotal(d.total || 0);
        setPages(d.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [searchParams, currentPage, getFilters]);

  const handleSearch = (filters: { q?: string; city?: string; country?: string; minPrice?: string; maxPrice?: string; propertyType?: string; listingType?: string; bedrooms?: string }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`/properties?${params}`);
  };

  const canList = userRole && ["SELLER", "SELLER_AGENT", "ADMIN"].includes(userRole);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-500 mt-1">
            {total} propert{total === 1 ? "y" : "ies"} found
          </p>
        </div>
        {canList && (
          <Link href="/properties/new">
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              List Property
            </Button>
          </Link>
        )}
      </div>

      {/* Search */}
      <div className="mb-8">
        <PropertySearch
          initialFilters={getFilters()}
          onSearch={handleSearch}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 animate-pulse">
              <div className="aspect-[4/3] bg-gray-200 rounded-t-xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500">Try adjusting your search filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => {
              const p = new URLSearchParams(searchParams.toString());
              p.set("page", String(currentPage - 1));
              router.push(`/properties?${p}`);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {pages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= pages}
            onClick={() => {
              const p = new URLSearchParams(searchParams.toString());
              p.set("page", String(currentPage + 1));
              router.push(`/properties?${p}`);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense>
      <PropertiesContent />
    </Suspense>
  );
}
