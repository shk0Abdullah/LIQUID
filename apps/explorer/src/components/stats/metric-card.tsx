"use client";

import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  label: string;
  value: string | number;
  color?: string;
}

const colorMap: Record<string, string> = {
  blue: "border-blue-500/30 text-blue-400",
  green: "border-green-500/30 text-green-400",
  red: "border-red-500/30 text-red-400",
  amber: "border-amber-500/30 text-amber-400",
  purple: "border-purple-500/30 text-purple-400",
  slate: "border-slate-500/30 text-slate-300",
};

export function MetricCard({ label, value, color = "slate" }: MetricCardProps) {
  return (
    <Card className={`border ${colorMap[color] ?? colorMap.slate}`}>
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
        <div className="text-2xl font-bold mt-1">{value}</div>
      </CardContent>
    </Card>
  );
}
