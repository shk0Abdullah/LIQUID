<script lang="ts">
  export let data: { nodes: any[] };
</script>

<div class="page">
  <header class="page-header">
    <h1>Network Nodes</h1>
    <div class="meta">
      <span class="count">{data.nodes.length} nodes</span>
    </div>
  </header>

  <!-- Nodes Grid -->
  <div class="nodes-grid">
    {#each data.nodes as node}
      <div class="node-card">
        <div class="node-header">
          <div class="node-id">
            <span class="indicator"></span>
            <span class="name">{node.id}</span>
          </div>
          <div class="node-status">
            <span class="badge online">Online</span>
          </div>
        </div>
        
        <div class="node-stats">
          <div class="stat">
            <span class="stat-label">Height</span>
            <span class="stat-value">{node.chainLength}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Mempool</span>
            <span class="stat-value">{node.pendingTxCount}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Difficulty</span>
            <span class="stat-value">{node.difficulty}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Max Tx/Block</span>
            <span class="stat-value">{node.maxTransactionsPerBlock}</span>
          </div>
        </div>
        
        <div class="node-footer">
          <div class="peers">
            <span class="peers-label">Peers:</span>
            <span class="peers-count">{(node.peers ?? []).length}</span>
          </div>
          <div class="address">
            <span class="addr">{node.address}</span>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Nodes Table -->
  <section class="panel">
    <div class="panel-header">
      <h2>All Nodes</h2>
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Node</th>
            <th>Address</th>
            <th class="num">Peers</th>
            <th class="num">Chain</th>
            <th class="num">Mempool</th>
            <th class="num">Difficulty</th>
            <th class="num">Max Tx</th>
          </tr>
        </thead>
        <tbody>
          {#each data.nodes as node}
            <tr>
              <td>
                <div class="node-cell">
                  <span class="indicator"></span>
                  <span class="name">{node.id}</span>
                </div>
              </td>
              <td>
                <span class="addr">{node.address}</span>
              </td>
              <td class="num">{(node.peers ?? []).length}</td>
              <td class="num">{node.chainLength}</td>
              <td class="num">{node.pendingTxCount}</td>
              <td class="num">{node.difficulty}</td>
              <td class="num">{node.maxTransactionsPerBlock}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
    
    {#if data.nodes.length === 0}
      <div class="empty">
        <span class="empty-icon">◧</span>
        <p>No nodes found</p>
      </div>
    {/if}
  </section>
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

  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .meta .count {
    font-size: 12px;
    color: var(--text-secondary);
    padding: 4px 8px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
  }

  /* Nodes Grid */
  .nodes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .node-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 16px;
  }

  .node-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .node-id {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 6px var(--success);
  }

  .name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .badge {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge.online {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }

  .node-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .stat-label {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    font-family: var(--font-mono);
  }

  .node-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  .peers {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
  }

  .peers-label {
    color: var(--text-muted);
  }

  .peers-count {
    color: var(--accent);
    font-weight: 500;
  }

  .address {
    font-size: 10px;
  }

  .addr {
    font-family: var(--font-mono);
    color: var(--text-muted);
  }

  /* Panel */
  .panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .panel-header {
    padding: 12px 16px;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
  }

  .panel-header h2 {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
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

  .node-cell {
    display: flex;
    align-items: center;
    gap: 8px;
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
