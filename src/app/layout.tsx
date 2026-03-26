import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "NewLocate – Find Your Perfect Property",
  description:
    "NewLocate is a full-featured property listing and management platform for buyers, sellers, and agents worldwide.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">
        <Navbar />
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <footer className="bg-white border-t border-gray-200 py-8 px-4 mt-auto hidden md:block">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-gray-500">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">NewLocate</h4>
              <p>Find your perfect property across Africa, Asia, and the diaspora.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">For Users</h4>
              <ul className="space-y-2">
                <li><a href="/properties" className="hover:text-blue-600">Browse Properties</a></li>
                <li><a href="/map" className="hover:text-blue-600">Map View</a></li>
                <li><a href="/chat" className="hover:text-blue-600">Anonymous Chat</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">For Agents</h4>
              <ul className="space-y-2">
                <li><a href="/register" className="hover:text-blue-600">Register as Agent</a></li>
                <li><a href="/dashboard/agent" className="hover:text-blue-600">Agent Dashboard</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Company</h4>
              <ul className="space-y-2">
                <li><a href="/escrow" className="hover:text-blue-600">Secure Escrow</a></li>
                <li><a href="/reviews" className="hover:text-blue-600">Reviews</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} NewLocate. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
