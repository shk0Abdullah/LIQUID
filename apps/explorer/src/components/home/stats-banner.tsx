import {
  Blocks,
  Network,
  ArrowLeftRight,
  Activity,
  AlertTriangle,
} from "lucide-react";
import type { Block, NodeInfo } from "@/types";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { FadeIn } from "@/components/ui/fade-in";

interface StatsBannerProps {
  latestBlock?: Block;
  nodes: NodeInfo[];
  totalTxs: number;
}

interface StatItemProps {
  label: string;
  rawValue: number;
  prefix?: string;
  sub: string;
  icon: React.ElementType;
  delay: number;
}

function StatItem({
  label,
  rawValue,
  prefix = "",
  sub,
  icon: Icon,
  delay,
}: StatItemProps) {
  return (
    <FadeIn direction="up" delay={delay}>
      <div className="group flex items-center gap-4 px-6 py-5 transition-colors hover:bg-primary/5 cursor-default">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-2xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 font-mono text-lg font-bold text-secondary">
            {rawValue > 0 ? (
              <AnimatedNumber value={rawValue} prefix={prefix} />
            ) : (
              "—"
            )}
          </p>
          <p className="mt-px truncate text-2xs text-muted-foreground">{sub}</p>
        </div>
      </div>
    </FadeIn>
  );
}

export function StatsBanner({
  latestBlock,
  nodes,
  totalTxs,
}: StatsBannerProps) {
  const totalForks = nodes.reduce((s, n) => s + n.metrics.forksDetected, 0);

  const stats: StatItemProps[] = [
    {
      label: "Latest Block",
      rawValue: latestBlock?.index ?? 0,
      prefix: "#",
      sub: latestBlock
        ? `${latestBlock.transactions.length} txn${latestBlock.transactions.length !== 1 ? "s" : ""}`
        : "No blocks mined",
      icon: Blocks,
      delay: 0.35,
    },
    {
      label: "Active Nodes",
      rawValue: nodes.length,
      sub: nodes.length > 0 ? "All online" : "None detected",
      icon: Network,
      delay: 0.42,
    },
    {
      label: "Transactions",
      rawValue: totalTxs,
      sub: "Total confirmed",
      icon: ArrowLeftRight,
      delay: 0.49,
    },
    {
      label: "Forks",
      rawValue: totalForks,
      sub: totalForks > 0 ? "Forks detected" : "No forks",
      icon: AlertTriangle,
      delay: 0.56,
    },
  ];

  return (
    <section className="w-full border-b border-border bg-white">
      <div className="mx-auto max-w-container">
        <div className="grid grid-cols-2 divide-x divide-border lg:grid-cols-4">
          {stats.map((s) => (
            <StatItem key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
