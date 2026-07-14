"use client";

import type { NodeInfo } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusDot } from "@/components/ui/status-dot";

interface NodeMetricsTableProps {
  nodes: NodeInfo[];
}

export function NodeMetricsTable({ nodes }: NodeMetricsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Node</TableHead>
          <TableHead>Height</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Mempool</TableHead>
          <TableHead>Blocks</TableHead>
          <TableHead>Txs Confirmed</TableHead>
          <TableHead>Forks</TableHead>
          <TableHead>Rejected</TableHead>
          <TableHead>Block Util</TableHead>
          <TableHead>Interval (ms)</TableHead>
          <TableHead>Peers</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nodes.map((node) => (
          <TableRow key={node.id}>
            <TableCell className="font-mono">
              <StatusDot active={node.metrics.forksDetected === 0} />
              {node.id}
            </TableCell>
            <TableCell>{node.height}</TableCell>
            <TableCell>{node.difficulty}</TableCell>
            <TableCell>{node.pendingTxCount}</TableCell>
            <TableCell>{node.metrics.blocksAccepted}</TableCell>
            <TableCell className="text-green-400">
              {node.metrics.txsConfirmed}
            </TableCell>
            <TableCell
              className={
                node.metrics.forksDetected > 0 ? "text-red-400 font-bold" : ""
              }
            >
              {node.metrics.forksDetected}
            </TableCell>
            <TableCell className="text-amber-400">
              {node.metrics.blocksRejected}
            </TableCell>
            <TableCell>
              {(node.metrics.blockUtilization * 100).toFixed(0)}%
            </TableCell>
            <TableCell>{node.metrics.blockIntervalMs || "-"}</TableCell>
            <TableCell>{node.neighborCount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
