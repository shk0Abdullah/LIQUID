package main

import (
	"flag"
	"fmt"
	"os"
)

func main() {
	var (
		port    = flag.Int("port", 8080, "Node port")
		peer    = flag.String("peer", "", "Bootstrap peer address")
		miner   = flag.Bool("miner", false, "Enable mining")
		version = flag.Bool("version", false, "Show version")
	)
	flag.Parse()

	if *version {
		fmt.Println("Consensus Blockchain v0.1.0")
		os.Exit(0)
	}

	fmt.Printf("Starting Consensus node on port %d...\n", *port)

	if *miner {
		fmt.Println("Mining enabled")
	}

	if *peer != "" {
		fmt.Printf("Connecting to bootstrap peer: %s\n", *peer)
	}

	select {}
}
