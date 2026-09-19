/* eslint-disable */
// @ts-nocheck — перенесено из старого тренажёра как есть, типизируется по мере переписывания
/** Форматирование чисел под финансовые данные: неразрывный пробел в разрядах, запятая как десятичный разделитель. */

const NB = ' ';
function fmt(v, dec){
  if (v == null || !isFinite(v)) return '—';
  dec = dec == null ? 0 : dec;
  const s = Math.abs(v).toFixed(dec).split('.');
  s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, NB);
  return (v < 0 ? '−' : '') + s.join(',');
}
const money = (v, dec) => fmt(v, dec == null ? 0 : dec) + NB + '₽';
const th = (v) => fmt(v / 1000, 0) + NB + 'тыс.';
const pct = (v, dec) => fmt(v, dec == null ? 1 : dec) + '%';
const num = (el) => { const v = parseFloat(String(el.value).replace(',', '.')); return isFinite(v) ? v : 0 };

export { NB, fmt, money, th, pct, num }
