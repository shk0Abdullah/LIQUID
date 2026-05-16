<script lang="ts">
  import { shortHash, timeAgo } from "$lib/api";
  
  export let data: { nodeId: string; nodes: any[]; blocks: any[] };

  function nodeHref(nodeId: string) {
    return `/blocks?nodeId=${encodeURIComponent(nodeId)}`;
  }
</script>

<div class="page">
  <header class="page-header">
    <h1>Blocks</h1>
    <div class="meta">
      <span class="label">Viewing</span>
      <span class="value">{data.nodeId}</span>
      <span class="divider">|</span>
      <span class="count">{data.blocks.length} blocks</span>
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
        <span class="height">#{node.height}</span>
      </a>
    {/each}
  </div>

  <!-- Blocks Table -->
  <section class="panel">
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Block</th>
            <th>Hash</th>
            <th>Previous</th>
            <th class="num">Txns</th>
            <th class="num">Nonce</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {#each data.blocks as block}
            <tr>
              <td>
                <span class="block-num">#{block.index}</span>
              </td>
              <td>
                <span class="hash">{shortHash(block.hash, 14)}</span>
              </td>
              <td>
                <span class="hash secondary">{shortHash(block.previousHash, 12)}</span>
              </td>
              <td class="num">
                <span class="badge">{block.transactions?.length ?? 0}</span>
              </td>
              <td class="num">
                <span class="nonce">{block.nonce.toLocaleString()}</span>
              </td>
              <td>
                <span class="time">{timeAgo(block.timestamp)}</span>
                <span class="timestamp">{new Date(block.timestamp).toLocaleString()}</span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    {#if data.blocks.length === 0}
      <div class="empty">
        <span class="empty-icon">◫</span>
        <p>No blocks found</p>
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

  .height {
    font-size: 10px;
    color: var(--text-muted);
    font-family: var(--font-mono);
    padding: 2px 4px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
  }

  .node-tab.active .height {
    background: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
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

  .block-num {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--accent);
  }

  .hash {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--text-primary);
  }

  .hash.secondary {
    color: var(--text-muted);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    padding: 2px 6px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
    font-size: 10px;
    font-weight: 500;
  }

  .nonce {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-muted);
  }

  .time {
    display: block;
    color: var(--text-secondary);
  }

  .timestamp {
    display: block;
    font-size: 10px;
    color: var(--text-muted);
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
