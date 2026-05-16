import { apiGet } from './client'
import type { NetworkState } from '@/types'

export function getNetworkState(): Promise<NetworkState> {
  return apiGet<NetworkState>('network/state')
}
