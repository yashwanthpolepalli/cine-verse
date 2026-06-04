import { jsxs, jsx } from "react/jsx-runtime";
import { useRouter } from "@tanstack/react-router";
import { M as MobileShell } from "./MobileShell-DP9HPWMy.js";
import { ArrowLeft, CreditCard, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { m as Route, b as fetchTheatres, n as createBooking } from "./router-BYVtQZ9Z.js";
import "zod";
const SEAT_PRICE = 16.25;
const BOOKING_FEE = 2.5;
function CheckoutPage() {
  const movie = Route.useLoaderData();
  const {
    time,
    theatre,
    date,
    seats
  } = Route.useSearch();
  const router = useRouter();
  const {
    data: theatres = []
  } = useQuery({
    queryKey: ["theatres"],
    queryFn: fetchTheatres
  });
  const theatreName = theatres.find((t) => t.id === theatre)?.name ?? "Theatre";
  const seatList = seats.split(",").filter(Boolean);
  const subtotal = seatList.length * SEAT_PRICE;
  const total = subtotal + BOOKING_FEE;
  const [processing, setProcessing] = useState(false);
  const bookingMutation = useMutation({
    mutationFn: () => createBooking({
      movie_id: movie.id,
      theatre_id: theatre,
      date,
      time,
      seats: seatList
    }),
    onSuccess: (ticket) => {
      router.navigate({
        to: "/ticket/$ticketId",
        params: {
          ticketId: ticket.id
        }
      });
    },
    onError: (err) => {
      alert(err.message || "Failed to book ticket. Please try again.");
      setProcessing(false);
    }
  });
  const confirm = () => {
    setProcessing(true);
    bookingMutation.mutate();
  };
  return /* @__PURE__ */ jsxs(MobileShell, { hideNav: true, children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-6 pt-12 pb-4 safe-top", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => router.history.back(), className: "size-10 rounded-full bg-surface ring-1 ring-border grid place-items-center", "aria-label": "Back", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-sm font-semibold uppercase tracking-widest", children: "Checkout" }),
      /* @__PURE__ */ jsx("span", { className: "w-10" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-surface ring-1 ring-border rounded-2xl p-4 flex gap-4", children: [
        /* @__PURE__ */ jsx("img", { src: movie.poster, alt: movie.title, width: 512, height: 768, className: "w-20 aspect-[2/3] object-cover rounded-md" }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsx("h2", { className: "font-semibold leading-tight", children: movie.title }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            movie.genre,
            " • ",
            movie.runtime
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-foreground/80 mt-3", children: theatreName }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            date,
            " • ",
            time
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Row, { label: `Seats (${seatList.length})`, value: seatList.join(", ") || "—" }),
      /* @__PURE__ */ jsx(Row, { label: "Subtotal", value: `$${subtotal.toFixed(2)}` }),
      /* @__PURE__ */ jsx(Row, { label: "Booking fees", value: `$${BOOKING_FEE.toFixed(2)}` }),
      /* @__PURE__ */ jsxs("div", { className: "border-t border-border pt-4 flex justify-between font-semibold", children: [
        /* @__PURE__ */ jsx("span", { children: "Total" }),
        /* @__PURE__ */ jsxs("span", { children: [
          "$",
          total.toFixed(2)
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-surface ring-1 ring-border rounded-2xl p-4 flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(CreditCard, { className: "size-5 text-accent" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Visa •••• 4242" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Default payment method" })
        ] }),
        /* @__PURE__ */ jsx(Check, { className: "size-4 text-accent" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/90 backdrop-blur-xl border-t border-border px-6 pt-4 safe-bottom", children: /* @__PURE__ */ jsxs("button", { onClick: confirm, disabled: processing || seatList.length === 0, className: "w-full py-4 rounded-xl bg-accent text-accent-foreground font-semibold text-sm uppercase tracking-wider shadow-glow disabled:opacity-60 flex items-center justify-center gap-2", children: [
      processing && /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }),
      processing ? "Confirming…" : `Pay $${total.toFixed(2)}`
    ] }) })
  ] });
}
function Row({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("span", { className: "text-foreground font-medium text-right max-w-[60%]", children: value })
  ] });
}
export {
  CheckoutPage as component
};
