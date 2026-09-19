/* eslint-disable */
// @ts-nocheck — перенесено из старого тренажёра как есть, типизируется по мере переписывания
/** Конструкторы упражнений: сортировка по корзинам, сопоставление пар, пошаговый разбор, дерево решений. */
import { dEl, dBtn, dShell } from './dom'

/* Классификация: разложить утверждения по корзинам */
function mkSort(root, title, cfg){
  const body = dShell(root, title);
  if (cfg.intro) body.appendChild(dEl('div', 'demo-note', cfg.intro));
  const picks = {}, nodes = [];
  cfg.items.forEach((it, i) => {
    const box = dEl('div', 'sort-it');
    box.appendChild(dEl('div', 'sort-q', it.q));
    const bar = dEl('div', 'sort-b');
    const btns = {};
    cfg.bins.forEach(b => {
      const btn = dEl('button', null, b.label);
      btn.type = 'button';
      btn.onclick = () => {
        picks[i] = b.id;
        Object.values(btns).forEach(x => x.classList.remove('pick'));
        btn.classList.add('pick');
      };
      btns[b.id] = btn;
      bar.appendChild(btn);
    });
    box.appendChild(bar);
    const why = dEl('div', 'why');
    why.style.display = 'none';
    box.appendChild(why);
    nodes.push({ box, why, it });
    body.appendChild(box);
  });
  const ctl = dEl('div', 'demo-ctl');
  const score = dEl('span', 'demo-note');
  score.style.margin = '0';
  ctl.appendChild(dBtn('Проверить', 'pri', () => {
    let ok = 0;
    nodes.forEach((n, i) => {
      const right = picks[i] === n.it.bin;
      if (right) ok++;
      n.box.className = 'sort-it ' + (picks[i] == null ? '' : (right ? 'ok' : 'no'));
      const binName = (cfg.bins.find(b => b.id === n.it.bin) || {}).label;
      n.why.innerHTML = '<b>' + binName + '</b> — ' + n.it.why;
      n.why.style.display = '';
    });
    score.innerHTML = 'Верно <b>' + ok + '</b> из ' + nodes.length;
  }));
  ctl.appendChild(dBtn('Сброс', 'sm', () => {
    nodes.forEach((n, i) => { delete picks[i]; n.box.className = 'sort-it'; n.why.style.display = 'none';
      n.box.querySelectorAll('.sort-b button').forEach(b => b.classList.remove('pick')) });
    score.innerHTML = '';
  }));
  ctl.appendChild(score);
  body.appendChild(ctl);
}

/* Сопоставление пар: клик слева, затем справа */
function mkMatch(root, title, cfg){
  const body = dShell(root, title);
  if (cfg.intro) body.appendChild(dEl('div', 'demo-note', cfg.intro));
  const grid = dEl('div', 'mt');
  const colL = dEl('div', 'mt-col'), colR = dEl('div', 'mt-col');
  grid.appendChild(colL); grid.appendChild(colR);
  const order = cfg.pairs.map((_, i) => i);
  const shuffled = order.slice().sort(() => Math.random() - 0.5);
  let sel = null, done = 0;
  const msg = dEl('div', 'demo-note');
  const lNodes = {}, rNodes = {};
  cfg.pairs.forEach((p, i) => {
    const n = dEl('div', 'mt-i', p.l);
    n.onclick = () => {
      if (n.classList.contains('ok')) return;
      Object.values(lNodes).forEach(x => x.classList.remove('sel'));
      n.classList.add('sel'); sel = i;
    };
    lNodes[i] = n; colL.appendChild(n);
  });
  shuffled.forEach(i => {
    const p = cfg.pairs[i];
    const n = dEl('div', 'mt-i', p.r);
    n.onclick = () => {
      if (n.classList.contains('ok') || sel == null) return;
      if (sel === i){
        n.classList.add('ok'); lNodes[sel].classList.add('ok'); lNodes[sel].classList.remove('sel');
        if (p.note) n.appendChild(dEl('span', 'tag', p.note));
        done++; sel = null;
        msg.innerHTML = 'Сопоставлено <b>' + done + '</b> из ' + cfg.pairs.length + (done === cfg.pairs.length ? ' — готово' : '');
      } else {
        n.classList.add('no');
        setTimeout(() => n.classList.remove('no'), 450);
        msg.innerHTML = 'Не та пара — посмотрите ещё раз на предпосылку, которую закрывает процедура';
      }
    };
    rNodes[i] = n; colR.appendChild(n);
  });
  body.appendChild(grid);
  body.appendChild(msg);
}

/* Дерево решений */
function mkTree(root, title, cfg){
  const body = dShell(root, title);
  const zone = dEl('div', 'tree');
  body.appendChild(zone);
  function ask(key){
    const node = cfg.nodes[key];
    if (!node) return;
    if (node.out){
      const o = dEl('div', 'tree-out ' + (node.cls || 'ok'), '<b>' + node.out + '</b>' + node.text);
      zone.appendChild(o);
      const ctl = dEl('div', 'demo-ctl');
      ctl.appendChild(dBtn('Пройти заново', 'sm', () => { zone.innerHTML = ''; ask(cfg.start) }));
      zone.appendChild(ctl);
      return;
    }
    const q = dEl('div', 'tree-q');
    q.appendChild(dEl('div', 'qq', node.q));
    const bar = dEl('div', 'sort-b');
    node.opts.forEach(o => {
      const b = dEl('button', null, o.t);
      b.type = 'button';
      b.onclick = () => {
        bar.querySelectorAll('button').forEach(x => { x.disabled = true; x.style.opacity = .5 });
        b.classList.add('pick'); b.style.opacity = 1;
        ask(o.go);
      };
      bar.appendChild(b);
    });
    q.appendChild(bar);
    zone.appendChild(q);
  }
  ask(cfg.start);
}

/* Пошаговый разбор: шаги с пояснением и произвольным рендером панели */
function mkSteps(root, title, cfg){
  const body = dShell(root, title);
  const panel = dEl('div');
  const note = dEl('div', 'demo-note');
  const ctl = dEl('div', 'demo-ctl');
  let i = 0;
  const prev = dBtn('← Назад', 'sm', () => { i = Math.max(0, i - 1); draw() });
  const next = dBtn('Дальше →', 'pri', () => { i = Math.min(cfg.steps.length - 1, i + 1); draw() });
  const pos = dEl('span', 'demo-note');
  pos.style.margin = '0';
  ctl.appendChild(prev); ctl.appendChild(next);
  ctl.appendChild(dBtn('В начало', 'sm', () => { i = 0; draw() }));
  ctl.appendChild(pos);
  function draw(){
    panel.innerHTML = '';
    const s = cfg.steps[i];
    cfg.render(panel, s, i);
    note.innerHTML = s.note || '';
    pos.innerHTML = 'шаг <b>' + (i + 1) + '</b> / ' + cfg.steps.length;
    prev.disabled = i === 0;
    next.disabled = i === cfg.steps.length - 1;
  }
  body.appendChild(panel); body.appendChild(ctl); body.appendChild(note);
  draw();
}

export { mkSort, mkMatch, mkTree, mkSteps }
