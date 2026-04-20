package ledger

import (
	"sync"
)

type Ledger struct {
	balances map[string]int64
	mutex    sync.RWMutex
}

func NewLedger() *Ledger {
	return &Ledger{
		balances: make(map[string]int64),
	}
}

func (l *Ledger) GetBalance(address string) int64 {
	l.mutex.RLock()
	defer l.mutex.RUnlock()
	return l.balances[address]
}

func (l *Ledger) UpdateBalance(address string, amount int64) {
	l.mutex.Lock()
	defer l.mutex.Unlock()
	l.balances[address] += amount
}

func (l *Ledger) Transfer(from, to string, amount int64) bool {
	l.mutex.Lock()
	defer l.mutex.Unlock()

	if l.balances[from] < amount {
		return false
	}

	l.balances[from] -= amount
	l.balances[to] += amount
	return true
}
