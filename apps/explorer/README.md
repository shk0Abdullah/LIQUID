# Explorer (SvelteKit)

Minimal Etherscan-style explorer for this repo's `packages/node-api` (no fake data).

## What It Shows

- Nodes: `GET /network/state`
- Blocks: `GET /chain?nodeId=...`
- Transactions: derived from the blocks returned by `/chain`

The UI calls a same-origin proxy endpoint (`/api/*`) implemented in SvelteKit so you don't have to enable CORS in `node-api`.

## Run It

1. Start the Node API (defaults to port 3000):

```bash
bun run dev --filter @liquid/node-api
```

2. Start the explorer (defaults to port 5173):

```bash
bun run dev --filter @apps/explorer
```

## Configure Node API URL

The proxy defaults to `http://localhost:3000`.

Override with:

- `NODE_API_URL=http://localhost:3000`

