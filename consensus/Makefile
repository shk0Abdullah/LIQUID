BINARY_NAME=consensus
BUILD_DIR=build

build:
	go build -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/node

run:
	go run ./cmd/node -port 8080

run-miner:
	go run ./cmd/node -port 8081 -miner

test:
	go test -v ./...

clean:
	rm -rf $(BUILD_DIR)

.PHONY: build run test clean run-miner
