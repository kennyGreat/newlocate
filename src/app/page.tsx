import Link from "next/link";
import { Building2, Shield, MessageCircle, Map, Star, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PropertyCard } from "@/components/property/PropertyCard";

async function getFeaturedProperties() {
  return prisma.property.findMany({
    where: { status: "ACTIVE", isFeatured: true },
    include: { owner: { select: { name: true, avatar: true } } },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
}

async function getStats() {
  const [properties, users] = await Promise.all([
    prisma.property.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
  ]);
  return { properties, users };
}

export default async function HomePage() {
  const [featured, stats] = await Promise.all([
    getFeaturedProperties(),
    getStats(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Find Your Perfect Property
              <br />
              <span className="text-blue-200">Anywhere in the World</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-xl">
              Connect buyers, sellers, renters, and agents across Africa, Asia,
              and the global diaspora. Secure escrow, anonymous chat, AI matching.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Building2 className="h-5 w-5" />
                Browse Properties
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors border border-blue-400"
              >
                List Your Property
              </Link>
              <Link
                href="/map"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors border border-blue-300"
              >
                <Map className="h-5 w-5" />
                Map View
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            {[
              { label: "Properties Listed", value: stats.properties.toLocaleString() },
              { label: "Registered Users", value: stats.users.toLocaleString() },
              { label: "Countries", value: "50+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-blue-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            A complete platform for property transactions—from discovery to ownership
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Secure Escrow",
                color: "text-green-600 bg-green-50",
                desc: "No payment is released until all parties—buyers, sellers, and agents—confirm verification and documentation.",
              },
              {
                icon: MessageCircle,
                title: "Anonymous Chat",
                color: "text-purple-600 bg-purple-50",
                desc: "Communicate securely without revealing your phone number, email, or physical address.",
              },
              {
                icon: Map,
                title: "Interactive Map",
                color: "text-blue-600 bg-blue-50",
                desc: "Explore properties on an interactive map with advanced filters and pictorial display.",
              },
              {
                icon: Star,
                title: "Reviews & Ratings",
                color: "text-yellow-600 bg-yellow-50",
                desc: "Read honest reviews of properties, buyers, sellers, and agents to build trust.",
              },
              {
                icon: Globe,
                title: "Diaspora Connect",
                color: "text-orange-600 bg-orange-50",
                desc: "Connecting Nigerian, African, Indian and diaspora buyers and sellers across borders.",
              },
              {
                icon: Building2,
                title: "AI Matching",
                color: "text-indigo-600 bg-indigo-50",
                desc: "Our recommendation engine matches your preferences to the best properties automatically.",
              },
            ].map(({ icon: Icon, title, color, desc }) => (
              <div
                key={title}
                className="p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {featured.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
                <p className="text-gray-500 mt-1">Hand-picked listings for you</p>
              </div>
              <Link
                href="/properties"
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {featured.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Property?</h2>
          <p className="text-blue-100 mb-8">
            Join thousands of buyers, sellers, and agents already using NewLocate.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/properties"
              className="px-8 py-3 bg-transparent text-white font-semibold rounded-lg border border-blue-400 hover:bg-blue-700 transition-colors"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Built for Everyone
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                role: "Buyers",
                icon: "🏠",
                features: ["AI-matched listings", "Saved properties", "Escrow protection"],
                href: "/register?role=BUYER",
              },
              {
                role: "Sellers",
                icon: "🏷️",
                features: ["Easy listing", "Verified buyers", "Analytics dashboard"],
                href: "/register?role=SELLER",
              },
              {
                role: "Buyer Agents",
                icon: "🤝",
                features: ["Client management", "Request matching", "Commission tracking"],
                href: "/register?role=BUYER_AGENT",
              },
              {
                role: "Seller Agents",
                icon: "📋",
                features: ["Portfolio listing", "Social media reach", "Verified transactions"],
                href: "/register?role=SELLER_AGENT",
              },
            ].map((type) => (
              <Link
                key={type.role}
                href={type.href}
                className="p-6 rounded-xl border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all text-center group"
              >
                <div className="text-4xl mb-3">{type.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-3 group-hover:text-blue-600">
                  {type.role}
                </h3>
                <ul className="text-sm text-gray-500 space-y-1">
                  {type.features.map((f) => (
                    <li key={f}>✓ {f}</li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
