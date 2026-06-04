import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { M as MobileShell } from "./MobileShell-DP9HPWMy.js";
import { X, Loader2, MapPin, ChevronDown, Star, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { a as fetchMovies } from "./router-BYVtQZ9Z.js";
import * as React from "react";
import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import "zod";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
const INDIAN_CITIES = [{
  name: "Mumbai",
  state: "Maharashtra"
}, {
  name: "Delhi (NCR)",
  state: "Delhi"
}, {
  name: "Bengaluru",
  state: "Karnataka"
}, {
  name: "Hyderabad",
  state: "Telangana"
}, {
  name: "Chennai",
  state: "Tamil Nadu"
}, {
  name: "Kolkata",
  state: "West Bengal"
}, {
  name: "Pune",
  state: "Maharashtra"
}, {
  name: "Ahmedabad",
  state: "Gujarat"
}, {
  name: "Jaipur",
  state: "Rajasthan"
}, {
  name: "Lucknow",
  state: "Uttar Pradesh"
}, {
  name: "Kochi",
  state: "Kerala"
}, {
  name: "Chandigarh",
  state: "Punjab"
}];
function HomePage() {
  const [selectedCity, setSelectedCity] = useState(() => {
    return (typeof window !== "undefined" ? localStorage.getItem("selectedCity") : null) || "Mumbai";
  });
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const {
    data: allMovies,
    isLoading,
    error
  } = useQuery({
    queryKey: ["movies", selectedCity],
    queryFn: () => fetchMovies(void 0, selectedCity)
  });
  if (isLoading) {
    return /* @__PURE__ */ jsx(MobileShell, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center pt-40", children: /* @__PURE__ */ jsx(Loader2, { className: "size-8 text-accent animate-spin" }) }) });
  }
  if (error || !allMovies) {
    return /* @__PURE__ */ jsx(MobileShell, { children: /* @__PURE__ */ jsxs("div", { className: "px-6 pt-24 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Failed to load films" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-2", children: error?.message || "Please try again later." })
    ] }) });
  }
  const nowShowing = allMovies.filter((m) => m.status === "now");
  const upcoming = allMovies.filter((m) => m.status === "upcoming");
  const featured = nowShowing[0];
  return /* @__PURE__ */ jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center justify-between px-6 pt-12 pb-6 safe-top", children: [
      /* @__PURE__ */ jsxs(Dialog, { open: isLocationOpen, onOpenChange: setIsLocationOpen, children: [
        /* @__PURE__ */ jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs("button", { className: "text-left group cursor-pointer focus:outline-none", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-widest group-hover:text-accent transition-colors", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "size-3 text-accent" }),
            " Location"
          ] }),
          /* @__PURE__ */ jsxs("h2", { className: "text-foreground font-semibold mt-0.5 flex items-center gap-1 group-hover:text-accent transition-colors", children: [
            selectedCity,
            " ",
            /* @__PURE__ */ jsx(ChevronDown, { className: "size-3.5 opacity-60 group-hover:opacity-100 transition-opacity" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-[90%] sm:max-w-md bg-background/95 backdrop-blur-md border-border/40 rounded-2xl p-5 shadow-2xl", children: [
          /* @__PURE__ */ jsx(DialogHeader, { className: "pb-3 border-b border-border/40", children: /* @__PURE__ */ jsx(DialogTitle, { className: "text-lg font-semibold tracking-tight text-center sm:text-left", children: "Select City" }) }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 mt-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar animate-fade-in", children: INDIAN_CITIES.map((city) => /* @__PURE__ */ jsxs("button", { onClick: () => {
            setSelectedCity(city.name);
            localStorage.setItem("selectedCity", city.name);
            setIsLocationOpen(false);
          }, className: `flex flex-col items-start p-3 rounded-xl transition-all cursor-pointer text-left ${selectedCity === city.name ? "bg-accent/15 ring-1 ring-accent/60 shadow-[0_0_15px_rgba(245,158,11,0.08)]" : "bg-surface/50 hover:bg-surface ring-1 ring-border/40"}`, children: [
            /* @__PURE__ */ jsx("span", { className: `text-sm font-semibold transition-colors ${selectedCity === city.name ? "text-accent" : "text-foreground"}`, children: city.name }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide", children: city.state })
          ] }, city.name)) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/profile", className: "size-10 rounded-full bg-surface ring-1 ring-border grid place-items-center text-sm font-semibold", children: "AV" })
    ] }),
    featured ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("section", { className: "px-6 mb-10", children: /* @__PURE__ */ jsxs(Link, { to: "/movie/$id", params: {
        id: featured.id
      }, className: "block group", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative aspect-[2/3] rounded-2xl overflow-hidden bg-surface ring-1 ring-border mb-5", children: [
          /* @__PURE__ */ jsx("img", { src: featured.poster, alt: featured.title, width: 640, height: 960, className: "w-full h-full object-cover animate-fade-in" }),
          /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" }),
          /* @__PURE__ */ jsx("span", { className: "absolute top-4 left-4 px-2 py-0.5 rounded-md bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest", children: "Featured" })
        ] }),
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-foreground leading-tight", children: featured.title }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-2", children: [
          /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 px-2 py-0.5 bg-surface ring-1 ring-border rounded text-[11px] font-semibold text-accent", children: [
            /* @__PURE__ */ jsx(Star, { className: "size-3 fill-accent stroke-accent" }),
            " IMDb ",
            featured.imdb
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
            featured.genre,
            " • ",
            featured.runtime
          ] })
        ] })
      ] }) }),
      nowShowing.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mb-10 animate-fade-in", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 mb-4", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-foreground", children: "Now Showing" }),
          /* @__PURE__ */ jsx(Link, { to: "/search", className: "text-xs font-medium text-accent uppercase tracking-wider", children: "View All" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-4 overflow-x-auto px-6 no-scrollbar", children: nowShowing.map((m) => /* @__PURE__ */ jsxs(Link, { to: "/movie/$id", params: {
          id: m.id
        }, className: "flex-shrink-0 w-36 group", children: [
          /* @__PURE__ */ jsx("div", { className: "w-full aspect-[2/3] bg-surface rounded-xl ring-1 ring-border mb-3 overflow-hidden", children: /* @__PURE__ */ jsx("img", { src: m.poster, alt: m.title, loading: "lazy", width: 512, height: 768, className: "w-full h-full object-cover" }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-foreground line-clamp-1", children: m.title }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            m.genre,
            " • ",
            m.rating
          ] })
        ] }, m.id)) })
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "px-6 py-20 text-center animate-fade-in", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No films currently showing in this city." }) }),
    upcoming.length > 0 && /* @__PURE__ */ jsxs("section", { className: "mb-10 animate-fade-in", children: [
      /* @__PURE__ */ jsx("div", { className: "px-6 mb-4", children: /* @__PURE__ */ jsx("h2", { className: "text-lg font-medium text-foreground", children: "Coming Soon" }) }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3 px-6", children: upcoming.map((m) => /* @__PURE__ */ jsxs(Link, { to: "/movie/$id", params: {
        id: m.id
      }, className: "flex gap-4 p-3 bg-surface ring-1 ring-border rounded-xl items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "size-20 rounded-md bg-surface-2 flex-shrink-0 overflow-hidden", children: /* @__PURE__ */ jsx("img", { src: m.poster, alt: m.title, loading: "lazy", width: 512, height: 768, className: "w-full h-full object-cover" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-foreground", children: m.title }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-2 mt-0.5", children: m.release_note }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-semibold text-accent uppercase tracking-wider mt-1 inline-block", children: "Notify me" })
        ] }),
        /* @__PURE__ */ jsx(ChevronRight, { className: "size-4 text-muted-foreground flex-shrink-0" })
      ] }, m.id)) })
    ] })
  ] });
}
export {
  HomePage as component
};
