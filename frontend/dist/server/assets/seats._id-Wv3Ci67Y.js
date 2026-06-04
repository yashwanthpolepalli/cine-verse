import { jsxs, jsx } from "react/jsx-runtime";
import { useRouter, Link } from "@tanstack/react-router";
import { M as MobileShell } from "./MobileShell-DP9HPWMy.js";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { g as Route, h as fetchSeatMap, b as fetchTheatres } from "./router-BYVtQZ9Z.js";
import "zod";
const DEFAULT_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H"];
const DEFAULT_COLS = 10;
function SeatsPage() {
  const movie = Route.useLoaderData();
  const {
    id
  } = Route.useParams();
  const {
    time,
    theatre,
    date
  } = Route.useSearch();
  const router = useRouter();
  const {
    data: seatMap,
    isLoading: isSeatsLoading,
    error: seatsError
  } = useQuery({
    queryKey: ["seats", id, theatre, date, time],
    queryFn: () => fetchSeatMap(id, theatre, date, time)
  });
  const {
    data: theatres = []
  } = useQuery({
    queryKey: ["theatres"],
    queryFn: fetchTheatres
  });
  const theatreName = theatres.find((t) => t.id === theatre)?.name ?? "Theatre";
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const seatPrice = seatMap?.seat_price ?? 16.25;
  const total = useMemo(() => selected.size * seatPrice, [selected, seatPrice]);
  const soldSeats = useMemo(() => {
    if (!seatMap) return /* @__PURE__ */ new Set();
    return new Set(seatMap.seats.filter((s) => s.status !== "available").map((s) => `${s.row}${s.col}`));
  }, [seatMap]);
  const toggle = (sid) => {
    if (soldSeats.has(sid)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid);
      else next.add(sid);
      return next;
    });
  };
  const rows = seatMap?.rows ?? DEFAULT_ROWS;
  const cols = seatMap?.cols ?? DEFAULT_COLS;
  return /* @__PURE__ */ jsxs(MobileShell, { hideNav: true, children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-6 pt-12 pb-4 safe-top", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => router.history.back(), className: "size-10 rounded-full bg-surface ring-1 ring-border grid place-items-center", "aria-label": "Back", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-sm font-semibold leading-tight", children: movie.title }),
        /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wider", children: [
          theatreName,
          " • ",
          date,
          " • ",
          time
        ] })
      ] }),
      /* @__PURE__ */ jsx("span", { className: "w-10" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "px-6 mt-2", children: /* @__PURE__ */ jsxs("div", { className: "bg-surface/60 ring-1 ring-border rounded-3xl p-6 pt-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative mb-10", children: [
        /* @__PURE__ */ jsx("div", { className: "h-1 bg-gradient-to-r from-transparent via-accent/60 to-transparent rounded-full" }),
        /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-[0.25em] text-center mt-3", children: "Screen" })
      ] }),
      isSeatsLoading ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center py-16 gap-3", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "size-8 text-accent animate-spin" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Loading seats..." })
      ] }) : seatsError ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-red-500 font-medium", children: "Failed to load seats" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: seatsError.message })
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: rows.map((row) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "w-4 text-[10px] text-muted-foreground", children: row }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-10 gap-1.5 flex-1", children: Array.from({
          length: cols
        }).map((_, i) => {
          const seat = `${row}${i + 1}`;
          const isSold = soldSeats.has(seat);
          const isSel = selected.has(seat);
          return /* @__PURE__ */ jsx("button", { onClick: () => toggle(seat), disabled: isSold, "aria-label": `Seat ${seat}`, className: `aspect-square rounded-[6px] transition-transform active:scale-90 ${isSold ? "bg-surface-2 opacity-40 cursor-not-allowed" : isSel ? "bg-accent shadow-glow" : "bg-foreground/15 hover:bg-foreground/25"}` }, seat);
        }) })
      ] }, row)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-5 mt-8", children: [
        /* @__PURE__ */ jsx(Legend, { swatch: "bg-foreground/15", label: "Available" }),
        /* @__PURE__ */ jsx(Legend, { swatch: "bg-accent", label: "Selected" }),
        /* @__PURE__ */ jsx(Legend, { swatch: "bg-surface-2 opacity-40", label: "Sold" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/90 backdrop-blur-xl border-t border-border px-6 pt-4 safe-bottom", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-3 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 pr-3", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wider", children: [
            selected.size,
            " ",
            selected.size === 1 ? "seat" : "seats"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "font-semibold truncate", children: [...selected].sort().join(", ") || "Select seats" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right flex-shrink-0", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground uppercase tracking-wider", children: "Total" }),
          /* @__PURE__ */ jsxs("p", { className: "font-semibold", children: [
            "$",
            total.toFixed(2)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/checkout/$id", params: {
        id: movie.id
      }, search: {
        time,
        theatre,
        date,
        seats: [...selected].sort().join(",")
      }, className: `w-full py-4 rounded-xl font-semibold text-sm uppercase tracking-wider grid place-items-center transition-all ${selected.size > 0 ? "bg-accent text-accent-foreground shadow-glow" : "bg-surface text-muted-foreground pointer-events-none"}`, children: "Continue to checkout" })
    ] })
  ] });
}
function Legend({
  swatch,
  label
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
    /* @__PURE__ */ jsx("span", { className: `size-3 rounded-sm ${swatch}` }),
    /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground", children: label })
  ] });
}
export {
  SeatsPage as component
};
