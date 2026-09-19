/* eslint-disable */
// @ts-nocheck — перенесено из старого тренажёра как есть, типизируется по мере переписывания
/** Императивные DOM-хелперы, которыми пользуются все перенесённые демо. */
import { fmt, money, num, pct } from './format'

function dEl(tag, cls, html){ const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n }
function dBtn(label, cls, onClick){ const b = dEl('button', 'demo-b' + (cls ? ' ' + cls : ''), label); b.type = 'button'; b.onclick = onClick; return b }
function dShell(root, title){ root.classList.add('demo'); root.appendChild(dEl('div', 'demo-t', title)); const b = dEl('div'); root.appendChild(b); return b }
/* поле ввода: возвращает сам input, чтобы дальше читать значение */
function dField(parent, label, value, opts){
  opts = opts || {};
  const row = dEl('div', 'fld');
  row.appendChild(dEl('label', null, label));
  const inp = document.createElement('input');
  inp.type = opts.type || 'number';
  inp.value = value;
  if (opts.step) inp.step = opts.step;
  if (opts.min != null) inp.min = opts.min;
  if (opts.max != null) inp.max = opts.max;
  row.appendChild(inp);
  if (opts.unit) row.appendChild(dEl('span', 'u', opts.unit));
  parent.appendChild(row);
  return inp;
}
function dSelect(parent, label, options, value){
  const row = dEl('div', 'fld');
  row.appendChild(dEl('label', null, label));
  const sel = document.createElement('select');
  options.forEach(o => {
    const op = document.createElement('option');
    op.value = o.v != null ? o.v : o;
    op.textContent = o.t != null ? o.t : o;
    sel.appendChild(op);
  });
  if (value != null) sel.value = value;
  row.appendChild(sel);
  parent.appendChild(row);
  return sel;
}
function dRange(parent, label, value, min, max, step, render){
  const row = dEl('div', 'fld');
  row.appendChild(dEl('label', null, label));
  const inp = document.createElement('input');
  inp.type = 'range'; inp.min = min; inp.max = max; inp.step = step; inp.value = value;
  const out = dEl('span', 'rv', render ? render(value) : value);
  inp.addEventListener('input', () => { out.textContent = render ? render(+inp.value) : inp.value });
  row.appendChild(inp); row.appendChild(out);
  parent.appendChild(row);
  return inp;
}
function kpi(parent, label, value, hint, cls){
  const k = dEl('div', 'kpi' + (cls ? ' ' + cls : ''));
  k.appendChild(dEl('div', 'l', label));
  const v = dEl('div', 'v', value); k.appendChild(v);
  const h = dEl('div', 'h', hint || ''); k.appendChild(h);
  parent.appendChild(k);
  return { set(val, hnt, c){ v.innerHTML = val; if (hnt != null) h.innerHTML = hnt; if (c) k.className = 'kpi ' + c }, node:k };
}

export { dEl, dBtn, dShell, dField, dSelect, dRange, kpi }
