import type { LegacyDemo } from '@/engine/types'

export const frameworkReactivityLab: LegacyDemo = root => {
  root.innerHTML = ''
  const shell = document.createElement('div')
  shell.className = 'demo-shell'
  shell.innerHTML = '<h4>Сравнение моделей реактивности — учебная схема</h4><p class="demo-note">Это не запускает Angular или Vue. Здесь можно увидеть различие между явной записью состояния, вычисляемым значением и побочным эффектом.</p>'
  const controls = document.createElement('div'); controls.className = 'demo-ctl'
  const output = document.createElement('pre'); output.className = 'demo-note'
  let count = 0
  const draw = () => { output.textContent = `count = ${count}\ndouble = ${count * 2}\nview update: после явного события\n\nAngular: signal(count).update(v => v + 1)\nVue: const count = ref(${count}); computed(() => count.value * 2)\nPlain JS: присваивание само по себе DOM не обновляет.` }
  for (const [label, delta] of [['−1', -1], ['+1', 1], ['Сброс', -count]] as [string, number][]) {
    const btn = document.createElement('button'); btn.className = 'sm'; btn.textContent = label
    btn.onclick = () => { count = label === 'Сброс' ? 0 : count + delta; draw() }
    controls.appendChild(btn)
  }
  shell.append(controls, output); root.appendChild(shell); draw()
}
