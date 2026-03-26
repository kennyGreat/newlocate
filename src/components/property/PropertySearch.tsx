"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

interface SearchFilters {
  q?: string;
  city?: string;
  country?: string;
  minPrice?: string;
  maxPrice?: string;
  propertyType?: string;
  listingType?: string;
  bedrooms?: string;
  bathrooms?: string;
}

interface PropertySearchProps {
  initialFilters?: SearchFilters;
  onSearch: (filters: SearchFilters) => void;
}

const PROPERTY_TYPES = [
  { value: "", label: "Any Type" },
  { value: "HOUSE", label: "House" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "CONDO", label: "Condo" },
  { value: "LAND", label: "Land" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "VILLA", label: "Villa" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "STUDIO", label: "Studio" },
];

const LISTING_TYPES = [
  { value: "", label: "Buy or Rent" },
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
];

const BEDROOM_OPTIONS = [
  { value: "", label: "Any Beds" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
  { value: "5", label: "5+" },
];

export function PropertySearch({
  initialFilters = {},
  onSearch,
}: PropertySearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const clearFilters = () => {
    setFilters({});
    onSearch({});
  };

  const hasFilters = Object.values(filters).some((v) => v && v !== "");

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      {/* Main search row */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by city, address, or keyword..."
            value={filters.q || ""}
            onChange={(e) => handleChange("q", e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              !
            </span>
          )}
        </Button>
        <Button type="submit" className="px-6">
          Search
        </Button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select
            options={LISTING_TYPES}
            value={filters.listingType || ""}
            onChange={(e) => handleChange("listingType", e.target.value)}
            label="Listing Type"
          />
          <Select
            options={PROPERTY_TYPES}
            value={filters.propertyType || ""}
            onChange={(e) => handleChange("propertyType", e.target.value)}
            label="Property Type"
          />
          <Input
            type="text"
            placeholder="City"
            value={filters.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
            label="City"
          />
          <Input
            type="text"
            placeholder="Country"
            value={filters.country || ""}
            onChange={(e) => handleChange("country", e.target.value)}
            label="Country"
          />
          <Input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice || ""}
            onChange={(e) => handleChange("minPrice", e.target.value)}
            label="Min Price"
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice || ""}
            onChange={(e) => handleChange("maxPrice", e.target.value)}
            label="Max Price"
          />
          <Select
            options={BEDROOM_OPTIONS}
            value={filters.bedrooms || ""}
            onChange={(e) => handleChange("bedrooms", e.target.value)}
            label="Bedrooms"
          />
          <div className="flex items-end">
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
