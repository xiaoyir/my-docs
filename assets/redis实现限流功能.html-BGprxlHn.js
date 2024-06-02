import{_ as s,c as n,o as a,d as e}from"./app-CUrI_gXd.js";const i={},l=e(`<h1 id="太优雅了-用redis高效实现限流功能" tabindex="-1"><a class="header-anchor" href="#太优雅了-用redis高效实现限流功能"><span>太优雅了！用Redis高效实现限流功能!</span></a></h1><p>在高并发场景下，接口限流能够防止系统过载，确保服务的可用性和稳定性。限流策略的选择和实现方式，直接影响到用户体验和系统的负载能力。而Redis作为强大的内存数据库，以其卓越的性能和原子操作特性，成为了实现接口限流的理想选择。它不仅可以快速响应请求，还能通过其丰富的数据结构，如字符串、列表、有序集合等，来辅助实现多样化的限流逻辑。</p><h2 id="限流算法概览" tabindex="-1"><a class="header-anchor" href="#限流算法概览"><span>限流算法概览</span></a></h2><p>在介绍具体的Redis实现之前，我们先来了解几种常见的限流算法。</p><h3 id="固定窗口限流" tabindex="-1"><a class="header-anchor" href="#固定窗口限流"><span>固定窗口限流</span></a></h3><p>在固定时间窗口内限制请求数量。</p><ul><li><p>优点：实现简单，容易理解。</p></li><li><p>缺点：无法应对短时间内的突发流量。</p></li><li><p>适用场景：流量相对平稳，没有明显波峰波谷的系统。</p></li></ul><h3 id="滑动窗口限流" tabindex="-1"><a class="header-anchor" href="#滑动窗口限流"><span>滑动窗口限流</span></a></h3><p>将时间窗口划分为多个小片段，允许一定程度的突发流量。</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525175302.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><ul><li><p>优点：可以应对短时间内的突发流量。</p></li><li><p>缺点：实现相对复杂，需要维护多个计数器。</p></li><li><p>适用场景：有明显流量波峰的系统，如促销活动、流量突增等。</p></li></ul><h3 id="漏桶算法" tabindex="-1"><a class="header-anchor" href="#漏桶算法"><span>漏桶算法</span></a></h3><p>请求被收集到桶中，以固定速率处理。如果输入流量较大，则多余的流量会在桶中缓存起来，直到桶满为止。一旦桶满，新的流量将会被丢弃。</p><ul><li><p>优点：平滑处理请求，不受突发流量影响。</p></li><li><p>缺点：处理速度固定，无法充分利用系统资源。</p></li><li><p>适用场景：对处理速度有严格要求，不希望因为流量波动而影响处理速度的系统。</p></li></ul><h3 id="令牌桶算法" tabindex="-1"><a class="header-anchor" href="#令牌桶算法"><span>令牌桶算法</span></a></h3><p>允许在有可用令牌的情况下以任意速率传输数据。如果有足够的令牌，可以立即处理一个大的流量突发。当流量较小时，令牌可以在桶中积累。如果桶中令牌满了，则新生成的令牌将被丢弃。</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525175312.png" alt="img_1" tabindex="0" loading="lazy"><figcaption>img_1</figcaption></figure><ul><li><p>优点：允许一定程度的突发流量，同时限制长时间内的流量。</p></li><li><p>缺点：实现较为复杂，需要维护令牌生成和消耗。</p></li><li><p>适用场景：需要平衡突发流量和长时间流量限制的系统。</p></li></ul><h2 id="滑动窗口限流-1" tabindex="-1"><a class="header-anchor" href="#滑动窗口限流-1"><span>滑动窗口限流</span></a></h2><p>相对来说，滑动窗口限流可以更灵活地应对流量波动，是使用的最多的一个，这里介绍用redis来实现用户维度或接口维度下该限流的两种方式，可以用list或zset。</p><h3 id="list结构" tabindex="-1"><a class="header-anchor" href="#list结构"><span>List结构</span></a></h3><p>在Redis中，可以使用列表（List）来存储时间窗口内的请求计数。通过维护多个列表来实现多个时间窗口的计数，然后根据这些计数来判断是否允许新的请求通过。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@Component</span></span>
<span class="line"><span>public class SlideWindow {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Autowired</span></span>
<span class="line"><span>    private RedisTemplate redisTemplate;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 滑动时间窗口限流算法</span></span>
<span class="line"><span>     * 在指定时间窗口，指定限制次数内，是否允许通过</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @param listId     队列id，可以是用户Id 或者 用户Id+接口url 的维度来控制限流</span></span>
<span class="line"><span>     * @param count      限制次数</span></span>
<span class="line"><span>     * @param timeWindow 时间窗口大小</span></span>
<span class="line"><span>     * @return 是否允许通过</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    @SneakyThrows</span></span>
<span class="line"><span>    public boolean checkAccess(String listId, int count, long timeWindow) {</span></span>
<span class="line"><span>        // 获取当前时间</span></span>
<span class="line"><span>        long nowTime = System.currentTimeMillis();</span></span>
<span class="line"><span>        // 根据队列id，取出对应的限流队列，若没有则创建</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        if (redisTemplate.hasKey(listId)) {</span></span>
<span class="line"><span>            // 如果队列还没满，则允许通过，并添加当前时间戳到队列开始位置</span></span>
<span class="line"><span>            Long size = redisTemplate.opsForList().size(listId);</span></span>
<span class="line"><span>            if (size &lt; count) {</span></span>
<span class="line"><span>                redisTemplate.opsForList().leftPush(listId,nowTime);</span></span>
<span class="line"><span>                return true;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            // 队列已满（达到限制次数），则获取队列中最早添加的时间戳</span></span>
<span class="line"><span>            Long farTime = (Long) redisTemplate.opsForList().index(listId, count - 1);</span></span>
<span class="line"><span>            // 用当前时间戳 减去 最早添加的时间戳</span></span>
<span class="line"><span>            if (nowTime - farTime &lt;= timeWindow) {</span></span>
<span class="line"><span>                // 若结果小于等于timeWindow，则说明在timeWindow内，通过的次数大于count</span></span>
<span class="line"><span>                // 不允许通过</span></span>
<span class="line"><span>                return false;</span></span>
<span class="line"><span>            } else {</span></span>
<span class="line"><span>                // 若结果大于timeWindow，则说明在timeWindow内，通过的次数小于等于count</span></span>
<span class="line"><span>                // 允许通过，并删除最早添加的时间戳，将当前时间添加到队列开始位置</span></span>
<span class="line"><span>                redisTemplate.opsForList().rightPop(listId);</span></span>
<span class="line"><span>                redisTemplate.opsForList().leftPush(listId,nowTime);</span></span>
<span class="line"><span>                return true;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>            redisTemplate.opsForList().leftPush(listId,nowTime);</span></span>
<span class="line"><span>            return true;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="zset结构" tabindex="-1"><a class="header-anchor" href="#zset结构"><span>ZSet结构</span></a></h3><p>用有序集合（ZSet）来存储接口请求的时间，通过统计滑动时间窗口内的个数，来判断是否允许新的请求通过。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@Component</span></span>
<span class="line"><span>@Slf4j</span></span>
<span class="line"><span>public class FlowLimitInterceptor implements HandlerInterceptor {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Autowired</span></span>
<span class="line"><span>    StringRedisTemplate stringRedisTemplate;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>            String userId = request.getHeader(&quot;userId&quot;);</span></span>
<span class="line"><span>            if (!isPeriodLimiting(userId)) {</span></span>
<span class="line"><span>                return false;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        } catch (Exception e) {</span></span>
<span class="line"><span>            log.error(&quot;preHandle error:{}&quot;,e.getMessage(),e);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return true;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private boolean isPeriodLimiting(String userId) {</span></span>
<span class="line"><span>        String key = &quot;FLW_&quot; + userId;</span></span>
<span class="line"><span>        //设置滑动时间窗口1分钟最多访问1000次</span></span>
<span class="line"><span>        int period = 60;</span></span>
<span class="line"><span>        int periodMaxCount = 1000;</span></span>
<span class="line"><span>        long nowTs = System.currentTimeMillis();</span></span>
<span class="line"><span>        //移除过期时间元素，只保留最近一分钟的数据</span></span>
<span class="line"><span>        stringRedisTemplate.opsForZSet().removeRangeByScore(key, 0, nowTs - period * 1000);</span></span>
<span class="line"><span>        stringRedisTemplate.opsForZSet().add(key, String.valueOf(nowTs), nowTs);</span></span>
<span class="line"><span>        long currCount = stringRedisTemplate.opsForZSet().zCard(key);</span></span>
<span class="line"><span>        //大于单位时间内滑动窗口请求数量</span></span>
<span class="line"><span>        if (currCount &gt;= periodMaxCount) {</span></span>
<span class="line"><span>            return false;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        //如果考虑限制用户单日最大总请求数，可打开下方注释</span></span>
<span class="line"><span>//        if (beyondTotalNum(userId)) {</span></span>
<span class="line"><span>//            return false;</span></span>
<span class="line"><span>//        }</span></span>
<span class="line"><span>        return true;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private boolean beyondTotalNum(String userId) {</span></span>
<span class="line"><span>        String totalKey = &quot;FLC_&quot; + userId;</span></span>
<span class="line"><span>        Boolean redisKey = stringRedisTemplate.hasKey(totalKey);</span></span>
<span class="line"><span>        if (redisKey) {</span></span>
<span class="line"><span>            Integer num = Integer.parseInt((String) stringRedisTemplate.opsForValue().get(totalKey));</span></span>
<span class="line"><span>            int maxNum = 10000;</span></span>
<span class="line"><span>            if (num &gt;= maxNum) {</span></span>
<span class="line"><span>                return true;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            stringRedisTemplate.opsForValue().increment(totalKey, 1);</span></span>
<span class="line"><span>            return false;</span></span>
<span class="line"><span>        } else {</span></span>
<span class="line"><span>            stringRedisTemplate.opsForValue().set(totalKey, &quot;1&quot;, 1, TimeUnit.DAYS);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return false;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="结语" tabindex="-1"><a class="header-anchor" href="#结语"><span>结语</span></a></h2><p>Redis作为接口限流的利器，具备灵活的特性，使其在高并发场景下表现出色。当然，每种限流方法都有其优缺点，选择哪种方法取决于具体需求和场景。在实际应用中，也可以根据需要将不同的限流方法结合起来使用，以达到更好的限流效果。</p><hr><p><a href="http://mp.weixin.qq.com/s?__biz=Mzk0NjQwNzI1MA==&amp;mid=2247484059&amp;idx=1&amp;sn=2ac6dcddfa78e3d4d413d3cb6c214e0f&amp;chksm=c307d0a6f47059b040e29c0a82770f58d24bdf213b4c6137f3fe41d7a0b52f624f20879a9ea1&amp;scene=21#wechat_redirect" target="_blank" rel="noopener noreferrer">欢迎关注小义公众号，</a><a href="http://mp.weixin.qq.com/s?__biz=Mzk0NjQwNzI1MA==&amp;mid=2247484059&amp;idx=1&amp;sn=2ac6dcddfa78e3d4d413d3cb6c214e0f&amp;chksm=c307d0a6f47059b040e29c0a82770f58d24bdf213b4c6137f3fe41d7a0b52f624f20879a9ea1&amp;scene=21#wechat_redirect" target="_blank" rel="noopener noreferrer">点击此处结识程序员小义</a></p>`,30),p=[l];function d(r,c){return a(),n("div",null,p)}const m=s(i,[["render",d],["__file","redis实现限流功能.html.vue"]]),v=JSON.parse('{"path":"/skill/redis/redis%E5%AE%9E%E7%8E%B0%E9%99%90%E6%B5%81%E5%8A%9F%E8%83%BD.html","title":"太优雅了！用Redis高效实现限流功能!","lang":"zh-CN","frontmatter":{"description":"太优雅了！用Redis高效实现限流功能! 在高并发场景下，接口限流能够防止系统过载，确保服务的可用性和稳定性。限流策略的选择和实现方式，直接影响到用户体验和系统的负载能力。而Redis作为强大的内存数据库，以其卓越的性能和原子操作特性，成为了实现接口限流的理想选择。它不仅可以快速响应请求，还能通过其丰富的数据结构，如字符串、列表、有序集合等，来辅助实现...","head":[["meta",{"property":"og:url","content":"https://mister-hope.github.io/my-docs/skill/redis/redis%E5%AE%9E%E7%8E%B0%E9%99%90%E6%B5%81%E5%8A%9F%E8%83%BD.html"}],["meta",{"property":"og:site_name","content":"博客演示"}],["meta",{"property":"og:title","content":"太优雅了！用Redis高效实现限流功能!"}],["meta",{"property":"og:description","content":"太优雅了！用Redis高效实现限流功能! 在高并发场景下，接口限流能够防止系统过载，确保服务的可用性和稳定性。限流策略的选择和实现方式，直接影响到用户体验和系统的负载能力。而Redis作为强大的内存数据库，以其卓越的性能和原子操作特性，成为了实现接口限流的理想选择。它不仅可以快速响应请求，还能通过其丰富的数据结构，如字符串、列表、有序集合等，来辅助实现..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525175302.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-02T09:24:29.000Z"}],["meta",{"property":"article:author","content":"程序员小义"}],["meta",{"property":"article:modified_time","content":"2024-06-02T09:24:29.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"太优雅了！用Redis高效实现限流功能!\\",\\"image\\":[\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525175302.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525175312.png\\"],\\"dateModified\\":\\"2024-06-02T09:24:29.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"程序员小义\\",\\"url\\":\\"https://mister-hope.com\\"}]}"]]},"headers":[{"level":2,"title":"限流算法概览","slug":"限流算法概览","link":"#限流算法概览","children":[{"level":3,"title":"固定窗口限流","slug":"固定窗口限流","link":"#固定窗口限流","children":[]},{"level":3,"title":"滑动窗口限流","slug":"滑动窗口限流","link":"#滑动窗口限流","children":[]},{"level":3,"title":"漏桶算法","slug":"漏桶算法","link":"#漏桶算法","children":[]},{"level":3,"title":"令牌桶算法","slug":"令牌桶算法","link":"#令牌桶算法","children":[]}]},{"level":2,"title":"滑动窗口限流","slug":"滑动窗口限流-1","link":"#滑动窗口限流-1","children":[{"level":3,"title":"List结构","slug":"list结构","link":"#list结构","children":[]},{"level":3,"title":"ZSet结构","slug":"zset结构","link":"#zset结构","children":[]}]},{"level":2,"title":"结语","slug":"结语","link":"#结语","children":[]}],"git":{"createdTime":1717320269000,"updatedTime":1717320269000,"contributors":[{"name":"whuhbz","email":"463436681@qq.com","commits":1}]},"readingTime":{"minutes":5.02,"words":1505},"filePathRelative":"skill/redis/redis实现限流功能.md","localizedDate":"2024年6月2日","excerpt":"\\n<p>在高并发场景下，接口限流能够防止系统过载，确保服务的可用性和稳定性。限流策略的选择和实现方式，直接影响到用户体验和系统的负载能力。而Redis作为强大的内存数据库，以其卓越的性能和原子操作特性，成为了实现接口限流的理想选择。它不仅可以快速响应请求，还能通过其丰富的数据结构，如字符串、列表、有序集合等，来辅助实现多样化的限流逻辑。</p>\\n<h2>限流算法概览</h2>\\n<p>在介绍具体的Redis实现之前，我们先来了解几种常见的限流算法。</p>\\n<h3>固定窗口限流</h3>\\n<p>在固定时间窗口内限制请求数量。</p>\\n<ul>\\n<li>\\n<p>优点：实现简单，容易理解。</p>\\n</li>\\n<li>\\n<p>缺点：无法应对短时间内的突发流量。</p>\\n</li>\\n<li>\\n<p>适用场景：流量相对平稳，没有明显波峰波谷的系统。</p>\\n</li>\\n</ul>","autoDesc":true}');export{m as comp,v as data};
