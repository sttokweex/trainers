/* eslint-disable */
// @ts-nocheck — перенесено из старого тренажёра как есть, типизируется по мере переписывания
/** Самописный SVG-движок графиков на провалидированной для тёмной темы палитре --s1..--s4. */
import { dEl } from './dom'
import { fmt } from './format'

const SVGNS = 'http://www.w3.org/2000/svg';
const PAL = ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)'];
function sv(tag, attrs){
  const n = document.createElementNS(SVGNS, tag);
  for (const k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
  return n;
}
/* прямоугольник со скруглением только на «конце данных» */
function barPath(x, y, w, h, r, dir){
  r = Math.max(0, Math.min(r, dir === 'h' ? w : h));
  if (w <= 0 || h <= 0) return '';
  if (dir === 'h') return `M${x},${y} H${x + w - r} a${r},${r} 0 0 1 ${r},${r} V${y + h - r} a${r},${r} 0 0 1 ${-r},${r} H${x} Z`;
  return `M${x},${y + r} a${r},${r} 0 0 1 ${r},${-r} H${x + w - r} a${r},${r} 0 0 1 ${r},${r} V${y + h} H${x} Z`;
}
function chartBox(parent){
  const box = dEl('div', 'chart');
  const tip = dEl('div', 'ct');
  parent.appendChild(box); box.appendChild(tip);
  const show = (html, x, y) => {
    tip.innerHTML = html; tip.classList.add('on');
    const bw = box.clientWidth, tw = tip.offsetWidth;
    tip.style.left = Math.max(0, Math.min(x - tw / 2, bw - tw)) + 'px';
    tip.style.top = Math.max(0, y - tip.offsetHeight - 10) + 'px';
  };
  const hide = () => tip.classList.remove('on');
  return { box, show, hide };
}
function legend(parent, items){
  const l = dEl('div', 'lgd');
  items.forEach(it => {
    const s = dEl('span', null, '<i style="background:' + it.color + '"></i>' + it.name);
    l.appendChild(s);
  });
  parent.appendChild(l);
  return l;
}
/* горизонтальные полосы: одна серия, подписи значений справа */
function barsH(parent, opts){
  const data = opts.data, fmtV = opts.fmt || (v => fmt(v));
  const w = 640, rowH = opts.rowH || 30, padL = opts.padL || 150, padR = 96, top = 6;
  const h = top + data.length * rowH + 8;
  const { box, show, hide } = chartBox(parent);
  const s = sv('svg', { viewBox: `0 0 ${w} ${h}`, role: 'img' });
  const max = Math.max(1, ...data.map(d => Math.abs(d.value)));
  const plot = w - padL - padR;
  data.forEach((d, i) => {
    const y = top + i * rowH, bh = Math.min(20, rowH - 10);
    const bw = Math.max(2, Math.abs(d.value) / max * plot);
    s.appendChild(sv('text', { x: padL - 10, y: y + bh / 2 + 4, 'text-anchor': 'end', class: 'axl' })).textContent = d.label;
    const p = sv('path', { d: barPath(padL, y, bw, bh, 4, 'h'), fill: d.color || PAL[0] });
    s.appendChild(p);
    const val = sv('text', { x: padL + bw + 8, y: y + bh / 2 + 4, class: 'vl' });
    val.textContent = fmtV(d.value);
    s.appendChild(val);
    const hit = sv('rect', { x: 0, y: y - 3, width: w, height: rowH, fill: 'transparent' });
    hit.addEventListener('mousemove', ev => {
      const r = box.getBoundingClientRect();
      show('<b>' + d.label + '</b><br>' + fmtV(d.value) + (d.note ? '<br><span class="k">' + d.note + '</span>' : ''),
        ev.clientX - r.left, ev.clientY - r.top);
    });
    hit.addEventListener('mouseleave', hide);
    s.appendChild(hit);
  });
  box.appendChild(s);
  return { box };
}
/* вертикальные столбцы; series: [{name,color,values:[]}], xLabels */
function barsV(parent, opts){
  const series = opts.series, xs = opts.xLabels, fmtV = opts.fmt || (v => fmt(v));
  if (series.length > 1) legend(parent, series.map((s, i) => ({ name: s.name, color: s.color || PAL[i] })));
  const w = 640, h = opts.h || 230, padL = 58, padB = 34, padT = 14, padR = 10;
  const { box, show, hide } = chartBox(parent);
  const s = sv('svg', { viewBox: `0 0 ${w} ${h}` });
  const all = series.flatMap(x => x.values);
  const max = opts.max || Math.max(1, ...all.map(Math.abs)) * 1.12;
  const plotH = h - padB - padT, plotW = w - padL - padR;
  const yOf = v => padT + plotH - (v / max) * plotH;
  for (let t = 0; t <= 4; t++){
    const v = max / 4 * t, y = yOf(v);
    s.appendChild(sv('line', { x1: padL, x2: w - padR, y1: y, y2: y, stroke: 'var(--grid)', 'stroke-width': 1 }));
    const lab = sv('text', { x: padL - 8, y: y + 3.5, 'text-anchor': 'end', class: 'ax' });
    lab.textContent = opts.tick ? opts.tick(v) : fmt(v);
    s.appendChild(lab);
  }
  const band = plotW / xs.length, gap = 2;
  const bw = Math.min(24, (band - 14) / series.length - gap);
  xs.forEach((lb, i) => {
    const x0 = padL + band * i + (band - (bw + gap) * series.length + gap) / 2;
    series.forEach((se, j) => {
      const v = se.values[i], x = x0 + j * (bw + gap), y = yOf(Math.max(0, v)), bh = Math.abs(yOf(v) - yOf(0));
      const p = sv('path', { d: barPath(x, y, bw, Math.max(2, bh), 4, 'v'), fill: se.color || PAL[j] });
      s.appendChild(p);
      const hit = sv('rect', { x: x - 3, y: padT, width: bw + 6, height: plotH, fill: 'transparent' });
      hit.addEventListener('mousemove', ev => {
        const r = box.getBoundingClientRect();
        show('<b>' + lb + '</b><br><span class="k">' + se.name + ':</span> ' + fmtV(v), ev.clientX - r.left, ev.clientY - r.top);
      });
      hit.addEventListener('mouseleave', hide);
      s.appendChild(hit);
    });
    const lab = sv('text', { x: padL + band * i + band / 2, y: h - padB + 16, 'text-anchor': 'middle', class: 'ax' });
    lab.textContent = lb;
    s.appendChild(lab);
  });
  s.appendChild(sv('line', { x1: padL, x2: w - padR, y1: yOf(0), y2: yOf(0), stroke: 'var(--bd2)', 'stroke-width': 1 }));
  box.appendChild(s);
  return { box };
}
/* линии с маркерами; series:[{name,color,values}] */
function lineC(parent, opts){
  const series = opts.series, xs = opts.xLabels, fmtV = opts.fmt || (v => fmt(v));
  if (series.length > 1) legend(parent, series.map((s, i) => ({ name: s.name, color: s.color || PAL[i] })));
  const w = 640, h = opts.h || 220, padL = 60, padB = 30, padT = 14, padR = 64;
  const { box, show, hide } = chartBox(parent);
  const s = sv('svg', { viewBox: `0 0 ${w} ${h}` });
  const all = series.flatMap(x => x.values).filter(v => v != null);
  const rawMax = Math.max(...all), rawMin = Math.min(0, ...all);
  const max = opts.max != null ? opts.max : rawMax * 1.1 || 1, min = opts.min != null ? opts.min : rawMin;
  const plotH = h - padB - padT, plotW = w - padL - padR;
  const yOf = v => padT + plotH - (v - min) / (max - min) * plotH;
  const xOf = i => padL + (xs.length === 1 ? plotW / 2 : plotW / (xs.length - 1) * i);
  for (let t = 0; t <= 4; t++){
    const v = min + (max - min) / 4 * t, y = yOf(v);
    s.appendChild(sv('line', { x1: padL, x2: w - padR, y1: y, y2: y, stroke: 'var(--grid)', 'stroke-width': 1 }));
    const lab = sv('text', { x: padL - 8, y: y + 3.5, 'text-anchor': 'end', class: 'ax' });
    lab.textContent = opts.tick ? opts.tick(v) : fmt(v);
    s.appendChild(lab);
  }
  xs.forEach((lb, i) => {
    const lab = sv('text', { x: xOf(i), y: h - padB + 16, 'text-anchor': 'middle', class: 'ax' });
    lab.textContent = lb;
    s.appendChild(lab);
  });
  /* подписи у конца линий: пропускаем те, что налезли бы друг на друга —
     идентичность всё равно несёт легенда */
  const labY = [];
  series.forEach((se, j) => {
    const col = se.color || PAL[j];
    const pts = se.values.map((v, i) => (v == null ? null : [xOf(i), yOf(v)])).filter(Boolean);
    if (se.dash) {
      s.appendChild(sv('path', { d: 'M' + pts.map(p => p.join(',')).join(' L'), fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-dasharray': '5 4', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    } else {
      s.appendChild(sv('path', { d: 'M' + pts.map(p => p.join(',')).join(' L'), fill: 'none', stroke: col, 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    }
    const last = pts[pts.length - 1];
    if (last && series.length <= 4 && !labY.some(y => Math.abs(y - last[1]) < 13)){
      labY.push(last[1]);
      const lab = sv('text', { x: last[0] + 10, y: last[1] + 4, class: 'vl' });
      lab.textContent = se.name;
      s.appendChild(lab);
    }
    se.values.forEach((v, i) => {
      if (v == null) return;
      s.appendChild(sv('circle', { cx: xOf(i), cy: yOf(v), r: 4.5, fill: col, stroke: 'var(--panel2)', 'stroke-width': 2 }));
    });
  });
  /* перекрестие: одна вертикаль на все серии */
  const cross = sv('line', { x1: 0, x2: 0, y1: padT, y2: padT + plotH, stroke: 'var(--bd2)', 'stroke-width': 1, opacity: 0 });
  s.appendChild(cross);
  const hit = sv('rect', { x: padL, y: padT, width: plotW, height: plotH, fill: 'transparent' });
  hit.addEventListener('mousemove', ev => {
    const r = box.getBoundingClientRect();
    const rel = (ev.clientX - r.left) / r.width * w;
    let i = Math.round((rel - padL) / (plotW / Math.max(1, xs.length - 1)));
    i = Math.max(0, Math.min(xs.length - 1, i));
    cross.setAttribute('x1', xOf(i)); cross.setAttribute('x2', xOf(i)); cross.setAttribute('opacity', 1);
    const rows = series.map(se => '<span class="k">' + se.name + ':</span> ' + (se.values[i] == null ? '—' : fmtV(se.values[i]))).join('<br>');
    show('<b>' + xs[i] + '</b><br>' + rows, ev.clientX - r.left, ev.clientY - r.top);
  });
  hit.addEventListener('mouseleave', () => { hide(); cross.setAttribute('opacity', 0) });
  s.appendChild(hit);
  box.appendChild(s);
  return { box };
}
/* одна составная полоса: part-to-whole, ≤6 сегментов, зазор 2px */
function stackRow(parent, opts){
  const segs = opts.segments, total = segs.reduce((a, b) => a + Math.abs(b.value), 0) || 1;
  const fmtV = opts.fmt || (v => fmt(v));
  const { box, show, hide } = chartBox(parent);
  const w = 640, h = opts.h || 34;
  const s = sv('svg', { viewBox: `0 0 ${w} ${h}` });
  let x = 0;
  segs.forEach((sg, i) => {
    const sw = Math.max(2, Math.abs(sg.value) / total * w - 2);
    const r = sv('rect', { x, y: 0, width: sw, height: h - 12, rx: 3, fill: sg.color || PAL[i % 4] });
    s.appendChild(r);
    if (sw > 46){
      const lab = sv('text', { x: x + sw / 2, y: h - 2, 'text-anchor': 'middle', class: 'ax' });
      lab.textContent = pct(Math.abs(sg.value) / total * 100, 0);
      s.appendChild(lab);
    }
    r.addEventListener('mousemove', ev => {
      const bb = box.getBoundingClientRect();
      show('<b>' + sg.name + '</b><br>' + fmtV(sg.value) + '<br><span class="k">доля ' + pct(Math.abs(sg.value) / total * 100, 1) + '</span>',
        ev.clientX - bb.left, ev.clientY - bb.top);
    });
    r.addEventListener('mouseleave', hide);
    x += sw + 2;
  });
  box.appendChild(s);
  legend(parent, segs.map((sg, i) => ({ name: sg.name, color: sg.color || PAL[i % 4] })));
  return { box };
}

export { SVGNS, PAL, sv, barPath, chartBox, legend, barsH, barsV, lineC, stackRow }
