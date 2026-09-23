import type { TheoryArticle } from '@/engine/types'

export const infraRoadmap: TheoryArticle = { id:'th-infra-roadmap', topic:'Инфраструктура: карта обучения', title:'Как изучить frontend и backend инфраструктуру по-настоящему глубоко',
  lead:'Полная карта обучения: как идти от браузера, сетей и Linux к протоколам, Vue/Angular/Nuxt, backend, базам, очередям, контейнерам, облаку и production-эксплуатации.',
  body:`
<h5>Что значит «понимать инфраструктуру»</h5>
<p>Понимание — это уметь объяснить причинно-следственный путь, а не только дать определение. Например, не просто «DNS превращает домен в IP», а кто именно задаёт вопрос, как работает рекурсивный кеш, почему после смены записи часть пользователей видит старый адрес, какие команды разделяют resolver и authoritative ответы, и как ошибочный AAAA может задержать подключение. Для каждой технологии изучайте: проблему, внутреннюю модель, контракт, failure modes, наблюдаемость, security boundary, цену владения и альтернативы.</p>
<p>Инфраструктура не заканчивается DevOps-инструментами. Она проходит через устройство браузера, сеть, runtime языка, API, хранение, очередь, деплой, мониторинг и процесс восстановления. Любой пользовательский запрос — сквозная система, состоящая из этих частей.</p>

<h5>Карта технологий и зависимостей</h5>
<pre class="code">HTML/CSS/JS → browser runtime → frontend framework → build/deploy/CDN
                                           ↓ HTTP/API/auth
Linux process → Node runtime → Express/Fastify/Nest → database/cache/queue
                                           ↓
Ethernet/IP → routing/DNS/TCP/TLS/HTTP → proxy/LB/firewall/cloud network</pre>
<p>Параллельные ветки: UI state и тестирование; SQL/транзакции и Redis; Kafka и event processing; Linux/containers/Kubernetes; IAM/secret management; observability/SLO/incident response. Не учите Kubernetes до уверенного понимания процессов, портов, DNS, файловой системы и контейнерных namespaces: иначе команды превращаются в заучивание.</p>

<h5>Уровень 1 — устройство web платформы</h5>
<ol><li>HTML parsing, DOM/CSSOM, layout, paint/compositing, event loop, tasks/microtasks, storage/security origin.</li><li>HTTP request/response, URL, methods, status, headers, cookies, cache and CORS.</li><li>JavaScript modules, async, promises, memory, TypeScript runtime erasure, browser networking.</li><li>CSS cascade, layout, accessibility, responsive behavior, forms and browser rendering cost.</li></ol>
<p><b>Критерий mastery:</b> объяснить путь клика до обновления DOM; найти лишний network request; диагностировать CORS без «выключить безопасность браузера»; назвать разницу transfer size и execution cost.</p>

<h5>Уровень 2 — frontend framework как runtime</h5>
<p>Учите React, Vue и Angular не только синтаксисом. Для каждого разберите создание компонентов, реактивность/state model, scheduling/render, lifecycle, forms, routing, dependency injection/store, error handling, testing, SSR и migration/versioning. Потом сравнивайте одну и ту же feature, а не маркетинговые описания.</p>
<table><tr><th>Ось сравнения</th><th>Что исследовать</th></tr>
<tr><td>Модель UI</td><td>template vs JSX, component contract, slots/children, directives</td></tr>
<tr><td>Реактивность</td><td>Vue proxy/ref, Angular signals/RxJS/change detection, React state/hooks/reconciliation</td></tr>
<tr><td>Оркестрация</td><td>routing, lazy loading, state, forms, DI, data fetching, error boundaries</td></tr>
<tr><td>Runtime cost</td><td>bundle, rendering frequency, SSR/hydration, compiler, devtools, tree-shaking</td></tr>
<tr><td>Командная цена</td><td>learning curve, conventions, ecosystem, migration, hiring, upgrade cadence</td></tr></table>
<p><b>Когда Vue может быть лучше:</b> команда хочет постепенно внедрять framework, template-first авторинг, компактное реактивное ядро и согласованный путь Router/Pinia/Nuxt; проекту полезна доступная кривая входа и single-file component workflow. Это не универсальный рейтинг: большой enterprise с уже существующим Angular, строгими conventions и DI может выиграть от сохранения Angular; React подходит экосистеме и командам, которым нужны гибкие compositional primitives и широкий рынок библиотек. Сравнивайте зрелость модулей, навык команды, долгосрочную поддержку, SSR, bundle и тестирование на своём продукте.</p>

<h5>Уровень 3 — серверный JavaScript и HTTP приложение</h5>
<p>Изучить процесс Node, event loop phases, libuv pool, worker threads, streams/backpressure, memory/GC, sockets, graceful shutdown и сигналы ОС. Затем Express/Fastify/Nest: route lifecycle, validation, auth, errors, logging, request context, connection pools, deadlines и concurrency. Поверх framework — clean boundaries, API contract, idempotency, pagination, rate limiting и compatibility.</p>
<p><b>Критерий mastery:</b> при высокой CPU нагрузке объяснить event loop lag; измерить pool exhaustion; продумать безопасный retry POST; включить graceful drain без потери очереди; выбрать schema boundary и формат ошибок.</p>

<h5>Уровень 4 — сеть от интерфейса до приложения</h5>
<p>Пройти Ethernet/MAC/VLAN/ARP, IPv4/IPv6/CIDR, route/gateway/NAT, DNS hierarchy, TCP states/windows/retransmission, UDP/QUIC, TLS handshake/certificates, HTTP/1.1/2/3, proxy, WebSocket/SSE/RPC. Параллельно пользоваться Wireshark/tcpdump, curl, dig, ss, iproute2 и openssl. Сначала предсказывать пакетный путь, потом подтверждать его захватом.</p>
<p><b>Критерий mastery:</b> для timeout обозначить последнюю подтверждённую границу, доказать следующий слой, объяснить разницу timeout/refused, проверить SNI/chain, найти ошибочный маршрут или MTU и не сделать вывод по одному ping.</p>

<h5>Уровень 5 — операционная система и Linux</h5>
<p>Процессы/threads, scheduling, signals, file descriptors, permissions/ACL, users/groups, filesystem/inodes/mounts, memory/virtual memory/OOM, systemd units, journalctl, environment/config, package manager, SSH, cron/timers, limits/ulimit, cgroups/namespaces. Важно понимать, какие ресурсы видит процесс и откуда он получает config/secrets.</p>
<p><b>Критерий mastery:</b> найти процесс, порт, логи и файловое ограничение; определить systemd restart loop; безопасно завершить процесс; объяснить OOM и разницу container limit vs host RAM.</p>

<h5>Уровень 6 — данные и распределённые системы</h5>
<p>SQL schema, indexes/query plan, MVCC/locks/isolation/replication; Redis data structures, eviction, persistence, replication; Kafka partitions, offsets, retention, rebalances, delivery semantics; outbox/inbox, saga, deduplication, ordering and schema evolution. Изучайте не только happy path: что случится при падении после записи, но до ACK; кто хранит cursor; как повтор не создаёт двойной эффект.</p>

<h5>Уровень 7 — контейнеры, облако и rollout</h5>
<p>Сначала Linux process/cgroup/namespaces, затем container image layers, Dockerfile, volumes, bridge network, Compose. После этого cloud VPC/subnets/route tables/security groups/load balancers/IAM/object storage/managed databases. Kubernetes — Pods, Deployments, Services, EndpointSlices, DNS, ConfigMaps/Secrets, probes, requests/limits, autoscaling, ingress, persistent volumes, NetworkPolicy, RBAC. Terraform/IaC описывает desired state и требует state/locking/module/version discipline.</p>
<p>Поставка кода включает reproducible builds, CI artifact provenance, environment promotion, DB migrations, feature flags, canary/blue-green rollout, rollback и compatibility между версиями. Rollback кода не откатывает автоматически irreversible data migration.</p>

<h5>Уровень 8 — наблюдаемость и операционная зрелость</h5>
<p>Логи объясняют отдельные события, metrics показывают численные ряды, traces связывают spans одного запроса. Correlation ID должен проходить границы. Умейте определять SLIs, latency/error/availability SLO, budget и alert actionability; не алертить на каждую ошибку. Incident response: зафиксировать impact, остановить деградацию, сохранить evidence, восстановить, затем провести blameless review и закрыть corrective actions.</p>
<p><b>Критерий mastery:</b> по симптомам пользователя найти проблемный hop по golden signals, сформулировать гипотезу, сделать безопасный mitigation, оценить blast radius и доказать восстановление.</p>

<h5>Лабораторный цикл для каждой темы</h5>
<ol><li>Сформулировать вопрос: например, «почему запрос иногда ждёт две секунды?».</li><li>Нарисовать ожидаемую последовательность компонентов и протоколов.</li><li>Воспроизвести happy path локально и измерить baseline.</li><li>Внести одну контролируемую поломку: DNS, порт, timeout, OOM, duplicate event или stale cache.</li><li>Собрать доказательства правильным инструментом и назвать последнее успешное звено.</li><li>Исправить, добавить мониторинг/тест/операционный контроль.</li><li>Объяснить trade-off решения, пределы гарантии и что произойдёт при следующем отказе.</li></ol>

<h5>Проект, который соединит почти всю инфраструктуру</h5>
<p>Сделайте небольшую систему каталога: Vue/Nuxt UI, Express/Fastify API, PostgreSQL, Redis cache, Kafka события, reverse proxy, Docker Compose, затем deployment в Kubernetes или доступный cloud. Добавьте auth, SSR публичных страниц, private account routes, WebSocket/SSE обновление, health/readiness, structured logs, metrics, tracing, CI build и blue/green или canary release. Не нужно сразу платить за облако — локально можно изучить сеть и runtime, а облачные ограничения разобрать конфигурационно.</p>
<ul><li>Измерить от browser navigation до SQL запроса с trace spans.</li><li>Отключить Redis и проверить fallback/load amplification.</li><li>Задержать PostgreSQL и проверить deadline/pool behavior.</li><li>Убить worker после commit до ACK и проверить outbox/idempotency.</li><li>Сломать readiness, DNS и TLS по очереди и написать runbook.</li><li>Сделать schema migration при одновременной работе старой и новой версии приложения.</li><li>Сравнить Vue/Nuxt с Angular либо React для одной feature по конкретным критериям.</li></ul>

<h5>Как сравнивать технологии без религиозных ответов</h5>
<p>Фраза «X быстрее/лучше» ничего не говорит без метрики и контекста. Уточните нагрузку, latency percentile, размер команды, навыки, release cadence, platform constraints, failure cost и migration cost. Разделяйте compile time, startup, throughput, tail latency, memory, bundle transfer, execution CPU, developer speed и operational complexity. Выведите вариант, критерии выбора и условия, при которых решение надо пересмотреть.</p>
<p><b>Шаблон ответа:</b> «Я бы выбрал X для этой системы, потому что ограничение — A, а у команды есть B. Цена — C, которую ограничу способом D. Перед внедрением сравню метрики E на сценарии F. Если результат окажется G, выберу Y». Это показывает инженерное рассуждение, а не перечень брендов.</p>
` }
