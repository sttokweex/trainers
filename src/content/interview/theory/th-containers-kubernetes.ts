import type { TheoryArticle } from '@/engine/types'

export const containersKubernetes: TheoryArticle = { id:'th-containers-kubernetes', topic:'Docker и Kubernetes', title:'Контейнеры, Docker и Kubernetes: от Linux namespaces до production кластера',
  lead:'Практический курс по контейнерному runtime, образам и слоям, Compose, Kubernetes API/control plane, Pod, Deployment, Service/DNS, probes, storage, ingress, RBAC, Helm, GitOps и отладке.',
  body:`
<h5>Ментальная модель: контейнер — это изолированный процесс</h5>
<p>Контейнер — не маленькая виртуальная машина и не отдельное ядро. Обычно это процесс Linux с ограниченным видом на процессы, сеть, mount points и ресурсы. Namespaces изолируют представление PID, network, mount, user и других ресурсов; cgroups учитывают и ограничивают CPU, память и I/O; capabilities и seccomp ограничивают привилегии. Контейнер разделяет kernel хоста, поэтому kernel exploit, неверные права или опасный privileged mount могут перейти границу.</p>
<p>Docker — набор developer-facing инструментов и APIs для build, image, network, volume и запуска контейнеров. На Linux Docker Engine historically использует containerd/runc стек; Kubernetes обычно общается с CRI runtime (например containerd или CRI-O), а не требует Docker Engine. Docker image и OCI-compatible image остаются переносимыми между совместимыми runtimes. Контейнерный формат, runtime, registry и оркестратор — разные компоненты.</p>

<h5>Image, container, registry и OCI</h5>
<p><b>Image</b> — read-only шаблон слоёв с filesystem и metadata: entrypoint, command, user, ports, environment defaults. <b>Container</b> — запущенный процесс с этим image и изменяемым writable layer/config. <b>Registry</b> хранит и раздаёт образы по tag/digest. OCI стандартизует image/runtime форматы. Tag вроде <code class="i">latest</code> подвижен; digest <code class="i">sha256:…</code> идентифицирует точное содержимое.</p>
<p>Не сохраняй runtime состояние только в writable layer: удаление/recreate контейнера потеряет изменения. Persistent data помещают в volume или внешнее хранилище. Логи обычно выводят в stdout/stderr, чтобы runtime/agent собирал их централизованно.</p>

<h5>Dockerfile: build context, cache и минимальный образ</h5>
<pre class="code">FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable &amp;&amp; pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules ./node_modules
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]</pre>
<p>Docker CLI отправляет build context — набор файлов из указанной директории — builder-у. <code class="i">.dockerignore</code> исключает git, node_modules, локальные секреты, build outputs и гигантские файлы. COPY lockfile до исходников позволяет кешировать dependency layer, пока manifest не изменился. Multi-stage build отделяет инструменты компиляции от runtime и снижает лишнее содержимое, но нужно перенести runtime dependencies и нативные modules для правильной платформы.</p>
<p>Порядок инструкций влияет на cache invalidation. Часто меняющийся файл, скопированный рано, обнуляет cache следующих слоёв. BuildKit cache mounts ускоряют зависимости, но содержимое cache не должно становиться runtime state. Сборка должна быть воспроизводимой из lockfile и фиксированного base image; для supply-chain важны image digest и provenance.</p>

<h5>ENTRYPOINT, CMD, signals и PID 1</h5>
<p><code class="i">ENTRYPOINT</code> задаёт основной executable, <code class="i">CMD</code> — default command/arguments и может переопределяться при запуске. Exec form (<code class="i">["node", "server.js"]</code>) запускает процесс напрямую; shell form создаёт промежуточный shell и может мешать передаче SIGTERM. PID 1 в контейнере имеет особое поведение reaping signals/zombies; сложным процессным деревьям нужен корректный init/tini. Приложение должно закрываться по SIGTERM.</p>

<h5>Docker network и порты</h5>
<p>Контейнер получает network namespace и виртуальный интерфейс. User-defined bridge network даёт сервисам DNS по именам контейнеров/Compose services. <code class="i">-p HOST:CONTAINER</code> публикует порт host-а внутрь контейнера; это отдельная операция от <code class="i">EXPOSE</code>, который только metadata документации. Bind к 127.0.0.1 на host ограничивает внешний доступ, bind к 0.0.0.0 может открыть порт на всех интерфейсах — дополнительно проверь firewall.</p>
<p>Внутри контейнера <code class="i">localhost</code> — сам контейнер. Поэтому API-контейнер обращается к Compose database по service name, а не localhost. Host networking снимает часть изоляции и имеет platform-specific semantics; не применяй как универсальное «починить сеть».</p>

<h5>Volumes, bind mounts и файловые данные</h5>
<p>Named volume управляется container runtime и переживает удаление контейнера. Bind mount связывает host path с container path и зависит от host файловой системы и прав. Read-only mount снижает риск записи. В production база часто располагается в managed service или persistent storage с backup/restore политикой, а не в случайном локальном слое контейнера.</p>
<p>Контейнерный user ID может не совпасть с владельцем bind-mounted files; диагностируй UID/GID и parent permissions, не решай проблему <code class="i">chmod -R 777</code>. Для stateful workloads важны filesystem semantics, fsync, latency, zone, snapshot consistency и восстановление.</p>

<h5>Docker Compose для локальной системы</h5>
<pre class="code">services:
  api:
    build: .
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/app
    ports: ["127.0.0.1:3000:3000"]
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:17
    volumes: ["dbdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 3s
      retries: 10
volumes:
  dbdata:</pre>
<p>Compose описывает сервисы, локальные сети, volumes и конфигурацию для dev/test/small deployments. <code class="i">depends_on</code> задаёт порядок старта, но без health condition не гарантирует готовность приложения принимать соединения; даже healthcheck требует retry/backoff клиента. Секрет <code class="i">secret</code> в примере демонстрационный: не храни реальный пароль в публичном compose файле. Для production нужны secrets management, backup, upgrade и restore план.</p>

<h5>Контейнерная безопасность и цепочка поставки</h5>
<ul><li>Запускай процесс не от root, если нет конкретной необходимости.</li><li>Не монтируй docker socket внутрь приложения: control над ним часто равносилен root на host.</li><li>Не передавай секреты в Dockerfile ARG, build logs или image layer; используй secret mount для build и secret store runtime.</li><li>Фиксируй base image по digest/поддерживаемой версии, обновляй и пересобирай при security advisory.</li><li>Ограничь capabilities, seccomp/AppArmor/SELinux policy и filesystem write там, где совместимо.</li><li>Сканируй image/software bill of materials, подписывай artifacts и проверяй provenance в deploy pipeline.</li><li>Не публикуй ненужные ports и не копируй dev dependencies/source/secrets в runtime layer.</li></ul>
<p>Контейнер не является автоматической песочницей против недоверенного кода. Для multi-tenant hostile workloads нужны более сильные isolation решения и профиль угроз; «запустим arbitrary code в обычном Docker» может дать доступ к kernel и соседним ресурсам.</p>

<h5>Зачем Kubernetes и почему не каждому он нужен</h5>
<p>Kubernetes автоматизирует desired state для множества контейнеризированных workloads: scheduling по узлам, reconciliation, discovery, rollout, health и масштабирование. Цена — control plane, networking/storage plugins, upgrades, RBAC, observability, on-call и дополнительная отладка. Один сайт на VPS может быть дешевле и надёжнее как systemd + Nginx. Kubernetes выбирают при наличии потребности и команды на эксплуатацию, а не по престижу.</p>

<h5>Control plane, node и reconciliation loop</h5>
<p>API server — основной Kubernetes API endpoint и точка чтения/изменения объектов. etcd хранит кластерное состояние. Scheduler выбирает node для unscheduled Pod по ресурсам, constraints, affinity/taints и другим правилам. Controller managers наблюдают desired/current state и в reconciliation loop создают изменения, приближающие фактическое к объявленному. Kubelet на node запускает заданные Pods через CRI runtime, а CNI plugin предоставляет pod networking.</p>
<p>Обычно пользователь объявляет desired state через API, а не командует процессам напрямую. Если удалить Pod из Deployment, controller заметит разницу replicas и создаст замену. Это self-healing в заданных пределах: потерянные данные без persistent backup не появятся, а ошибочный желаемый шаблон controller будет faithfully создавать снова.</p>

<h5>Pod, Deployment, ReplicaSet и rollout</h5>
<p>Pod — минимальная scheduling единица, содержит один или несколько тесно связанных контейнеров с общей сетью и volumes. Контейнеры внутри Pod обращаются друг к другу через localhost и разделяют lifecycle/network namespace; обычно sidecar использует общий Pod network. Pod ephemeral: его IP и конкретный экземпляр могут смениться.</p>
<p>Deployment описывает stateless replicas и стратегию обновления, создаёт ReplicaSet, который поддерживает число Pods. Rolling update постепенно заменяет экземпляры, учитывая maxUnavailable/maxSurge. Readiness исключает неготовый Pod из traffic endpoints. Rollback Deployment вернёт предыдущий pod template/image, но не автоматически откатит схему БД или внешнюю запись.</p>

<h5>Service, EndpointSlice и cluster DNS</h5>
<p>Service даёт стабильный виртуальный адрес/имя поверх меняющихся Pod IPs. Selector находит подходящие Pods, EndpointSlices публикуют актуальные endpoints и readiness. Cluster DNS обычно разрешает имя Service в ClusterIP; headless Service возвращает адреса endpoints по модели конкретного использования. Service не запускает процесс и не создаёт Pod — он направляет к существующим подходящим endpoints.</p>
<p>Типы включают ClusterIP для внутреннего доступа, NodePort для порта на nodes, LoadBalancer с внешней интеграцией платформы и headless Service без виртуального IP. Конкретное поведение зависит от CNI/cloud controller и настроек кластера. Не путай port, targetPort, nodePort и container port.</p>

<h5>Manifest Deployment + Service</h5>
<pre class="code">apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: registry.example/api@sha256:REPLACE_WITH_DIGEST
          ports: [{ containerPort: 3000 }]
          readinessProbe:
            httpGet: { path: /ready, port: 3000 }
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits: { memory: 512Mi }
---
apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: 3000 }]</pre>
<p>Selector Deployment обязан соответствовать labels Pod template, иначе controller не сможет корректно владеть replicas. Image digest даёт воспроизводимую версию. Requests участвуют в scheduling; limits ограничивают ресурс в runtime, но CPU limit может вызвать throttling. Memory limit превышение обычно приводит к OOM kill. Значения подбирают по измерению, не копируют этот пример вслепую.</p>

<h5>Startup, readiness и liveness probes</h5>
<p><b>Startup probe</b> даёт медленно стартующему процессу время до начала обычных проверок. <b>Readiness</b> отвечает, готов ли экземпляр получать новый трафик; fail удаляет endpoint из балансировки, но не перезапускает процесс. <b>Liveness</b> проверяет, способен ли процесс восстановиться; fail инициирует restart. Эти сигналы нельзя подменять одним endpoint.</p>
<p>Не привязывай liveness к PostgreSQL: сбой БД может вызвать массовый restart приложения, ещё больше нагрузить систему и не восстановить базу. Проверка должна иметь timeout и failure thresholds, соответствующие latency/старта. Неверная readiness оставит ноль endpoints; неверная liveness создаст restart storm.</p>

<h5>Requests, limits, QoS и autoscaling</h5>
<p>Scheduler планирует Pod по requests и доступной allocatable capacity, а не прогнозу среднего потребления. Memory limit превышение вызывает OOM kill; CPU limit чаще throttles, добавляя latency. ResourceQuota и LimitRange задают namespace guardrails. QoS class влияет на поведение при eviction. Оставь запас на system daemons, rolling surge и пики.</p>
<p>HPA изменяет число replicas по CPU/memory/custom metrics. Для CPU сигнал обычно вычисляется относительно requests, поэтому неверный request портит scale decision. Scaling требует capacity на node и достаточного DB pool; увеличение pod count может перегрузить зависимость. Cluster autoscaler/managed node autoscaling имеет задержку provisioning — не мгновенное решение burst.</p>

<h5>Config, secrets, identity и RBAC</h5>
<p>ConfigMap хранит несекретные настройки; Secret — API объект для чувствительных значений, но его base64 представление само по себе не encryption. Нужны etcd encryption at rest, RBAC минимальных прав, rotation, внешний secret manager и защита логов. Не кладите секреты в Git, образ или command line, видимый через process metadata.</p>
<p>ServiceAccount задаёт identity Pod при обращении к Kubernetes API. RBAC связывает subject, role и permissions на verb/resource/namespace. Отключи auto-mounted token, если приложению не нужен API; выдавай только требуемые права. Cluster-admin не должен быть повседневной ролью deployment pipeline.</p>

<h5>Volumes и stateful workloads</h5>
<p>Ephemeral container filesystem исчезает при замене Pod. Volume связывает данные с lifecycle Pod/node; PersistentVolume/PersistentVolumeClaim дают абстракцию постоянного storage через provisioner/StorageClass. StatefulSet поддерживает стабильные identity и storage claim для ordered/stateful replicas, но сам по себе не создаёт distributed database consistency или backup.</p>
<p>Проверь доступность storage zone, attach/detach delay, filesystem permissions/fsGroup, snapshot consistency и restore. БД на Kubernetes требует конкретной операционной модели/operator и компетенции; managed DB может быть проще и надёжнее.</p>

<h5>Ingress, Gateway API и сеть кластера</h5>
<p>Ingress — API декларации HTTP routing; без Ingress controller он не начинает принимать трафик. Controller (Nginx, cloud LB integration и другие) реализует правила, TLS и балансировку. Gateway API — более выразительная развиваемая модель ролей/маршрутов; поддержка зависит от implementation. TLS может завершаться на external LB, gateway или приложении — ясно обозначь каждый hop.</p>
<p>CNI plugin обеспечивает Pod network и NetworkPolicy semantics; не всякая CNI поддерживает каждую policy feature. Kube-proxy или eBPF data plane обеспечивает Service forwarding в зависимости от кластера. Service mesh добавляет sidecar/ambient proxy, mTLS, retries и telemetry, но создаёт собственные resource, configuration и debug failure modes. Включай его только при конкретной необходимости.</p>

<h5>Namespace, labels и организация окружения</h5>
<p>Namespace — логическая область API-объектов и удобная грань RBAC/quota, но не полноценная security isolation сама по себе. Labels — ключевой механизм выборки; annotations хранят metadata для tooling. Используй стабильные labels app/name, instance, component, version и owner; не создавай уникальные labels с высоким cardinality для метрик без оценки последствий.</p>

<h5>Helm, Kustomize, GitOps и Terraform</h5>
<p>Helm пакует Kubernetes templates в chart с values и versioning; полезен для переиспользования, но сложный template становится своим языком программирования. Kustomize накладывает patches/overlays на base YAML без полноценного templating. Выбери один источник truth, review-ь rendered manifests и следи за version compatibility charts/controllers.</p>
<p>GitOps controller (например Argo CD/Flux) сравнивает Git desired state с кластером и reconciles drift. Это улучшает аудит/повторяемость, но не отменяет secret strategy, approval boundaries и emergency changes. Terraform обычно управляет cloud infrastructure/API resources и ведёт state с locking; Kubernetes provider тоже возможен, но раздели lifecycle кластерной инфраструктуры и приложений, если их команды/скорость изменений различаются.</p>

<h5>CI/CD контейнерного приложения</h5>
<ol><li>Проверить source: lint/type/build/security tests и license policy.</li><li>Собрать image один раз, прикрепить commit/version labels и SBOM, подписать provenance.</li><li>Push в registry и deploy по digest, а не изменяемому tag.</li><li>Обновить manifests/values в reviewable Git change и применить к staging.</li><li>Выкатить canary/rolling, проверить readiness, ошибки, p95 и зависимости.</li><li>Остановить rollout/rollback при превышении guardrail; не откатывать incompatible DB schema автоматически.</li><li>Регулярно пересобирать base images для security patches.</li></ol>

<h5>Диагностика: команды и порядок проверки</h5>
<div data-demo="k8s-diagnostics"></div>
<pre class="code">docker ps -a
docker logs --tail=200 CONTAINER
docker inspect CONTAINER
docker stats
docker network inspect NETWORK

kubectl get pods -A -o wide
kubectl describe pod POD -n NS
kubectl logs POD -n NS --previous
kubectl get svc,endpointslices -n NS
kubectl get events -n NS --sort-by=.lastTimestamp
kubectl rollout status deploy/api -n NS</pre>
<p><code class="i">kubectl get</code> показывает текущее объявленное состояние; <code class="i">describe</code> раскрывает events и причины scheduling/probe; <code class="i">logs --previous</code> важен после crash/restart; Service плюс EndpointSlice показывает, нашёл ли selector ready Pods. Не делай вывод только по статусу Running: приложение может не быть Ready или отвечать 500.</p>
<ul><li><b>ImagePullBackOff:</b> registry/DNS/credentials/tag/digest/network/architecture.</li><li><b>Pending:</b> requests не помещаются, taint/affinity/PVC/quota/unschedulable nodes.</li><li><b>CrashLoopBackOff:</b> предыдущие logs, command, config, permissions, startup dependency, OOMKilled.</li><li><b>Running, но недоступен:</b> readiness, labels/selectors, Service ports, endpoints, NetworkPolicy, DNS, ingress.</li><li><b>Latency выросла после rollout:</b> CPU throttling, probes, dependency saturation, image/config changes, trace comparison.</li></ul>

<h5>Практикум: перевести VPS приложение в Kubernetes</h5>
<ol><li>Сначала контейнеризируй Node сервис и запусти локально; объясни каждую Dockerfile инструкцию и layer cache.</li><li>Добавь .dockerignore, non-root user, digest-based base, graceful SIGTERM, health endpoint и multi-stage build.</li><li>Создай Compose API + DB + migration job с persistent volume, healthcheck и внутренней network.</li><li>Опубликуй image в registry, задеплой Deployment/Service в локальный кластер, проверь selector и EndpointSlices.</li><li>Сделай плохой config, неверный image и failing readiness; диагностируй через events/logs без угадывания.</li><li>Настрой resource requests/limits и смоделируй OOM/CPU throttling; объясни отличие.</li><li>Сделай ConfigMap/Secret через безопасный local workflow и RBAC для deploy identity.</li><li>Выполни rollout, отмену, rollback к совместимому релизу и backward-compatible DB migration.</li><li>Задеплой через Helm или Kustomize, добавь GitOps sync и drift correction.</li><li>Восстанови PVC/БД из backup и оформи runbook с RPO/RTO и доказательством restore.</li></ol>
<p><b>Ключевой вывод:</b> Docker упаковывает процесс и его runtime окружение; Kubernetes согласует desired state множества таких workloads. Ни один из них не отменяет понимания Linux, TCP/IP, DNS, прав, хранения, доступности и восстановления.</p>
` }
