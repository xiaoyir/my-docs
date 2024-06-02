import{_ as n,c as s,o as a,d as i}from"./app-BLFzZ_eu.js";const e={},l=i(`<h1 id="秒杀系统之nginx开发" tabindex="-1"><a class="header-anchor" href="#秒杀系统之nginx开发"><span>秒杀系统之Nginx开发</span></a></h1><h1 id="_1-技术概述" tabindex="-1"><a class="header-anchor" href="#_1-技术概述"><span><strong>1. 技术概述</strong></span></a></h1><h3 id="" tabindex="-1"><a class="header-anchor" href="#"><span></span></a></h3><h3 id="_1-1-nginx介绍" tabindex="-1"><a class="header-anchor" href="#_1-1-nginx介绍"><span><strong>1.1 nginx介绍</strong></span></a></h3><p>Nginx 最早被发明出来，就是来应对互联网高速发展下，出现的并发几十万、上百万的网络请求连接场景的，传统 Apache 服务器无法有效地解决这种问题，而 Nginx 却具有并发能力强、资源消耗低的特性。总的来说，Nginx 有 5 大优点，即模块化、事件驱动、异步、非阻塞、多进程单线程。</p><p>Nginx 是由一个 master 进程和多个 worker 进程（可配置）来配合完成工作的。其中 master 进程负责 Nginx 配置文件的加载和 worker 进程的管理工作，而 worker 进程负责请求的处理与转发，进程之间相互隔离，互不干扰。同时每个进程中只有一个线程，这就省去了并发情况下的加锁以及线程的切换带来的性能损耗。</p><p>以 Linux 为例，Nginx 的工作模型采用的是 epoll 模型（即事件驱动模型），该模型是 IO 多路复用思想的一种实现方式，是异步非阻塞的，什么意思呢？就是一个请求进来后，会由一个 worker 进程去处理，当程序代码执行到 IO 时，比如调用外部服务或是通过 upstream 分发请求到后端 Web 服务时，IO 是阻塞的，但是 worker 进程不会一直在这等着，而是等 IO 有结果了再处理，在这期间它会去处理别的请求，这样就可以充分利用 CPU 资源去处理多个请求了。所以一个线程也能支持高并发的业务场景。</p><p>以下是nginx配置文件nginx.conf的结构图：</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173034.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><ul><li><p>全局模块配置：这里一般配置 Nginx 的进程数、日志目录与级别、CPU 绑核等；</p></li><li><p>events 模块配置：主要配置 Nginx 使用的工作模型，进程连接数限制等；</p></li><li><p>HTTP 模块配置：这里就是处理 HTTP 请求的相关配置，包括监控的域名、端口、URL 以及业务代码的配置引用等。</p></li></ul><h3 id="-1" tabindex="-1"><a class="header-anchor" href="#-1"><span></span></a></h3><h3 id="_1-2-openresty介绍" tabindex="-1"><a class="header-anchor" href="#_1-2-openresty介绍"><span><strong>1.2 openResty介绍</strong></span></a></h3><p>Nginx 的底层模块一般都是用 C 语言写的，如果我们想在 Nginx 的基础之上写业务逻辑，还得借助 OpenResty。OpenResty 是一个基于 Nginx 与 Lua 的高性能 Web 平台，它使我们具备在 Nginx 上使用 Lua 语言来开发业务逻辑的能力，并充分利用 Nginx 的非阻塞 IO 模型，来帮助我们非常方便地搭建能够处理超高并发、扩展性极高的动态 Web 应用、Web 服务和动态网关。</p><h3 id="-2" tabindex="-1"><a class="header-anchor" href="#-2"><span></span></a></h3><h3 id="_1-3-lua介绍" tabindex="-1"><a class="header-anchor" href="#_1-3-lua介绍"><span><strong>1.3 lua介绍</strong></span></a></h3><p>之所以用lua语言来做nginx的开发，是因为Lua 的线程模型是单线程多协程的模式，而 Nginx 刚好是单进程单线程，天生的完美搭档。同时 Lua 是一种小巧的脚本语言，语法非常的简单，很容易学习掌握。openresty为nginx提供了share dict共享字典的功能，可以在nginx的多个worker之间共享数据，实现缓存功能。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span># 共享字典，也叫本地缓存，设置名称为item_cache，大小150m</span></span>
<span class="line"><span>lua_shared_dict item_cache 150m;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_2-环境搭建" tabindex="-1"><a class="header-anchor" href="#_2-环境搭建"><span><strong>2. 环境搭建</strong></span></a></h2><p>使用idea基于windows系统，配置Lua+OpenResty+Nginx开发环境步骤如下：</p><h3 id="-3" tabindex="-1"><a class="header-anchor" href="#-3"><span></span></a></h3><h3 id="_1-1-idea插件" tabindex="-1"><a class="header-anchor" href="#_1-1-idea插件"><span><strong>1.1 idea插件</strong></span></a></h3><p>1.idea安装EmmyLua、nginx Support、OpenResty Lua Support这三个插件，然后重启。重启后EmmyLua和OpenResty Lua Support插件可能会提示有冲突，忽略即可，无需其他操作。</p><p>2.去OpenResty官网下载最新版本的OpenRestry：http://openresty.org/cn/download.html</p><p>本次下载的是openresty-1.21.4.1-win64.zip，然后解压。</p><h3 id="-4" tabindex="-1"><a class="header-anchor" href="#-4"><span></span></a></h3><h3 id="_1-2-新建项目" tabindex="-1"><a class="header-anchor" href="#_1-2-新建项目"><span><strong>1.2 新建项目</strong></span></a></h3><p>1.新建lua项目，需要安装完EmmyLua插件才会出现下图中的lua标志。</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173052.png" alt="img_1" tabindex="0" loading="lazy"><figcaption>img_1</figcaption></figure><p>2.项目新建完成后，点击界面左上角的run -&gt; Edit configutations，配置nginx server。需要配置成我们第一步安装的OpenResty中的nginx。</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173107.png" alt="img_2" tabindex="0" loading="lazy"><figcaption>img_2</figcaption></figure><p>3.根目录下新建一个build.xml文件，文件代码如下，注意location=&quot;D:\\myUtils\\openresty-1.21.4.1-win64&quot; 这个地方需要修改成openresty的安装目录：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;</span></span>
<span class="line"><span>&lt;project name=&quot;demo-nginx&quot; default=&quot;dist&quot; basedir=&quot;.&quot;&gt;</span></span>
<span class="line"><span>    &lt;description&gt;</span></span>
<span class="line"><span>        run demo-nginx</span></span>
<span class="line"><span>    &lt;/description&gt;</span></span>
<span class="line"><span>    &lt;!-- set global properties for this build --&gt;</span></span>
<span class="line"><span>    &lt;property name=&quot;openresty-home&quot; location=&quot;D:\\myUtils\\openresty-1.21.4.1-win64&quot;/&gt;</span></span>
<span class="line"><span>    &lt;property name=&quot;conf&quot; location=&quot;\${basedir}/conf&quot;/&gt;</span></span>
<span class="line"><span>    &lt;property name=&quot;src&quot; location=&quot;\${basedir}/src&quot;/&gt;</span></span>
<span class="line"><span>    &lt;property name=&quot;target-conf&quot; location=&quot;\${openresty-home}/conf&quot;/&gt;</span></span>
<span class="line"><span>    &lt;property name=&quot;target-src&quot; location=&quot;\${openresty-home}/\${ant.project.name}&quot;/&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &lt;echo&gt;ant配置&lt;/echo&gt;</span></span>
<span class="line"><span>    &lt;target name=&quot;clean&quot; depends=&quot;&quot;&gt;</span></span>
<span class="line"><span>        &lt;echo&gt;清理openresty目录( \${dist}下的conf,logs,janus,januslib)&lt;/echo&gt;</span></span>
<span class="line"><span>        &lt;delete dir=&quot;\${target-conf}&quot;/&gt;</span></span>
<span class="line"><span>        &lt;delete dir=&quot;\${target-src}&quot;/&gt;</span></span>
<span class="line"><span>        &lt;delete&gt;</span></span>
<span class="line"><span>            &lt;fileset dir=&quot;\${openresty-home}/logs&quot; includes=&quot;*.log&quot;&gt;&lt;/fileset&gt;</span></span>
<span class="line"><span>        &lt;/delete&gt;</span></span>
<span class="line"><span>    &lt;/target&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &lt;target name=&quot;init&quot; depends=&quot;clean&quot;&gt;</span></span>
<span class="line"><span>        &lt;echo&gt;创建安装目录&lt;/echo&gt;</span></span>
<span class="line"><span>        &lt;mkdir dir=&quot;\${target-conf}&quot;/&gt;</span></span>
<span class="line"><span>        &lt;mkdir dir=&quot;\${target-src}&quot;/&gt;</span></span>
<span class="line"><span>    &lt;/target&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &lt;target name=&quot;dist&quot; depends=&quot;init&quot; description=&quot;generate the distribution&quot; &gt;</span></span>
<span class="line"><span>        &lt;echo&gt;复制安装文件&lt;/echo&gt;</span></span>
<span class="line"><span>        &lt;copy todir=&quot;\${target-conf}&quot;&gt;</span></span>
<span class="line"><span>            &lt;fileset dir=&quot;\${conf}&quot;&gt;&lt;/fileset&gt;</span></span>
<span class="line"><span>        &lt;/copy&gt;</span></span>
<span class="line"><span>        &lt;copy todir=&quot;\${target-src}&quot;&gt;</span></span>
<span class="line"><span>            &lt;fileset dir=&quot;\${src}&quot;&gt;&lt;/fileset&gt;</span></span>
<span class="line"><span>        &lt;/copy&gt;</span></span>
<span class="line"><span>    &lt;/target&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>&lt;/project&gt;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>4.选择idea右侧Ant Build，选择刚刚配置的build.xml文件，最后点击OK：</p><p><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173543.png" alt="img_3" loading="lazy"> 5.在nginx中配置Run Ant target，选择dist。另外由于ant需要JDK环境，所以需要指定项目的JDK版本。选择File-&gt;Project Structure，Project选择JDK1.8。</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173629.png" alt="img_4" tabindex="0" loading="lazy"><figcaption>img_4</figcaption></figure><h3 id="-5" tabindex="-1"><a class="header-anchor" href="#-5"><span></span></a></h3><h3 id="_1-3-运行与测试" tabindex="-1"><a class="header-anchor" href="#_1-3-运行与测试"><span><strong>1.3 运行与测试</strong></span></a></h3><p>1.在项目根目录下新建conf文件夹，在该文件夹下新建nginx.conf文件，代码如下：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>worker_processes 1; #工作进程数            </span></span>
<span class="line"><span>error_log logs/error.log error;#日志路径  日志级别            </span></span>
<span class="line"><span>events {            </span></span>
<span class="line"><span>    worker_connections 256;#单进程最大连接数            </span></span>
<span class="line"><span>}            </span></span>
<span class="line"><span>http {            </span></span>
<span class="line"><span>    lua_package_path &quot;demo-nginx/?.lua;;&quot;;            </span></span>
<span class="line"><span>    #include demo-nginx/domain/domain.com;            </span></span>
<span class="line"><span>           </span></span>
<span class="line"><span>           </span></span>
<span class="line"><span>    server {            </span></span>
<span class="line"><span>        listen 7081;            </span></span>
<span class="line"><span>        server_name  localhost;            </span></span>
<span class="line"><span>        default_type text/html;            </span></span>
<span class="line"><span>        location = /favicon.ico {            </span></span>
<span class="line"><span>            log_not_found off;            </span></span>
<span class="line"><span>            access_log off;            </span></span>
<span class="line"><span>        }            </span></span>
<span class="line"><span>           </span></span>
<span class="line"><span>        location /sayhello {            </span></span>
<span class="line"><span>            content_by_lua_file demo-nginx/test.lua;            </span></span>
<span class="line"><span>        }            </span></span>
<span class="line"><span>    }            </span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>2.在项目根目录下src文件夹下新建test.lua文件，代码如下：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>local function main()            </span></span>
<span class="line"><span>    ngx.say(&quot;Hello World&quot;)            </span></span>
<span class="line"><span>end            </span></span>
<span class="line"><span>           </span></span>
<span class="line"><span>main()</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>3.最后项目整体结构大致如下，点击右上角的nginx运行程序。</p><p><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173737.png" alt="img_5" loading="lazy"> 4.访问页面验证，成功返回。 <img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173906.png" alt="img_7" loading="lazy"></p><h2 id="_3-功能扩展" tabindex="-1"><a class="header-anchor" href="#_3-功能扩展"><span><strong>3. 功能扩展</strong></span></a></h2><h3 id="-6" tabindex="-1"><a class="header-anchor" href="#-6"><span></span></a></h3><h3 id="_3-1-限流配置" tabindex="-1"><a class="header-anchor" href="#_3-1-限流配置"><span><strong>3.1 限流配置</strong></span></a></h3><h4 id="-7" tabindex="-1"><a class="header-anchor" href="#-7"><span></span></a></h4><h4 id="_3-1-1-控制速率" tabindex="-1"><a class="header-anchor" href="#_3-1-1-控制速率"><span><strong>3.1.1 控制速率</strong></span></a></h4><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>#限流配置定义            </span></span>
<span class="line"><span>limit_req_zone $binary_remote_addr zone=contentRateLimit:10m rate=2r/s;            </span></span>
<span class="line"><span>server {            </span></span>
<span class="line"><span>  listen       80;            </span></span>
<span class="line"><span>  server_name  localhost;            </span></span>
<span class="line"><span>  location /read_content {            </span></span>
<span class="line"><span>    #限流配置引用            </span></span>
<span class="line"><span>    limit_req zone=contentRateLimit burst=4 nodelay;            </span></span>
<span class="line"><span>    content_by_lua_file /root/lua/read_content.lua;            </span></span>
<span class="line"><span>  }            </span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里定义了一个名为 contentRateLimit 的限流规则，根据请求的服务器 IP 来做限流，限流的速率为同一个IP地址 1 秒内只允许 2 个请求通过，即500ms处理一个请求。</p><p>这里的 10m 表示该规则申请的内存大小为 10m。假如一个 binary_remote_addr 占用的内存大小为 16 字节，那么 10M 的内存大概可以处理单机 10*1024*1024/16=655360 个请求。</p><p>burst 译为突发、爆发，表示在超过设定的处理速率后能额外处理的请求数。此处，**burst=4 **，表示若同时有4个请求到达，Nginx 会处理第一个请求，剩余3个请求将放入队列，然后每隔500ms从队列中获取一个请求进行处理。若请求数大于4，将拒绝处理多余的请求，直接返回503.</p><p>不过，单独使用burst参数并不实用。假设 burst=50 ，rate为10r/s，排队中的50个请求虽然每100ms会处理一个，但第50个请求却需要等待 50 * 100ms即 5s，这么长的处理时间自然难以接受。因此单纯的增加burst的值(与rate相比的值)，是没有意义的，这个值不会太大。因此，burst往往结合nodelay一起使用，nodelay 是被限流后的策略，意为不等待，直接返回。</p><h4 id="-8" tabindex="-1"><a class="header-anchor" href="#-8"><span></span></a></h4><h4 id="_3-1-2-控制并发量-连接数" tabindex="-1"><a class="header-anchor" href="#_3-1-2-控制并发量-连接数"><span><strong>3.1.2 控制并发量(连接数)</strong></span></a></h4><p>ngx_http_limit_conn_module提供了限制连接数的能力。主要是利用limit_conn_zone和limit_conn两个指令，利用连接数限制某一IP连接的数量来控制流量。注意并非所有连接都被计算在内，只有当服务器正在处理请求并且已经读取了整个请求头时，才会计算有效连接。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>#限流配置定义            </span></span>
<span class="line"><span>limit_req_zone $binary_remote_addr zone=contentRateLimit:10m rate=2r/s;            </span></span>
<span class="line"><span>           </span></span>
<span class="line"><span>#根据ip地址来限制并发数，内存大小为10M            </span></span>
<span class="line"><span>limit_conn_zone $binary_remote_addr zone=addr:10m;            </span></span>
<span class="line"><span>server {            </span></span>
<span class="line"><span>  listen       80;            </span></span>
<span class="line"><span>  server_name  localhost;            </span></span>
<span class="line"><span>           </span></span>
<span class="line"><span>  location /limit {            </span></span>
<span class="line"><span>    limit_conn addr 2;  #表示同一个地址只允许连接2次            </span></span>
<span class="line"><span>    proxy_pass http://192.168.12.1:9090;            </span></span>
<span class="line"><span>  }            </span></span>
<span class="line"><span>           </span></span>
<span class="line"><span>  location /read_content {            </span></span>
<span class="line"><span>    #限流配置引用            </span></span>
<span class="line"><span>    limit_req zone=contentRateLimit burst=4 nodelay;            </span></span>
<span class="line"><span>    content_by_lua_file /root/lua/read_content.lua;            </span></span>
<span class="line"><span>  }            </span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>图中设置访问某个后台请求http://192.168.12.1:9090/limit，同一IP只允许最大并发量为2。可在后台代码中设置休眠时间，方便测试。利用Jmeter验证，开3个线程的时候会发生异常，开2个就正常（测试结果略）。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@GetMapping(&quot;/limit&quot;)            </span></span>
<span class="line"><span>public String limit(){            </span></span>
<span class="line"><span>    System.out.println(&quot;休眠开始:&quot;+Thread.currentThread().getId());            </span></span>
<span class="line"><span>    try {            </span></span>
<span class="line"><span>        Thread.sleep(1000);            </span></span>
<span class="line"><span>    } catch (InterruptedException e) {            </span></span>
<span class="line"><span>        e.printStackTrace();            </span></span>
<span class="line"><span>    }            </span></span>
<span class="line"><span>    System.out.println(&quot;休眠结束:&quot;+Thread.currentThread().getId());            </span></span>
<span class="line"><span>    //业务逻辑代码            </span></span>
<span class="line"><span>    //...            </span></span>
<span class="line"><span>    return &quot;success&quot;;            </span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>另外在限制每个客户端IP与服务器的并发连接数的同时，可限制所有客户端与服务器的总连接数。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>limit_conn_zone $binary_remote_addr zone=perip:10m;            </span></span>
<span class="line"><span>limit_conn_zone $server_name zone=perserver:10m;            </span></span>
<span class="line"><span>server {              </span></span>
<span class="line"><span>  listen       80;            </span></span>
<span class="line"><span>  server_name  localhost;            </span></span>
<span class="line"><span>  charset utf-8;            </span></span>
<span class="line"><span>  location / {            </span></span>
<span class="line"><span>    limit_conn perip 10; #单个客户端ip与服务器的连接数．            </span></span>
<span class="line"><span>    limit_conn perserver 100; ＃限制所有客户端与服务器的总连接数            </span></span>
<span class="line"><span>      root   html;            </span></span>
<span class="line"><span>    index  index.html index.htm;            </span></span>
<span class="line"><span>  }            </span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="-9" tabindex="-1"><a class="header-anchor" href="#-9"><span></span></a></h3><h3 id="_3-2-lua实践" tabindex="-1"><a class="header-anchor" href="#_3-2-lua实践"><span><strong>3.2 lua实践</strong></span></a></h3><p>下面通过模拟用户抢购商品下单时的场景，利用user_id限流，实现nginx结合lua的二次开发。交互时序图大致如下：</p><p><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525174010.png" alt="img_8" loading="lazy"> 1.配置set_common_var.lua脚本文件。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>--通过请求URL获取st(security token)并赋值给变量st            </span></span>
<span class="line"><span>local param_st = ngx.var.arg_st            </span></span>
<span class="line"><span>if param_st == null then            </span></span>
<span class="line"><span>  param_st = &quot;&quot;            </span></span>
<span class="line"><span>end            </span></span>
<span class="line"><span>ngx.var.st = param_st            </span></span>
<span class="line"><span>--通过请求URL获取产品编码，并赋值给变量product_id            </span></span>
<span class="line"><span>local param_product_id = ngx.var.arg_productId            </span></span>
<span class="line"><span>if param_product_id == nil then            </span></span>
<span class="line"><span>  param_product_id = &quot;&quot;            </span></span>
<span class="line"><span>end            </span></span>
<span class="line"><span>ngx.var.product_id = param_product_id            </span></span>
<span class="line"><span>--通过cookie获取用户ID并赋值给user_id            </span></span>
<span class="line"><span>local user_id = ngx.var.cookie_user_id            </span></span>
<span class="line"><span>if user_id == nil then            </span></span>
<span class="line"><span>  user_id = &quot;&quot;            </span></span>
<span class="line"><span>end            </span></span>
<span class="line"><span>--打印值            </span></span>
<span class="line"><span>ngx.log(ngx.ERR,&quot;---- user id is : &quot;..user_id)            </span></span>
<span class="line"><span>return user_id</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果请求url=http://127.0.0.1:8080/domain/test?st=09876tryu54321&amp;productId=202210104591，则上图中的变量ngx.var.st=09876tryu54321，ngx.var.product_id=202210104591。nginx中的变量说明如下：</p><p>2.配置nginx.conf，在根目录下新建html文件夹，新建page.html和html_fail.html静态文件模拟请求。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>log_format access &#39;$remote_addr - $remote_user [$time_local] &quot;$request&quot; $status &#39;            </span></span>
<span class="line"><span>    &#39;&quot;$upstream_addr&quot; &quot;$upstream_status&quot; &quot;$upstream_response_time&quot; userId:&quot;$user_id&quot;&#39;;            </span></span>
<span class="line"><span>#限流规则            </span></span>
<span class="line"><span>limit_req_zone $user_id zone=limit_by_user:10m rate=1r/s;            </span></span>
<span class="line"><span>server {              </span></span>
<span class="line"><span>  listen       7081;            </span></span>
<span class="line"><span>  error_log  D://logs/domain-error.log error;            </span></span>
<span class="line"><span>  access_log  D://logs/domain-access.log access;            </span></span>
<span class="line"><span>  server_name  localhost;            </span></span>
<span class="line"><span>  default_type text/html;            </span></span>
<span class="line"><span>  set $st &quot;&quot;;        </span></span>
<span class="line"><span>  set $product_id &quot;&quot;;            </span></span>
<span class="line"><span>  set_by_lua_file $user_id D://2020CRPrograms/demo-nginx/lua/set_common_var.lua;            </span></span>
<span class="line"><span>  location /query {            </span></span>
<span class="line"><span>    limit_req zone=limit_by_user nodelay;            </span></span>
<span class="line"><span>    #proxy_pass http://xx.xx.xx.xx;            </span></span>
<span class="line"><span>    #设置返回的header,并将security token放在headers中            </span></span>
<span class="line"><span>    header_filter_by_lua_block{            </span></span>
<span class="line"><span>      -- 这里st的只是简单地将用户ID+时序图中的步骤编号做了MD5，生产上应加入商品编号、自定义加密key等            </span></span>
<span class="line"><span>      ngx.header[&quot;st&quot;] = ngx.md5(ngx.var.user_id..&quot;1&quot;)            </span></span>
<span class="line"><span>      ngx.header[&quot;Access-Control-Expose-Headers&quot;] = &quot;st&quot;            </span></span>
<span class="line"><span>    }            </span></span>
<span class="line"><span>    rewrite_by_lua_block{            </span></span>
<span class="line"><span>        local function main()            </span></span>
<span class="line"><span>            ngx.say(&quot;请求成功，请继续下一步操作.&quot;)            </span></span>
<span class="line"><span>        end            </span></span>
<span class="line"><span>        main()            </span></span>
<span class="line"><span>    }            </span></span>
<span class="line"><span>  }            </span></span>
<span class="line"><span>           </span></span>
<span class="line"><span>  location /prePage {            </span></span>
<span class="line"><span>    default_type text/html;            </span></span>
<span class="line"><span>    rewrite_by_lua_block{            </span></span>
<span class="line"><span>      --先检验st            </span></span>
<span class="line"><span>      local _st = ngx.md5(ngx.var.user_id..&quot;1&quot;)            </span></span>
<span class="line"><span>      --检验不通过时，以500状态码，返回对应错误页            </span></span>
<span class="line"><span>      if _st ~= ngx.var.st then            </span></span>
<span class="line"><span>        ngx.log(ngx.ERR,&quot;st is not valid!&quot;)            </span></span>
<span class="line"><span>        return ngx.exit(500)            </span></span>
<span class="line"><span>      end            </span></span>
<span class="line"><span>      --检验通过时，再生成个新的st，用于下个接口校验            </span></span>
<span class="line"><span>      local new_st = ngx.md5(ngx.var.user_id..&quot;2&quot;)            </span></span>
<span class="line"><span>      --ngx.exec执行内部跳转，浏览器url不会发生改变            </span></span>
<span class="line"><span>      --ngx.redirect(url,status)重定向，其中status为301或302            </span></span>
<span class="line"><span>      local redirect_url = &quot;/page&quot;..&quot;?productId=&quot;..ngx.var.product_id..&quot;&amp;st=&quot;..new_st            </span></span>
<span class="line"><span>      return ngx.redirect(redirect_url,302)            </span></span>
<span class="line"><span>    }            </span></span>
<span class="line"><span>    error_page 500 502 504 /html_fail.html;            </span></span>
<span class="line"><span>  }            </span></span>
<span class="line"><span>           </span></span>
<span class="line"><span>  location /page {            </span></span>
<span class="line"><span>    default_type text/html;            </span></span>
<span class="line"><span>    #proxy_pass http://xx.xx.xx.xx;            </span></span>
<span class="line"><span>    alias D://2020CRPrograms/demo-nginx/html;            </span></span>
<span class="line"><span>    index page.html;            </span></span>
<span class="line"><span>    error_page 500 502 504 /html_fail.html;            </span></span>
<span class="line"><span>  }            </span></span>
<span class="line"><span>           </span></span>
<span class="line"><span>  location = /html_fail.html{            </span></span>
<span class="line"><span>      default_type text/html;            </span></span>
<span class="line"><span>      root D://2020CRPrograms/demo-nginx/html;            </span></span>
<span class="line"><span>  }            </span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这里根据user_id设置了限流规则，配置了四个location，访问的是静态页面，实际开发中应代理至后台。</p><p><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525174104.png" alt="queryUrl" loading="lazy"> 最后整体项目结构如下，项目地址https://github.com/xiaoyir/demo-nginx.git</p><p><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525174031.png" alt="img_9" loading="lazy"> 使用postman进行验证，访问query请求成功返回security token：st=aaa42296669b958c3cee6c0475c8093e</p><p>请求头添加返回的token，访问prePage请求，成功返回page页面。</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525174041.png" alt="img_10" tabindex="0" loading="lazy"><figcaption>img_10</figcaption></figure>`,74),p=[l];function t(r,c){return a(),s("div",null,p)}const o=n(e,[["render",t],["__file","秒杀系统之Nginx开发.html.vue"]]),u=JSON.parse('{"path":"/skill/nginx/%E7%A7%92%E6%9D%80%E7%B3%BB%E7%BB%9F%E4%B9%8BNginx%E5%BC%80%E5%8F%91.html","title":"秒杀系统之Nginx开发","lang":"zh-CN","frontmatter":{"description":"秒杀系统之Nginx开发 1. 技术概述 1.1 nginx介绍 Nginx 最早被发明出来，就是来应对互联网高速发展下，出现的并发几十万、上百万的网络请求连接场景的，传统 Apache 服务器无法有效地解决这种问题，而 Nginx 却具有并发能力强、资源消耗低的特性。总的来说，Nginx 有 5 大优点，即模块化、事件驱动、异步、非阻塞、多进程单线程...","head":[["meta",{"property":"og:url","content":"https://mister-hope.github.io/my-docs/skill/nginx/%E7%A7%92%E6%9D%80%E7%B3%BB%E7%BB%9F%E4%B9%8BNginx%E5%BC%80%E5%8F%91.html"}],["meta",{"property":"og:site_name","content":"Java库"}],["meta",{"property":"og:title","content":"秒杀系统之Nginx开发"}],["meta",{"property":"og:description","content":"秒杀系统之Nginx开发 1. 技术概述 1.1 nginx介绍 Nginx 最早被发明出来，就是来应对互联网高速发展下，出现的并发几十万、上百万的网络请求连接场景的，传统 Apache 服务器无法有效地解决这种问题，而 Nginx 却具有并发能力强、资源消耗低的特性。总的来说，Nginx 有 5 大优点，即模块化、事件驱动、异步、非阻塞、多进程单线程..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173034.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-02T09:33:57.000Z"}],["meta",{"property":"article:author","content":"程序员小义"}],["meta",{"property":"article:modified_time","content":"2024-06-02T09:33:57.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"秒杀系统之Nginx开发\\",\\"image\\":[\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173034.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173052.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173107.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173543.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173629.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173737.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525173906.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525174010.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525174104.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525174031.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525174041.png\\"],\\"dateModified\\":\\"2024-06-02T09:33:57.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"程序员小义\\",\\"url\\":\\"https://mister-hope.com\\"}]}"]]},"headers":[{"level":3,"title":"","slug":"","link":"#","children":[]},{"level":3,"title":"1.1 nginx介绍","slug":"_1-1-nginx介绍","link":"#_1-1-nginx介绍","children":[]},{"level":3,"title":"","slug":"-1","link":"#-1","children":[]},{"level":3,"title":"1.2 openResty介绍","slug":"_1-2-openresty介绍","link":"#_1-2-openresty介绍","children":[]},{"level":3,"title":"","slug":"-2","link":"#-2","children":[]},{"level":3,"title":"1.3 lua介绍","slug":"_1-3-lua介绍","link":"#_1-3-lua介绍","children":[]},{"level":2,"title":"2. 环境搭建","slug":"_2-环境搭建","link":"#_2-环境搭建","children":[{"level":3,"title":"","slug":"-3","link":"#-3","children":[]},{"level":3,"title":"1.1 idea插件","slug":"_1-1-idea插件","link":"#_1-1-idea插件","children":[]},{"level":3,"title":"","slug":"-4","link":"#-4","children":[]},{"level":3,"title":"1.2 新建项目","slug":"_1-2-新建项目","link":"#_1-2-新建项目","children":[]},{"level":3,"title":"","slug":"-5","link":"#-5","children":[]},{"level":3,"title":"1.3 运行与测试","slug":"_1-3-运行与测试","link":"#_1-3-运行与测试","children":[]}]},{"level":2,"title":"3. 功能扩展","slug":"_3-功能扩展","link":"#_3-功能扩展","children":[{"level":3,"title":"","slug":"-6","link":"#-6","children":[]},{"level":3,"title":"3.1 限流配置","slug":"_3-1-限流配置","link":"#_3-1-限流配置","children":[]},{"level":3,"title":"","slug":"-9","link":"#-9","children":[]},{"level":3,"title":"3.2 lua实践","slug":"_3-2-lua实践","link":"#_3-2-lua实践","children":[]}]}],"git":{"createdTime":1717320269000,"updatedTime":1717320837000,"contributors":[{"name":"whuhbz","email":"463436681@qq.com","commits":2}]},"readingTime":{"minutes":9.49,"words":2848},"filePathRelative":"skill/nginx/秒杀系统之Nginx开发.md","localizedDate":"2024年6月2日","excerpt":"\\n<h1><strong>1. 技术概述</strong></h1>\\n<h3></h3>\\n<h3><strong>1.1 nginx介绍</strong></h3>\\n<p>Nginx 最早被发明出来，就是来应对互联网高速发展下，出现的并发几十万、上百万的网络请求连接场景的，传统 Apache 服务器无法有效地解决这种问题，而 Nginx 却具有并发能力强、资源消耗低的特性。总的来说，Nginx 有 5 大优点，即模块化、事件驱动、异步、非阻塞、多进程单线程。</p>\\n<p>Nginx 是由一个 master 进程和多个 worker 进程（可配置）来配合完成工作的。其中 master 进程负责 Nginx 配置文件的加载和 worker 进程的管理工作，而 worker 进程负责请求的处理与转发，进程之间相互隔离，互不干扰。同时每个进程中只有一个线程，这就省去了并发情况下的加锁以及线程的切换带来的性能损耗。</p>","autoDesc":true}');export{o as comp,u as data};
