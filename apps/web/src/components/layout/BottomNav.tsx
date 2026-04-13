import { useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, PieChart, User } from "lucide-react";

const tabs = [
  { path: "/", label: "Feed", icon: Home },
  { path: "/explore", label: "Explore", icon: Compass },
  { path: "/portfolio", label: "Portfolio", icon: PieChart },
  { path: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname.startsWith("/market/")) return null;

  return (
    <nav className="flex items-center justify-around px-4 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-bg-secondary/80 backdrop-blur-xl border-t border-border">
      {tabs.map((tab) => {
        const isActive =
          tab.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(tab.path);
        const Icon = tab.icon;

        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center gap-1 py-1.5 px-5 transition-colors"
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2.5 : 1.8}
              className={
                isActive ? "text-brand" : "text-text-muted"
              }
            />
            <span
              className={`text-[10px] font-medium ${
                isActive ? "text-brand" : "text-text-muted"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
