<script lang="ts">
  import { shortHash, timeAgo } from "$lib/api";
  import { fade, slide } from 'svelte/transition';
  
  export let data: { nodeId: string; nodes: any[]; txs: any[] };

  function nodeHref(nodeId: string) {
    return `/transactions?nodeId=${encodeURIComponent(nodeId)}`;
  }
</script>

<div class="page">
  <header class="page-header" in:slide={{ duration: 300 }}>
    <div class="header-content">
      <h1>Transactions</h1>
      <p class="subtitle">View all confirmed transactions</p>
    </div>
    <div class="header-meta">
      <span class="meta-item">
        <span class="meta-label">Viewing</span>
        <span class="meta-value mono">{data.nodeId}</span>
      </span>
      <span class="divider">|</span>
      <span class="meta-item">
        <span class="meta-value">{data.txs.length}</span>
        <span class="meta-label">total tx</span>
      </span>
    </div>
  </header>

  <div class="controls" in:slide={{ duration: 300, delay: 100 }}>
    <div class="node-selector">
      <span class="selector-label">Select Node:</span>
      <div class="node-tabs">
        {#each data.nodes as node, i}
          <a 
            class="node-tab" 
            href={nodeHref(node.id)}
            class:active={node.id === data.nodeId}
            in:fade={{ duration: 200, delay: i * 50 }}
          >
            <span class="tab-indicator" class:active={node.id === data.nodeId}></span>
            <span class="tab-name">{node.id}</span>
            <span class="tab-count mono">{node.pendingTxCount} pending</span>
          </a>
        {/each}
      </div>
    </div>
  </div>

  <section class="panel" in:slide={{ duration: 300, delay: 200 }}>
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Tx Hash</th>
            <th>From</th>
            <th class="arrow-col"></th>
            <th>To</th>
            <th>Value</th>
            <th>Time</th>
            <th>Block</th>
          </tr>
        </thead>
        <tbody>
          {#each data.txs as tx, i}
            <tr class="row" in:fade={{ duration: 200, delay: i * 30 }}>
              <td>
                <div class="hash-cell">
                  <span class="hash mono">{shortHash(tx.id, 14)}</span>
                  <button class="copy-btn" title="Copy hash">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                    </svg>
                  </button>
                </div>
              </td>
              <td>
                <span class="address from mono">{tx.from}</span>
              </td>
              <td class="arrow-col">
                <div class="arrow">→</div>
              </td>
              <td>
                <span class="address to mono">{tx.to}</span>
              </td>
              <td>
                <div class="value-cell">
                  <span class="amount">{tx.amount}</span>
                  <span class="unit">LIQ</span>
                </div>
              </td>
              <td>
                <div class="time-cell">
                  <span class="time">{timeAgo(tx.timestamp)}</span>
                  <span class="timestamp">{new Date(tx.timestamp).toLocaleString()}</span>
                </div>
              </td>
              <td>
                <a class="block-link mono" href="/blocks">
                  <span class="block-badge">#{tx.blockIndex}</span>
                </a>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    {#if data.txs.length === 0}
      <div class="empty-state">
        <div class="empty-icon">💸</div>
        <h3>No Transactions Found</h3>
        <p>This node hasn't processed any transactions yet.</p>
      </div>
    {/if}
  </section>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
    flex-wrap: wrap;
    padding-bottom: 8px;
  }
  
  .header-content h1 {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.3px;
  }
  
  .subtitle {
    margin: 6px 0 0;
    color: var(--text-muted);
    font-size: 14px;
  }
  
  .header-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .meta-label {
    font-size: 12px;
    color: var(--text-muted);
  }
  
  .meta-value {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }
  
  .divider {
    color: var(--border-color);
  }
  
  .controls {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 20px;
  }
  
  .node-selector {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .selector-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .node-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .node-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: var(--text-secondary);
    font-size: 13px;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }
  
  .node-tab:hover {
    background: var(--bg-hover);
    border-color: var(--border-light);
    color: var(--text-primary);
  }
  
  .node-tab.active {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1));
    border-color: rgba(99, 102, 241, 0.3);
    color: var(--text-primary);
  }
  
  .tab-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-muted);
    transition: all 0.2s;
  }
  
  .tab-indicator.active {
    background: var(--success);
    box-shadow: 0 0 6px var(--success);
  }
  
  .tab-name {
    font-weight: 600;
  }
  
  .tab-count {
    font-size: 11px;
    color: var(--accent-cyan);
    background: rgba(6, 182, 212, 0.1);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }
  
  .panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
  
  .table-wrapper {
    overflow-x: auto;
  }
  
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  
  .data-table th {
    text-align: left;
    padding: 14px 16px;
    font-weight: 600;
    color: var(--text-muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-color);
    white-space: nowrap;
  }
  
  .data-table th.arrow-col {
    width: 40px;
    text-align: center;
  }
  
  .data-table td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-secondary);
    vertical-align: middle;
  }
  
  .data-table td.arrow-col {
    text-align: center;
  }
  
  .data-table tr.row:hover td {
    background: var(--bg-hover);
  }
  
  .mono {
    font-family: var(--mono);
  }
  
  .hash-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .hash {
    font-family: var(--mono);
    color: var(--accent-blue);
    font-weight: 500;
    font-size: 12px;
  }
  
  .copy-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-muted);
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s;
  }
  
  tr:hover .copy-btn {
    opacity: 1;
  }
  
  .copy-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border-color: var(--border-light);
  }
  
  .copy-btn svg {
    width: 12px;
    height: 12px;
  }
  
  .address {
    font-family: var(--mono);
    font-size: 12px;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
  }
  
  .address.from {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
  }
  
  .address.to {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
  }
  
  .arrow {
    color: var(--text-muted);
    font-size: 14px;
  }
  
  .value-cell {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  .amount {
    font-weight: 700;
    color: var(--text-primary);
    font-size: 14px;
  }
  
  .unit {
    font-size: 11px;
    color: var(--text-muted);
    background: var(--bg-tertiary);
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }
  
  .time-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .time {
    color: var(--text-secondary);
    font-weight: 500;
  }
  
  .timestamp {
    font-size: 11px;
    color: var(--text-muted);
  }
  
  .block-link {
    text-decoration: none;
  }
  
  .block-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1));
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: var(--radius-sm);
    color: var(--accent-indigo);
    font-weight: 600;
    font-size: 12px;
    transition: all 0.2s;
  }
  
  .block-badge:hover {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.2));
    border-color: rgba(99, 102, 241, 0.3);
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 20px;
    text-align: center;
  }
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .empty-state h3 {
    margin: 0 0 8px;
    color: var(--text-primary);
    font-size: 18px;
  }
  
  .empty-state p {
    margin: 0;
    color: var(--text-muted);
    font-size: 14px;
  }
  
  @media (max-width: 1024px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .node-tabs {
      flex-direction: column;
    }
    
    .data-table {
      font-size: 12px;
    }
    
    .data-table th,
    .data-table td {
      padding: 12px;
    }
    
    .timestamp {
      display: none;
    }
    
    .arrow-col {
      display: none;
    }
  }
</style>
