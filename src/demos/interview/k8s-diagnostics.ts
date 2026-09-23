import type { LegacyDemo } from '@/engine/types'

export const k8sDiagnosticsLab: LegacyDemo = root => {
  root.innerHTML = ''
  const shell = document.createElement('div'); shell.className = 'demo-shell'
  shell.innerHTML = '<h4>Kubernetes: диагностика по наблюдаемому статусу</h4><p class="demo-note">Учебная таблица гипотез; команды не запускаются против реального кластера.</p>'
  const select = document.createElement('select')
  select.innerHTML = '<option value="pending">Pod Pending</option><option value="pull">ImagePullBackOff</option><option value="crash">CrashLoopBackOff</option><option value="noendpoint">Service без endpoints</option><option value="ready">Pod Running, но запросы 503</option>'
  const button = document.createElement('button'); button.className = 'sm'; button.textContent = 'Построить порядок проверки'
  const out = document.createElement('pre'); out.className = 'demo-note'
  const paths: Record<string,string> = {
    pending:'kubectl describe pod → Events → requests/limits и доступность node → taints/affinity/quota → PVC binding. Не менять случайно node selector до понимания scheduling constraint.',
    pull:'kubectl describe pod → image tag/digest → registry DNS/TLS/network → imagePullSecrets/service account → architecture и registry permissions.',
    crash:'kubectl logs --previous → kubectl describe pod → exit code/OOMKilled → command/config/secret/permissions → startup dependency и SIGTERM behavior.',
    noendpoint:'kubectl get svc,endpointslices → сравнить Service selector с Pod labels → readiness status → port/targetPort/protocol → NetworkPolicy/DNS только после появления endpoints.',
    ready:'Проверить ingress/LB upstream status → Service endpoints и targetPort → app logs/trace → dependency failures → resource throttling. Running не означает healthy; 503 может прийти на любом proxy/app hop.'
  }
  button.onclick = () => { out.textContent = paths[select.value] ?? 'Выбери наблюдаемый симптом.' }
  shell.append(select, button, out); root.appendChild(shell)
}
