import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import {
  ChevronRight, MapPin, Star, Loader2, Search, X, Flame, Ticket,
  ChevronDown, Globe,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchMovies, fetchTrending, fetchLocations } from "@/lib/api";
import type { MovieAPI, LocationAPI } from "@/lib/api";
import { useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumiere — Now Showing" },
      { name: "description", content: "Book movie tickets in your city — now showing and coming soon." },
    ],
  }),
  component: HomePage,
});

const LANGUAGES = ["All", "Telugu", "Hindi", "Tamil", "English", "Malayalam"];

// ─── Searchable Location Picker ───────────────────────────────────────────────
function LocationPicker({
  selectedCity,
  onSelect,
}: {
  selectedCity: string;
  onSelect: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations", query],
    queryFn: () => fetchLocations(query || undefined),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
    else setQuery("");
  }, [open]);

  const grouped: Record<string, LocationAPI[]> = {};
  for (const loc of locations) {
    const key = loc.state;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(loc);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="text-left group cursor-pointer focus:outline-none"
      >
        <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground uppercase tracking-widest group-hover:text-accent transition-colors">
          <MapPin className="size-3 text-accent" /> Location
        </span>
        <span className="text-foreground font-semibold flex items-center gap-1 group-hover:text-accent transition-colors text-base mt-0.5">
          {selectedCity}
          <ChevronDown className="size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        </span>
      </button>

      {/* Full-screen overlay */}
      {open && (
        <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-background/95 backdrop-blur-md flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-14 pb-3 border-b border-border/40">
            <div className="flex-1 flex items-center gap-2 bg-surface ring-1 ring-border rounded-xl px-3 py-2.5">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city or district…"
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-accent"
            >
              Cancel
            </button>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-10">
            {isLoading ? (
              <div className="flex justify-center pt-10">
                <Loader2 className="size-5 animate-spin text-accent" />
              </div>
            ) : locations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center pt-10">
                No locations found for "{query}"
              </p>
            ) : (
              Object.entries(grouped).map(([state, locs]) => (
                <div key={state} className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1">
                    <Globe className="size-3" /> {state}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {locs.map((loc) => (
                      <button
                        key={loc.name}
                        onClick={() => {
                          onSelect(loc.name);
                          setOpen(false);
                        }}
                        className={`flex flex-col items-start p-3 rounded-xl ring-1 transition-all text-left ${
                          selectedCity === loc.name
                            ? "bg-accent/15 ring-accent/60 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                            : "bg-surface ring-border/40 hover:ring-border"
                        }`}
                      >
                        <span
                          className={`text-sm font-semibold ${
                            selectedCity === loc.name ? "text-accent" : "text-foreground"
                          }`}
                        >
                          {loc.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          {loc.type === "district" ? (
                            <span className="px-1 py-0.5 rounded bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-wide">
                              District
                            </span>
                          ) : (
                            <span className="px-1 py-0.5 rounded bg-border/60 text-muted-foreground text-[9px] font-bold uppercase tracking-wide">
                              City
                            </span>
                          )}
                          {loc.type === "district" && loc.parent_city && ` · ${loc.parent_city}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Movie Card (horizontal scroll) ──────────────────────────────────────────
function MovieCard({ m }: { m: MovieAPI }) {
  return (
    <Link
      to="/movie/$id"
      params={{ id: m.id }}
      className="flex-shrink-0 w-36 group"
    >
      <div className="w-full aspect-[2/3] bg-surface rounded-xl ring-1 ring-border mb-2.5 overflow-hidden relative">
        <img
          src={m.poster}
          alt={m.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Language badge */}
        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-background/80 backdrop-blur text-accent ring-1 ring-accent/30">
          {m.language}
        </span>
      </div>
      <h3 className="text-xs font-semibold text-foreground line-clamp-1 leading-tight">
        {m.title}
      </h3>
      <p className="text-[10px] text-muted-foreground mt-0.5">
        {m.genre} · {m.rating}
      </p>
    </Link>
  );
}

// ─── Trending Card ────────────────────────────────────────────────────────────
function TrendingCard({ m, rank }: { m: MovieAPI; rank: number }) {
  return (
    <Link
      to="/movie/$id"
      params={{ id: m.id }}
      className="flex items-center gap-3 p-3 bg-surface ring-1 ring-border rounded-xl hover:ring-accent/50 transition-all group"
    >
      <span className="text-3xl font-black text-accent/20 w-8 text-center leading-none tabular-nums">
        {rank}
      </span>
      <div className="size-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
        <img
          src={m.poster}
          alt={m.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Flame className="size-3 text-orange-400 shrink-0" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-orange-400">
            Trending
          </span>
        </div>
        <h3 className="text-sm font-semibold text-foreground line-clamp-1">{m.title}</h3>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">{m.genre}</span>
          <span className="text-[9px] px-1 py-0.5 rounded bg-accent/10 text-accent font-bold uppercase tracking-wide">
            {m.language}
          </span>
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function HomePage() {
  const [selectedCity, setSelectedCity] = useState(() => {
    return (typeof window !== "undefined" ? localStorage.getItem("selectedCity") : null) || "Mumbai";
  });
  const [activeLang, setActiveLang] = useState("All");

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem("selectedCity", city);
    setActiveLang("All"); // reset language filter on city change
  };

  const langParam = activeLang === "All" ? undefined : activeLang;

  const { data: allMovies, isLoading } = useQuery({
    queryKey: ["movies", selectedCity, langParam],
    queryFn: () => fetchMovies(undefined, selectedCity, langParam),
  });

  const { data: trending = [] } = useQuery({
    queryKey: ["trending", selectedCity],
    queryFn: () => fetchTrending(selectedCity, 5),
    staleTime: 5 * 60 * 1000,
  });

  const nowShowing = allMovies?.filter((m) => m.status === "now") ?? [];
  const upcoming = allMovies?.filter((m) => m.status === "upcoming") ?? [];
  const featured = nowShowing[0];

  return (
    <MobileShell>
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-12 pb-5 safe-top">
        <LocationPicker selectedCity={selectedCity} onSelect={handleCitySelect} />
        <Link
          to="/profile"
          className="size-10 rounded-full bg-surface ring-1 ring-border grid place-items-center text-sm font-semibold hover:ring-accent/50 transition-all"
        >
          YK
        </Link>
      </header>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="size-8 text-accent animate-spin" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* ── NOW BOOKING hero ──────────────────────────────── */}
          {featured ? (
            <section className="px-6 mb-8">
              <Link to="/movie/$id" params={{ id: featured.id }} className="block group">
                <div className="relative aspect-[3/4] sm:aspect-[2/3] rounded-2xl overflow-hidden bg-surface ring-1 ring-border">
                  <img
                    src={featured.poster}
                    alt={featured.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest shadow-lg">
                      <Ticket className="size-3" /> Now Booking
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-background/70 backdrop-blur text-accent text-[10px] font-bold uppercase tracking-wide">
                      {featured.language}
                    </span>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h1 className="text-2xl font-bold text-foreground leading-tight mb-2">
                      {featured.title}
                    </h1>
                    <div className="flex items-center gap-3">
                      {featured.imdb > 0 && (
                        <span className="flex items-center gap-1 text-accent text-sm font-semibold">
                          <Star className="size-3.5 fill-accent stroke-accent" />
                          {featured.imdb}
                        </span>
                      )}
                      <span className="text-sm text-foreground/70">
                        {featured.genre} · {featured.runtime}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded ring-1 ring-border text-muted-foreground">
                        {featured.rating}
                      </span>
                    </div>
                    <div className="mt-4 w-full py-3 bg-accent text-accent-foreground rounded-xl font-bold text-sm uppercase tracking-wider text-center shadow-[0_0_24px_rgba(245,158,11,0.35)]">
                      Book Tickets
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          ) : (
            <div className="px-6 py-16 text-center">
              <MapPin className="size-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">No films currently in {selectedCity}</p>
              <p className="text-xs text-muted-foreground mt-1">Try searching a nearby city or district</p>
            </div>
          )}

          {/* ── Language filter pills ──────────────────────────── */}
          {nowShowing.length > 0 && (
            <div className="flex gap-2 overflow-x-auto px-6 pb-4 no-scrollbar">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    activeLang === lang
                      ? "bg-accent text-accent-foreground shadow-[0_0_12px_rgba(245,158,11,0.3)]"
                      : "bg-surface ring-1 ring-border text-foreground"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}

          {/* ── Now Showing scroll ────────────────────────────── */}
          {nowShowing.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between px-6 mb-4">
                <h2 className="text-base font-semibold text-foreground">Now Showing</h2>
                <Link to="/search" className="text-xs font-medium text-accent uppercase tracking-wider">
                  See All
                </Link>
              </div>
              <div className="flex gap-3.5 overflow-x-auto px-6 no-scrollbar pb-1">
                {nowShowing.map((m) => (
                  <MovieCard key={m.id} m={m} />
                ))}
              </div>
            </section>
          )}

          {/* ── Trending Near You ─────────────────────────────── */}
          {trending.length > 0 && (
            <section className="px-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="size-4 text-orange-400" />
                <h2 className="text-base font-semibold text-foreground">
                  Trending in {selectedCity}
                </h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {trending.map((m, i) => (
                  <TrendingCard key={m.id} m={m} rank={i + 1} />
                ))}
              </div>
            </section>
          )}

          {/* ── Coming Soon ───────────────────────────────────── */}
          {upcoming.length > 0 && (
            <section className="px-6 mb-10">
              <h2 className="text-base font-semibold text-foreground mb-4">Coming Soon</h2>
              <div className="flex flex-col gap-3">
                {upcoming.map((m) => (
                  <Link
                    key={m.id}
                    to="/movie/$id"
                    params={{ id: m.id }}
                    className="flex gap-4 p-3 bg-surface ring-1 ring-border rounded-xl items-center hover:ring-accent/40 transition-all group"
                  >
                    <div className="size-20 rounded-lg bg-surface-2 flex-shrink-0 overflow-hidden">
                      <img
                        src={m.poster}
                        alt={m.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-accent">
                          {m.language}
                        </span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wide">
                          {m.genre}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-tight">{m.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {m.release_note}
                      </p>
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider mt-1.5 inline-block">
                        Notify me →
                      </span>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </MobileShell>
  );
}
