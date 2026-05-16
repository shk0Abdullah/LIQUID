<script lang="ts">
  import { shortHash, formatNumber, timeAgo } from "$lib/api";
  
  export let data: {
    nodeId: string;
    nodes: any[];
    latestBlocks: any[];
    latestTx: any[];
  };
</script>

<div class="page">
  <header class="page-header">
    <h1>Dashboard</h1>
    <div class="node-info">
      <span class="label">Active Node</span>
      <span class="value">{data.nodeId}</span>
    </div>
  </header>

  <!-- Stats Grid -->
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Latest Block</span>
        <span class="stat-icon blue">◫</span>
      </div>
      <div class="stat-value">
        {#if data.latestBlocks.length > 0}
          #{data.latestBlocks[0].index}
        {:else}
          -
        {/if}
      </div>
      <div class="stat-meta">
        {#if data.latestBlocks.length > 0}
          {timeAgo(data.latestBlocks[0].timestamp)}
        {:else}
          No blocks
        {/if}
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Active Nodes</span>
        <span class="stat-icon green">◧</span>
      </div>
      <div class="stat-value">{data.nodes.length}</div>
      <div class="stat-meta">In sync</div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Transactions</span>
        <span class="stat-icon purple">◯</span>
      </div>
      <div class="stat-value">{formatNumber(data.latestTx.length)}</div>
      <div class="stat-meta">Confirmed</div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <span class="stat-label">Network</span>
        <span class="stat-icon cyan">◈</span>
      </div>
      <div class="stat-value">Online</div>
      <div class="stat-meta">Healthy</div>
    </div>
  </div>

  <!-- Content Grid -->
  <div class="content-grid">
    <!-- Latest Blocks -->
    <section class="panel">
      <div class="panel-header">
        <h2>Latest Blocks</h2>
        <a class="view-all" href="/blocks">View all →</a>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Block</th>
              <th>Hash</th>
              <th class="num">Txns</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {#each data.latestBlocks.slice(0, 6) as block}
              <tr>
                <td>
                  <a class="link" href="/blocks">#{block.index}</a>
                </td>
                <td>
                  <span class="hash">{shortHash(block.hash, 12)}</span>
                </td>
                <td class="num">{block.transactions?.length ?? 0}</td>
                <td class="time">{timeAgo(block.timestamp)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Latest Transactions -->
    <section class="panel">
      <div class="panel-header">
        <h2>Latest Transactions</h2>
        <a class="view-all" href="/transactions">View all →</a>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Hash</th>
              <th>From</th>
              <th>To</th>
              <th class="num">Value</th>
            </tr>
          </thead>
          <tbody>
            {#each data.latestTx.slice(0, 6) as tx}
              <tr>
                <td>
                  <span class="hash">{shortHash(tx.id, 10)}</span>
                </td>
                <td>
                  <span class="addr from">{tx.from}</span>
                </td>
                <td>
                  <span class="addr to">{tx.to}</span>
                </td>
                <td class="num">
                  <span class="value">{tx.amount}</span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  </div>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 20px;
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

  .node-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
  }

  .node-info .label {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
  }

  .node-info .value {
    font-size: 12px;
    font-weight: 500;
    color: var(--accent);
    font-family: var(--font-mono);
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }

  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 640px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }

  .stat-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 16px;
  }

  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .stat-label {
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-icon {
    font-size: 14px;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
  }

  .stat-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
  .stat-icon.green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
  .stat-icon.purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }
  .stat-icon.cyan { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }

  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .stat-meta {
    font-size: 11px;
    color: var(--text-muted);
  }

  /* Content Grid */
  .content-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
  }

  .panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-tertiary);
  }

  .panel-header h2 {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .view-all {
    font-size: 11px;
    color: var(--accent);
    transition: color 0.15s;
  }

  .view-all:hover {
    color: var(--accent-hover);
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
    padding: 10px 12px;
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
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
    color: var(--text-secondary);
    white-space: nowrap;
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

  .link {
    color: var(--accent);
    font-weight: 500;
  }

  .link:hover {
    text-decoration: underline;
  }

  .hash {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-muted);
  }

  .time {
    font-size: 11px;
    color: var(--text-muted);
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
</style>
