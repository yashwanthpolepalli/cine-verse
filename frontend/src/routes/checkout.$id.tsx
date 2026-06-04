import { createFileRoute, useRouter } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { ArrowLeft, CreditCard, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchMovie, fetchTheatres, createBooking } from "@/lib/api";

const searchSchema = z.object({
  time: z.string(),
  theatre: z.string(),
  date: z.string(),
  seats: z.string(),
  price: z.coerce.number(),
  fee: z.coerce.number(),
});

export const Route = createFileRoute("/checkout/$id")({
  validateSearch: searchSchema,
  loader: async ({ context: { queryClient }, params }) => {
    return queryClient.ensureQueryData({
      queryKey: ["movie", params.id],
      queryFn: () => fetchMovie(params.id),
    });
  },
  head: () => ({
    meta: [{ title: "Checkout — Lumiere" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const movie = Route.useLoaderData();
  const { time, theatre, date, seats, price, fee } = Route.useSearch();
  const router = useRouter();

  // 1. Fetch theatres
  const { data: theatres = [] } = useQuery({
    queryKey: ["theatres"],
    queryFn: fetchTheatres,
  });

  const theatreName = theatres.find((t) => t.id === theatre)?.name ?? "Theatre";
  const seatList = seats.split(",").filter(Boolean);
  const subtotal = seatList.length * price;
  const total = subtotal + fee;
  const [processing, setProcessing] = useState(false);

  // 2. Booking mutation
  const bookingMutation = useMutation({
    mutationFn: () => createBooking({
      movie_id: movie.id,
      theatre_id: theatre,
      date,
      time,
      seats: seatList,
    }),
    onSuccess: (ticket) => {
      router.navigate({ to: "/ticket/$ticketId", params: { ticketId: ticket.id } });
    },
    onError: (err: any) => {
      alert(err.message || "Failed to book ticket. Please try again.");
      setProcessing(false);
    },
  });

  const confirm = () => {
    setProcessing(true);
    bookingMutation.mutate();
  };

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
        <h1 className="text-sm font-semibold uppercase tracking-widest">Checkout</h1>
        <span className="w-10" />
      </header>

      <div className="px-6 space-y-5">
        <div className="bg-surface ring-1 ring-border rounded-2xl p-4 flex gap-4">
          <img
            src={movie.poster}
            alt={movie.title}
            width={512}
            height={768}
            className="w-20 aspect-[2/3] object-cover rounded-md"
          />
          <div className="min-w-0">
            <h2 className="font-semibold leading-tight">{movie.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {movie.genre} • {movie.runtime}
            </p>
            <p className="text-xs text-foreground/80 mt-3">{theatreName}</p>
            <p className="text-xs text-muted-foreground">
              {date} • {time}
            </p>
          </div>
        </div>

        <Row label={`Seats (${seatList.length})`} value={seatList.join(", ") || "—"} />
        <Row label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
        <Row label="Booking fees" value={`₹${fee.toFixed(2)}`} />
        <div className="border-t border-border pt-4 flex justify-between font-semibold">
          <span>Total</span>
          <span>₹{total.toFixed(2)}</span>
        </div>

        <div className="bg-surface ring-1 ring-border rounded-2xl p-4 flex items-center gap-3">
          <CreditCard className="size-5 text-accent" />
          <div className="flex-1">
            <p className="text-sm font-medium">Visa •••• 4242</p>
            <p className="text-xs text-muted-foreground">Default payment method</p>
          </div>
          <Check className="size-4 text-accent" />
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/90 backdrop-blur-xl border-t border-border px-6 pt-4 safe-bottom">
        <button
          onClick={confirm}
          disabled={processing || seatList.length === 0}
          className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-semibold text-sm uppercase tracking-wider shadow-glow disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {processing && <Loader2 className="size-4 animate-spin" />}
          {processing ? "Confirming…" : `Pay ₹${total.toFixed(2)}`}
        </button>
      </div>
    </MobileShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}
