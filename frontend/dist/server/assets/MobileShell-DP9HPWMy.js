import { jsx, jsxs } from "react/jsx-runtime";
import { useRouterState, Link } from "@tanstack/react-router";
import { Film, Search, Ticket, User } from "lucide-react";
const tabs = [
  { to: "/", label: "Browse", icon: Film, match: (p) => p === "/" || p.startsWith("/movie") || p.startsWith("/seats") },
  { to: "/search", label: "Search", icon: Search, match: (p) => p.startsWith("/search") },
  { to: "/tickets", label: "Tickets", icon: Ticket, match: (p) => p.startsWith("/ticket") },
  { to: "/profile", label: "Profile", icon: User, match: (p) => p.startsWith("/profile") }
];
function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return /* @__PURE__ */ jsx("nav", { className: "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/85 backdrop-blur-xl border-t border-border z-50 px-6 pt-3 safe-bottom", children: /* @__PURE__ */ jsx("ul", { className: "flex justify-between items-center", children: tabs.map(({ to, label, icon: Icon, match }) => {
    const active = match(pathname);
    return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
      Link,
      {
        to,
        className: `flex flex-col items-center gap-1 py-1 px-3 transition-colors ${active ? "text-accent" : "text-muted-foreground"}`,
        children: [
          /* @__PURE__ */ jsx(Icon, { className: "size-5", strokeWidth: active ? 2.4 : 1.8 }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium tracking-wide", children: label })
        ]
      }
    ) }, to);
  }) }) });
}
function MobileShell({ children, hideNav }) {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background flex justify-center", children: [
    /* @__PURE__ */ jsx("main", { className: "w-full max-w-[480px] min-h-screen bg-background relative pb-28", children }),
    !hideNav && /* @__PURE__ */ jsx(BottomNav, {})
  ] });
}
export {
  MobileShell as M
};
