# Consensus Blockchain

A simple blockchain implementation in Go with monorepo architecture.

## Project Structure

```
consensus/
├── cmd/node/         # Main node application
├── pkg/
│   ├── blockchain/   # Core blockchain logic
│   ├── consensus/    # Consensus algorithms (PoW)
│   ├── crypto/       # Cryptographic utilities
│   ├── ledger/       # Account balance tracking
│   ├── network/      # P2P networking
│   └── types/        # Core data structures
├── internal/         # Internal packages
├── scripts/          # Build and utility scripts
├── go.mod           # Go module file
└── Makefile         # Build automation
```

## Quick Start

### Build

```bash
make build
```

### Run a Node

```bash
# Standard node
make run

# Miner node
make run-miner

# With custom options
go run ./cmd/node -port 8080 -miner
```

### Commands

- `-port`: Node port (default: 8080)
- `-peer`: Bootstrap peer address
- `-miner`: Enable mining mode
- `-version`: Show version

## Architecture

This monorepo uses Go modules with package-based organization:

- **cmd/**: Application entry points
- **pkg/**: Public library code
- **internal/**: Private application code

All packages are part of the `consensus` module and can import each other directly.

## Features

- Proof of Work consensus
- P2P networking
- Transaction ledger
- Cryptographic key management
- Modular architecture

## Development

```bash
# Run tests
make test

# Clean build artifacts
make clean
```
