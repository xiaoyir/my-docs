import{_ as n,c as s,o as a,d as e}from"./app-CozQZ8Vh.js";const i={},l=e(`<h1 id="完蛋了-线程池死锁-生产出bug了" tabindex="-1"><a class="header-anchor" href="#完蛋了-线程池死锁-生产出bug了"><span>完蛋了，线程池死锁，生产出Bug了</span></a></h1><p>生产环境系统excel报表导不出，挨客户投诉，内心慌得一批，赶紧查看日志，结果发现是线程池死锁，还是自己写的代码，这锅不背也得背了。</p><p>遇事不要慌，来杯82年的java压压惊。还好之前做了开关配置，小义赶紧切换开关恢复旧页面，先解决客户问题。排查了半天日志，原来是因为父子任务共用同个线程池，造成循环依赖，直接堵死了导出请求。</p><p>下面来模拟一下当时的导出场景，客户导出一天的订单，分批按100条去查每个订单详情，然后每个订单有关联的运单信息需要另外分批按10个10个的去查。不要问小义为什么一次查询的数量这么少，数据我管不着，接口都是第三方服务的，他们只能这么支持。</p><p>为提高查询效率，只能利用多线程了。先新建一个通用的线程池和线程工厂。</p><ul><li>线程工厂</li></ul><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>import com.sun.istack.NotNull;</span></span>
<span class="line"><span>import java.util.concurrent.ThreadFactory;</span></span>
<span class="line"><span>import java.util.concurrent.atomic.AtomicInteger;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * @description: 线程工厂,可自定义线程名</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>public class NamedThreadFactory implements ThreadFactory {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 线程名前缀</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    private final String prefix;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 线程编号</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    private final AtomicInteger threadNumber = new AtomicInteger(1);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 创建线程工厂</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param prefix 线程名前缀</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    public NamedThreadFactory(String prefix) {</span></span>
<span class="line"><span>        this.prefix = prefix;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public Thread newThread(@NotNull Runnable r) {</span></span>
<span class="line"><span>        return new Thread(null, r, prefix + threadNumber.getAndIncrement());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>配置线程池</li></ul><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>import org.springframework.context.annotation.Bean;</span></span>
<span class="line"><span>import org.springframework.context.annotation.Configuration;</span></span>
<span class="line"><span>import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import java.util.concurrent.ArrayBlockingQueue;</span></span>
<span class="line"><span>import java.util.concurrent.ExecutorService;</span></span>
<span class="line"><span>import java.util.concurrent.TimeUnit;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/**</span></span>
<span class="line"><span> * Description:线程池基础配置</span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>@Configuration</span></span>
<span class="line"><span>public class ExecutorConfig implements WebMvcConfigurer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Bean(value = &quot;orderExecutorService&quot;)</span></span>
<span class="line"><span>    public ExecutorService aaasMiniExecutorService() {</span></span>
<span class="line"><span>        return new MdcThreadPoolExecutor(5, 10, 60,</span></span>
<span class="line"><span>                TimeUnit.SECONDS, new ArrayBlockingQueue&lt;&gt;(3000),</span></span>
<span class="line"><span>                new NamedThreadFactory(&quot;order&quot;));</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>执行代码</li></ul><p>假设总共有5000条订单，分5000/100=50个父线程去查订单详情，每个父线程再新建100/10=10个子线程去查运单号。所以父线程要等待子线程执行完然后组装订单信息。</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525165140.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><p>写个单元测试复现一下</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class ThreadPoolTest {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Autowired</span></span>
<span class="line"><span>    private ExecutorService orderExecutorService;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Test</span></span>
<span class="line"><span>    public void executorTest() {</span></span>
<span class="line"><span>        List&lt;CompletableFuture&lt;List&lt;OrderDetailDTO&gt;&gt;&gt; orderFutureList = Lists.newArrayList();</span></span>
<span class="line"><span>        for (int i = 0; i &lt; 50; i++) {</span></span>
<span class="line"><span>            int finalPageNo = i;</span></span>
<span class="line"><span>            orderFutureList.add(CompletableFuture.supplyAsync(() -&gt; {</span></span>
<span class="line"><span>                List&lt;OrderDetailDTO&gt; orderInfoList = queryOrderInfo(finalPageNo,100);</span></span>
<span class="line"><span>                return orderInfoList;</span></span>
<span class="line"><span>            }, orderExecutorService));</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        List&lt;OrderDetailDTO&gt; orderDetailDTOList = orderFutureList.stream().map(f -&gt; f.join())</span></span>
<span class="line"><span>                .flatMap(l -&gt; l.stream()).collect(Collectors.toList());</span></span>
<span class="line"><span>        return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private List&lt;OrderDetailDTO&gt; queryOrderInfo(int pageNo, int pageSize) {</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>            //查询订单信息</span></span>
<span class="line"><span>            List&lt;OrderDetailDTO&gt; orderList = queryOrderDetail(pageNo, pageSize);</span></span>
<span class="line"><span>            List&lt;String&gt; orderIdList = orderList.stream().map(OrderDetailDTO::getOrderId).collect(Collectors.toList());</span></span>
<span class="line"><span>            List&lt;List&lt;String&gt;&gt; orderIdListList = Lists.partition(orderIdList, 10);</span></span>
<span class="line"><span>            Map&lt;String, String&gt; idMap = queryBatchTrackId(orderIdListList);</span></span>
<span class="line"><span>            orderList.stream().forEach(orderDetailDTO -&gt; {</span></span>
<span class="line"><span>                orderDetailDTO.setTrackId(idMap.getOrDefault(orderDetailDTO.getOrderId(),&quot;&quot;));</span></span>
<span class="line"><span>            });</span></span>
<span class="line"><span>        } catch (Exception e) {</span></span>
<span class="line"><span>            log.error(&quot;查询订单详情异常:{}&quot;,e.getMessage(),e);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return Lists.newArrayList();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private Map&lt;String, String&gt; queryBatchTrackId(List&lt;List&lt;String&gt;&gt; orderIdListList) {</span></span>
<span class="line"><span>        Map&lt;String, String&gt; map = new HashMap&lt;&gt;();</span></span>
<span class="line"><span>        List&lt;CompletableFuture&lt;List&lt;TrackInfo&gt;&gt;&gt; trackFutureList = Lists.newArrayList();</span></span>
<span class="line"><span>        if (CollUtil.isEmpty(orderIdListList)) return map;</span></span>
<span class="line"><span>        try{</span></span>
<span class="line"><span>            for (List&lt;String&gt; list : orderIdListList) {</span></span>
<span class="line"><span>                trackFutureList.add(CompletableFuture.supplyAsync(() -&gt; {</span></span>
<span class="line"><span>                    List&lt;TrackInfo&gt; trackList = queryTrackInfoByOrderId(list);</span></span>
<span class="line"><span>                    return trackList;</span></span>
<span class="line"><span>                }, orderExecutorService));</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            map = trackFutureList.stream().map(f -&gt; f.join()).flatMap(l -&gt; l.stream())</span></span>
<span class="line"><span>                    .collect(Collectors.toMap(TrackInfo::getOrderId, TrackInfo::getTrackId));</span></span>
<span class="line"><span>        }catch (Exception e) {</span></span>
<span class="line"><span>            log.error(&quot;批量查询运单id异常：{}&quot;,e.getMessage(),e);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return map;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private List&lt;OrderDetailDTO&gt; queryOrderDetail(int pageNo, int pageSize) {</span></span>
<span class="line"><span>        //...</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private List&lt;TrackInfo&gt; queryTrackInfoByOrderId(List&lt;String&gt; list) {</span></span>
<span class="line"><span>        //...</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>利用jstack命令分析一下线程状态</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>&quot;order5&quot; #23 prio=5 os_prio=0 tid=0x000000001a2b4000 nid=0x6c04 waiting on condition [0x000000002311e000]</span></span>
<span class="line"><span>   java.lang.Thread.State: WAITING (parking)</span></span>
<span class="line"><span> at sun.misc.Unsafe.park(Native Method)</span></span>
<span class="line"><span> - parking to wait for  &lt;0x00000000e06b6598&gt; (a java.util.concurrent.CompletableFuture$Signaller)</span></span>
<span class="line"><span> at java.util.concurrent.locks.LockSupport.park(LockSupport.java:175)</span></span>
<span class="line"><span> at java.util.concurrent.CompletableFuture$Signaller.block(CompletableFuture.java:1707)</span></span>
<span class="line"><span> at java.util.concurrent.ForkJoinPool.managedBlock(ForkJoinPool.java:3323)</span></span>
<span class="line"><span> at java.util.concurrent.CompletableFuture.waitingGet(CompletableFuture.java:1742)</span></span>
<span class="line"><span> at java.util.concurrent.CompletableFuture.join(CompletableFuture.java:1947)</span></span>
<span class="line"><span> at org.coco.cat.utils.ThreadPoolTest.lambda$queryBatchTrackId$5(ThreadPoolTest.java:81)</span></span>
<span class="line"><span> at org.coco.cat.utils.ThreadPoolTest$$Lambda$735/383614241.apply(Unknown Source)</span></span>
<span class="line"><span> at java.util.stream.ReferencePipeline$3$1.accept(ReferencePipeline.java:193)</span></span>
<span class="line"><span> at java.util.ArrayList$ArrayListSpliterator.forEachRemaining(ArrayList.java:1382)</span></span>
<span class="line"><span> at java.util.stream.AbstractPipeline.copyInto(AbstractPipeline.java:482)</span></span>
<span class="line"><span> at java.util.stream.AbstractPipeline.wrapAndCopyInto(AbstractPipeline.java:472)</span></span>
<span class="line"><span> at java.util.stream.ReduceOps$ReduceOp.evaluateSequential(ReduceOps.java:708)</span></span>
<span class="line"><span> at java.util.stream.AbstractPipeline.evaluate(AbstractPipeline.java:234)</span></span>
<span class="line"><span> at java.util.stream.ReferencePipeline.collect(ReferencePipeline.java:499)</span></span>
<span class="line"><span> at org.coco.cat.utils.ThreadPoolTest.queryBatchTrackId(ThreadPoolTest.java:82)</span></span>
<span class="line"><span> at org.coco.cat.utils.ThreadPoolTest.queryOrderInfo(ThreadPoolTest.java:60)</span></span>
<span class="line"><span> at org.coco.cat.utils.ThreadPoolTest.lambda$executorTest$0(ThreadPoolTest.java:45)</span></span>
<span class="line"><span> at org.coco.cat.utils.ThreadPoolTest$$Lambda$723/1058101486.get(Unknown Source)</span></span>
<span class="line"><span> at java.util.concurrent.CompletableFuture$AsyncSupply.run(CompletableFuture.java:1604)</span></span>
<span class="line"><span> at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)</span></span>
<span class="line"><span> at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)</span></span>
<span class="line"><span> at java.lang.Thread.run(Thread.java:748)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>   Locked ownable synchronizers:</span></span>
<span class="line"><span> - &lt;0x00000000dfdfa878&gt; (a java.util.concurrent.ThreadPoolExecutor$Worker)</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到线程已经被锁住了，无法执行任务</p><ul><li>问题根源</li></ul><p>orderExecutorService核心线程数是5，最大线程是10，队列长度3000。因为父任务过多，一小子就把5个核心线程全部占有了，其他父任务和子任务只能到队列中等候，只有队列塞满了，才会另外起工作线程。这时候所有核心线程因为要等待子任务完成才能结束，而子任务又切好躺在队列中无法执行，所以就造成了循环依赖，也就是死锁，线程池被阻塞，无法工作了。</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525165424.png" alt="image-20240525165424096" tabindex="0" loading="lazy"><figcaption>image-20240525165424096</figcaption></figure><p>吃一堑长一智，总结是为了更好的提升，祝大家一起变得更强。</p>`,21),p=[l];function r(t,c){return a(),s("div",null,p)}const v=n(i,[["render",r],["__file","线程池死锁.html.vue"]]),o=JSON.parse('{"path":"/skill/java/%E7%BA%BF%E7%A8%8B%E6%B1%A0%E6%AD%BB%E9%94%81.html","title":"完蛋了，线程池死锁，生产出Bug了","lang":"zh-CN","frontmatter":{"description":"完蛋了，线程池死锁，生产出Bug了 生产环境系统excel报表导不出，挨客户投诉，内心慌得一批，赶紧查看日志，结果发现是线程池死锁，还是自己写的代码，这锅不背也得背了。 遇事不要慌，来杯82年的java压压惊。还好之前做了开关配置，小义赶紧切换开关恢复旧页面，先解决客户问题。排查了半天日志，原来是因为父子任务共用同个线程池，造成循环依赖，直接堵死了导出...","head":[["meta",{"property":"og:url","content":"https://mister-hope.github.io/my-docs/skill/java/%E7%BA%BF%E7%A8%8B%E6%B1%A0%E6%AD%BB%E9%94%81.html"}],["meta",{"property":"og:site_name","content":"Java库"}],["meta",{"property":"og:title","content":"完蛋了，线程池死锁，生产出Bug了"}],["meta",{"property":"og:description","content":"完蛋了，线程池死锁，生产出Bug了 生产环境系统excel报表导不出，挨客户投诉，内心慌得一批，赶紧查看日志，结果发现是线程池死锁，还是自己写的代码，这锅不背也得背了。 遇事不要慌，来杯82年的java压压惊。还好之前做了开关配置，小义赶紧切换开关恢复旧页面，先解决客户问题。排查了半天日志，原来是因为父子任务共用同个线程池，造成循环依赖，直接堵死了导出..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525165140.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-02T09:24:29.000Z"}],["meta",{"property":"article:author","content":"程序员小义"}],["meta",{"property":"article:modified_time","content":"2024-06-02T09:24:29.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"完蛋了，线程池死锁，生产出Bug了\\",\\"image\\":[\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525165140.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525165424.png\\"],\\"dateModified\\":\\"2024-06-02T09:24:29.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"程序员小义\\",\\"url\\":\\"https://mister-hope.com\\"}]}"]]},"headers":[],"git":{"createdTime":1717320269000,"updatedTime":1717320269000,"contributors":[{"name":"whuhbz","email":"463436681@qq.com","commits":1}]},"readingTime":{"minutes":3.54,"words":1061},"filePathRelative":"skill/java/线程池死锁.md","localizedDate":"2024年6月2日","excerpt":"\\n<p>生产环境系统excel报表导不出，挨客户投诉，内心慌得一批，赶紧查看日志，结果发现是线程池死锁，还是自己写的代码，这锅不背也得背了。</p>\\n<p>遇事不要慌，来杯82年的java压压惊。还好之前做了开关配置，小义赶紧切换开关恢复旧页面，先解决客户问题。排查了半天日志，原来是因为父子任务共用同个线程池，造成循环依赖，直接堵死了导出请求。</p>\\n<p>下面来模拟一下当时的导出场景，客户导出一天的订单，分批按100条去查每个订单详情，然后每个订单有关联的运单信息需要另外分批按10个10个的去查。不要问小义为什么一次查询的数量这么少，数据我管不着，接口都是第三方服务的，他们只能这么支持。</p>","autoDesc":true}');export{v as comp,o as data};
