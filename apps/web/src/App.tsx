import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { FeedScreen } from "@/screens/FeedScreen";
import { ExploreScreen } from "@/screens/ExploreScreen";
import { PortfolioScreen } from "@/screens/PortfolioScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { MarketDetailScreen } from "@/screens/MarketDetailScreen";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<FeedScreen />} />
        <Route path="/explore" element={<ExploreScreen />} />
        <Route path="/portfolio" element={<PortfolioScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/market/:id" element={<MarketDetailScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
