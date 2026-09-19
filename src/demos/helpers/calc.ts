/* eslint-disable */
// @ts-nocheck — перенесено из старого тренажёра как есть, типизируется по мере переписывания
/** Каркас калькулятора и живой пересчёт по любому изменению поля. */
import { dEl, dShell } from './dom'

function calcShell(root, title, intro){
  const body = dShell(root, title);
  if (intro) body.appendChild(dEl('div', 'demo-note', intro));
  const form = dEl('div'), out = dEl('div');
  body.appendChild(form); body.appendChild(out);
  return { body, form, out };
}
function bindAll(scope, fn){
  scope.querySelectorAll('input,select').forEach(i => { i.oninput = fn; i.onchange = fn });
  fn();
}

export { calcShell, bindAll }
