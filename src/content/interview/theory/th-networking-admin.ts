import type { TheoryArticle } from '@/engine/types'

export const networkingAdmin: TheoryArticle = { id:'th-networking-admin', topic:'Сети и системное администрирование', title:'Компьютерные сети для разработчика и системного администратора: от кабеля до TLS',
  lead:'Большой практический курс по Ethernet, IP, подсетям, маршрутизации, DNS, DHCP, NAT, TCP/UDP, firewall, TLS, прокси, диагностике Linux и работе сервисов в production.',
  body:`
<h5>Что происходит, когда открываешь сайт</h5>
<p>Браузер разбирает URL: схема https, hostname, порт и path. Проверяется локальная конфигурация proxy, затем hostname разрешается через DNS или кеш. Клиент выбирает маршрут, узнаёт MAC следующего узла через ARP (IPv4) или Neighbor Discovery (IPv6), устанавливает TCP-соединение и TLS-сессию, отправляет HTTP-запрос, получает ответ через цепочку proxy/load balancer/application. DNS, маршрутизация, транспорт и HTTP — разные уровни; успешный DNS ещё не доказывает, что порт доступен или приложение работает.</p>
<pre class="code">URL → proxy/DNS → route + next hop → TCP (или QUIC/UDP)
    → TLS → HTTP → reverse proxy → service → dependency → response</pre>
<p>Точная цепочка может отличаться: HTTP/3 работает поверх QUIC/UDP, service mesh добавляет sidecar, CDN завершает TLS, а корпоративный proxy меняет маршрут. Диагностика должна подтверждать каждый переход независимо.</p>

<h5>Слои модели и инкапсуляция</h5>
<table><tr><th>Практический уровень</th><th>Данные</th><th>Примеры</th><th>Типовая поломка</th></tr>
<tr><td>Канальный (L2)</td><td>кадр, MAC</td><td>Ethernet, Wi-Fi, VLAN</td><td>не та VLAN, нет ARP ответа</td></tr>
<tr><td>Сетевой (L3)</td><td>IP пакет</td><td>IPv4/IPv6, ICMP, router</td><td>неверная маска/маршрут</td></tr>
<tr><td>Транспортный (L4)</td><td>TCP segment / UDP datagram</td><td>TCP, UDP, port</td><td>порт закрыт, handshake не завершён</td></tr>
<tr><td>Прикладной (L7)</td><td>сообщение протокола</td><td>DNS, TLS, HTTP, SSH</td><td>не тот host, сертификат, код 5xx</td></tr></table>
<p>При инкапсуляции HTTP сообщение становится TLS record, затем TCP сегментом, IP пакетом и L2 кадром; на принимающей стороне оболочки снимаются. OSI — учебная модель, а TCP/IP — более практическая стековая модель. Реальные границы некоторых протоколов не укладываются в одну колонку, поэтому используйте слои как способ локализовать проблему, не как абсолютный физический закон.</p>

<h5>Ethernet, MAC, ARP, switch и VLAN</h5>
<p>MAC-адрес идентифицирует сетевой интерфейс в пределах L2 сегмента. Switch обучается по source MAC кадра и пересылает кадры к нужному порту; неизвестный unicast может flood-иться в пределах VLAN. Router разделяет IP сети и не пересылает Ethernet broadcast между ними по умолчанию. ARP связывает IPv4 адрес соседа с MAC; IPv6 использует Neighbor Discovery через ICMPv6.</p>
<p>VLAN — логическое разделение L2 broadcast domains на одном физическом оборудовании. Access порт обычно несёт одну VLAN для конечного устройства; trunk переносит несколько tagged VLAN между switches/routers. Ошибка VLAN tagging может выглядеть как «сервер физически доступен, но IP не пингуется». Нельзя решать всё включением promiscuous mode или разрешением всех VLAN — сначала сверить port config и адресный план.</p>

<h5>IPv4 адреса и CIDR подсети</h5>
<p>IPv4 — 32-битный адрес. CIDR запись <code class="i">192.168.10.32/27</code> задаёт 27 network bits и 5 host bits: в обычной подсети 32 адреса, обычно 30 адресов узлам (network и broadcast зарезервированы). Исключения существуют для /31 point-to-point и /32 host route. Маска определяет, считается ли destination локальной или её нужно отправить gateway.</p>
<p>Частные IPv4 диапазоны RFC1918: 10/8, 172.16/12, 192.168/16. Они не маршрутизируются в публичном интернете без преобразования/туннеля. CGNAT провайдера может добавлять ещё один NAT слой. Адрес 127.0.0.1 — loopback текущего namespace/host; в Docker контейнере это сам контейнер, не хост.</p>
<p>Практика чтения CIDR: для /24 последние 8 bits host, 256 адресов; /25 — 128; /26 — 64; /27 — 32; /28 — 16. Для /20 остаётся 12 host bits (4096 адресов). Считайте потребность с запасом, gateway, broadcast/reserved, growth и разбиением зон, а не назначайте всем «похожую» маску.</p>

<h5>IPv6 и почему его нельзя просто игнорировать</h5>
<p>IPv6 использует 128-битные адреса и обычно применяет /64 для обычной локальной сети. Нет broadcast в прежнем IPv4 смысле; multicast и Neighbor Discovery решают соответствующие задачи. SLAAC может автоматически сформировать адрес из Router Advertisement, DHCPv6 используется для дополнительных параметров/адресов в зависимости от сети. Link-local начинается с fe80::/10 и нужен на локальном сегменте.</p>
<p>Сервис может быть доступен по IPv4, но не IPv6, либо DNS AAAA запись ведёт в неработающий адрес. Happy Eyeballs позволяет клиенту пробовать семейства адресов с задержкой; это иногда маскирует неполную IPv6 настройку. Firewall правила нужны отдельно для IPv4 и IPv6 — защита только IPv4 оставляет открытый IPv6 путь.</p>

<h5>Маршрутизация, gateway и таблица маршрутов</h5>
<p>Хост сопоставляет destination IP с таблицей маршрутов и выбирает наиболее специфичный (longest prefix match) маршрут. Если адрес локален по маске, хост ищет MAC самого адресата. Иначе передаёт кадр MAC default gateway, сохраняя IP destination исходного удалённого хоста. Router смотрит IP destination, уменьшает TTL/hop limit и выбирает следующий hop.</p>
<p>Default route — путь ко всем назначениям, для которых нет более точного маршрута. Асимметричная маршрутизация (ответ идёт другим путём) может ломать stateful firewall, NAT и диагностику. Проверяйте route table на обеих сторонах и policy routing/VRF в сложной сети.</p>

<h5>DHCP и адресная конфигурация</h5>
<p>DHCPv4 типично проходит Discover, Offer, Request, Acknowledge (DORA). Клиент получает адрес, lease time, subnet mask, default gateway, DNS servers и дополнительные параметры. DHCP relay пересылает broadcast запрос между подсетями. Конфликт статического адреса с динамическим pool вызывает случайные обрывы; резервируйте адреса или исключайте их из pool. DHCP — не DNS: он может выдать адрес DNS-сервера, но записи имён обслуживаются отдельно.</p>

<h5>DNS: рекурсивный поиск, TTL, кеш и диагностика</h5>
<p>Stub resolver устройства обычно спрашивает recursive resolver. Resolver использует кеш и при необходимости проходит root → TLD → authoritative server. A возвращает IPv4, AAAA IPv6, CNAME alias, MX почтовые серверы, TXT текстовые/проверочные записи, NS делегирование. TTL указывает сколько запись можно кешировать, но отрицательные ответы тоже могут кешироваться.</p>
<p>DNS не является мгновенным глобальным push механизмом: после изменения старые кеши могут жить до TTL/negative TTL, а разные resolver обновятся в разное время. Проверяйте authoritative запись отдельно от recursive cache. Split-horizon DNS отдаёт разные ответы внутри и снаружи сети. Ошибка search suffix может превратить короткое имя в неожиданный FQDN.</p>
<pre class="code">dig example.com A
dig example.com AAAA
dig @1.1.1.1 example.com A
dig +trace example.com
getent hosts api.internal</pre>

<h5>TCP: handshake, потоки байтов, retransmission</h5>
<p>TCP предоставляет надёжный упорядоченный byte stream между IP:port endpoints. Трёхсторонний handshake SYN → SYN-ACK → ACK согласует начальные sequence numbers и параметры. TCP не знает границ сообщений приложения: один write может прийти несколькими reads, а несколько writes — одним read. Протокол приложения сам задаёт framing, например length prefix или delimiter.</p>
<p>TCP retransmits потерянные сегменты, использует congestion control и flow control. Packet loss, высокий RTT и ограниченное окно уменьшают throughput. «Порт открыт» не гарантирует быстрый ответ приложения: handshake может пройти, а handler зависнуть. SYN backlog и accept queue переполнение — разные места проблемы.</p>

<h5>UDP, QUIC и когда потеря допустима</h5>
<p>UDP передаёт datagrams без встроенной гарантии доставки, порядка и повторной передачи. Приложение реализует нужную надёжность или принимает потери. DNS часто использует UDP с fallback на TCP для больших ответов/zone transfer; VoIP и real-time media предпочитают задержку повтору старого пакета. QUIC использует UDP как транспортную основу, но реализует надёжные streams, TLS 1.3 интеграцию и connection migration на уровне протокола.</p>

<h5>Порты, sockets и локальный bind</h5>
<p>Socket endpoint — комбинация адреса/протокола/порта; один серверный порт может обслуживать множество соединений, различающихся remote endpoint. <code class="i">127.0.0.1:3000</code> доступен только loopback внутри соответствующего namespace; <code class="i">0.0.0.0:3000</code> слушает IPv4 интерфейсы; <code class="i">[::]:3000</code> IPv6 wildcard и dual-stack поведение зависит от ОС. Контейнерный процесс должен слушать интерфейс, достижимый через опубликованный port mapping.</p>
<p>«Connection refused» часто означает, что SYN получил RST: host reachable, но никто не слушает порт или firewall явно отверг. Timeout чаще означает молчаливую фильтрацию, потерянный route или зависимость. Но эти симптомы не уникальны: подтверждайте packet capture/logs и путь.</p>

<h5>NAT, port forwarding и CGNAT</h5>
<p>NAT меняет IP адреса и часто порты в заголовках, ведя state table для обратного трафика. Домашний source NAT/PAT позволяет нескольким приватным узлам разделить публичный IP. Port forwarding направляет входящий порт на внутренний host, но не отменяет host firewall и сервис bind. CGNAT означает, что домашний router не владеет внешним адресом провайдера; обычный port forwarding на домашнем устройстве не создаст прямую входящую доступность через CGNAT.</p>
<p>NAT не является полноценной security policy. Stateful firewall решает, какие соединения разрешать; NAT — преобразование адресов. Для inbound доступа рассмотрите публичный сервер, VPN или reverse tunnel с осознанием threat model.</p>

<h5>Firewall: packet filter, stateful rules и порядок</h5>
<p>Firewall принимает решение по direction, interface, source/destination address, protocol/port, connection state и policy. Default deny ограничивает поверхность, но нужно явно открыть необходимый трафик. Stateful firewall отслеживает established/related connections; обратный ответ разрешается как часть существующей сессии. Stateless ACL может требовать симметричных правил.</p>
<p>Host firewall (nftables/Windows Defender Firewall), cloud security groups, network ACL, Kubernetes NetworkPolicy и perimeter firewall — отдельные enforcement points. Правило на cloud security group не поможет, если процесс bind только к localhost. Не отключайте firewall для «проверки» без понимания масштаба; применяйте временное точечное правило и удаляйте его.</p>

<h5>TLS и сертификат: шифрование не равно доверие к приложению</h5>
<p>TLS handshake согласует параметры шифрования, проверяет сертификат сервера и создаёт защищённый канал. Сертификат связывает публичный ключ с именем через цепочку доверия до trust store. Клиент проверяет hostname/SAN, срок, цепочку и алгоритм. TLS шифрует канал и защищает целостность, но не исправляет SQL injection и не подтверждает, что API корректно авторизовал операцию.</p>
<p>Certificate renewal, intermediate chain, SNI и clock skew дают частые сбои. SNI сообщает hostname до выбора сертификата при shared IP. Завершение TLS в reverse proxy означает, что hop proxy→app может быть plain HTTP; оцените network trust boundary и требование re-encryption/mTLS. mTLS аутентифицирует обе стороны сертификатами, но требует управления выпуском/ротацией.</p>

<h5>HTTP/1.1, HTTP/2, HTTP/3 и proxy</h5>
<p>HTTP — прикладной протокол request/response. HTTP/1.1 обычно повторно использует соединения, но браузер держит несколько соединений; HTTP/2 мультиплексирует streams поверх TCP, поэтому packet loss всё ещё может затормозить все streams одного соединения (TCP head-of-line blocking). HTTP/3 использует QUIC/UDP и уменьшает влияние потери одного stream на остальные, но требует доступного UDP path и поддержки прокси/CDN.</p>
<p>Reverse proxy принимает клиентский трафик от имени сервиса, завершает TLS, маршрутизирует по host/path, применяет limits и пишет edge logs. Forward proxy работает от имени клиента к внешним ресурсам. Заголовки <code class="i">Forwarded</code>/<code class="i">X-Forwarded-*</code> нужно доверять только от известных proxy hops. Backend должен быть недоступен напрямую или очищать недоверенные forwarding headers.</p>

<h5>MTU, fragmentation и Path MTU Discovery</h5>
<p>MTU — максимальный размер L3 packet, который проходит link без фрагментации. Ethernet часто имеет MTU 1500 bytes, но туннели VPN/VXLAN добавляют overhead и снижают эффективную MTU. IPv4 может фрагментировать пакет при разрешении; IPv6 routers не фрагментируют транзитные пакеты, а endpoint использует Path MTU Discovery. Если ICMP сообщения блокируются, большие пакеты могут исчезать, при этом маленькие ping проходят — классический PMTU black hole.</p>

<h5>Linux сеть: интерфейсы, route, sockets</h5>
<pre class="code">ip addr show                 # адреса интерфейсов
ip route show                # таблица маршрутов
ip neigh show                # ARP/NDP cache
ss -lntup                    # listeners и sockets
ss -ti                       # TCP состояние/метрики
resolvectl status            # DNS настройка systemd-resolved
ethtool eth0                 # link/driver параметры
tcpdump -ni any port 443     # packet capture (нужны права)</pre>
<p>Читайте вывод, а не просто копируйте команды: <code class="i">ip addr</code> показывает адрес/маску и состояние интерфейса; <code class="i">ip route get DEST</code> объясняет выбранный next hop/interface; <code class="i">ss -lntp</code> показывает, какой процесс слушает TCP порт. В контейнерах эти команды показывают namespace контейнера, если не смотреть host namespace.</p>

<h5>Диагностика по слоям и значение инструментов</h5>
<div data-demo="network-path-lab"></div>
<ol><li>Проверьте конфигурацию интерфейса, link state, address, mask, gateway, DNS.</li><li>Разрешите имя через <code class="i">getent</code>/<code class="i">dig</code>; сравните A и AAAA.</li><li>Проверьте route selection: <code class="i">ip route get</code>.</li><li>Проверьте TCP соединение: <code class="i">nc -vz host port</code> или <code class="i">curl -v</code>.</li><li>Проверьте TLS hostname/chain/SNI: <code class="i">openssl s_client -connect host:443 -servername host</code>.</li><li>Проверьте HTTP status/headers/latency через curl и reverse proxy logs.</li><li>Если неясно — захватите пакеты на обеих сторонах и найдите место потери.</li></ol>
<p><code class="i">ping</code> проверяет ICMP echo, который firewall может запрещать; отсутствие ping не доказывает недоступность HTTPS. <code class="i">traceroute</code> зависит от TTL exceeded/ICMP и может показывать пропуски из-за фильтрации, а не поломки пути. <code class="i">curl</code> полезен для HTTP/TLS, но не объясняет весь routing path. Время DNS/TCP/TLS/TTFB измеряйте отдельно.</p>

<h5>Сетевая диагностика приложений: контейнеры и Kubernetes</h5>
<p>В Docker сервисы обычно обращаются друг к другу по service DNS в общей network, а не по localhost. Published port маппит host port на container port. В Kubernetes Pod IP обычно эфемерен, а Service предоставляет стабильный virtual endpoint и балансирует на ready endpoints. CoreDNS разрешает service names. NetworkPolicy может блокировать трафик даже при правильном Service. Readiness probe исключает Pod из трафика; liveness restart-ит зависший container, но неверный liveness может вызвать restart loop.</p>
<p>Диагностируйте из той же сети/namespace, где выполняется приложение: DNS внутри Pod может отличаться от ноутбука. Проверяйте endpoints, policy, service port ↔ targetPort, listener bind, sidecar proxy и TLS mode. «Работает curl с node» не доказывает работоспособность из Pod.</p>

<h5>Практические сценарии и последовательность локализации</h5>
<p><b>Симптом: hostname не работает.</b> Сравнить DNS resolver и authoritative response, проверить search domain, A/AAAA и TTL.</p>
<p><b>DNS есть, соединение timeout.</b> Проверить route, egress ACL/security group, NAT, firewall, обратный маршрут и packet capture.</p>
<p><b>Connection refused.</b> Проверить listener address/port, process, container mapping, service targetPort и активный reject.</p>
<p><b>TLS hostname mismatch.</b> Проверить URL, SNI, certificate SAN/chain, proxy сертификат, дату узла и промежуточный CA.</p>
<p><b>GET работает, большие POST зависают.</b> Проверить body limits, proxy timeout, MTU/PMTU, buffering, application parser и downstream timeout.</p>
<p><b>Работает по IPv4, но не по имени.</b> Проверить AAAA, IPv6 route/firewall/listener и поведение клиента Happy Eyeballs.</p>

<h5>Лаборатория системного администратора</h5>
<ol><li>Рассчитать план подсетей для офиса, гостевого Wi-Fi, серверов, VPN и management VLAN, не допуская пересечения диапазонов.</li><li>Настроить на двух Linux VM адреса, gateway, DNS и firewall; подтвердить только необходимые порты.</li><li>Создать HTTP сервис, слушающий сначала 127.0.0.1, затем 0.0.0.0; объяснить отличие доступа из соседнего узла.</li><li>Поймать DNS query, TCP handshake и TLS ClientHello через tcpdump/Wireshark; сопоставить с curl -v.</li><li>Сымитировать неверную маску, отсутствующий route, closed port, DNS NXDOMAIN, сертификат не на тот hostname и заблокированный UDP.</li><li>Сравнить timeout и refused на packet capture и socket state.</li><li>Собрать runbook: симптомы, гипотезы, команда, ожидаемый результат и критерий эскалации.</li></ol>
<p><b>Системный подход:</b> двигайтесь от конкретного endpoint к соседнему hop, фиксируйте время и source/destination, проверяйте обе стороны, меняйте только одну переменную за раз, записывайте вывод до изменения firewall/маршрута. Это экономит время и оставляет проверяемое объяснение причины.</p>
` }
