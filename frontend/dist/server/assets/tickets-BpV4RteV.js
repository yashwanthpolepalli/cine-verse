import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { M as MobileShell } from "./MobileShell-DP9HPWMy.js";
import { Loader2, Ticket, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { f as fetchTickets, a as fetchMovies, b as fetchTheatres } from "./router-BYVtQZ9Z.js";
import "react";
import "zod";
function TicketsPage() {
  const {
    data: tickets = [],
    isLoading: isTicketsLoading
  } = useQuery({
    queryKey: ["tickets"],
    queryFn: fetchTickets
  });
  const {
    data: movies = [],
    isLoading: isMoviesLoading
  } = useQuery({
    queryKey: ["movies"],
    queryFn: () => fetchMovies()
  });
  const {
    data: theatres = [],
    isLoading: isTheatresLoading
  } = useQuery({
    queryKey: ["theatres"],
    queryFn: fetchTheatres
  });
  const getMovie = (id) => movies.find((m) => m.id === id);
  const isLoading = isTicketsLoading || isMoviesLoading || isTheatresLoading;
  return /* @__PURE__ */ jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxs("header", { className: "px-6 pt-12 pb-6 safe-top", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-muted-foreground uppercase tracking-widest", children: "Your bookings" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold mt-0.5", children: "My Tickets" })
    ] }),
    isLoading ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center pt-24 gap-3", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "size-8 text-accent animate-spin" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading tickets..." })
    ] }) : tickets.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "px-6 pt-16 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "size-16 rounded-full bg-surface ring-1 ring-border grid place-items-center mx-auto mb-4", children: /* @__PURE__ */ jsx(Ticket, { className: "size-7 text-accent" }) }),
      /* @__PURE__ */ jsx("h2", { className: "font-semibold", children: "No tickets yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1 max-w-xs mx-auto", children: "Book a film and your tickets, QR codes, and showtimes will live here." }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "inline-block mt-6 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl font-semibold text-sm uppercase tracking-wider", children: "Browse films" })
    ] }) : /* @__PURE__ */ jsx("div", { className: "px-6 space-y-3", children: tickets.map((t) => {
      const m = getMovie(t.movie_id);
      const theatre = theatres.find((x) => x.id === t.theatre_id);
      if (!m) return null;
      return /* @__PURE__ */ jsxs(Link, { to: "/ticket/$ticketId", params: {
        ticketId: t.id
      }, className: "flex gap-4 p-3 bg-surface ring-1 ring-border rounded-xl items-center", children: [
        /* @__PURE__ */ jsx("img", { src: m.poster, alt: m.title, loading: "lazy", width: 512, height: 768, className: "size-20 rounded-md object-cover" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-medium text-sm line-clamp-1", children: m.title }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            theatre?.name,
            " • ",
            t.date
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-accent font-medium mt-1", children: [
            t.time,
            " • ",
            t.seats.length,
            " ",
            t.seats.length === 1 ? "seat" : "seats"
          ] })
        ] }),
        /* @__PURE__ */ jsx(ChevronRight, { className: "size-4 text-muted-foreground" })
      ] }, t.id);
    }) })
  ] });
}
export {
  TicketsPage as component
};
