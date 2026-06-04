import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { M as MobileShell } from "./MobileShell-DP9HPWMy.js";
import { Loader2, Heart, Bell, CreditCard, MapPin, Download, Settings, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { c as fetchProfile } from "./router-BYVtQZ9Z.js";
import "react";
import "zod";
const items = [{
  icon: Heart,
  label: "Watchlist"
}, {
  icon: Bell,
  label: "Notifications"
}, {
  icon: CreditCard,
  label: "Payment methods"
}, {
  icon: MapPin,
  label: "Location"
}, {
  icon: Download,
  label: "Install app"
}, {
  icon: Settings,
  label: "Settings"
}];
function ProfilePage() {
  const {
    data: profile,
    isLoading
  } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile
  });
  return /* @__PURE__ */ jsx(MobileShell, { children: isLoading || !profile ? /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center pt-40 gap-3", children: [
    /* @__PURE__ */ jsx(Loader2, { className: "size-8 text-accent animate-spin" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading profile..." })
  ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("header", { className: "px-6 pt-12 pb-6 safe-top", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-medium text-muted-foreground uppercase tracking-widest", children: "Profile" }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold mt-0.5", children: profile.name }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: profile.email })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "px-6 grid grid-cols-3 gap-3 mb-8", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Films", value: String(profile.films_watched) }),
      /* @__PURE__ */ jsx(Stat, { label: "Hours", value: String(profile.hours) }),
      /* @__PURE__ */ jsx(Stat, { label: "Reviews", value: String(profile.reviews) })
    ] }),
    /* @__PURE__ */ jsx("ul", { className: "px-6 space-y-2", children: items.map(({
      icon: Icon,
      label
    }) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("button", { className: "w-full flex items-center gap-4 p-4 bg-surface ring-1 ring-border rounded-xl text-left", children: [
      /* @__PURE__ */ jsx(Icon, { className: "size-5 text-accent" }),
      /* @__PURE__ */ jsx("span", { className: "flex-1 text-sm font-medium", children: label }),
      label === "Location" && /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground mr-1", children: typeof window !== "undefined" ? localStorage.getItem("selectedCity") || "Mumbai" : "Mumbai" }),
      /* @__PURE__ */ jsx(ChevronRight, { className: "size-4 text-muted-foreground" })
    ] }) }, label)) }),
    /* @__PURE__ */ jsx(Link, { to: "/", className: "block text-center mt-8 mx-6 py-3 text-sm text-muted-foreground", children: "Sign out" })
  ] }) });
}
function Stat({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "bg-surface ring-1 ring-border rounded-xl p-4 text-center", children: [
    /* @__PURE__ */ jsx("p", { className: "text-2xl font-semibold text-accent", children: value }),
    /* @__PURE__ */ jsx("p", { className: "text-[10px] uppercase tracking-widest text-muted-foreground mt-1", children: label })
  ] });
}
export {
  ProfilePage as component
};
