"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PropertyCard } from "@/components/property/PropertyCard";

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
}

export default function SearchPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    description: "",
    city: "",
    country: "",
    minPrice: "",
    maxPrice: "",
    propertyType: "",
    listingType: "",
    bedrooms: "",
    bathrooms: "",
    isAnonymous: true,
  });
  const [results, setResults] = useState<Property[]>([]);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (k: string, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create a property request for AI matching
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setError(data.error || "Failed to submit");
        return;
      }

      const data = await res.json();
      setMatchCount(data.matchCount);
      setSubmitted(true);

      // Fetch matching properties
      const params = new URLSearchParams();
      if (form.city) params.set("city", form.city);
      if (form.country) params.set("country", form.country);
      if (form.minPrice) params.set("minPrice", form.minPrice);
      if (form.maxPrice) params.set("maxPrice", form.maxPrice);
      if (form.propertyType) params.set("propertyType", form.propertyType);
      if (form.listingType) params.set("listingType", form.listingType);
      if (form.bedrooms) params.set("bedrooms", form.bedrooms);

      const propRes = await fetch(`/api/properties?${params}`);
      const propData = await propRes.json();
      setResults(propData.properties || []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Lightbulb className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Property Request</h1>
          <p className="text-gray-500 text-sm">Describe what you need, and our AI will find matching properties</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Request Form */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Submit Your Request</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {submitted && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  ✓ Request submitted! Found {matchCount} matching properties.
                </div>
              )}

              <Textarea
                label="Describe what you're looking for *"
                value={form.description}
                onChange={e => update("description", e.target.value)}
                placeholder="e.g., Looking for a 3-bedroom house in Lagos for my family. Must have parking and be close to schools. Budget around ₦50M."
                required
                rows={4}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Listing Type"
                  options={LISTING_TYPES}
                  value={form.listingType}
                  onChange={e => update("listingType", e.target.value)}
                />
                <Select
                  label="Property Type"
                  options={PROPERTY_TYPES}
                  value={form.propertyType}
                  onChange={e => update("propertyType", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  value={form.city}
                  onChange={e => update("city", e.target.value)}
                  placeholder="Lagos"
                />
                <Input
                  label="Country"
                  value={form.country}
                  onChange={e => update("country", e.target.value)}
                  placeholder="Nigeria"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Min Budget"
                  type="number"
                  value={form.minPrice}
                  onChange={e => update("minPrice", e.target.value)}
                  placeholder="0"
                />
                <Input
                  label="Max Budget"
                  type="number"
                  value={form.maxPrice}
                  onChange={e => update("maxPrice", e.target.value)}
                  placeholder="1000000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Min Bedrooms"
                  type="number"
                  value={form.bedrooms}
                  onChange={e => update("bedrooms", e.target.value)}
                  placeholder="2"
                  min="0"
                />
                <Input
                  label="Min Bathrooms"
                  type="number"
                  value={form.bathrooms}
                  onChange={e => update("bathrooms", e.target.value)}
                  placeholder="1"
                  min="0"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={e => update("isAnonymous", e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-600">Keep request anonymous</span>
              </label>

              <Button type="submit" loading={loading} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Submit & Find Matches
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">How AI Matching Works</h2>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  "Describe your requirements in detail",
                  "Our AI analyzes all active listings",
                  "Properties are matched by location, price, size, and type",
                  "You receive personalized recommendations",
                  "New listings that match are automatically notified to you",
                  "Your request remains anonymous if you choose",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold text-gray-900">Diaspora Support</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Looking for property in Nigeria, Ghana, Kenya, India, or other developing countries
                from abroad? Our platform connects diaspora buyers with verified local sellers and agents.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ✓ Secure escrow payment protection<br />
                ✓ Anonymous communication<br />
                ✓ Verified listings and agents
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Matching Properties ({results.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {results.map(p => (
              <PropertyCard key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
