import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { Ticket as TicketIcon, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchTickets, fetchMovies, fetchTheatres } from "@/lib/api";

export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "My Tickets — Lumiere" },
      { name: "description", content: "Your booked movie tickets." },
    ],
  }),
  component: TicketsPage,
});

function TicketsPage() {
  // 1. Fetch tickets
  const { data: tickets = [], isLoading: isTicketsLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTickets,
  });

  // 2. Fetch movies
  const { data: movies = [], isLoading: isMoviesLoading } = useQuery({
    queryKey: ["movies"],
    queryFn: () => fetchMovies(),
  });

  // 3. Fetch theatres
  const { data: theatres = [], isLoading: isTheatresLoading } = useQuery({
    queryKey: ["theatres"],
    queryFn: fetchTheatres,
  });

  const getMovie = (id: string) => movies.find((m) => m.id === id);

  const isLoading = isTicketsLoading || isMoviesLoading || isTheatresLoading;

  return (
    <MobileShell>
      <header className="px-6 pt-12 pb-6 safe-top">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
          Your bookings
        </span>
        <h1 className="text-2xl font-semibold mt-0.5">My Tickets</h1>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center pt-24 gap-3">
          <Loader2 className="size-8 text-accent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="px-6 pt-16 text-center">
          <div className="size-16 rounded-full bg-surface ring-1 ring-border grid place-items-center mx-auto mb-4">
            <TicketIcon className="size-7 text-accent" />
          </div>
          <h2 className="font-semibold">No tickets yet</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            Book a film and your tickets, QR codes, and showtimes will live here.
          </p>
          <Link
            to="/"
            className="inline-block mt-6 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl font-semibold text-sm uppercase tracking-wider"
          >
            Browse films
          </Link>
        </div>
      ) : (
        <div className="px-6 space-y-3">
          {tickets.map((t) => {
            const m = getMovie(t.movie_id);
            const theatre = theatres.find((x) => x.id === t.theatre_id);
            if (!m) return null;
            return (
              <Link
                key={t.id}
                to="/ticket/$ticketId"
                params={{ ticketId: t.id }}
                className="flex gap-4 p-3 bg-surface ring-1 ring-border rounded-xl items-center"
              >
                <img
                  src={m.poster}
                  alt={m.title}
                  loading="lazy"
                  width={512}
                  height={768}
                  className="size-20 rounded-md object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-1">{m.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {theatre?.name} • {t.date}
                  </p>
                  <p className="text-xs text-accent font-medium mt-1">
                    {t.time} • {t.seats.length} {t.seats.length === 1 ? "seat" : "seats"}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      )}
    </MobileShell>
  );
}
