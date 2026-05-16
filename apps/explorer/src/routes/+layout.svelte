<script lang="ts">
  import { page } from '$app/stores';
  
  const nav = [
    { href: "/", label: "Overview", icon: "◈" },
    { href: "/blocks", label: "Blocks", icon: "◫" },
    { href: "/transactions", label: "Transactions", icon: "◯" },
    { href: "/nodes", label: "Nodes", icon: "◧" },
  ];
  
  $: currentPath = $page.url.pathname;
</script>

<div class="app">
  <aside class="sidebar">
    <div class="brand">
      <div class="logo">◈</div>
      <div class="brand-text">
        <span class="brand-title">Liquid</span>
        <span class="brand-sub">Blockchain Explorer</span>
      </div>
    </div>
    
    <nav class="nav">
      {#each nav as item}
        <a 
          class="nav-link" 
          class:active={currentPath === item.href}
          href={item.href}
        >
          <span class="nav-icon">{item.icon}</span>
          <span class="nav-label">{item.label}</span>
        </a>
      {/each}
    </nav>
    
    <div class="sidebar-footer">
      <div class="status">
        <span class="status-dot"></span>
        <span class="status-text">Connected</span>
      </div>
    </div>
  </aside>
  
  <main class="main">
    <header class="header">
      <div class="search">
        <input type="text" placeholder="Search block, tx, address..." />
      </div>
      <div class="header-meta">
        <span class="version">v1.0</span>
      </div>
    </header>
    
    <div class="content">
      <slot />
    </div>
  </main>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(:root) {
    --bg-primary: #0a0a0a;
    --bg-secondary: #141414;
    --bg-tertiary: #1a1a1a;
    --bg-hover: #1f1f1f;
    
    --text-primary: #fafafa;
    --text-secondary: #a3a3a3;
    --text-muted: #525252;
    
    --accent: #3b82f6;
    --accent-hover: #2563eb;
    
    --border: #262626;
    --border-light: #404040;
    
    --success: #22c55e;
    --warning: #f59e0b;
    
    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'SF Mono', Monaco, monospace;
    
    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
  }

  :global(body) {
    font-family: var(--font-sans);
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 13px;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  :global(a) {
    color: inherit;
    text-decoration: none;
  }

  .app {
    display: flex;
    min-height: 100vh;
  }

  .sidebar {
    width: 200px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
  }

  .brand {
    padding: 16px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo {
    width: 28px;
    height: 28px;
    background: var(--accent);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: white;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .brand-sub {
    font-size: 10px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .nav {
    flex: 1;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    font-size: 12px;
    transition: all 0.15s;
  }

  .nav-link:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .nav-link.active {
    background: var(--accent);
    color: white;
  }

  .nav-icon {
    font-size: 11px;
    width: 16px;
    text-align: center;
  }

  .nav-label {
    font-weight: 500;
  }

  .sidebar-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--border);
  }

  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--text-muted);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--success);
  }

  .main {
    flex: 1;
    margin-left: 200px;
    display: flex;
    flex-direction: column;
  }

  .header {
    height: 56px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .search {
    flex: 1;
    max-width: 400px;
  }

  .search input {
    width: 100%;
    padding: 8px 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 12px;
    outline: none;
    transition: border-color 0.15s;
  }

  .search input:focus {
    border-color: var(--accent);
  }

  .search input::placeholder {
    color: var(--text-muted);
  }

  .header-meta {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .version {
    font-size: 11px;
    color: var(--text-muted);
    padding: 4px 8px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-sm);
  }

  .content {
    flex: 1;
    padding: 20px;
    max-width: 1400px;
  }

  @media (max-width: 768px) {
    .sidebar {
      width: 60px;
    }

    .brand-text,
    .nav-label,
    .status-text {
      display: none;
    }

    .main {
      margin-left: 60px;
    }

    .nav-link {
      justify-content: center;
      padding: 12px;
    }

    .nav-icon {
      width: auto;
    }
  }
</style>
