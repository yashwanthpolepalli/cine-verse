import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ArrowLeft, Calendar, Clock, MapPin, Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  fetchMovie,
  fetchTheatres,
  fetchTheatresForMovie,
  fetchDates,
  fetchShowtimes,
  subscribeNotification,
} from "@/lib/api";

export const Route = createFileRoute("/movie/$id")({
  loader: async ({ context: { queryClient }, params }) => {
    return queryClient.ensureQueryData({
      queryKey: ["movie", params.id],
      queryFn: () => fetchMovie(params.id),
    });
  },
  head: ({ loaderData }) => {
    const m = loaderData;
    return {
      meta: [
        { title: m ? `${m.title} — Lumiere` : "Film not found" },
        { name: "description", content: m?.synopsis ?? "Film details" },
        { property: "og:title", content: m?.title ?? "Lumiere" },
        { property: "og:description", content: m?.synopsis ?? "" },
        ...(m ? [{ property: "og:image", content: m.poster }] : []),
      ],
    };
  },
  component: MoviePage,
});

function MoviePage() {
  const movie = Route.useLoaderData();
  const { id } = Route.useParams();
  const router = useRouter();

  const selectedCity =
    typeof window !== "undefined"
      ? localStorage.getItem("selectedCity") || "Mumbai"
      : "Mumbai";

  const isUpcoming = movie.status === "upcoming";

  // 1. Fetch ALL theatres in the selected city (for display info like name/distance)
  const { data: allCityTheatres = [] } = useQuery({
    queryKey: ["theatres", selectedCity],
    queryFn: () => fetchTheatres(selectedCity),
    enabled: !isUpcoming,
  });

  // 2. Fetch theatre IDs that actually have showtimes for THIS movie in the city
  const { data: activeTheatreIds = [], isLoading: isActiveTheatresLoading } = useQuery({
    queryKey: ["showtimes-theatres", id, selectedCity],
    queryFn: () => fetchTheatresForMovie(id, selectedCity),
    enabled: !isUpcoming,
  });

  // 3. Filter to only theatres that actually screen this movie in this city
  const theatres = allCityTheatres.filter((t) => activeTheatreIds.includes(t.id));

  // 4. Fetch available dates scoped to this city
  const { data: dates = [], isLoading: isDatesLoading } = useQuery({
    queryKey: ["dates", id, selectedCity],
    queryFn: () => fetchDates(id, selectedCity),
    enabled: !isUpcoming,
  });

  const [dateIdx, setDateIdx] = useState(0);
  const selectedDate = dates[dateIdx]?.date;

  const [theatreId, setTheatreId] = useState<string | null>(null);

  // Auto-select first available theatre
  useEffect(() => {
    if (theatres.length > 0 && !theatreId) {
      setTheatreId(theatres[0].id);
    }
  }, [theatres, theatreId]);

  // Reset theatre selection if city changes
  useEffect(() => {
    setTheatreId(null);
    setDateIdx(0);
  }, [selectedCity]);

  // 5. Fetch showtimes for the selected theatre + date
  const { data: showtimes = [], isLoading: isShowtimesLoading } = useQuery({
    queryKey: ["showtimes", id, theatreId, selectedDate],
    queryFn: () => fetchShowtimes(id, theatreId!, selectedDate!),
    enabled: !isUpcoming && !!theatreId && !!selectedDate,
  });

  const [time, setTime] = useState<string | null>(null);

  // 6. Notification mutation (upcoming only)
  const [subscribed, setSubscribed] = useState(false);
  const notifyMutation = useMutation({
    mutationFn: () => subscribeNotification(id),
    onSuccess: () => setSubscribed(true),
    onError: (err: any) => {
      alert(err.message || "Failed to subscribe to notifications");
    },
  });

  const isLoadingShowtimeInfo = isActiveTheatresLoading || isDatesLoading;
  const movieNotInCity = !isUpcoming && !isLoadingShowtimeInfo && theatres.length === 0;

  return (
    <MobileShell>
      {/* Hero Poster */}
      <div className="relative">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.title}
            width={640}
            height={960}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/30" />
        </div>
        <button
          onClick={() => router.history.back()}
          className="absolute top-12 left-5 size-10 rounded-full bg-background/70 backdrop-blur ring-1 ring-border grid place-items-center safe-top"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </button>
      </div>

      {/* Movie Info */}
      <div className="px-6 -mt-20 relative pb-10">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent">
          {movie.genre}
        </span>
        <h1 className="text-3xl font-semibold leading-tight mt-1">{movie.title}</h1>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          {movie.imdb > 0 && (
            <span className="flex items-center gap-1 text-accent">
              <Star className="size-3.5 fill-accent stroke-accent" /> {movie.imdb}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" /> {movie.runtime}
          </span>
          <span className="px-1.5 py-0.5 rounded ring-1 ring-border text-xs">
            {movie.rating}
          </span>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed mt-5">{movie.synopsis}</p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-6 text-sm">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Director</p>
            <p className="text-foreground mt-0.5">{movie.director}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Cast</p>
            <p className="text-foreground mt-0.5 line-clamp-2">{movie.cast.join(", ")}</p>
          </div>
        </div>

        {/* Upcoming: notify me */}
        {isUpcoming ? (
          <div className="mt-8 p-4 bg-surface ring-1 ring-border rounded-xl">
            <p className="text-sm text-foreground">{movie.release_note}</p>
            <button
              onClick={() => notifyMutation.mutate()}
              disabled={notifyMutation.isPending || subscribed}
              className="mt-3 w-full py-3 bg-accent text-accent-foreground rounded-xl font-semibold text-sm uppercase tracking-wider disabled:opacity-60"
            >
              {subscribed
                ? "Subscribed!"
                : notifyMutation.isPending
                ? "Subscribing..."
                : "Notify me"}
            </button>
          </div>
        ) : isLoadingShowtimeInfo ? (
          /* Loading skeleton */
          <div className="mt-8 flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-accent" />
          </div>
        ) : movieNotInCity ? (
          /* Not showing in this city */
          <div className="mt-8 p-5 bg-surface ring-1 ring-border rounded-xl text-center">
            <MapPin className="size-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">
              Not showing in {selectedCity}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try switching your city from the home screen.
            </p>
          </div>
        ) : (
          /* Showtimes section */
          <>
            <h2 className="text-lg font-medium mt-8 mb-3 flex items-center gap-2">
              <Calendar className="size-4 text-accent" /> Showtimes in {selectedCity}
            </h2>

            {/* Date picker */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1">
              {dates.map((d, i) => (
                <button
                  key={d.date}
                  onClick={() => {
                    setDateIdx(i);
                    setTime(null);
                  }}
                  className={`flex-shrink-0 flex flex-col items-center w-16 py-2 rounded-xl transition-colors ${
                    dateIdx === i
                      ? "bg-accent text-accent-foreground"
                      : "bg-surface text-foreground ring-1 ring-border"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider">{d.label}</span>
                  <span className="text-sm font-semibold mt-0.5">{d.date}</span>
                </button>
              ))}
            </div>

            {/* Theatre picker — only shows theatres actually screening this movie */}
            <div className="mt-5 space-y-3">
              {theatres.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheatreId(t.id);
                    setTime(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all ring-1 bg-surface ${
                    theatreId === t.id
                      ? "ring-accent shadow-[0_0_12px_rgba(245,158,11,0.12)]"
                      : "ring-border"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-medium block">{t.name}</span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3" /> {t.city} · {t.distance}
                      </span>
                    </div>
                    {theatreId === t.id && (
                      <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Showtime slots */}
            {isShowtimesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="size-6 animate-spin text-accent" />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mt-4">
                {showtimes.length > 0 ? (
                  showtimes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setTime(s)}
                      className={`py-2.5 rounded-lg text-sm font-medium ring-1 transition-colors ${
                        time === s
                          ? "bg-accent text-accent-foreground ring-accent"
                          : "bg-surface text-foreground ring-border"
                      }`}
                    >
                      {s}
                    </button>
                  ))
                ) : (
                  <p className="col-span-3 text-xs text-muted-foreground text-center py-3">
                    No showtimes for the selected date & theatre.
                  </p>
                )}
              </div>
            )}

            {/* Book button */}
            {dates.length > 0 && theatreId && (
              <Link
                to="/seats/$id"
                params={{ id: movie.id }}
                search={{
                  time: time || "",
                  theatre: theatreId,
                  date: dates[dateIdx]?.date ?? "",
                }}
                className={`mt-8 mb-4 w-full py-4 rounded-xl font-semibold text-sm uppercase tracking-wider grid place-items-center transition-all ${
                  time
                    ? "bg-accent text-accent-foreground shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                    : "bg-surface text-muted-foreground pointer-events-none"
                }`}
              >
                {time ? `Choose seats — ${time}` : "Pick a showtime"}
              </Link>
            )}
          </>
        )}
      </div>
    </MobileShell>
  );
}
