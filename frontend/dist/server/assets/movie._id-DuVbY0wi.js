import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useRouter, Link } from "@tanstack/react-router";
import { M as MobileShell } from "./MobileShell-DP9HPWMy.js";
import { ArrowLeft, Star, Clock, Calendar, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { i as Route, b as fetchTheatres, j as fetchDates, k as fetchShowtimes, l as subscribeNotification } from "./router-BYVtQZ9Z.js";
import "zod";
function MoviePage() {
  const movie = Route.useLoaderData();
  const {
    id
  } = Route.useParams();
  const router = useRouter();
  const selectedCity = typeof window !== "undefined" ? localStorage.getItem("selectedCity") || "Mumbai" : "Mumbai";
  const {
    data: theatres = [],
    isLoading: isTheatresLoading
  } = useQuery({
    queryKey: ["theatres", selectedCity],
    queryFn: () => fetchTheatres(selectedCity),
    enabled: movie.status === "now"
  });
  const {
    data: dates = [],
    isLoading: isDatesLoading
  } = useQuery({
    queryKey: ["dates", id],
    queryFn: () => fetchDates(id),
    enabled: movie.status === "now"
  });
  const [dateIdx, setDateIdx] = useState(0);
  const selectedDate = dates[dateIdx]?.date;
  const [theatreId, setTheatreId] = useState(null);
  useEffect(() => {
    if (theatres.length > 0 && !theatreId) {
      setTheatreId(theatres[0].id);
    }
  }, [theatres, theatreId]);
  const {
    data: showtimes = [],
    isLoading: isShowtimesLoading
  } = useQuery({
    queryKey: ["showtimes", id, theatreId, selectedDate],
    queryFn: () => fetchShowtimes(id, theatreId, selectedDate),
    enabled: movie.status === "now" && !!theatreId && !!selectedDate
  });
  const [time, setTime] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const notifyMutation = useMutation({
    mutationFn: () => subscribeNotification(id),
    onSuccess: () => {
      setSubscribed(true);
    },
    onError: (err) => {
      alert(err.message || "Failed to subscribe to notifications");
    }
  });
  const isUpcoming = movie.status === "upcoming";
  return /* @__PURE__ */ jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative aspect-[3/4] overflow-hidden", children: [
        /* @__PURE__ */ jsx("img", { src: movie.poster, alt: movie.title, width: 640, height: 960, className: "w-full h-full object-cover" }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/30" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => router.history.back(), className: "absolute top-12 left-5 size-10 rounded-full bg-background/70 backdrop-blur ring-1 ring-border grid place-items-center safe-top", "aria-label": "Back", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 -mt-20 relative", children: [
      /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold uppercase tracking-widest text-accent", children: movie.genre }),
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-semibold leading-tight mt-1", children: movie.title }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mt-3 text-sm text-muted-foreground", children: [
        movie.imdb > 0 && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-accent", children: [
          /* @__PURE__ */ jsx(Star, { className: "size-3.5 fill-accent stroke-accent" }),
          " ",
          movie.imdb
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Clock, { className: "size-3.5" }),
          " ",
          movie.runtime
        ] }),
        /* @__PURE__ */ jsx("span", { className: "px-1.5 py-0.5 rounded ring-1 ring-border text-xs", children: movie.rating })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground/80 leading-relaxed mt-5", children: movie.synopsis }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-x-6 gap-y-3 mt-6 text-sm", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Director" }),
          /* @__PURE__ */ jsx("p", { className: "text-foreground mt-0.5", children: movie.director })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wider", children: "Cast" }),
          /* @__PURE__ */ jsx("p", { className: "text-foreground mt-0.5 line-clamp-2", children: movie.cast.join(", ") })
        ] })
      ] }),
      isUpcoming ? /* @__PURE__ */ jsxs("div", { className: "mt-8 p-4 bg-surface ring-1 ring-border rounded-xl", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground", children: movie.release_note }),
        /* @__PURE__ */ jsx("button", { onClick: () => notifyMutation.mutate(), disabled: notifyMutation.isPending || subscribed, className: "mt-3 w-full py-3 bg-accent text-accent-foreground rounded-xl font-semibold text-sm uppercase tracking-wider disabled:opacity-60", children: subscribed ? "Subscribed!" : notifyMutation.isPending ? "Subscribing..." : "Notify me" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("h2", { className: "text-lg font-medium mt-8 mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "size-4 text-accent" }),
          " Showtimes"
        ] }),
        isDatesLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-4", children: /* @__PURE__ */ jsx(Loader2, { className: "size-6 animate-spin text-accent" }) }) : /* @__PURE__ */ jsx("div", { className: "flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6 pb-1", children: dates.map((d, i) => /* @__PURE__ */ jsxs("button", { onClick: () => {
          setDateIdx(i);
          setTime(null);
        }, className: `flex-shrink-0 flex flex-col items-center w-16 py-2 rounded-xl transition-colors ${dateIdx === i ? "bg-accent text-accent-foreground" : "bg-surface text-foreground ring-1 ring-border"}`, children: [
          /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wider", children: d.label }),
          /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold mt-0.5", children: d.date })
        ] }, d.date)) }),
        isTheatresLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-4", children: /* @__PURE__ */ jsx(Loader2, { className: "size-6 animate-spin text-accent" }) }) : /* @__PURE__ */ jsx("div", { className: "mt-5 space-y-3", children: theatres.map((t) => /* @__PURE__ */ jsx("button", { onClick: () => {
          setTheatreId(t.id);
          setTime(null);
        }, className: `w-full text-left p-3 rounded-xl transition-colors ring-1 bg-surface ${theatreId === t.id ? "ring-accent" : "ring-border"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: t.name }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: t.distance })
        ] }) }, t.id)) }),
        isShowtimesLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-4", children: /* @__PURE__ */ jsx(Loader2, { className: "size-6 animate-spin text-accent" }) }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2 mt-4", children: showtimes.map((s) => /* @__PURE__ */ jsx("button", { onClick: () => setTime(s), className: `py-2.5 rounded-lg text-sm font-medium ring-1 transition-colors ${time === s ? "bg-accent text-accent-foreground ring-accent" : "bg-surface text-foreground ring-border"}`, children: s }, s)) }),
        dates.length > 0 && theatreId && /* @__PURE__ */ jsx(Link, { to: "/seats/$id", params: {
          id: movie.id
        }, search: {
          time: time ?? showtimes[0] ?? "7:45 PM",
          theatre: theatreId,
          date: dates[dateIdx]?.date ?? ""
        }, className: `mt-8 mb-4 w-full py-4 rounded-xl font-semibold text-sm uppercase tracking-wider grid place-items-center transition-all ${time ? "bg-accent text-accent-foreground shadow-glow" : "bg-surface text-muted-foreground pointer-events-none"}`, children: time ? `Choose seats — ${time}` : "Pick a showtime" })
      ] })
    ] })
  ] });
}
export {
  MoviePage as component
};
