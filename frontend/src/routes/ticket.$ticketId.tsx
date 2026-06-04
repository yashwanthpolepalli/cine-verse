import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ArrowLeft, Loader2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery } from "@tanstack/react-query";
import { fetchTicket, fetchMovie, fetchTheatres } from "@/lib/api";

export const Route = createFileRoute("/ticket/$ticketId")({
  head: () => ({
    meta: [{ title: "Your ticket — Lumiere" }],
  }),
  component: TicketPage,
});

function TicketPage() {
  const { ticketId } = Route.useParams();
  const router = useRouter();

  // 1. Fetch ticket details
  const { data: ticket, isLoading: isTicketLoading, error: ticketError } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => fetchTicket(ticketId),
  });

  // 2. Fetch movie details
  const { data: movie, isLoading: isMovieLoading } = useQuery({
    queryKey: ["movie", ticket?.movie_id],
    queryFn: () => fetchMovie(ticket!.movie_id),
    enabled: !!ticket,
  });

  // 3. Fetch theatres to find name
  const { data: theatres = [] } = useQuery({
    queryKey: ["theatres"],
    queryFn: fetchTheatres,
    enabled: !!ticket,
  });

  const theatre = theatres.find((t) => t.id === ticket?.theatre_id);

  if (isTicketLoading || (ticket && isMovieLoading)) {
    return (
      <MobileShell hideNav>
        <div className="flex flex-col items-center justify-center pt-40 gap-3">
          <Loader2 className="size-8 text-accent animate-spin" />
          <p className="text-sm text-muted-foreground">Loading ticket...</p>
        </div>
      </MobileShell>
    );
  }

  if (ticketError || !ticket) {
    return (
      <MobileShell hideNav>
        <div className="px-6 pt-24 text-center">
          <h1 className="text-xl font-semibold">Ticket not found</h1>
          <p className="text-xs text-muted-foreground mt-1">
            {ticketError ? (ticketError as Error).message : "No ticket exists with this ID."}
          </p>
          <Link to="/tickets" className="text-accent text-sm mt-4 inline-block">
            View my tickets
          </Link>
        </div>
      </MobileShell>
    );
  }

  if (!movie) {
    return (
      <MobileShell hideNav>
        <div className="px-6 pt-24 text-center text-muted-foreground text-sm">
          Loading film details…
        </div>
      </MobileShell>
    );
  }

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
        <h1 className="text-sm font-semibold uppercase tracking-widest">Your Ticket</h1>
        <span className="w-10" />
      </header>

      <div className="px-6">
        <div className="relative bg-surface ring-1 ring-border rounded-3xl overflow-hidden">
          <div className="relative h-44">
            <img
              src={movie.poster}
              alt={movie.title}
              width={640}
              height={960}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <span className="text-[10px] uppercase tracking-widest text-accent font-semibold">
                {movie.genre}
              </span>
              <h2 className="text-xl font-semibold leading-tight">{movie.title}</h2>
            </div>
          </div>

          <div className="relative h-6 flex items-center">
            <div className="absolute -left-3 size-6 bg-background rounded-full" />
            <div className="absolute -right-3 size-6 bg-background rounded-full" />
            <div className="w-full border-t border-dashed border-border mx-3" />
          </div>

          <div className="px-5 pb-6 grid grid-cols-2 gap-y-4 gap-x-3 text-sm">
            <Field label="Theatre" value={theatre?.name ?? "—"} />
            <Field label="Date" value={ticket.date} />
            <Field label="Showtime" value={ticket.time} />
            <Field label="Seats" value={ticket.seats.join(", ")} />
            <Field label="Total paid" value={`₹${ticket.total.toFixed(2)}`} />
            <Field label="Booking" value={ticket.id} mono />
          </div>

          <div className="px-5 pb-6 pt-2">
            <div className="bg-white rounded-xl p-4 flex justify-center">
              <QRCodeSVG value={ticket.id} size={180} level="M" />
            </div>
            <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground mt-3">
              Scan at entry
            </p>
          </div>
        </div>

        <Link
          to="/tickets"
          className="block w-full text-center mt-6 py-3 text-sm text-muted-foreground"
        >
          Back to all tickets
        </Link>
      </div>
    </MobileShell>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 font-medium text-foreground ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}
