<script lang="ts">
  import { shortHash, timeAgo } from "$lib/api";
  import { fade, slide } from 'svelte/transition';
  
  export let data: { nodeId: string; nodes: any[]; blocks: any[] };

  function nodeHref(nodeId: string) {
    return `/blocks?nodeId=${encodeURIComponent(nodeId)}`;
  }
</script>

<div class="page">
  <header class="page-header" in:slide={{ duration: 300 }}>
    <div class="header-content">
      <h1>Blocks</h1>
      <p class="subtitle">Browse the blockchain history</p>
    </div>
    <div class="header-meta">
      <span class="meta-item">
        <span class="meta-label">Viewing</span>
        <span class="meta-value mono">{data.nodeId}</span>
      </span>
      <span class="divider">|</span>
      <span class="meta-item">
        <span class="meta-value">{data.blocks.length}</span>
        <span class="meta-label">total blocks</span>
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
            <span class="tab-height mono">#{node.height}</span>
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
            <th class="col-narrow">Block</th>
            <th>Hash</th>
            <th>Previous Hash</th>
            <th class="col-narrow">Txns</th>
            <th class="col-narrow">Nonce</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {#each data.blocks as block, i}
            <tr class="row" in:fade={{ duration: 200, delay: i * 30 }}>
              <td>
                <div class="block-cell">
                  <div class="block-icon">📦</div>
                  <span class="block-number mono">#{block.index}</span>
                </div>
              </td>
              <td>
                <div class="hash-cell">
                  <span class="hash mono">{shortHash(block.hash, 12)}</span>
                  <button class="copy-btn" title="Copy hash">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                    </svg>
                  </button>
                </div>
              </td>
              <td>
                <span class="hash secondary mono">{shortHash(block.previousHash, 12)}</span>
              </td>
              <td>
                <span class="badge {block.transactions?.length > 0 ? 'has-tx' : 'empty'}">
                  {block.transactions?.length ?? 0}
                </span>
              </td>
              <td>
                <span class="nonce mono">{block.nonce.toLocaleString()}</span>
              </td>
              <td>
                <div class="time-cell">
                  <span class="time">{timeAgo(block.timestamp)}</span>
                  <span class="timestamp">{new Date(block.timestamp).toLocaleString()}</span>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    {#if data.blocks.length === 0}
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No Blocks Found</h3>
        <p>This node hasn't mined any blocks yet.</p>
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
  
  .tab-height {
    font-size: 11px;
    color: var(--text-muted);
    background: var(--bg-primary);
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
  
  .data-table th.col-narrow {
    width: 80px;
  }
  
  .data-table td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-color);
    color: var(--text-secondary);
  }
  
  .data-table tr.row:hover td {
    background: var(--bg-hover);
  }
  
  .mono {
    font-family: var(--mono);
  }
  
  .block-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .block-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
    border-radius: var(--radius-md);
    font-size: 16px;
  }
  
  .block-number {
    font-weight: 600;
    color: var(--accent-blue);
  }
  
  .hash-cell {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .hash {
    font-family: var(--mono);
    color: var(--text-primary);
    font-weight: 500;
  }
  
  .hash.secondary {
    color: var(--text-muted);
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
  
  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    padding: 4px 10px;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 12px;
  }
  
  .badge.empty {
    background: var(--bg-tertiary);
    color: var(--text-muted);
  }
  
  .badge.has-tx {
    background: rgba(99, 102, 241, 0.15);
    color: var(--accent-indigo);
  }
  
  .nonce {
    color: var(--text-muted);
    font-size: 12px;
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
  
  @media (max-width: 768px) {
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
  }
</style>
