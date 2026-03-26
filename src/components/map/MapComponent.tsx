"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import { formatPrice, parseImages } from "@/lib/utils";

interface Property {
  id: string;
  title: string;
  price: number;
  priceUnit: string;
  city: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  images: string;
  listingType: string;
  propertyType: string;
}

interface MapComponentProps {
  properties: Property[];
  selectedId?: string | null;
  onSelect: (property: Property) => void;
}

export default function MapComponent({ properties, selectedId, onSelect }: MapComponentProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default markers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      const map = L.map(mapDivRef.current!, {
        center: [9.0820, 8.6753], // Center on Nigeria
        zoom: 6,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;

      // Add markers
      properties.forEach(property => {
        if (!property.latitude || !property.longitude) return;

        const images = parseImages(property.images);
        const img = images[0] || null;

        const markerIcon = L.divIcon({
          className: "custom-pin",
          html: `
            <div style="
              background: ${property.listingType === "SALE" ? "#2563eb" : "#16a34a"};
              color: white;
              padding: 4px 8px;
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              border: 2px solid white;
            ">
              ${formatPrice(property.price, property.priceUnit)}
            </div>
          `,
          iconSize: [80, 30],
          iconAnchor: [40, 30],
        });

        const marker = L.marker([property.latitude, property.longitude], { icon: markerIcon });

        const popup = L.popup({ maxWidth: 250 }).setContent(`
          <div style="font-family: sans-serif; min-width: 200px;">
            ${img ? `<img src="${img}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px" />` : ""}
            <strong style="font-size:13px">${property.title}</strong>
            <p style="color:#2563eb;font-weight:bold;margin:4px 0">${formatPrice(property.price, property.priceUnit)}</p>
            <p style="color:#666;font-size:11px">📍 ${property.city}, ${property.country}</p>
            <a href="/properties/${property.id}" style="
              display:inline-block;margin-top:8px;padding:6px 12px;
              background:#2563eb;color:white;border-radius:6px;
              text-decoration:none;font-size:12px
            ">View Details</a>
          </div>
        `);

        marker.bindPopup(popup);
        marker.on("click", () => onSelect(property));
        marker.addTo(map);
      });

      // Fit to markers if any
      if (properties.length > 0) {
        const latlngs = properties
          .filter(p => p.latitude && p.longitude)
          .map(p => [p.latitude!, p.longitude!] as [number, number]);
        if (latlngs.length > 0) {
          map.fitBounds(latlngs, { padding: [30, 30], maxZoom: 12 });
        }
      }
    };

    initMap();

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mapDivRef} className="w-full h-full" />;
}
