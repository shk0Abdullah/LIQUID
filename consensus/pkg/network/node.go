package network

import (
	"encoding/json"
	"fmt"
	"net"
	"sync"
)

type Node struct {
	address string
	peers   map[string]net.Conn
	mutex   sync.RWMutex
}

func NewNode(address string) *Node {
	return &Node{
		address: address,
		peers:   make(map[string]net.Conn),
	}
}

func (n *Node) Start() error {
	listener, err := net.Listen("tcp", n.address)
	if err != nil {
		return fmt.Errorf("failed to start node: %w", err)
	}
	defer listener.Close()

	fmt.Printf("Node listening on %s\n", n.address)

	for {
		conn, err := listener.Accept()
		if err != nil {
			continue
		}
		go n.handleConnection(conn)
	}
}

func (n *Node) Connect(address string) error {
	conn, err := net.Dial("tcp", address)
	if err != nil {
		return fmt.Errorf("failed to connect to %s: %w", address, err)
	}

	n.mutex.Lock()
	n.peers[address] = conn
	n.mutex.Unlock()

	go n.handleConnection(conn)
	return nil
}

func (n *Node) Broadcast(data interface{}) error {
	n.mutex.RLock()
	defer n.mutex.RUnlock()

	message, err := json.Marshal(data)
	if err != nil {
		return err
	}

	for addr, conn := range n.peers {
		_, err := conn.Write(message)
		if err != nil {
			fmt.Printf("Failed to send to %s: %v\n", addr, err)
		}
	}
	return nil
}

func (n *Node) handleConnection(conn net.Conn) {
	defer conn.Close()
	decoder := json.NewDecoder(conn)

	for {
		var message map[string]interface{}
		if err := decoder.Decode(&message); err != nil {
			break
		}
		n.handleMessage(message)
	}
}

func (n *Node) handleMessage(message map[string]interface{}) {
	fmt.Printf("Received message: %+v\n", message)
}
