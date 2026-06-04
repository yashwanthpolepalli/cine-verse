import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { z } from "zod";
const appCss = "/assets/styles-NEYKhOmR.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$8 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
      },
      { name: "theme-color", content: "#09090b" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Lumiere" },
      { title: "Lumiere — Movie Tickets" },
      { name: "description", content: "Discover films and book tickets in seconds." },
      { property: "og:title", content: "Lumiere — Movie Tickets" },
      { property: "og:description", content: "Discover films and book tickets in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-512.png" },
      { rel: "icon", href: "/icon-512.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$8.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
const $$splitComponentImporter$7 = () => import("./tickets-BpV4RteV.js");
const Route$7 = createFileRoute("/tickets")({
  head: () => ({
    meta: [{
      title: "My Tickets — Lumiere"
    }, {
      name: "description",
      content: "Your booked movie tickets."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./search-CbCQmj0_.js");
const Route$6 = createFileRoute("/search")({
  head: () => ({
    meta: [{
      title: "Search — Lumiere"
    }, {
      name: "description",
      content: "Search films, genres, and theatres."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./profile-BzXCxdcQ.js");
const Route$5 = createFileRoute("/profile")({
  head: () => ({
    meta: [{
      title: "Profile — Lumiere"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./index-DHz7bDUi.js");
const Route$4 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Lumiere — Now Showing"
    }, {
      name: "description",
      content: "Browse films now showing and coming soon."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./ticket._ticketId-nIc7geu9.js");
const Route$3 = createFileRoute("/ticket/$ticketId")({
  head: () => ({
    meta: [{
      title: "Your ticket — Lumiere"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const API_BASE = "http://localhost:8000/api";
async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers
    },
    ...options
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error ${res.status}`);
  }
  return res.json();
}
async function fetchMovies(status, city) {
  const params = new URLSearchParams();
  if (city) params.set("city", city);
  const queryString = params.toString() ? `?${params.toString()}` : "";
  const data = await request(`/movies${queryString}`);
  return data.movies;
}
async function fetchMovie(id) {
  return request(`/movies/${id}`);
}
async function searchMovies(q, genre, city) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (genre && genre !== "All") params.set("genre", genre);
  params.set("city", city);
  const data = await request(`/movies/search?${params}`);
  return data.movies;
}
async function fetchTheatres(city) {
  const actualCity = typeof city === "string" ? city : void 0;
  const params = actualCity ? `?city=${encodeURIComponent(actualCity)}` : "";
  return request(`/theatres${params}`);
}
async function fetchShowtimes(movieId, theatreId, date) {
  const params = new URLSearchParams({ movie_id: movieId, theatre_id: theatreId, date });
  return request(`/showtimes?${params}`);
}
async function fetchDates(movieId) {
  return request(`/showtimes/dates?movie_id=${movieId}`);
}
async function fetchSeatMap(movieId, theatreId, date, time) {
  const params = new URLSearchParams({ theatre_id: theatreId, date, time });
  return request(`/seats/${movieId}?${params}`);
}
async function fetchTickets() {
  return request("/tickets");
}
async function fetchTicket(id) {
  return request(`/tickets/${id}`);
}
async function createBooking(data) {
  return request("/tickets", {
    method: "POST",
    body: JSON.stringify(data)
  });
}
async function fetchProfile() {
  return request("/users/profile");
}
async function subscribeNotification(movieId) {
  await request("/notifications", {
    method: "POST",
    body: JSON.stringify({ movie_id: movieId })
  });
}
const $$splitComponentImporter$2 = () => import("./seats._id-Wv3Ci67Y.js");
const searchSchema$1 = z.object({
  time: z.string().default("7:45 PM"),
  theatre: z.string().default("scotiabank"),
  date: z.string().default("Jun 3")
});
const Route$2 = createFileRoute("/seats/$id")({
  validateSearch: searchSchema$1,
  loader: async ({
    context: {
      queryClient
    },
    params
  }) => {
    return queryClient.ensureQueryData({
      queryKey: ["movie", params.id],
      queryFn: () => fetchMovie(params.id)
    });
  },
  head: ({
    loaderData
  }) => {
    const m = loaderData;
    return {
      meta: [{
        title: m ? `Pick seats — ${m.title}` : "Pick seats"
      }, {
        name: "description",
        content: "Select your seats."
      }]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./movie._id-DuVbY0wi.js");
const Route$1 = createFileRoute("/movie/$id")({
  loader: async ({
    context: {
      queryClient
    },
    params
  }) => {
    return queryClient.ensureQueryData({
      queryKey: ["movie", params.id],
      queryFn: () => fetchMovie(params.id)
    });
  },
  head: ({
    loaderData
  }) => {
    const m = loaderData;
    return {
      meta: [{
        title: m ? `${m.title} — Lumiere` : "Film not found"
      }, {
        name: "description",
        content: m?.synopsis ?? "Film details"
      }, {
        property: "og:title",
        content: m?.title ?? "Lumiere"
      }, {
        property: "og:description",
        content: m?.synopsis ?? ""
      }, ...m ? [{
        property: "og:image",
        content: m.poster
      }] : []]
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./checkout._id-Cij-wy0K.js");
const searchSchema = z.object({
  time: z.string(),
  theatre: z.string(),
  date: z.string(),
  seats: z.string()
});
const Route = createFileRoute("/checkout/$id")({
  validateSearch: searchSchema,
  loader: async ({
    context: {
      queryClient
    },
    params
  }) => {
    return queryClient.ensureQueryData({
      queryKey: ["movie", params.id],
      queryFn: () => fetchMovie(params.id)
    });
  },
  head: () => ({
    meta: [{
      title: "Checkout — Lumiere"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TicketsRoute = Route$7.update({
  id: "/tickets",
  path: "/tickets",
  getParentRoute: () => Route$8
});
const SearchRoute = Route$6.update({
  id: "/search",
  path: "/search",
  getParentRoute: () => Route$8
});
const ProfileRoute = Route$5.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => Route$8
});
const IndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$8
});
const TicketTicketIdRoute = Route$3.update({
  id: "/ticket/$ticketId",
  path: "/ticket/$ticketId",
  getParentRoute: () => Route$8
});
const SeatsIdRoute = Route$2.update({
  id: "/seats/$id",
  path: "/seats/$id",
  getParentRoute: () => Route$8
});
const MovieIdRoute = Route$1.update({
  id: "/movie/$id",
  path: "/movie/$id",
  getParentRoute: () => Route$8
});
const CheckoutIdRoute = Route.update({
  id: "/checkout/$id",
  path: "/checkout/$id",
  getParentRoute: () => Route$8
});
const rootRouteChildren = {
  IndexRoute,
  ProfileRoute,
  SearchRoute,
  TicketsRoute,
  CheckoutIdRoute,
  MovieIdRoute,
  SeatsIdRoute,
  TicketTicketIdRoute
};
const routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$3 as R,
  fetchMovies as a,
  fetchTheatres as b,
  fetchProfile as c,
  fetchTicket as d,
  fetchMovie as e,
  fetchTickets as f,
  Route$2 as g,
  fetchSeatMap as h,
  Route$1 as i,
  fetchDates as j,
  fetchShowtimes as k,
  subscribeNotification as l,
  Route as m,
  createBooking as n,
  router as r,
  searchMovies as s
};
