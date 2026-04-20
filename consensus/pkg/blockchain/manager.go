package blockchain

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"

	"consensus/pkg/types"
)

type Manager struct {
	Chain *types.Blockchain
}

func NewManager() *Manager {
	return &Manager{
		Chain: types.NewBlockchain(),
	}
}

func (m *Manager) AddBlock(transactions []types.Transaction) error {
	lastBlock := m.Chain.Blocks[len(m.Chain.Blocks)-1]
	newBlock := types.NewBlock(lastBlock.Hash, transactions, m.GetDifficulty())

	hash := CalculateHash(newBlock)
	newBlock.Hash = hash

	m.Chain.Blocks = append(m.Chain.Blocks, newBlock)
	return nil
}

func (m *Manager) GetDifficulty() int {
	if len(m.Chain.Blocks) < 10 {
		return 1
	}
	return 2
}

func (m *Manager) GetLastBlock() *types.Block {
	if len(m.Chain.Blocks) == 0 {
		return nil
	}
	return m.Chain.Blocks[len(m.Chain.Blocks)-1]
}

func CalculateHash(block *types.Block) string {
	record := fmt.Sprintf("%d%s%s%d%d",
		block.Index,
		block.PrevHash,
		block.Transactions,
		block.Nonce,
		block.Difficulty,
	)
	h := sha256.New()
	h.Write([]byte(record))
	hashed := h.Sum(nil)
	return hex.EncodeToString(hashed)
}

func IsValidHash(hash string, difficulty int) bool {
	prefix := strings.Repeat("0", difficulty)
	return strings.HasPrefix(hash, prefix)
}
