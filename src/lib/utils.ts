import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function parseImages(images: string): string[] {
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
}

export function parseAmenities(amenities: string): string[] {
  try {
    return JSON.parse(amenities);
  } catch {
    return [];
  }
}

export function generateAnonymousId(): string {
  return `anon_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

export function maskSensitiveInfo(text: string): string {
  // Mask phone numbers
  const phoneRegex =
    /(\+?[\d\s\-().]{7,})/g;
  // Mask email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  // Mask addresses with numbers that look like street addresses
  const addressRegex = /\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|lane|ln|drive|dr|blvd|boulevard)\b/gi;

  return text
    .replace(phoneRegex, "[phone hidden]")
    .replace(emailRegex, "[email hidden]")
    .replace(addressRegex, "[address hidden]");
}

export function calculateMatchScore(
  property: {
    price: number;
    city: string;
    country: string;
    propertyType: string;
    listingType: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
  },
  request: {
    minPrice?: number | null;
    maxPrice?: number | null;
    city?: string | null;
    country?: string | null;
    propertyType?: string | null;
    listingType?: string | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
  }
): number {
  let score = 0;
  let factors = 0;

  if (request.country) {
    factors++;
    if (property.country.toLowerCase() === request.country.toLowerCase()) score += 1;
  }

  if (request.city) {
    factors++;
    if (property.city.toLowerCase().includes(request.city.toLowerCase())) score += 1;
  }

  if (request.minPrice !== null && request.minPrice !== undefined) {
    factors++;
    if (property.price >= request.minPrice) score += 0.5;
  }
  if (request.maxPrice !== null && request.maxPrice !== undefined) {
    factors++;
    if (property.price <= request.maxPrice) score += 0.5;
  }

  if (request.propertyType) {
    factors++;
    if (property.propertyType === request.propertyType) score += 1;
  }

  if (request.listingType) {
    factors++;
    if (property.listingType === request.listingType) score += 1;
  }

  if (request.bedrooms) {
    factors++;
    if (property.bedrooms && property.bedrooms >= request.bedrooms) score += 1;
  }

  if (request.bathrooms) {
    factors++;
    if (property.bathrooms && property.bathrooms >= request.bathrooms) score += 1;
  }

  return factors > 0 ? score / factors : 0;
}
