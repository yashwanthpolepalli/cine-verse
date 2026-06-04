import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { fetchMovie, fetchSeatMap, fetchTheatres } from "@/lib/api";

const searchSchema = z.object({
  time: z.string(),
  theatre: z.string(),
  date: z.string(),
});

export const Route = createFileRoute("/seats/$id")({
  validateSearch: searchSchema,
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
        { title: m ? `Pick seats — ${m.title}` : "Pick seats" },
        { name: "description", content: "Select your seats." },
      ],
    };
  },
  component: SeatsPage,
});

function SeatsPage() {
  const movie = Route.useLoaderData();
  const { id } = Route.useParams();
  const { time, theatre, date } = Route.useSearch();
  const router = useRouter();

  // 1. Fetch seat map
  const { data: seatMap, isLoading: isSeatsLoading, error: seatsError } = useQuery({
    queryKey: ["seats", id, theatre, date, time],
    queryFn: () => fetchSeatMap(id, theatre, date, time),
  });

  // 2. Fetch theatres
  const { data: theatres = [] } = useQuery({
    queryKey: ["theatres"],
    queryFn: fetchTheatres,
  });

  const theatreName = theatres.find((t) => t.id === theatre)?.name ?? "Theatre";
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const seatPrice = seatMap?.seat_price;
  const bookingFee = seatMap?.booking_fee;
  const total = useMemo(() => selected.size * (seatPrice ?? 0), [selected, seatPrice]);

  const soldSeats = useMemo(() => {
    if (!seatMap) return new Set<string>();
    return new Set(
      seatMap.seats
        .filter((s) => s.status !== "available")
        .map((s) => `${s.row}${s.col}`)
    );
  }, [seatMap]);

  const toggle = (sid: string) => {
    if (soldSeats.has(sid)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid);
      else next.add(sid);
      return next;
    });
  };

  const rows = seatMap?.rows;
  const cols = seatMap?.cols;

  return (
    <MobileShell hideNav>
      <header className="flex items-center justify-between px-6 pt-12 pb-4 safe-top">
        <button
          onClick={() => router.history.back()}
          className="size-10 rounded-full bg-surface ring-1 ring-border grid place-items-center"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-semibold leading-tight">{movie.title}</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {theatreName} • {date} • {time}
          </p>
        </div>
        <span className="w-10" />
      </header>

      <div className="px-6 mt-2">
        <div className="bg-surface/60 ring-1 ring-border rounded-3xl p-6 pt-8">
          <div className="relative mb-10">
            <div className="h-1 bg-gradient-to-r from-transparent via-accent/60 to-transparent rounded-full" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] text-center mt-3">
              Screen
            </p>
          </div>

          {isSeatsLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="size-8 text-accent animate-spin" />
              <p className="text-xs text-muted-foreground">Loading seats...</p>
            </div>
          ) : seatsError ? (
            <div className="text-center py-12">
              <p className="text-sm text-red-500 font-medium">Failed to load seats</p>
              <p className="text-xs text-muted-foreground mt-1">{(seatsError as Error).message}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rows?.map((row) => (
                <div key={row} className="flex items-center gap-2">
                  <span className="w-4 text-[10px] text-muted-foreground">{row}</span>
                  <div
                    className="grid gap-1.5 flex-1"
                    style={{ gridTemplateColumns: `repeat(${cols || 1}, minmax(0, 1fr))` }}
                  >
                    {Array.from({ length: cols || 0 }).map((_, i) => {
                      const seat = `${row}${i + 1}`;
                      const isSold = soldSeats.has(seat);
                      const isSel = selected.has(seat);
                      return (
                        <button
                          key={seat}
                          onClick={() => toggle(seat)}
                          disabled={isSold}
                          aria-label={`Seat ${seat}`}
                          className={`aspect-square rounded-[6px] transition-transform active:scale-90 ${
                            isSold
                              ? "bg-surface-2 opacity-40 cursor-not-allowed"
                              : isSel
                                ? "bg-accent shadow-glow"
                                : "bg-foreground/15 hover:bg-foreground/25"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-5 mt-8">
            <Legend swatch="bg-foreground/15" label="Available" />
            <Legend swatch="bg-accent" label="Selected" />
            <Legend swatch="bg-surface-2 opacity-40" label="Sold" />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/90 backdrop-blur-xl border-t border-border px-6 pt-4 safe-bottom">
        <div className="flex justify-between items-center mb-3 text-sm">
          <div className="min-w-0 pr-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {selected.size} {selected.size === 1 ? "seat" : "seats"}
            </p>
            <p className="font-semibold truncate">
              {[...selected].sort().join(", ") || "Select seats"}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="font-semibold">₹{total.toFixed(2)}</p>
          </div>
        </div>
        <Link
          to="/checkout/$id"
          params={{ id: movie.id }}
          search={{
            time,
            theatre,
            date,
            seats: [...selected].sort().join(","),
            price: seatPrice ?? 0,
            fee: bookingFee ?? 0,
          }}
          className={`w-full py-4 rounded-xl font-semibold text-sm uppercase tracking-wider grid place-items-center transition-all ${
            selected.size > 0
              ? "bg-accent text-accent-foreground shadow-glow"
              : "bg-surface text-muted-foreground pointer-events-none"
          }`}
        >
          Continue to checkout
        </Link>
      </div>
    </MobileShell>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`size-3 rounded-sm ${swatch}`} />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
