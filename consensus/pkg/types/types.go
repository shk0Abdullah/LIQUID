package types

import (
	"time"
)

type Block struct {
	Index        int64         `json:"index"`
	Timestamp    int64         `json:"timestamp"`
	PrevHash     string        `json:"prev_hash"`
	Hash         string        `json:"hash"`
	Transactions []Transaction `json:"transactions"`
	Nonce        int64         `json:"nonce"`
	Difficulty   int           `json:"difficulty"`
}

type Transaction struct {
	ID        string `json:"id"`
	From      string `json:"from"`
	To        string `json:"to"`
	Amount    int64  `json:"amount"`
	Timestamp int64  `json:"timestamp"`
	Signature string `json:"signature,omitempty"`
}

type Blockchain struct {
	Blocks []*Block `json:"blocks"`
}

func NewBlock(prevHash string, transactions []Transaction, difficulty int) *Block {
	return &Block{
		Timestamp:    time.Now().Unix(),
		PrevHash:     prevHash,
		Transactions: transactions,
		Difficulty:   difficulty,
		Nonce:        0,
	}
}

func NewTransaction(from, to string, amount int64) *Transaction {
	return &Transaction{
		ID:        "", // TODO: Generate proper ID
		From:      from,
		To:        to,
		Amount:    amount,
		Timestamp: time.Now().Unix(),
	}
}

func NewBlockchain() *Blockchain {
	genesisBlock := NewBlock("", []Transaction{}, 1)
	return &Blockchain{
		Blocks: []*Block{genesisBlock},
	}
}
