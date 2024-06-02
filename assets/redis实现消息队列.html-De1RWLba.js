import{_ as s,c as e,o as n,d as a}from"./app-CUrI_gXd.js";const i={},l=a(`<h1 id="redis实现消息队列-超简单" tabindex="-1"><a class="header-anchor" href="#redis实现消息队列-超简单"><span>Redis实现消息队列，超简单！</span></a></h1><p>在现代的软件开发中，消息队列已经成为了构建可扩展、高性能系统的关键组件。它帮助我们解耦服务，实现异步处理，提高系统的吞吐量和稳定性。主要应用场景如下：</p><ul><li><p><strong>任务调度</strong>：将耗时的任务异步处理，提高系统的响应速度。</p></li><li><p><strong>日志处理</strong>：收集来自不同服务的日志，进行统一的处理和分析。</p></li><li><p><strong>事件驱动架构</strong>：构建松耦合的微服务架构，服务之间通过消息进行通信。</p></li></ul><p>其实除了kafka、rocketMQ等常见的消息中间件，redis也可以实现消息队列的功能。相信也有不少同学会被面试官问到，如何在不使用消息中间件的情况下实现一个消息队列，下面来看看redis如何处理。</p><h2 id="redis消息队列的工作原理" tabindex="-1"><a class="header-anchor" href="#redis消息队列的工作原理"><span>Redis消息队列的工作原理</span></a></h2><p>Redis消息队列的实现基于其内置的数据结构和命令。主要有以下几种方式：</p><h3 id="_1-使用list作为队列" tabindex="-1"><a class="header-anchor" href="#_1-使用list作为队列"><span>1. 使用List作为队列</span></a></h3><p>Redis的List数据结构是一个双向链表，可以通过<code>LPUSH</code>或<code>RPUSH</code>命令将消息添加到队列头部或尾部，消费者可以使用<code>LPOP</code>或<code>RPOP</code>命令从队列取出消息。这种方式简单直接，但由于Redis的List是存储在内存中的，所以处理速度非常快。在Spring中，我们通常使用RedisTemplate来操作Redis的List数据结构。</p><p><strong>生产者代码示例：</strong></p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>ListOperations&lt;String&gt; listOps = redisTemplate.opsForList();</span></span>
<span class="line"><span>listOps.rightPush(&quot;myQueue&quot;, &quot;Message payload&quot;);</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>消费者代码示例：</strong></p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>// 消费者从队列取出消息</span></span>
<span class="line"><span>String message = listOps.leftPop(&quot;myQueue&quot;);</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-使用pub-sub模式" tabindex="-1"><a class="header-anchor" href="#_2-使用pub-sub模式"><span>2. 使用Pub/Sub模式</span></a></h3><p>Redis的Pub/Sub模式是一种发布/订阅模式，自2.8.0版本之后就开始支持。生产者可以将消息发布到一个频道，而消费者可以订阅这个频道来接收消息。这种方式支持模式匹配和多个消费者，但不支持消息持久化和回溯。</p><p><strong>生产者代码示例：</strong></p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>String channel = &quot;myChannel&quot;;</span></span>
<span class="line"><span>String message = &quot;Message payload&quot;;</span></span>
<span class="line"><span>// 生产者发布消息</span></span>
<span class="line"><span>redisTemplate.convertAndSend(channel, message);</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>消费者代码示例：</strong></p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>MessageListenerAdapter messageListenerAdapter = new MessageListenerAdapter(new MyMessageListener());</span></span>
<span class="line"><span></span></span>
<span class="line"><span>RedisMessageListenerContainer container = new RedisMessageListenerContainer();</span></span>
<span class="line"><span>container.setConnectionFactory(yourRedisConnectFactory);</span></span>
<span class="line"><span>container.addMessageListener(messageListenerAdapter, new PatternTopic(&quot;myChannel&quot;));</span></span>
<span class="line"><span>container.start();</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>MyMessageListener类实现MessageListener接口，用于处理接收到的消息。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class MyMessageListener implements MessageListener {</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public void onMessage(Message message, byte[] pattern) {</span></span>
<span class="line"><span>        String channel = message.getChannel();</span></span>
<span class="line"><span>        String messageContent = new String(message.getBody());</span></span>
<span class="line"><span>        System.out.println(&quot;Received message on channel &#39;&quot; + channel + &quot;&#39;: &quot; + messageContent);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-使用stream数据结构" tabindex="-1"><a class="header-anchor" href="#_3-使用stream数据结构"><span>3. 使用Stream数据结构</span></a></h3><p>Redis 5.0引入了Stream数据结构，它提供了类似于Kafka的消息队列功能。Stream支持消息持久化、ack确认、多个消费者以及回溯消费。这使得Stream成为了Redis中最强大的消息队列实现。</p><p><strong>生产者代码示例：</strong></p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>HashMap hashMap = new HashMap();</span></span>
<span class="line"><span>        hashMap.put(&quot;key&quot;, &quot;Message payload&quot;);</span></span>
<span class="line"><span>        StreamOperations&lt;String, Object, Object&gt; streamOps = redisTemplate.opsForStream();</span></span>
<span class="line"><span>        MapRecord&lt;String, String, String&gt; record = StreamRecords.newRecord()</span></span>
<span class="line"><span>                .ofStrings(hashMap)</span></span>
<span class="line"><span>                .withStreamKey(&quot;myStream&quot;);</span></span>
<span class="line"><span>        streamOps.add(record);</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>消费者代码示例：</strong></p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>StreamOperations&lt;String, Object, Object&gt; streamOps = redisTemplate.opsForStream();</span></span>
<span class="line"><span>        List&lt;MapRecord&lt;String, Object, Object&gt;&gt; recordList = streamOps.read(StreamOffset.create(&quot;myStream&quot;, ReadOffset.lastConsumed()));</span></span>
<span class="line"><span>        for (MapRecord&lt;String, Object, Object&gt; entries : recordList) {</span></span>
<span class="line"><span>            Map&lt;Object, Object&gt; value = entries.getValue();</span></span>
<span class="line"><span>            System.out.println(value);</span></span>
<span class="line"><span>        }</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-使用zset数据结构" tabindex="-1"><a class="header-anchor" href="#_4-使用zset数据结构"><span>4. 使用Zset数据结构</span></a></h3><p>除了以上三种普通的消息队列，还可以用Redis的zset可以实现一个延迟消息队列。</p><p>使用Redis的ZADD命令，为集合中的每个消息添加一个分数，该分数将决定消息在列表中的排列顺序。这个分数可以是添加消息时的服务器时间戳加上延迟的时间（比如延迟15秒，那么分数就是当前时间戳+15）。</p><p>使用ZRANGE命令，配合WITHSCORES参数，获取有序集合中最小的元素及其分数。分数即为我们在步骤1中设置的执行时间。如果当前时间大于或等于消息的分数（执行时间），那么就处理这条消息。否则，每隔一段时间检查一次。处理了的消息要使用ZREM命令将其从列表中移除。</p><p>代码实现如下：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>import org.springframework.beans.factory.annotation.Autowired;</span></span>
<span class="line"><span>import org.springframework.data.redis.core.RedisTemplate;</span></span>
<span class="line"><span>import org.springframework.data.redis.core.ZSetOperations;</span></span>
<span class="line"><span>import org.springframework.stereotype.Component;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>import java.util.Set;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>public class RedisDelayingQueueWithRedisTemplate {</span></span>
<span class="line"><span>   </span></span>
<span class="line"><span>    private final RedisTemplate&lt;String, Object&gt; redisTemplate;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Autowired</span></span>
<span class="line"><span>    public RedisDelayingQueueWithRedisTemplate(RedisTemplate&lt;String, Object&gt; redisTemplate) {</span></span>
<span class="line"><span>        this.redisTemplate = redisTemplate;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public void delay(String message) {</span></span>
<span class="line"><span>        ZSetOperations&lt;String, Object&gt; ops = redisTemplate.opsForZSet();</span></span>
<span class="line"><span>        // 提交消息到队列中，设置5秒后处理</span></span>
<span class="line"><span>        ops.add(&quot;delay_queue&quot;, message, System.currentTimeMillis() + 5000);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public void loop() {</span></span>
<span class="line"><span>        ZSetOperations&lt;String, Object&gt; ops = redisTemplate.opsForZSet();</span></span>
<span class="line"><span>        while (true) {</span></span>
<span class="line"><span>            Set&lt;Object&gt; items = ops.rangeByScore(&quot;delay_queue&quot;, 0, System.currentTimeMillis(), 0, 1);</span></span>
<span class="line"><span>            if (items == null || items.isEmpty()) {</span></span>
<span class="line"><span>                try {</span></span>
<span class="line"><span>                    Thread.sleep(500);</span></span>
<span class="line"><span>                } catch (InterruptedException e) {</span></span>
<span class="line"><span>                    break;</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>                continue;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            Object next = items.iterator().next();</span></span>
<span class="line"><span>            if (ops.remove(&quot;delay_queue&quot;, next) &gt; 0) { // 抢到了</span></span>
<span class="line"><span>                handleMsg((String) next);</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public void handleMsg(String message) {</span></span>
<span class="line"><span>        System.out.println(message);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="最佳实践" tabindex="-1"><a class="header-anchor" href="#最佳实践"><span>最佳实践</span></a></h2><p>在使用Redis消息队列时，需要注意以下几点：</p><ul><li><p><strong>选择合适的数据结构</strong>：根据业务需求选择List、Pub/Sub还是Stream。</p></li><li><p><strong>处理消息丢失</strong>：对于重要的业务数据，需要考虑消息丢失的处理策略。</p></li><li><p><strong>监控和调优</strong>：监控Redis的性能，根据实际情况进行调优。</p></li></ul><p>当然，如果非轻量级的、涉及到复杂业务场景的，如下订单、消息通知等，还是得上rocketMQ等消息中间件。</p>`,36),t=[l];function p(r,d){return n(),e("div",null,t)}const o=s(i,[["render",p],["__file","redis实现消息队列.html.vue"]]),u=JSON.parse('{"path":"/skill/redis/redis%E5%AE%9E%E7%8E%B0%E6%B6%88%E6%81%AF%E9%98%9F%E5%88%97.html","title":"Redis实现消息队列，超简单！","lang":"zh-CN","frontmatter":{"description":"Redis实现消息队列，超简单！ 在现代的软件开发中，消息队列已经成为了构建可扩展、高性能系统的关键组件。它帮助我们解耦服务，实现异步处理，提高系统的吞吐量和稳定性。主要应用场景如下： 任务调度：将耗时的任务异步处理，提高系统的响应速度。 日志处理：收集来自不同服务的日志，进行统一的处理和分析。 事件驱动架构：构建松耦合的微服务架构，服务之间通过消息进...","head":[["meta",{"property":"og:url","content":"https://mister-hope.github.io/my-docs/skill/redis/redis%E5%AE%9E%E7%8E%B0%E6%B6%88%E6%81%AF%E9%98%9F%E5%88%97.html"}],["meta",{"property":"og:site_name","content":"博客演示"}],["meta",{"property":"og:title","content":"Redis实现消息队列，超简单！"}],["meta",{"property":"og:description","content":"Redis实现消息队列，超简单！ 在现代的软件开发中，消息队列已经成为了构建可扩展、高性能系统的关键组件。它帮助我们解耦服务，实现异步处理，提高系统的吞吐量和稳定性。主要应用场景如下： 任务调度：将耗时的任务异步处理，提高系统的响应速度。 日志处理：收集来自不同服务的日志，进行统一的处理和分析。 事件驱动架构：构建松耦合的微服务架构，服务之间通过消息进..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-02T09:24:29.000Z"}],["meta",{"property":"article:author","content":"程序员小义"}],["meta",{"property":"article:modified_time","content":"2024-06-02T09:24:29.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Redis实现消息队列，超简单！\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2024-06-02T09:24:29.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"程序员小义\\",\\"url\\":\\"https://mister-hope.com\\"}]}"]]},"headers":[{"level":2,"title":"Redis消息队列的工作原理","slug":"redis消息队列的工作原理","link":"#redis消息队列的工作原理","children":[{"level":3,"title":"1. 使用List作为队列","slug":"_1-使用list作为队列","link":"#_1-使用list作为队列","children":[]},{"level":3,"title":"2. 使用Pub/Sub模式","slug":"_2-使用pub-sub模式","link":"#_2-使用pub-sub模式","children":[]},{"level":3,"title":"3. 使用Stream数据结构","slug":"_3-使用stream数据结构","link":"#_3-使用stream数据结构","children":[]},{"level":3,"title":"4. 使用Zset数据结构","slug":"_4-使用zset数据结构","link":"#_4-使用zset数据结构","children":[]}]},{"level":2,"title":"最佳实践","slug":"最佳实践","link":"#最佳实践","children":[]}],"git":{"createdTime":1717320269000,"updatedTime":1717320269000,"contributors":[{"name":"whuhbz","email":"463436681@qq.com","commits":1}]},"readingTime":{"minutes":4.12,"words":1236},"filePathRelative":"skill/redis/redis实现消息队列.md","localizedDate":"2024年6月2日","excerpt":"\\n<p>在现代的软件开发中，消息队列已经成为了构建可扩展、高性能系统的关键组件。它帮助我们解耦服务，实现异步处理，提高系统的吞吐量和稳定性。主要应用场景如下：</p>\\n<ul>\\n<li>\\n<p><strong>任务调度</strong>：将耗时的任务异步处理，提高系统的响应速度。</p>\\n</li>\\n<li>\\n<p><strong>日志处理</strong>：收集来自不同服务的日志，进行统一的处理和分析。</p>\\n</li>\\n<li>\\n<p><strong>事件驱动架构</strong>：构建松耦合的微服务架构，服务之间通过消息进行通信。</p>\\n</li>\\n</ul>\\n<p>其实除了kafka、rocketMQ等常见的消息中间件，redis也可以实现消息队列的功能。相信也有不少同学会被面试官问到，如何在不使用消息中间件的情况下实现一个消息队列，下面来看看redis如何处理。</p>","autoDesc":true}');export{o as comp,u as data};
