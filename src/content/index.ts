import type { ContentPack } from '@/engine/types'

/** Подставляется сборкой: PACK=audit оставляет в бандле только один пак. */
declare const __ONLY_PACK__: string

const ALL_PACKS = [
  { id: 'interview', title: 'Собеседование' },
  { id: 'audit', title: 'Аудит' },
] as const

export type PackId = (typeof ALL_PACKS)[number]['id']

/**
 * Метаданные паков статичны, а сам контент грузится лениво: открывая тренажёр
 * по собеседованию, нет смысла тянуть полмегабайта аудита.
 */
export const PACK_META: readonly { id: PackId; title: string }[] =
  __ONLY_PACK__ ? ALL_PACKS.filter((p) => p.id === __ONLY_PACK__) : ALL_PACKS

export const DEFAULT_PACK: PackId = PACK_META[0]?.id ?? 'interview'

const isPackId = (id: string): id is PackId => PACK_META.some((p) => p.id === id)

const cache = new Map<PackId, Promise<ContentPack>>()

/**
 * Ветки с __ONLY_PACK__ написаны так, чтобы бандлер мог их свернуть: define
 * подставляет литерал, условие становится константой, и чужой пак вырезается
 * из сборки целиком. Иначе однофайловая версия для друга тащила бы и мой
 * контент по собеседованиям.
 */
function importPack(id: PackId): Promise<ContentPack> {
  if (__ONLY_PACK__ === 'audit') return import('./audit').then((m) => m.auditPack)
  if (__ONLY_PACK__ === 'interview') return import('./interview').then((m) => m.interviewPack)
  return id === 'audit'
    ? import('./audit').then((m) => m.auditPack)
    : import('./interview').then((m) => m.interviewPack)
}

export function loadPack(id: string): Promise<ContentPack> {
  const packId: PackId = isPackId(id) ? id : DEFAULT_PACK
  let promise = cache.get(packId)
  if (!promise) {
    promise = importPack(packId)
    cache.set(packId, promise)
  }
  return promise
}
