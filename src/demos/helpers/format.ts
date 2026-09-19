/**
 * Форматирование чисел под финансовые данные: неразрывный пробел в разрядах,
 * запятая как десятичный разделитель, юникодный минус.
 */

/** Неразрывный пробел — разряды не должны разрываться переносом строки. */
export const NB = ' '

export function fmt(value: number | null | undefined, dec = 0): string {
  if (value == null || !isFinite(value)) return '—'
  const parts = Math.abs(value).toFixed(dec).split('.')
  parts[0] = (parts[0] as string).replace(/\B(?=(\d{3})+(?!\d))/g, NB)
  return (value < 0 ? '−' : '') + parts.join(',')
}

export const money = (value: number | null | undefined, dec = 0): string =>
  fmt(value, dec) + NB + '₽'

/** Тысячи — для осей графиков, где полные суммы не помещаются. */
export const th = (value: number): string => fmt(value / 1000, 0) + NB + 'тыс.'

export const pct = (value: number | null | undefined, dec = 1): string => fmt(value, dec) + '%'

/** Читает число из поля ввода, терпя запятую вместо точки. */
export const num = (el: HTMLInputElement | HTMLSelectElement): number => {
  const v = parseFloat(String(el.value).replace(',', '.'))
  return isFinite(v) ? v : 0
}
