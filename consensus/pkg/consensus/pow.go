package consensus

import (
	"consensus/pkg/blockchain"
	"consensus/pkg/types"
)

type Engine interface {
	ValidateBlock(block *types.Block, prevBlock *types.Block) bool
	MineBlock(block *types.Block, cancel chan struct{}) (*types.Block, error)
	GetDifficulty(prevBlock *types.Block) int
}

type ProofOfWork struct {
	manager *blockchain.Manager
}

func NewProofOfWork(manager *blockchain.Manager) *ProofOfWork {
	return &ProofOfWork{
		manager: manager,
	}
}

func (pow *ProofOfWork) ValidateBlock(block *types.Block, prevBlock *types.Block) bool {
	hash := blockchain.CalculateHash(block)
	return blockchain.IsValidHash(hash, block.Difficulty)
}

func (pow *ProofOfWork) MineBlock(block *types.Block, cancel chan struct{}) (*types.Block, error) {
	for {
		select {
		case <-cancel:
			return nil, nil
		default:
			hash := blockchain.CalculateHash(block)
			if blockchain.IsValidHash(hash, block.Difficulty) {
				block.Hash = hash
				return block, nil
			}
			block.Nonce++
		}
	}
}

func (pow *ProofOfWork) GetDifficulty(prevBlock *types.Block) int {
	return pow.manager.GetDifficulty()
}
