<script lang="ts">
  import { shortHash, timeAgo } from "$lib/api";
  
  export let data: { nodeId: string; nodes: any[]; txs: any[] };

  function nodeHref(nodeId: string) {
    return `/transactions?nodeId=${encodeURIComponent(nodeId)}`;
  }
</script>

<div class="page">
  <header class="page-header">
    <h1>Transactions</h1>
    <div class="meta">
      <span class="label">Viewing</span>
      <span class="value">{data.nodeId}</span>
      <span class="divider">|</span>
      <span class="count">{data.txs.length} tx</span>
    </div>
  </header>

  <!-- Node Selector -->
  <div class="node-tabs">
    {#each data.nodes as node}
      <a 
        class="node-tab" 
        href={nodeHref(node.id)}
        class:active={node.id === data.nodeId}
      >
        <span class="indicator" class:active={node.id === data.nodeId}></span>
        <span class="name">{node.id}</span>
        <span class="pending">{node.pendingTxCount} pending</span>
      </a>
    {/each}
  </div>

  <!-- Transactions Table -->
  <section class="panel">
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Hash</th>
            <th>From</th>
            <th>To</th>
            <th class="num">Value</th>
            <th>Time</th>
            <th>Block</th>
          </tr>
        </thead>
        <tbody>
          {#each data.txs as tx}
            <tr>
              <td>
                <span class="hash">{shortHash(tx.id, 12)}</span>
              </td>
              <td>
                <span class="addr from">{tx.from}</span>
              </td>
              <td>
                <span class="addr to">{tx.to}</span>
              </td>
              <td class="num">
                <span class="value">{tx.amount} <span class="unit">LIQ</span></span>
              </td>
              <td>
                <span class="time">{timeAgo(tx.timestamp)}</span>
              </td>
              <td>
                <a class="block-link" href="/blocks">#{tx.blockIndex}</a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    {#if data.txs.length === 0}
      <div class="empty">
        <span class="empty-icon">◯</span>
        <p>No transactions found</p>
      </div>
    {/if}
  </section>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .page-header h1 {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
  }

  .meta .label {
    color: var(--text-muted);
  }

  .meta .value {
    color: var(--accent);
    font-family: var(--font-mono);
    font-weight: 500;
  }

  .meta .divider {
    color: var(--border);
  }

  .meta .count {
    color: var(--text-secondary);
  }

  /* Node Tabs */
  .node-tabs {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .node-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 12px;
    transition: all 0.15s;
  }

  .node-tab:hover {
    background: var(--bg-hover);
    border-color: var(--border-light);
  }

  .node-tab.active {
    background: var(--accent);
    border-color: var(--accent);
    color: white;
  }

  .indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-muted);
  }

  .indicator.active {
    background: var(--success);
    box-shadow: 0 0 4px var(--success);
  }

  .name {
    font-weight: 500;
  }

  .pending {
    font-size: 10px;
    color: var(--accent);
    background: rgba(59, 130, 246, 0.1);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }

  .node-tab.active .pending {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  /* Panel */
  .panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .table-container {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }

  th {
    text-align: left;
    padding: 12px;
    font-weight: 500;
    color: var(--text-muted);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
    white-space: nowrap;
  }

  th.num {
    text-align: right;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid var(--border);
    color: var(--text-secondary);
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: var(--bg-hover);
  }

  td.num {
    text-align: right;
  }

  .hash {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--accent);
  }

  .addr {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }

  .addr.from {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
  }

  .addr.to {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }

  .value {
    font-weight: 600;
    color: var(--text-primary);
  }

  .unit {
    font-size: 10px;
    color: var(--text-muted);
    font-weight: 400;
    margin-left: 4px;
  }

  .time {
    font-size: 11px;
    color: var(--text-muted);
  }

  .block-link {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: var(--radius-sm);
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--accent);
    transition: background 0.15s;
  }

  .block-link:hover {
    background: rgba(99, 102, 241, 0.2);
  }

  /* Empty State */
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    text-align: center;
  }

  .empty-icon {
    font-size: 32px;
    margin-bottom: 12px;
    opacity: 0.3;
  }

  .empty p {
    color: var(--text-muted);
    font-size: 13px;
  }
</style>
