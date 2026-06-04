import { jsx, jsxs } from "react/jsx-runtime";
import { useRouter, Link } from "@tanstack/react-router";
import { M as MobileShell } from "./MobileShell-DP9HPWMy.js";
import { Loader2, ArrowLeft } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQuery } from "@tanstack/react-query";
import { R as Route, d as fetchTicket, e as fetchMovie, b as fetchTheatres } from "./router-BYVtQZ9Z.js";
import "react";
import "zod";
function TicketPage() {
  const {
    ticketId
  } = Route.useParams();
  const router = useRouter();
  const {
    data: ticket,
    isLoading: isTicketLoading,
    error: ticketError
  } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => fetchTicket(ticketId)
  });
  const {
    data: movie,
    isLoading: isMovieLoading
  } = useQuery({
    queryKey: ["movie", ticket?.movie_id],
    queryFn: () => fetchMovie(ticket.movie_id),
    enabled: !!ticket
  });
  const {
    data: theatres = []
  } = useQuery({
    queryKey: ["theatres"],
    queryFn: fetchTheatres,
    enabled: !!ticket
  });
  const theatre = theatres.find((t) => t.id === ticket?.theatre_id);
  if (isTicketLoading || ticket && isMovieLoading) {
    return /* @__PURE__ */ jsx(MobileShell, { hideNav: true, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center pt-40 gap-3", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "size-8 text-accent animate-spin" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading ticket..." })
    ] }) });
  }
  if (ticketError || !ticket) {
    return /* @__PURE__ */ jsx(MobileShell, { hideNav: true, children: /* @__PURE__ */ jsxs("div", { className: "px-6 pt-24 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Ticket not found" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: ticketError ? ticketError.message : "No ticket exists with this ID." }),
      /* @__PURE__ */ jsx(Link, { to: "/tickets", className: "text-accent text-sm mt-4 inline-block", children: "View my tickets" })
    ] }) });
  }
  if (!movie) {
    return /* @__PURE__ */ jsx(MobileShell, { hideNav: true, children: /* @__PURE__ */ jsx("div", { className: "px-6 pt-24 text-center text-muted-foreground text-sm", children: "Loading film details…" }) });
  }
  return /* @__PURE__ */ jsxs(MobileShell, { hideNav: true, children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-6 pt-12 pb-4 safe-top", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => router.history.back(), className: "size-10 rounded-full bg-surface ring-1 ring-border grid place-items-center", "aria-label": "Back", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-sm font-semibold uppercase tracking-widest", children: "Your Ticket" }),
      /* @__PURE__ */ jsx("span", { className: "w-10" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative bg-surface ring-1 ring-border rounded-3xl overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative h-44", children: [
          /* @__PURE__ */ jsx("img", { src: movie.poster, alt: movie.title, width: 640, height: 960, className: "w-full h-full object-cover" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" }),
          /* @__PURE__ */ jsxs("div", { className: "absolute bottom-4 left-5 right-5", children: [
            /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-widest text-accent font-semibold", children: movie.genre }),
            /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold leading-tight", children: movie.title })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative h-6 flex items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute -left-3 size-6 bg-background rounded-full" }),
          /* @__PURE__ */ jsx("div", { className: "absolute -right-3 size-6 bg-background rounded-full" }),
          /* @__PURE__ */ jsx("div", { className: "w-full border-t border-dashed border-border mx-3" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "px-5 pb-6 grid grid-cols-2 gap-y-4 gap-x-3 text-sm", children: [
          /* @__PURE__ */ jsx(Field, { label: "Theatre", value: theatre?.name ?? "—" }),
          /* @__PURE__ */ jsx(Field, { label: "Date", value: ticket.date }),
          /* @__PURE__ */ jsx(Field, { label: "Showtime", value: ticket.time }),
          /* @__PURE__ */ jsx(Field, { label: "Seats", value: ticket.seats.join(", ") }),
          /* @__PURE__ */ jsx(Field, { label: "Total paid", value: `$${ticket.total.toFixed(2)}` }),
          /* @__PURE__ */ jsx(Field, { label: "Booking", value: ticket.id, mono: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "px-5 pb-6 pt-2", children: [
          /* @__PURE__ */ jsx("div", { className: "bg-white rounded-xl p-4 flex justify-center", children: /* @__PURE__ */ jsx(QRCodeSVG, { value: ticket.id, size: 180, level: "M" }) }),
          /* @__PURE__ */ jsx("p", { className: "text-center text-[10px] uppercase tracking-widest text-muted-foreground mt-3", children: "Scan at entry" })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/tickets", className: "block w-full text-center mt-6 py-3 text-sm text-muted-foreground", children: "Back to all tickets" })
    ] })
  ] });
}
function Field({
  label,
  value,
  mono
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("p", { className: `mt-0.5 font-medium text-foreground ${mono ? "font-mono text-xs" : ""}`, children: value })
  ] });
}
export {
  TicketPage as component
};
