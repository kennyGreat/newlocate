"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Building2, Plus, X } from "lucide-react";

const PROPERTY_TYPES = [
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
  { value: "SALE", label: "For Sale" },
  { value: "RENT", label: "For Rent" },
];

const CURRENCIES = [
  { value: "USD", label: "USD ($)" },
  { value: "NGN", label: "NGN (₦)" },
  { value: "GHS", label: "GHS (₵)" },
  { value: "KES", label: "KES (KSh)" },
  { value: "ZAR", label: "ZAR (R)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "INR", label: "INR (₹)" },
  { value: "CAD", label: "CAD (C$)" },
];

const COMMON_AMENITIES = [
  "Swimming Pool", "Parking", "Gym", "Garden", "Security",
  "Generator", "Borehole", "AC", "CCTV", "WiFi",
  "Elevator", "Balcony", "Servant Quarters", "Water Supply", "Solar Power",
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    priceUnit: "USD",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    latitude: "",
    longitude: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    areaUnit: "sqft",
    propertyType: "HOUSE",
    listingType: "SALE",
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const addImage = () => {
    if (imageInput.trim() && !images.includes(imageInput.trim())) {
      setImages(prev => [...prev, imageInput.trim()]);
      setImageInput("");
    }
  };

  const toggleAmenity = (a: string) => {
    setAmenities(prev =>
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images, amenities }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create property");
        return;
      }

      router.push(`/properties/${data.property.id}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">List a Property</h1>
          <p className="text-gray-500 text-sm">Fill in the details to list your property</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>
          <Input
            label="Property Title *"
            value={form.title}
            onChange={e => update("title", e.target.value)}
            placeholder="e.g., Modern 3-Bedroom House in Victoria Island"
            required
          />
          <Textarea
            label="Description *"
            value={form.description}
            onChange={e => update("description", e.target.value)}
            placeholder="Describe the property in detail..."
            required
            rows={5}
          />
          <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* Price */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Price</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price *"
              type="number"
              value={form.price}
              onChange={e => update("price", e.target.value)}
              placeholder="0"
              required
              min="0"
            />
            <Select
              label="Currency"
              options={CURRENCIES}
              value={form.priceUnit}
              onChange={e => update("priceUnit", e.target.value)}
            />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Location</h2>
          <Input
            label="Street Address *"
            value={form.address}
            onChange={e => update("address", e.target.value)}
            placeholder="123 Main Street"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City *"
              value={form.city}
              onChange={e => update("city", e.target.value)}
              placeholder="Lagos"
              required
            />
            <Input
              label="State/Province"
              value={form.state}
              onChange={e => update("state", e.target.value)}
              placeholder="Lagos State"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country *"
              value={form.country}
              onChange={e => update("country", e.target.value)}
              placeholder="Nigeria"
              required
            />
            <Input
              label="Zip/Postal Code"
              value={form.zipCode}
              onChange={e => update("zipCode", e.target.value)}
              placeholder="100001"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Latitude (for map)"
              type="number"
              step="any"
              value={form.latitude}
              onChange={e => update("latitude", e.target.value)}
              placeholder="6.5244"
            />
            <Input
              label="Longitude (for map)"
              type="number"
              step="any"
              value={form.longitude}
              onChange={e => update("longitude", e.target.value)}
              placeholder="3.3792"
            />
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Property Details</h2>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Bedrooms"
              type="number"
              value={form.bedrooms}
              onChange={e => update("bedrooms", e.target.value)}
              placeholder="3"
              min="0"
            />
            <Input
              label="Bathrooms"
              type="number"
              value={form.bathrooms}
              onChange={e => update("bathrooms", e.target.value)}
              placeholder="2"
              min="0"
            />
            <Input
              label="Area"
              type="number"
              value={form.area}
              onChange={e => update("area", e.target.value)}
              placeholder="150"
              min="0"
            />
          </div>
          <Select
            label="Area Unit"
            options={[
              { value: "sqft", label: "Square Feet" },
              { value: "sqm", label: "Square Meters" },
              { value: "hectare", label: "Hectares" },
              { value: "acre", label: "Acres" },
            ]}
            value={form.areaUnit}
            onChange={e => update("areaUnit", e.target.value)}
          />
        </div>

        {/* Amenities */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Amenities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COMMON_AMENITIES.map(a => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`px-3 py-2 rounded-lg text-sm border transition-colors ${amenities.includes(a) ? "bg-blue-50 border-blue-300 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {amenities.includes(a) ? "✓ " : ""}{a}
              </button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Images</h2>
          <p className="text-sm text-gray-500 mb-3">Add image URLs (e.g., from Unsplash or your hosting)</p>
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              value={imageInput}
              onChange={e => setImageInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
            />
            <Button type="button" variant="outline" onClick={addImage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img} alt="" className="w-full h-20 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button type="submit" loading={loading} size="lg" className="flex-1">
            Publish Property
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
