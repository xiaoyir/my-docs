import{_ as a,c as s,o as n,d as e}from"./app-9aLaKr4C.js";const l={},i=e(`<h1 id="你真的会用threadlocal吗" tabindex="-1"><a class="header-anchor" href="#你真的会用threadlocal吗"><span>你真的会用ThreadLocal吗</span></a></h1><h3 id="先来解释一下什么是threadlocal" tabindex="-1"><a class="header-anchor" href="#先来解释一下什么是threadlocal"><span>先来解释一下什么是ThreadLocal？</span></a></h3><p>一句话理解，threadlocal是作为当前线程中属性ThreadLocalMap集合的某一个Entry的key值（Entry的key是ThreadLocal，value是要存储的副本变量），不同的线程所拥有的ThreadLocalMap是互相隔离的。</p><h3 id="threadlocal为什么建议用static修饰" tabindex="-1"><a class="header-anchor" href="#threadlocal为什么建议用static修饰"><span>ThreadLocal为什么建议用static修饰？</span></a></h3><p>static修饰的变量是在类在加载时就分配地址了，在类卸载才会被回收，如果变量ThreadLocal是非static的话就会造成每次生成实例都要生成不同的ThreadLocal对象，虽然这样程序虽然不会有什么异常，但是会浪费内存资源。</p><h3 id="什么场景适合使用threadlocal呢" tabindex="-1"><a class="header-anchor" href="#什么场景适合使用threadlocal呢"><span>什么场景适合使用ThreadLocal呢？</span></a></h3><p>当每个线程需要有自己单独的变量副本，或者说变量需要在多个方法中共享但不希望被多线程共享的时候，就适合使用threadlocal。例如用threadlocal来保存当前用户的登录信息。</p><h3 id="threadlocal的传递性如何实现" tabindex="-1"><a class="header-anchor" href="#threadlocal的传递性如何实现"><span>ThreadLocal的传递性如何实现？</span></a></h3><p>对于业务系统来说，用户登录了之后，后端可以通过拦截器将用户信息这一变量存在threadlocal中。但是在使用线程池时，其他线程的threadlocal在不重新赋值的情况下就取不到用户信息。怎么实现父子线程之间这一变量的传递呢？难道只能通过参数传值吗？有没有更加优雅的方式呢？这就要涉及JDK的InheritableThreadLocal和阿里巴巴的TransmittableThreadLocal。<br> InheritableThreadLocal可以实现子线程继承父线程的threadlocal，但是有坑，在线程池中因为线程的复用性，子线程就无法有效继承。而使用TransmittableThreadLocal就很好的解决这一问题，注意要引入以下依赖包。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>        &lt;dependency&gt;</span></span>
<span class="line"><span>            &lt;groupId&gt;com.alibaba&lt;/groupId&gt;</span></span>
<span class="line"><span>            &lt;artifactId&gt;transmittable-thread-local&lt;/artifactId&gt;</span></span>
<span class="line"><span>            &lt;version&gt;2.12.0&lt;/version&gt;</span></span>
<span class="line"><span>        &lt;/dependency&gt;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="代码验证" tabindex="-1"><a class="header-anchor" href="#代码验证"><span>代码验证</span></a></h3><ol start="2"><li>InheritableThreadLocal 的父子线程传递性</li></ol><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class ThreadLocalTest {</span></span>
<span class="line"><span>    private static ThreadLocal&lt;UserVO&gt; userThreadLocal = new ThreadLocal&lt;&gt;();</span></span>
<span class="line"><span>    private static ThreadLocal&lt;UserVO&gt; inheritableuserThreadLocal = new InheritableThreadLocal&lt;&gt;();</span></span>
<span class="line"><span>    private static ThreadLocal&lt;UserVO&gt; ttluserThreadLocal = new TransmittableThreadLocal&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 验证 InheritableThreadLocal 的父子线程传递性</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    @Test</span></span>
<span class="line"><span>    public void inheritableThreadTest() throws InterruptedException {</span></span>
<span class="line"><span>        inheritableuserThreadLocal.set(new UserVO().setName(&quot;main-T&quot;));</span></span>
<span class="line"><span>        System.out.println(&quot;M:&quot;+inheritableuserThreadLocal.get());</span></span>
<span class="line"><span>        Thread thread = new Thread(() -&gt; {</span></span>
<span class="line"><span>            System.out.println(&quot;S:&quot;+inheritableuserThreadLocal.get());</span></span>
<span class="line"><span>            inheritableuserThreadLocal.set(new UserVO().setName(&quot;child&quot;).setAge(&quot;20&quot;));</span></span>
<span class="line"><span>            //inheritableuserThreadLocal.get().setName(&quot;child&quot;).setAge(&quot;20&quot;);</span></span>
<span class="line"><span>            System.out.println(&quot;S:&quot;+inheritableuserThreadLocal.get());</span></span>
<span class="line"><span>            inheritableuserThreadLocal.remove();</span></span>
<span class="line"><span>        });</span></span>
<span class="line"><span>        thread.start();</span></span>
<span class="line"><span>        Thread.sleep(5000);</span></span>
<span class="line"><span>        System.out.println(&quot;M:&quot;+inheritableuserThreadLocal.get());</span></span>
<span class="line"><span>        inheritableuserThreadLocal.remove();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    /** 打印结果 */</span></span>
<span class="line"><span>//        M:UserVO(name=main-T, age=null)</span></span>
<span class="line"><span>//        S:UserVO(name=main-T, age=null)</span></span>
<span class="line"><span>//        S:UserVO(name=child, age=20)</span></span>
<span class="line"><span>//        M:UserVO(name=main-T, age=null)</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>从打印结果可以得知，当另起线程时，inheritableuserThreadLocal是可以实现继承性的。但是注意子线程继承的对象是浅拷贝，如果放开代码中的注释行，也就是修改变量值，那么父线程中的threadlocal也会修改，因为两者引用指向的是同一个对象。</p><ol start="3"><li>线程池中InheritableThreadLocal失效</li></ol><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>    /**</span></span>
<span class="line"><span>     * 验证 InheritableThreadLocal 在线程池中的效果</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    @Test</span></span>
<span class="line"><span>    public void inheritableThreadPoolTest() throws InterruptedException {</span></span>
<span class="line"><span>        inheritableuserThreadLocal.set(new UserVO().setName(&quot;mainUser&quot;));</span></span>
<span class="line"><span>        System.out.println(&quot;M:&quot;+inheritableuserThreadLocal.get());</span></span>
<span class="line"><span>        ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(2, 4, 60, TimeUnit.SECONDS, new ArrayBlockingQueue&lt;&gt;(1000));</span></span>
<span class="line"><span>        for (int i = 0; i &lt; 5; i++) {</span></span>
<span class="line"><span>            threadPoolExecutor.submit(() -&gt; {</span></span>
<span class="line"><span>                System.out.println(&quot;S:&quot;+inheritableuserThreadLocal.get());</span></span>
<span class="line"><span>                inheritableuserThreadLocal.remove();</span></span>
<span class="line"><span>            });</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        Thread.sleep(5000);</span></span>
<span class="line"><span>        inheritableuserThreadLocal.remove();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    /** 打印结果 */</span></span>
<span class="line"><span>//    M:UserVO(name=mainUser, age=null)</span></span>
<span class="line"><span>//    S:UserVO(name=mainUser, age=null)</span></span>
<span class="line"><span>//    S:null</span></span>
<span class="line"><span>//    S:null</span></span>
<span class="line"><span>//    S:null</span></span>
<span class="line"><span>//    S:UserVO(name=mainUser, age=null)</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>之所以有的线程会打印出null值，是因为在使用InheritableThreadLocal时父线程的ThreadLocalMap是通过实例化一个Thread时赋值给子线程的，但是在线程池中业务线程只是将任务（实现了Runnable或者Callable的对象）加入到任务队列中，并不一定去创建线程池中的线程，因此线程池中线程也就获取不到业务线程中的上下文信息。</p><ol start="4"><li>阿里开源的TransmittableThreadLocal</li></ol><p>参考文档：https://github.com/alibaba/transmittable-thread-local</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>    /**</span></span>
<span class="line"><span>     * 验证TransmittableThreadLocal（错误用法）</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    @Test</span></span>
<span class="line"><span>    public void ttlThreadPoolErrorTest() throws InterruptedException {</span></span>
<span class="line"><span>        ttluserThreadLocal.set(new UserVO().setName(&quot;hello&quot;));</span></span>
<span class="line"><span>        System.out.println(&quot;M:&quot;+ttluserThreadLocal.get());</span></span>
<span class="line"><span>        for (int i = 0; i &lt; 10; i++) {</span></span>
<span class="line"><span>            ThreadUtil.execAsync(() -&gt; {</span></span>
<span class="line"><span>                System.out.println(&quot;S:&quot;+ttluserThreadLocal.get());</span></span>
<span class="line"><span>                ttluserThreadLocal.remove();</span></span>
<span class="line"><span>            });</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        Thread.sleep(5000);</span></span>
<span class="line"><span>        ttluserThreadLocal.remove();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    /** 打印结果 */</span></span>
<span class="line"><span>//    M:UserVO(name=hello, age=null)</span></span>
<span class="line"><span>//    S:UserVO(name=hello, age=null)</span></span>
<span class="line"><span>//    S:UserVO(name=hello, age=null)</span></span>
<span class="line"><span>//    S:UserVO(name=hello, age=null)</span></span>
<span class="line"><span>//    S:UserVO(name=hello, age=null)</span></span>
<span class="line"><span>//    S:null</span></span>
<span class="line"><span>//    S:null</span></span>
<span class="line"><span>//    S:null</span></span>
<span class="line"><span>//    S:null</span></span>
<span class="line"><span>//    S:UserVO(name=hello, age=null)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * TransmittableThreadLocal的正确用法</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    @Test</span></span>
<span class="line"><span>    public void ttlThreadPoolCorrectTest() throws InterruptedException {</span></span>
<span class="line"><span>        ttluserThreadLocal.set(new UserVO().setName(&quot;m&quot;).setAge(&quot;99&quot;));</span></span>
<span class="line"><span>        System.out.println(&quot;M:&quot;+ttluserThreadLocal.get());</span></span>
<span class="line"><span>        //需用TtlExecutors包装一层才能正常使用</span></span>
<span class="line"><span>        ExecutorService ttlExecutorService = TtlExecutors.getTtlExecutorService(ThreadUtil.newExecutor(2,4));</span></span>
<span class="line"><span>        for (int i = 0; i &lt; 10; i++) {</span></span>
<span class="line"><span>            ttlExecutorService.submit(() -&gt; {</span></span>
<span class="line"><span>                System.out.println(&quot;S:&quot; + ttluserThreadLocal.get());</span></span>
<span class="line"><span>            });</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        Thread.sleep(5000);</span></span>
<span class="line"><span>        ttluserThreadLocal.remove();</span></span>
<span class="line"><span>    }</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,20),p=[i];function r(t,d){return n(),s("div",null,p)}const o=a(l,[["render",r],["__file","ThreadLocal正确用法.html.vue"]]),h=JSON.parse('{"path":"/skill/java/ThreadLocal%E6%AD%A3%E7%A1%AE%E7%94%A8%E6%B3%95.html","title":"ThreadLocal正确用法","lang":"zh-CN","frontmatter":{"title":"ThreadLocal正确用法","icon":"laptop-code","category":["java"],"description":"你真的会用ThreadLocal吗 先来解释一下什么是ThreadLocal？ 一句话理解，threadlocal是作为当前线程中属性ThreadLocalMap集合的某一个Entry的key值（Entry的key是ThreadLocal，value是要存储的副本变量），不同的线程所拥有的ThreadLocalMap是互相隔离的。 ThreadLoca...","head":[["meta",{"property":"og:url","content":"https://mister-hope.github.io/my-docs/skill/java/ThreadLocal%E6%AD%A3%E7%A1%AE%E7%94%A8%E6%B3%95.html"}],["meta",{"property":"og:site_name","content":"Java库"}],["meta",{"property":"og:title","content":"ThreadLocal正确用法"}],["meta",{"property":"og:description","content":"你真的会用ThreadLocal吗 先来解释一下什么是ThreadLocal？ 一句话理解，threadlocal是作为当前线程中属性ThreadLocalMap集合的某一个Entry的key值（Entry的key是ThreadLocal，value是要存储的副本变量），不同的线程所拥有的ThreadLocalMap是互相隔离的。 ThreadLoca..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-02T15:08:55.000Z"}],["meta",{"property":"article:author","content":"程序员小义"}],["meta",{"property":"article:modified_time","content":"2024-06-02T15:08:55.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"ThreadLocal正确用法\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2024-06-02T15:08:55.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"程序员小义\\",\\"url\\":\\"https://mister-hope.com\\"}]}"]]},"headers":[{"level":3,"title":"先来解释一下什么是ThreadLocal？","slug":"先来解释一下什么是threadlocal","link":"#先来解释一下什么是threadlocal","children":[]},{"level":3,"title":"ThreadLocal为什么建议用static修饰？","slug":"threadlocal为什么建议用static修饰","link":"#threadlocal为什么建议用static修饰","children":[]},{"level":3,"title":"什么场景适合使用ThreadLocal呢？","slug":"什么场景适合使用threadlocal呢","link":"#什么场景适合使用threadlocal呢","children":[]},{"level":3,"title":"ThreadLocal的传递性如何实现？","slug":"threadlocal的传递性如何实现","link":"#threadlocal的传递性如何实现","children":[]},{"level":3,"title":"代码验证","slug":"代码验证","link":"#代码验证","children":[]}],"git":{"createdTime":1717320269000,"updatedTime":1717340935000,"contributors":[{"name":"whuhbz","email":"463436681@qq.com","commits":3}]},"readingTime":{"minutes":3.57,"words":1072},"filePathRelative":"skill/java/ThreadLocal正确用法.md","localizedDate":"2024年6月2日","excerpt":"\\n<h3>先来解释一下什么是ThreadLocal？</h3>\\n<p>一句话理解，threadlocal是作为当前线程中属性ThreadLocalMap集合的某一个Entry的key值（Entry的key是ThreadLocal，value是要存储的副本变量），不同的线程所拥有的ThreadLocalMap是互相隔离的。</p>\\n<h3>ThreadLocal为什么建议用static修饰？</h3>\\n<p>static修饰的变量是在类在加载时就分配地址了，在类卸载才会被回收，如果变量ThreadLocal是非static的话就会造成每次生成实例都要生成不同的ThreadLocal对象，虽然这样程序虽然不会有什么异常，但是会浪费内存资源。</p>","autoDesc":true}');export{o as comp,h as data};
