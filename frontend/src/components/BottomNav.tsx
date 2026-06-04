import { Link, useRouterState } from "@tanstack/react-router";
import { Film, Search, Ticket, User } from "lucide-react";

const tabs = [
  { to: "/", label: "Browse", icon: Film, match: (p: string) => p === "/" || p.startsWith("/movie") || p.startsWith("/seats") },
  { to: "/search", label: "Search", icon: Search, match: (p: string) => p.startsWith("/search") },
  { to: "/tickets", label: "Tickets", icon: Ticket, match: (p: string) => p.startsWith("/ticket") },
  { to: "/profile", label: "Profile", icon: User, match: (p: string) => p.startsWith("/profile") },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/85 backdrop-blur-xl border-t border-border z-50 px-6 pt-3 safe-bottom">
      <ul className="flex justify-between items-center">
        {tabs.map(({ to, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={to}>
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
                  active ? "text-accent" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
