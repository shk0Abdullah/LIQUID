import { StatsDashboard } from "@/components/stats/stats-dashboard";

export const metadata = {
  title: "Network Stats - Liquid Explorer",
  description: "Real-time blockchain network statistics and metrics",
};

export default function StatsPage() {
  return <StatsDashboard />;
}
