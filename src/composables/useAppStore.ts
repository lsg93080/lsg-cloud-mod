import { useStore } from 'vuex'
import { key } from '@/store'
import type { State } from '@/store'

export function useAppStore() {
  return useStore<State>(key)
}
