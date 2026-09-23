import type { ContentPack } from '@/engine/types'

export type PackId = 'interview'
export const DEFAULT_PACK: PackId = 'interview'
export const PACK_META = [{ id: 'interview', title: 'Собеседование' }] as const

const cache = new Map<PackId, Promise<ContentPack>>()

export function loadPack(_id: string): Promise<ContentPack> {
  let promise = cache.get(DEFAULT_PACK)
  if (!promise) {
    promise = import('./interview').then((module) => module.interviewPack)
    cache.set(DEFAULT_PACK, promise)
  }
  return promise
}
