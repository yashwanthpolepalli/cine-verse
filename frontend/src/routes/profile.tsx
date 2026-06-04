import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Bell, CreditCard, Download, Heart, MapPin, Settings, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile — Lumiere" }],
  }),
  component: ProfilePage,
});

const items = [
  { icon: Heart, label: "Watchlist" },
  { icon: Bell, label: "Notifications" },
  { icon: CreditCard, label: "Payment methods" },
  { icon: MapPin, label: "Location" },
  { icon: Download, label: "Install app" },
  { icon: Settings, label: "Settings" },
];

function ProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  return (
    <MobileShell>
      {isLoading || !profile ? (
        <div className="flex flex-col items-center justify-center pt-40 gap-3">
          <Loader2 className="size-8 text-accent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      ) : (
        <>
          <header className="px-6 pt-12 pb-6 safe-top">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Profile
            </span>
            <h1 className="text-2xl font-semibold mt-0.5">{profile.name}</h1>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </header>

          <div className="px-6 grid grid-cols-3 gap-3 mb-8">
            <Stat label="Films" value={String(profile.films_watched)} />
            <Stat label="Hours" value={String(profile.hours)} />
            <Stat label="Reviews" value={String(profile.reviews)} />
          </div>

          <ul className="px-6 space-y-2">
            {items.map(({ icon: Icon, label }) => (
              <li key={label}>
                <button className="w-full flex items-center gap-4 p-4 bg-surface ring-1 ring-border rounded-xl text-left">
                  <Icon className="size-5 text-accent" />
                  <span className="flex-1 text-sm font-medium">{label}</span>
                  {label === "Location" && (
                    <span className="text-xs text-muted-foreground mr-1">
                      {typeof window !== "undefined" ? localStorage.getItem("selectedCity") || "Mumbai" : "Mumbai"}
                    </span>
                  )}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>


          <Link to="/" className="block text-center mt-8 mx-6 py-3 text-sm text-muted-foreground">
            Sign out
          </Link>
        </>
      )}
    </MobileShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface ring-1 ring-border rounded-xl p-4 text-center">
      <p className="text-2xl font-semibold text-accent">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
