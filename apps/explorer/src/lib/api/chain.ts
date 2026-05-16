import { apiGet } from './client'
import { getNetworkState } from './network'
import type { ChainResponse, Block, TxRow } from '@/types'

export interface BlockLookup {
  block: Block
  totalBlocks: number
  nodeId: string
  prevBlock: Block | null
  nextBlock: Block | null
}

export async function getBlock(nodeId: string, index: number): Promise<BlockLookup | null> {
  const { chain } = await getChain(nodeId)
  const blockIdx = chain.findIndex((b) => b.index === index)
  if (blockIdx === -1) return null
  return {
    block: chain[blockIdx],
    totalBlocks: chain.length,
    nodeId,
    prevBlock: blockIdx > 0 ? chain[blockIdx - 1] : null,
    nextBlock: blockIdx < chain.length - 1 ? chain[blockIdx + 1] : null,
  }
}

export function getChain(nodeId: string): Promise<ChainResponse> {
  return apiGet<ChainResponse>('chain', { nodeId })
}

export interface TransactionLookup {
  transaction: TxRow
  block: Block
  totalBlocks: number
  nodeId: string
  txIndex: number
}

export async function getTransaction(hash: string): Promise<TransactionLookup | null> {
  let nodeIds: string[]
  try {
    const state = await getNetworkState()
    nodeIds = state.nodes.map((n) => n.id)
  } catch {
    nodeIds = ['node-1']
  }

  const results = await Promise.allSettled(
    nodeIds.map(async (nodeId) => {
      const { chain } = await getChain(nodeId)
      for (const block of chain) {
        const txIndex = block.transactions.findIndex((t) => t.id === hash)
        if (txIndex !== -1) {
          const tx = block.transactions[txIndex]
          return {
            transaction: { ...tx, blockIndex: block.index, blockHash: block.hash },
            block,
            totalBlocks: chain.length,
            nodeId,
            txIndex,
          } satisfies TransactionLookup
        }
      }
      return null
    }),
  )

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value !== null) {
      return result.value
    }
  }

  return null
}
