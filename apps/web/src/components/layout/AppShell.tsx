import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center w-full h-dvh bg-black">
      <div className="w-full max-w-[480px] h-full flex flex-col bg-bg-primary">
        <main className="flex-1 overflow-y-auto no-scrollbar">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
