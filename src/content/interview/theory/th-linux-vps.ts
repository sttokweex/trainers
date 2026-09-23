import type { TheoryArticle } from '@/engine/types'

export const linuxVps: TheoryArticle = { id:'th-linux-vps', topic:'Linux и VPS', title:'Linux с нуля для VPS: безопасно подготовить и обслуживать сервер',
  lead:'Практический курс по первой настройке Debian/Ubuntu VPS: SSH, пользователи, systemd, сеть, firewall, диски, Nginx, TLS, приложения, логи, резервное копирование и восстановление.',
  body:`
<h5>Что такое VPS и какой доступ у тебя есть</h5>
<p>VPS — виртуальная машина, которой гипервизор провайдера выделяет CPU, память, диск и виртуальный сетевой интерфейс. «Голая VPS» означает чистую операционную систему без настроенного приложения, reverse proxy и пользовательской конфигурации. У тебя обычно есть root-доступ по консоли провайдера и/или SSH. Консоль важна как out-of-band recovery канал: если сломать SSH или firewall по сети, можно войти через панель провайдера.</p>
<p>До настройки выпиши IP, ОС и её версию, регион, DNS зоны, доступ к панели, snapshot/backup условия, лимиты ресурсов, публичные IPv4/IPv6, способ rescue boot, важность данных и требуемые порты. Команды ниже в основном ориентированы на Debian/Ubuntu; на RHEL-family будут другие пакетный менеджер, firewall и пути.</p>

<h5>Первый вход и безопасная работа от root</h5>
<p>Root — суперпользователь с практически неограниченными полномочиями. Опечатка в команде может удалить системные данные или отключить сеть. Для повседневной работы создай отдельного пользователя с sudo и проверяй, от чьего имени работает команда.</p>
<pre class="code">ssh root@SERVER_IP
whoami
hostnamectl
cat /etc/os-release
uptime
free -h
df -h
ip addr
ip route</pre>
<p><code class="i">whoami</code> показывает пользователя процесса; <code class="i">hostnamectl</code> — имя/ОС/ядро; <code class="i">uptime</code> — время работы, load average; <code class="i">free -h</code> — память в читаемых единицах; <code class="i">df -h</code> — заполнение файловых систем; <code class="i">ip addr/route</code> — интерфейсы и маршруты. Load average — число runnable/uninterruptible задач в среднем за интервалы, а не процент CPU; интерпретируй с количеством vCPU и IO wait.</p>

<h5>Создать администратора и проверить sudo</h5>
<pre class="code">adduser deploy
usermod -aG sudo deploy
id deploy
su - deploy
sudo whoami</pre>
<p><code class="i">adduser</code> создаёт пользователя и домашний каталог; <code class="i">usermod -aG</code> добавляет группу, где <code class="i">-a</code> критично: без append можно заменить остальные дополнительные группы. В Debian/Ubuntu группа sudo обычно получает права через sudoers. <code class="i">sudo whoami</code> должен вывести root. Перед ужесточением SSH открой второй терминал и проверь новый способ входа, не закрывая исходную root session.</p>

<h5>SSH ключи: аутентификация и безопасная смена настроек</h5>
<p>SSH public-key auth использует пару: private key хранится только на твоём компьютере, public key добавляется на сервер. Никогда не пересылай и не копируй private key на VPS. Создай ключ локально, если его нет, и добавь public key для пользователя.</p>
<pre class="code"># на своём компьютере
ssh-keygen -t ed25519 -a 64
ssh-copy-id deploy@SERVER_IP
ssh deploy@SERVER_IP

# на сервере: проверить файлы и права
ls -ld ~/.ssh
ls -l ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys</pre>
<p>Файл <code class="i">authorized_keys</code> содержит разрешённые public keys. SSH может отвергать ключ при неверных владельце/режиме. Держи второй действующий доступ. Меняя <code class="i">/etc/ssh/sshd_config</code>, сначала сохрани резервную копию, проверь синтаксис командой <code class="i">sshd -t</code>, затем reload/restart и проверь вход в новой сессии. Только после успешной проверки отключай password/root login согласно своей политике. Точные директивы и include-файлы зависят от дистрибутива и версии OpenSSH.</p>

<h5>Пакетный менеджер и обновления</h5>
<pre class="code">sudo apt update
apt list --upgradable
sudo apt upgrade
sudo apt autoremove</pre>
<p><code class="i">apt update</code> обновляет индекс доступных пакетов, а не сами установленные пакеты. <code class="i">upgrade</code> применяет совместимые обновления из настроенных репозиториев; крупные release upgrades — отдельная операция. <code class="i">autoremove</code> удаляет автоматически установленные зависимости, которые больше не нужны: перед подтверждением просматривай список. Для production задай maintenance window, проверку release notes, backup/snapshot и plan rollback. Kernel/library update может потребовать reboot.</p>
<pre class="code">sudo reboot
uname -r
systemctl --failed
needrestart</pre>
<p>После перезагрузки проверь ядро, failed units, диск, сеть и приложение. Автообновления безопасности уменьшают задержку патчей, но не отменяют наблюдение, совместимость и планирование reboot. Не запускай наугад <code class="i">do-release-upgrade</code> на критичной машине без snapshot и проверенного восстановления.</p>

<h5>Сеть VPS и карта открытых портов</h5>
<pre class="code">ip -br addr
ip route
resolvectl status
ss -lntup
curl -4 https://ifconfig.co
getent hosts example.com</pre>
<p>Найди все listeners и сопоставь каждый с процессом/назначением. Обычно публично открыты только SSH, HTTP и HTTPS, но SSH лучше ограничивать по source IP или VPN, если это реально поддерживается твоим доступом. Приложение за Nginx должно слушать loopback/private interface; не выставляй dev server или database наружу. Учитывай firewall провайдера/security group отдельно от host firewall.</p>

<h5>Firewall: провайдерская панель и host UFW</h5>
<p>На VPS часто есть два независимых фильтра: cloud firewall у провайдера и firewall внутри Linux. Входящий пакет должен пройти оба. UFW — удобный frontend правил netfilter; nftables — актуальный низкоуровневый framework во многих Linux дистрибутивах. Не смешивай ручные правила разных менеджеров без понимания порядка.</p>
<pre class="code">sudo ufw status verbose
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status numbered</pre>
<p><b>Безопасный порядок:</b> до enable разреши SSH на реальном порту и, если возможно, только со своего стабильного IP; проверь console recovery; оставь текущую SSH сессию открытой; включи UFW; немедленно проверь новую SSH сессию из другого терминала. После успешной проверки удали широкое временное правило. При нестандартном порте правило OpenSSH profile может не совпасть. Не вводи deny/allow policy, не понимая текущего SSH пути — можно отрезать себя.</p>

<h5>Имена пользователей, права файлов и секреты</h5>
<pre class="code">id deploy
groups deploy
namei -l /srv/myapp/.env
stat /srv/myapp
chmod 750 /srv/myapp
chown -R deploy:deploy /srv/myapp</pre>
<p>Unix permission bits задают read/write/execute для owner/group/others; для каталога execute означает возможность прохода/поиска. <code class="i">chmod 750</code> — владелец rwx, группа r-x, остальные нет прав. <code class="i">chown</code> меняет владельца; не делай recursive chown на системных путях вслепую. Секреты ограничивай сервисному пользователю, не клади их в git, публичный frontend bundle, shell history или общедоступный лог. Файл <code class="i">.env</code> — не secret manager, а просто текстовый файл с правами доступа.</p>

<h5>Диски, память, inode и место</h5>
<pre class="code">df -hT
df -ih
lsblk -f
du -xhd1 /var 2>/dev/null | sort -h
free -h
swapon --show
dmesg -T | tail -80</pre>
<p><code class="i">df -hT</code> показывает занятое место и тип filesystem; <code class="i">df -ih</code> — inodes, которых может не хватить при миллионах мелких файлов даже если байты свободны. <code class="i">du</code> оценивает directory usage; удалённый, но открытый процессом лог продолжает занимать место — проверь <code class="i">lsof +L1</code>. Swap — не замена RAM, но может смягчить краткий пик ценой latency. Dmesg показывает kernel сообщения, в том числе OOM kill и ошибки диска.</p>

<h5>Процессы, systemd unit и автозапуск Node приложения</h5>
<p>Не держи production сервер в интерактивном SSH shell с <code class="i">npm run start</code>: disconnect, reboot и crash оставят управление случайным. systemd запускает сервис при boot, задаёт пользователя, рабочий каталог, рестарты, environment, sandboxing и журнал.</p>
<pre class="code">sudo nano /etc/systemd/system/myapp.service
[Unit]
Description=My Node API
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/srv/myapp/current
EnvironmentFile=/etc/myapp/myapp.env
ExecStart=/usr/bin/node dist/server.js
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target</pre>
<pre class="code">sudo systemd-analyze verify /etc/systemd/system/myapp.service
sudo systemctl daemon-reload
sudo systemctl enable --now myapp
sudo systemctl status myapp --no-pager
sudo journalctl -u myapp -n 100 --no-pager
sudo journalctl -u myapp -f</pre>
<p><code class="i">daemon-reload</code> перечитывает unit definitions; <code class="i">enable</code> настраивает запуск при boot; <code class="i">--now</code> запускает сейчас; <code class="i">status</code> показывает состояние и последние строки; <code class="i">journalctl -f</code> следует за логом. Перед применением проверь Node absolute path через <code class="i">command -v node</code> в подходящем окружении; nvm shell profile обычно не загружается systemd автоматически. Секретный EnvironmentFile храни вне release repo с ограниченными owner/mode.</p>

<h5>systemd service hardening и signals</h5>
<p>Приложение должно корректно обработать SIGTERM: прекратить принимать новые запросы, дренировать активные, завершить background work, закрыть DB/Redis connections и выйти в пределах stop timeout. systemd перезапускает процесс согласно Restart policy. Не ставь бесконечный автоперезапуск при постоянной ошибке конфигурации без rate limiting: это создаёт crash loop и лог-шторм.</p>
<p>По возможности включай ограничения filesystem/network/capabilities после проверки потребностей сервиса: <code class="i">ProtectSystem</code>, <code class="i">ProtectHome</code>, <code class="i">PrivateDevices</code>, <code class="i">RestrictAddressFamilies</code>, resource limits. Усиление должно сохранять права чтения сертификата, сокета и нужных директорий. Начни с least privilege и теста под фактическим пользователем, а не запускай приложение от root.</p>

<h5>Nginx как reverse proxy</h5>
<p>Nginx обычно принимает публичный HTTP(S), выбирает server block по hostname, завершает TLS и передаёт запрос Node приложению, слушающему 127.0.0.1:3000. Он может обслуживать static assets, ограничивать размер body, буферизовать/передавать поток и добавлять forwarding headers. Настройка proxy headers доверена только если backend недоступен напрямую и корректно настроен trust proxy.</p>
<pre class="code">server {
  listen 80;
  server_name app.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}</pre>
<pre class="code">sudo nginx -t
sudo systemctl reload nginx
sudo systemctl status nginx --no-pager
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log</pre>
<p><code class="i">nginx -t</code> проверяет конфигурацию; reload применяет её без полного прекращения текущих соединений. Сначала DNS A/AAAA должен вести на нужный публичный адрес, cloud firewall и UFW разрешать 80/443, а backend слушать ожидаемый адрес. Проверь домен через <code class="i">curl -v -H 'Host: app.example.com' http://SERVER_IP/</code> до TLS.</p>

<h5>DNS, HTTPS и автоматическое обновление сертификата</h5>
<p>DNS A указывает IPv4, AAAA — IPv6. Перед сертификатом проверь оба: ошибочный AAAA может увести часть клиентов на сервер/интерфейс, где сайт не настроен. Let’s Encrypt ACME подтверждает контроль над hostname, например HTTP-01 требует доступного порта 80 или DNS-01 доступ к записи зоны. Сертификат имеет срок действия, поэтому автоматическое renewal и проверка timer — обязательны.</p>
<pre class="code">dig +short A app.example.com
dig +short AAAA app.example.com
sudo certbot --nginx -d app.example.com
sudo certbot renew --dry-run
systemctl list-timers | grep -i certbot</pre>
<p>Команда certbot зависит от способа установки/дистрибутива. После выпуска проверь TLS chain, hostname, auto-renew timer, открытый port 443 и redirect HTTP→HTTPS. Не отключай проверку сертификата в клиенте. Private key должен быть доступен только нужным процессам; автоматизируй мониторинг срока действия.</p>

<h5>Логи, метрики и диагностика без угадывания</h5>
<pre class="code">systemctl --failed
journalctl -p warning..alert --since today
ps aux --sort=-%mem | head
top
ss -lntup
curl -sS -o /dev/null -w 'code=%{http_code} connect=%{time_connect} ttfb=%{time_starttransfer}\n' https://app.example.com/health
free -h && df -h</pre>
<p>Начни с симптома и слоя: сервис не стартует — systemd/journal; порт не открыт — ss/firewall/provider; домен не разрешается — dig; TLS — openssl/curl; HTTP 502 — Nginx upstream + app logs; диск заполнен — df/du/lsof; memory pressure — free, process RSS, kernel OOM log. Не перезапускай сервер как первую реакцию: это стирает часть evidence, вызывает downtime и может скрыть crash loop.</p>

<h5>Backups: копия не равна восстановлению</h5>
<p>Реши, что именно надо восстановить: БД, загруженные файлы, конфигурацию, TLS private key, DNS/IaC, deployment artifact. Snapshot всего VPS помогает быстро клонировать, но не всегда application-consistent; БД требует подходящего backup/replication метода. Храни копию вне этой же VPS/account/region, шифруй, ограничь доступ, установи retention и RPO/RTO.</p>
<p><b>RPO</b> — сколько данных приемлемо потерять; <b>RTO</b> — сколько времени приемлемо восстанавливаться. Периодически тестируй восстановление в отдельную среду, проверяй целостность и что ключи доступны. Backup, который никогда не восстанавливали, не доказан.</p>

<h5>Развёртывание приложения и безопасный rollback</h5>
<p>Не редактируй source production на сервере вручную. CI собирает immutable artifact, проверяет его, выкладывает в новую release directory, устанавливает зависимости воспроизводимо, запускает smoke check и атомарно переключает current symlink/release. Сохраняй предыдущую версию для rollback. Миграции БД делай backward-compatible: сначала добавь nullable поле/новую таблицу, выложи совместимый код, перенеси данные, потом удаляй старую схему отдельным шагом.</p>
<p>Если приложение слушает только localhost за Nginx, Node порт не открывай в firewall наружу. Secrets передавай отдельным защищённым механизмом. Проверь owner permissions, health endpoint, graceful shutdown, log rotation, disk alarms и план обновлений ОС.</p>

<h5>Сетевые и файловые команды: мини-справочник</h5>
<table><tr><th>Команда</th><th>Что показывает</th><th>Когда помогает</th></tr>
<tr><td><code class="i">ip addr / ip route</code></td><td>IP адреса и пути</td><td>нет доступа, неверная сеть</td></tr>
<tr><td><code class="i">ss -lntup</code></td><td>listeners и процессы</td><td>порт закрыт или занят</td></tr>
<tr><td><code class="i">dig / getent hosts</code></td><td>DNS ответ через resolver</td><td>домен ведёт не туда</td></tr>
<tr><td><code class="i">curl -v / -w</code></td><td>HTTP/TLS и timing</td><td>разделить connect, TLS, TTFB</td></tr>
<tr><td><code class="i">journalctl -u NAME</code></td><td>service logs</td><td>crash, config, permission</td></tr>
<tr><td><code class="i">df -h / df -i</code></td><td>байты и inodes</td><td>не записываются логи/файлы</td></tr>
<tr><td><code class="i">du / lsof +L1</code></td><td>директории / удалённые открытые файлы</td><td>неясно, кто занял диск</td></tr>
<tr><td><code class="i">top / free / dmesg</code></td><td>CPU, память, kernel events</td><td>OOM, load, аппаратные ошибки</td></tr></table>

<h5>Практикум: поднять API на новой VPS</h5>
<div data-demo="vps-runbook"></div>
<ol><li>Записать recovery путь и создать snapshot, собрать информацию о дистрибутиве, адресах, дисках и DNS.</li><li>Создать администратора, настроить SSH key и подтвердить вход во второй сессии.</li><li>Обновить пакеты, подготовить автоматизированный reboot plan и проверить firewall провайдера.</li><li>Включить UFW по безопасному порядку и доказать, какие порты доступны снаружи.</li><li>Развернуть Node сервис отдельным пользователем на loopback, создать systemd unit, проверить restart и SIGTERM.</li><li>Настроить Nginx hostname, DNS A/AAAA, TLS renewal, HTTPS redirect и корректные forwarding headers.</li><li>Настроить структурированные логи, log rotation, uptime/disk/certificate alerts и отдельный offsite backup.</li><li>Сымитировать сломанный release, заполненный диск, истёкший сертификат, неверный DNS и недоступную БД; восстановить по runbook.</li><li>Удалить тестовую VPS и развернуть заново из IaC/configuration management без ручной памяти о шагах.</li></ol>
<p><b>Главный навык администрирования:</b> после каждой операции знать, что именно изменилось, как проверить состояние, как откатить и какой мониторинг покажет повтор проблемы.</p>
` }
