<script lang="ts">
  import { shortHash, formatNumber, timeAgo } from "$lib/api";
  import { fade, slide } from 'svelte/transition';
  
  export let data: {
    nodeId: string;
    nodes: any[];
    latestBlocks: any[];
    latestTx: any[];
  };
  
  const stats = [
    { 
      label: "Latest Block", 
      value: data.latestBlocks.length > 0 ? `#${data.latestBlocks[0].index}` : "-",
      sub: data.latestBlocks.length > 0 ? timeAgo(data.latestBlocks[0].timestamp) : "",
      icon: "📦",
      color: "blue"
    },
    { 
      label: "Active Nodes", 
      value: data.nodes.length.toString(),
      sub: "In sync",
      icon: "🖥️",
      color: "green"
    },
    { 
      label: "Total Transactions", 
      value: formatNumber(data.latestTx.length),
      sub: "Confirmed",
      icon: "💸",
      color: "purple"
    },
    { 
      label: "Network Status", 
      value: "Online",
      sub: "Healthy",
      icon: "✅",
      color: "cyan"
    },
  ];
</script>

<div class="dashboard">
  <header class="page-header">
    <div class="header-content">
      <h1>Dashboard</h1>
      <p class="subtitle">Real-time blockchain network overview</p>
    </div>
    <div class="node-badge">
      <span class="label">Active Node</span>
      <span class="value mono">{data.nodeId}</span>
    </div>
  </header>

  <section class="stats-grid" in:fade={{ duration: 300 }}>
    {#each stats as stat, i}
      <div class="stat-card {stat.color}" style="animation-delay: {i * 100}ms">
        <div class="stat-icon">{stat.icon}</div>
        <div class="stat-content">
          <div class="stat-label">{stat.label}</div>
          <div class="stat-value">{stat.value}</div>
          {#if stat.sub}
            <div class="stat-sub">{stat.sub}</div>
          {/if}
        </div>
      </div>
    {/each}
  </section>

  <div class="content-grid">
    <section class="panel" in:slide={{ duration: 400, delay: 200 }}>
      <div class="panel-header">
        <div class="panel-title">
          <span class="title-icon">📦</span>
          <h2>Latest Blocks</h2>
        </div>
        <a class="view-all" href="/blocks">
          View All
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </a>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Block</th>
              <th>Hash</th>
              <th>Txns</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {#each data.latestBlocks.slice(0, 8) as block, i}
              <tr class="hoverable" in:fade={{ duration: 200, delay: i * 50 }}>
                <td>
                  <a class="block-link" href="/blocks">
                    <span class="block-number">#{block.index}</span>
                  </a>
                </td>
                <td>
                  <span class="hash mono">{shortHash(block.hash, 16)}</span>
                </td>
                <td>
                  <span class="tx-count">{block.transactions?.length ?? 0}</span>
                </td>
                <td>
                  <span class="time">{timeAgo(block.timestamp)}</span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>

    <section class="panel" in:slide={{ duration: 400, delay: 300 }}>
      <div class="panel-header">
        <div class="panel-title">
          <span class="title-icon">💸</span>
          <h2>Latest Transactions</h2>
        </div>
        <a class="view-all" href="/transactions">
          View All
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
          </svg>
        </a>
      </div>
      
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tx Hash</th>
              <th>From</th>
              <th>To</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {#each data.latestTx.slice(0, 8) as tx, i}
              <tr class="hoverable" in:fade={{ duration: 200, delay: i * 50 }}>
                <td>
                  <span class="hash mono">{shortHash(tx.id, 12)}</span>
                </td>
                <td>
                  <span class="address mono">{tx.from}</span>
                </td>
                <td>
                  <span class="address mono">{tx.to}</span>
                </td>
                <td>
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
  .dashboard {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    flex-wrap: wrap;
  }
  
  .header-content h1 {
    font-size: 32px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
    margin: 0;
  }
  
  .subtitle {
    margin: 6px 0 0;
    color: var(--text-muted);
    font-size: 15px;
  }
  
  .node-badge {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.05));
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: var(--radius-md);
  }
  
  .node-badge .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--text-muted);
    font-weight: 600;
  }
  
  .node-badge .value {
    font-size: 14px;
    font-weight: 600;
    color: var(--accent-cyan);
  }
  
  .mono {
    font-family: var(--mono);
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;
  }
  
  .stat-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    transition: all 0.3s ease;
    animation: slideUp 0.5s ease forwards;
    opacity: 0;
    transform: translateY(20px);
  }
  
  @keyframes slideUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .stat-card:hover {
    border-color: var(--border-light);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
  
  .stat-card.blue { border-left: 3px solid var(--accent-blue); }
  .stat-card.green { border-left: 3px solid var(--success); }
  .stat-card.purple { border-left: 3px solid #8b5cf6; }
  .stat-card.cyan { border-left: 3px solid var(--accent-cyan); }
  
  .stat-icon {
    font-size: 28px;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
  }
  
  .stat-content {
    flex: 1;
  }
  
  .stat-label {
    font-size: 13px;
    color: var(--text-muted);
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 2px;
  }
  
  .stat-sub {
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .content-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  @media (min-width: 1200px) {
    .content-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  
  .panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: linear-gradient(90deg, rgba(99, 102, 241, 0.05), transparent);
    border-bottom: 1px solid var(--border-color);
  }
  
  .panel-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .title-icon {
    font-size: 20px;
  }
  
  .panel-title h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
  }
  
  .view-all {
    display: flex;
    align-items: center;
    gap: 4px;
    color: var(--accent-blue);
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    transition: all 0.2s;
  }
  
  .view-all:hover {
    background: rgba(59, 130, 246, 0.1);
  }
  
  .view-all svg {
    width: 16px;
    height: 16px;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  
  .data-table th {
    text-align: left;
    padding: 14px 20px;
    font-weight: 600;
    color: var(--text-muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
  }
  
  .data-table td {
    padding: 14px 20px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-secondary);
  }
  
  .data-table tr.hoverable:hover td {
    background: var(--bg-hover);
    cursor: pointer;
  }
  
  .data-table tr:last-child td {
    border-bottom: none;
  }
  
  .block-link {
    text-decoration: none;
    color: var(--accent-blue);
  }
  
  .block-number {
    font-weight: 600;
  }
  
  .hash {
    color: var(--text-muted);
    font-size: 12px;
  }
  
  .address {
    color: var(--accent-cyan);
    font-size: 12px;
  }
  
  .tx-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    padding: 2px 8px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 12px;
    color: var(--accent-indigo);
  }
  
  .time {
    color: var(--text-muted);
    font-size: 12px;
  }
  
  .value {
    font-weight: 600;
    color: var(--success);
  }
  
  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
    }
    
    .node-badge {
      align-items: flex-start;
      width: 100%;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .data-table {
      font-size: 12px;
    }
    
    .data-table th,
    .data-table td {
      padding: 12px 14px;
    }
  }
</style>
