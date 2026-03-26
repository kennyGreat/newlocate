"use client";

import { useEffect, useState } from "react";
import { User, CheckCircle, Building2, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  bio?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  isVerified: boolean;
  createdAt: string;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
}

const COUNTRY_OPTIONS = [
  { value: "", label: "Select country..." },
  { value: "Nigeria", label: "Nigeria" },
  { value: "Ghana", label: "Ghana" },
  { value: "Kenya", label: "Kenya" },
  { value: "South Africa", label: "South Africa" },
  { value: "Ethiopia", label: "Ethiopia" },
  { value: "India", label: "India" },
  { value: "Pakistan", label: "Pakistan" },
  { value: "United States", label: "United States" },
  { value: "United Kingdom", label: "United Kingdom" },
  { value: "Canada", label: "Canada" },
  { value: "Australia", label: "Australia" },
  { value: "Other", label: "Other" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSavedState] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    fetch("/api/users/me")
      .then(r => r.json())
      .then(d => {
        setProfile(d.user);
        setForm(d.user || {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const d = await res.json();
      setProfile(d.user);
      setSavedState(true);
      setEditMode(false);
      setTimeout(() => setSavedState(false), 2000);
    }
    setSaving(false);
  };

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-20 w-20 bg-gray-200 rounded-full" />
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-40" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p>Please sign in to view your profile</p>
        <a href="/login" className="text-blue-600 mt-2 inline-block">Sign In</a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Profile header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover rounded-full" />
            ) : (
              profile.name[0]
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              {profile.isVerified && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            <p className="text-gray-500 text-sm">{profile.role.replace(/_/g, " ")}</p>
            {profile.country && (
              <p className="text-gray-400 text-xs mt-0.5">
                📍 {profile.city ? `${profile.city}, ` : ""}{profile.country}
              </p>
            )}
          </div>
        </div>
        <Button
          variant={editMode ? "outline" : "primary"}
          size="sm"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      {/* Bio */}
      {profile.bio && !editMode && (
        <Card>
          <CardContent className="py-4">
            <p className="text-gray-600 text-sm">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Edit form */}
      {editMode && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Edit Profile
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {saved && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg text-sm">
                Profile saved successfully!
              </div>
            )}
            <Input
              label="Full Name"
              value={form.name || ""}
              onChange={e => update("name", e.target.value)}
            />
            <Textarea
              label="Bio"
              value={form.bio || ""}
              onChange={e => update("bio", e.target.value)}
              placeholder="Tell others about yourself..."
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Country"
                options={COUNTRY_OPTIONS}
                value={form.country || ""}
                onChange={e => update("country", e.target.value)}
              />
              <Input
                label="City"
                value={form.city || ""}
                onChange={e => update("city", e.target.value)}
                placeholder="Lagos"
              />
            </div>
            <Input
              label="Phone"
              value={form.phone || ""}
              onChange={e => update("phone", e.target.value)}
              placeholder="+234 800 000 0000"
            />
            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Social Media</p>
              <div className="space-y-3">
                <Input
                  label="Facebook URL"
                  value={form.facebookUrl || ""}
                  onChange={e => update("facebookUrl", e.target.value)}
                  placeholder="https://facebook.com/..."
                />
                <Input
                  label="Twitter/X URL"
                  value={form.twitterUrl || ""}
                  onChange={e => update("twitterUrl", e.target.value)}
                  placeholder="https://twitter.com/..."
                />
                <Input
                  label="Instagram URL"
                  value={form.instagramUrl || ""}
                  onChange={e => update("instagramUrl", e.target.value)}
                  placeholder="https://instagram.com/..."
                />
                <Input
                  label="LinkedIn URL"
                  value={form.linkedinUrl || ""}
                  onChange={e => update("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
            </div>
            <Button onClick={handleSave} loading={saving} className="w-full">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Member since", value: formatDate(profile.createdAt), icon: User },
          { label: "Properties", value: "—", icon: Building2 },
          { label: "Chat Rooms", value: "—", icon: MessageCircle },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="text-center py-4">
              <Icon className="h-5 w-5 text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-medium text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Social Links */}
      {(profile.facebookUrl || profile.twitterUrl || profile.instagramUrl || profile.linkedinUrl) && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Social Media</h2>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {profile.facebookUrl && (
                <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  Facebook
                </a>
              )}
              {profile.twitterUrl && (
                <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-sky-500 text-white text-sm rounded-lg hover:bg-sky-600">
                  Twitter
                </a>
              )}
              {profile.instagramUrl && (
                <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-pink-600 text-white text-sm rounded-lg hover:bg-pink-700">
                  Instagram
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-800 text-white text-sm rounded-lg hover:bg-blue-900">
                  LinkedIn
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
