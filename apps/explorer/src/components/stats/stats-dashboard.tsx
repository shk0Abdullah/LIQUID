"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { FadeIn } from "@/components/ui/fade-in";
import { BarChart } from "./bar-chart";
import { MetricCard } from "./metric-card";
import { NodeMetricsTable } from "./node-metrics-table";
import type { NetworkState } from "@/types";

export function StatsDashboard() {
  const [data, setData] = useState<NetworkState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let interval: NodeJS.Timeout;

    async function fetchState() {
      try {
        const res = await fetch(`/api/proxy/network/state`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = await res.json();
        if (mounted) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (mounted)
          setError(e instanceof Error ? e.message : "Failed to fetch");
      }
    }

    fetchState();
    interval = setInterval(fetchState, 2000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Failed to load network stats: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading network stats...
      </div>
    );
  }

  const totalForks = data.nodes.reduce(
    (s, n) => s + n.metrics.forksDetected,
    0,
  );
  const totalTxsConfirmed = data.nodes.reduce(
    (s, n) => s + n.metrics.txsConfirmed,
    0,
  );
  const totalBlocksAccepted = data.nodes.reduce(
    (s, n) => s + n.metrics.blocksAccepted,
    0,
  );
  const avgBlockUtil =
    data.nodes.reduce((s, n) => s + n.metrics.blockUtilization, 0) /
    data.nodes.length;
  const redundancyRate =
    data.gossipMetrics.messagesSent > 0
      ? (
          (data.gossipMetrics.messagesDeduped /
            data.gossipMetrics.messagesSent) *
          100
        ).toFixed(1)
      : "0";

  const barData = data.nodes.map((n) => ({
    label: n.id,
    values: [
      { key: "txs", value: n.metrics.txsConfirmed, color: "#22c55e" },
      { key: "forks", value: n.metrics.forksDetected * 10, color: "#ef4444" },
      { key: "blocks", value: n.metrics.blocksAccepted, color: "#3b82f6" },
    ],
  }));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <FadeIn>
        <PageHeader
          title="Network Stats"
          description="Real-time blockchain network metrics"
        />
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <MetricCard
            label="Total Blocks"
            value={totalBlocksAccepted}
            color="blue"
          />
          <MetricCard
            label="Total Txs Confirmed"
            value={totalTxsConfirmed}
            color="green"
          />
          <MetricCard label="Forks Detected" value={totalForks} color="red" />
          <MetricCard
            label="Avg Block Util"
            value={`${(avgBlockUtil * 100).toFixed(0)}%`}
            color="purple"
          />
          <MetricCard
            label="Msg Redundancy"
            value={`${redundancyRate}%`}
            color="amber"
          />
          <MetricCard
            label="Propagation Delay"
            value={`${data.propagationDelayMs}ms`}
            color="slate"
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Per-Node Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <NodeMetricsTable nodes={data.nodes} />
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.3}>
        <Card>
          <CardHeader>
            <CardTitle>Node Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={barData} />
          </CardContent>
        </Card>
      </FadeIn>

      <FadeIn delay={0.4}>
        <Card>
          <CardHeader>
            <CardTitle>Gossip Protocol</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <MetricCard
                label="Messages Sent"
                value={data.gossipMetrics.messagesSent}
                color="blue"
              />
              <MetricCard
                label="Messages Delivered"
                value={data.gossipMetrics.messagesDelivered}
                color="green"
              />
              <MetricCard
                label="Messages Deduped"
                value={data.gossipMetrics.messagesDeduped}
                color="amber"
              />
              <MetricCard
                label="Avg Hops"
                value={data.gossipMetrics.averageHops.toFixed(1)}
                color="slate"
              />
              <MetricCard
                label="Fanout Size"
                value={data.nodes.length > 0 ? "see config" : "-"}
                color="purple"
              />
              <MetricCard
                label="Network Nodes"
                value={data.nodeCount}
                color="slate"
              />
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
