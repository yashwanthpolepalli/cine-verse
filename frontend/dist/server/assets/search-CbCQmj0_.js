import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { M as MobileShell } from "./MobileShell-DP9HPWMy.js";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { s as searchMovies } from "./router-BYVtQZ9Z.js";
import "zod";
const genres = ["All", "Sci-Fi", "Action", "Animation", "Thriller", "Horror", "Historical"];
function SearchPage() {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("All");
  const selectedCity = typeof window !== "undefined" ? localStorage.getItem("selectedCity") || "Mumbai" : "Mumbai";
  const {
    data: results = [],
    isLoading
  } = useQuery({
    queryKey: ["search", q, genre, selectedCity],
    queryFn: () => searchMovies(q, genre, selectedCity)
  });
  return /* @__PURE__ */ jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxs("header", { className: "px-6 pt-12 pb-4 safe-top", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold mb-4", children: "Search" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "size-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx("input", { type: "search", placeholder: "Films, genres, theatres…", value: q, onChange: (e) => setQ(e.target.value), className: "w-full bg-surface ring-1 ring-border rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground outline-none focus:ring-accent" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-2 overflow-x-auto px-6 pb-4 no-scrollbar", children: genres.map((g) => /* @__PURE__ */ jsx("button", { onClick: () => setGenre(g), className: `flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition-colors ${genre === g ? "bg-accent text-accent-foreground" : "bg-surface text-muted-foreground ring-1 ring-border"}`, children: g }, g)) }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "flex justify-center py-12", children: /* @__PURE__ */ jsx(Loader2, { className: "size-8 text-accent animate-spin" }) }) : /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4 px-6 mt-2", children: [
      results.map((m) => /* @__PURE__ */ jsxs(Link, { to: "/movie/$id", params: {
        id: m.id
      }, className: "group", children: [
        /* @__PURE__ */ jsx("div", { className: "aspect-[2/3] rounded-xl bg-surface ring-1 ring-border overflow-hidden mb-2", children: /* @__PURE__ */ jsx("img", { src: m.poster, alt: m.title, loading: "lazy", width: 512, height: 768, className: "w-full h-full object-cover" }) }),
        /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium line-clamp-1", children: m.title }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          m.genre,
          " • ",
          m.rating
        ] })
      ] }, m.id)),
      results.length === 0 && /* @__PURE__ */ jsx("p", { className: "col-span-2 text-sm text-muted-foreground text-center py-12", children: "No films match that search." })
    ] })
  ] });
}
export {
  SearchPage as component
};
