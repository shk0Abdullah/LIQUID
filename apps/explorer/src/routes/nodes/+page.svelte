<script lang="ts">
  export let data: { nodes: any[] };
</script>

<section class="card">
  <header class="head">
    <h1>Nodes</h1>
    <div class="meta">{data.nodes.length} total</div>
  </header>

  <div class="tableWrap">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Address</th>
          <th>Peers</th>
          <th>Chain</th>
          <th>Mempool</th>
          <th>Difficulty</th>
          <th>Max Tx/Block</th>
        </tr>
      </thead>
      <tbody>
        {#each data.nodes as n}
          <tr>
            <td class="mono">{n.id}</td>
            <td class="mono">{n.address}</td>
            <td class="mono">{(n.peers ?? []).length}</td>
            <td class="mono">{n.chainLength}</td>
            <td class="mono">{n.pendingTxCount}</td>
            <td class="mono">{n.difficulty}</td>
            <td class="mono">{n.maxTransactionsPerBlock}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
  .mono {
    font-family: var(--mono);
  }
  .card {
    border-radius: var(--radius);
    background: var(--panel);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    overflow: hidden;
  }
  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    padding: 14px 16px;
    background: linear-gradient(90deg, rgba(13, 43, 82, 0.07), transparent);
    border-bottom: 1px solid var(--border);
  }
  h1 {
    margin: 0;
    font-size: 18px;
    letter-spacing: -0.2px;
  }
  .meta {
    color: var(--muted);
    font-size: 13px;
  }
  .tableWrap {
    overflow: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  th,
  td {
    text-align: left;
    padding: 10px 12px;
    border-bottom: 1px solid rgba(13, 43, 82, 0.08);
    white-space: nowrap;
  }
  th {
    color: var(--steel);
    font-weight: 800;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.6px;
  }
</style>

