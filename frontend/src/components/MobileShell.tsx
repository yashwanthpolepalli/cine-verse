import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function MobileShell({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <main className="w-full max-w-[480px] min-h-screen bg-background relative pb-28">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
