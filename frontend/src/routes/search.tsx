import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "@/lib/api";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Lumiere" },
      { name: "description", content: "Search films, genres, and theatres." },
    ],
  }),
  component: SearchPage,
});

const genres = ["All", "Sci-Fi", "Action", "Animation", "Thriller", "Horror", "Historical"];

function SearchPage() {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("All");
  const selectedCity = typeof window !== "undefined" ? localStorage.getItem("selectedCity") || "Mumbai" : "Mumbai";

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search", q, genre, selectedCity],
    queryFn: () => searchMovies(q, genre, selectedCity),
  });

  return (
    <MobileShell>
      <header className="px-6 pt-12 pb-4 safe-top">
        <h1 className="text-2xl font-semibold mb-4">Search</h1>
        <div className="relative">
          <SearchIcon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Films, genres, theatres…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-surface ring-1 ring-border rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-accent"
          />
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto px-6 pb-4 no-scrollbar">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(g)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-colors ${
              genre === g
                ? "bg-accent text-accent-foreground"
                : "bg-surface text-muted-foreground ring-1 ring-border"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 text-accent animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 px-6 mt-2">
          {results.map((m) => (
            <Link key={m.id} to="/movie/$id" params={{ id: m.id }} className="group">
              <div className="aspect-[2/3] rounded-xl bg-surface ring-1 ring-border overflow-hidden mb-2">
                <img
                  src={m.poster}
                  alt={m.title}
                  loading="lazy"
                  width={512}
                  height={768}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-sm font-medium line-clamp-1">{m.title}</h3>
              <p className="text-xs text-muted-foreground">
                {m.genre} • {m.rating}
              </p>
            </Link>
          ))}
          {results.length === 0 && (
            <p className="col-span-2 text-sm text-muted-foreground text-center py-12">
              No films match that search.
            </p>
          )}
        </div>
      )}
    </MobileShell>
  );
}
