<script lang="ts">
  import { page } from '$app/stores';
  
  const nav = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/blocks", label: "Blocks", icon: "📦" },
    { href: "/transactions", label: "Transactions", icon: "💸" },
    { href: "/nodes", label: "Nodes", icon: "🖥️" },
  ];
  
  $: currentPath = $page.url.pathname;
</script>

<div class="app">
  <nav class="sidebar">
    <div class="brand">
      <div class="logo">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" fill="url(#gradient)" stroke="#6366f1" stroke-width="1.5"/>
          <path d="M16 8V24M16 8L22 12M16 8L10 12" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/>
          <defs>
            <linearGradient id="gradient" x1="4" y1="16" x2="28" y2="16" gradientUnits="userSpaceOnUse">
              <stop stop-color="#1e3a8a" stop-opacity="0.8"/>
              <stop offset="1" stop-color="#312e81" stop-opacity="0.8"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="brand-text">
        <span class="brand-name">Liquid</span>
        <span class="brand-sub">Explorer</span>
      </div>
    </div>
    
    <div class="nav-links">
      {#each nav as item}
        <a 
          class="nav-item" 
          href={item.href} 
          class:active={currentPath === item.href}
          data-sveltekit-preload-data="hover"
        >
          <span class="nav-icon">{item.icon}</span>
          <span class="nav-label">{item.label}</span>
        </a>
      {/each}
    </div>
    
    <div class="sidebar-footer">
      <div class="network-badge">
        <span class="status-dot online"></span>
        <span class="network-name">Local Network</span>
      </div>
    </div>
  </nav>
  
  <main class="main">
    <header class="top-header">
      <div class="search-bar">
        <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
        </svg>
        <input type="text" placeholder="Search by Block / Tx / Address..." />
      </div>
      <div class="header-actions">
        <button class="icon-btn">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
          </svg>
        </button>
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
    /* Etherscan Dark Navy Theme */
    --navy-900: #0f172a;
    --navy-800: #1e293b;
    --navy-700: #334155;
    --navy-600: #475569;
    --navy-500: #64748b;
    
    --accent-blue: #3b82f6;
    --accent-indigo: #6366f1;
    --accent-cyan: #06b6d4;
    
    --offwhite: #f8fafc;
    --offwhite-2: #e2e8f0;
    --offwhite-3: #cbd5e1;
    
    --success: #10b981;
    --warning: #f59e0b;
    --error: #ef4444;
    
    --bg-primary: var(--navy-900);
    --bg-secondary: var(--navy-800);
    --bg-tertiary: var(--navy-700);
    --bg-hover: rgba(99, 102, 241, 0.1);
    
    --text-primary: var(--offwhite);
    --text-secondary: var(--offwhite-2);
    --text-muted: var(--offwhite-3);
    
    --border-color: var(--navy-700);
    --border-light: var(--navy-600);
    
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
    
    --mono: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
  
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  
  .app {
    display: flex;
    min-height: 100vh;
  }
  
  .sidebar {
    width: 260px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    z-index: 100;
  }
  
  .brand {
    padding: 24px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid var(--border-color);
  }
  
  .logo {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }
  
  .logo svg {
    width: 100%;
    height: 100%;
  }
  
  .brand-text {
    display: flex;
    flex-direction: column;
  }
  
  .brand-name {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.3px;
  }
  
  .brand-sub {
    font-size: 12px;
    color: var(--text-muted);
    font-weight: 500;
  }
  
  .nav-links {
    flex: 1;
    padding: 16px 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    font-size: 14px;
    transition: all 0.2s ease;
  }
  
  .nav-item:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
  
  .nav-item.active {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1));
    color: var(--accent-cyan);
    border: 1px solid rgba(99, 102, 241, 0.2);
  }
  
  .nav-icon {
    font-size: 18px;
    width: 24px;
    text-align: center;
  }
  
  .sidebar-footer {
    padding: 16px;
    border-top: 1px solid var(--border-color);
  }
  
  .network-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 500;
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 8px var(--success);
  }
  
  .main {
    flex: 1;
    margin-left: 260px;
    display: flex;
    flex-direction: column;
  }
  
  .top-header {
    height: 72px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  
  .search-bar {
    flex: 1;
    max-width: 600px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    transition: all 0.2s;
  }
  
  .search-bar:focus-within {
    border-color: var(--accent-indigo);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  .search-icon {
    width: 18px;
    height: 18px;
    color: var(--text-muted);
    flex-shrink: 0;
  }
  
  .search-bar input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: 14px;
    font-family: inherit;
  }
  
  .search-bar input::placeholder {
    color: var(--text-muted);
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .icon-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .icon-btn:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border-color: var(--border-light);
  }
  
  .icon-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .content {
    flex: 1;
    padding: 32px;
    max-width: 1400px;
  }
  
  @media (max-width: 1024px) {
    .sidebar {
      width: 72px;
    }
    
    .main {
      margin-left: 72px;
    }
    
    .brand-text,
    .nav-label,
    .network-name {
      display: none;
    }
    
    .nav-links {
      align-items: center;
      padding: 16px 8px;
    }
    
    .nav-item {
      justify-content: center;
      padding: 14px;
    }
    
    .nav-icon {
      width: auto;
    }
    
    .logo {
      width: 36px;
      height: 36px;
    }
    
    .brand {
      justify-content: center;
      padding: 20px 8px;
    }
    
    .network-badge {
      justify-content: center;
      padding: 12px;
    }
    
    .top-header {
      padding: 0 20px;
    }
    
    .content {
      padding: 20px;
    }
  }
</style>
