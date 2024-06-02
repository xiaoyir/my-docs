import{_ as e,r as i,c as l,a,e as n,b as p,w as t,d as c,o as r}from"./app-CUrI_gXd.js";const d={},o=a("h1",{id:"实现cacheable注解",tabindex:"-1"},[a("a",{class:"header-anchor",href:"#实现cacheable注解"},[a("span",null,"实现Cacheable注解")])],-1),u=c(`<p>小义已经实现@CacheableTtl支持配置缓存的过期时间，但是忽略了一个重要功能，就是@Cacheable是支持动态设置的，如：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@Cacheable(value=&quot;cityInfo&quot;, key=&quot;#code&quot;, unless=&quot;#result == null&quot;)</span></span>
<span class="line"><span>public getCityInfoDto queryByCode(String code){</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>而自己设计的@CacheableTtl注解并不能支持，需要继续优化！</p><h2 id="二、实现" tabindex="-1"><a class="header-anchor" href="#二、实现"><span>二、实现</span></a></h2><h3 id="_1、-cacheparam" tabindex="-1"><a class="header-anchor" href="#_1、-cacheparam"><span>1、@CacheParam</span></a></h3><p>定义CacheParam注解用于标记缓存的参数</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>/**</span></span>
<span class="line"><span> * 缓存参数，自动将参数与Cacheable.key组合为动态key</span></span>
<span class="line"><span> * </span></span>
<span class="line"><span> */</span></span>
<span class="line"><span>@Target(ElementType.PARAMETER)</span></span>
<span class="line"><span>@Retention(RetentionPolicy.RUNTIME)</span></span>
<span class="line"><span>public @interface CacheParam {</span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 当修饰参数为复杂对象时，可指定为取值为对象属性。默认为空，直接取值对象本身</span></span>
<span class="line"><span>     * </span></span>
<span class="line"><span>     * @return</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    public String value() default &quot;&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2、定义拦截器父类" tabindex="-1"><a class="header-anchor" href="#_2、定义拦截器父类"><span>2、定义拦截器父类</span></a></h3><p>创建Aspect基类，提供基本的操作，原先的监听@CacheableTtl的拦截器CacheableAspect继承该基类</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class BaseAspect {</span></span>
<span class="line"><span>     /**</span></span>
<span class="line"><span>     * 根据指定注解方法获取拦截方法中的注解及参数值</span></span>
<span class="line"><span>     * </span></span>
<span class="line"><span>     * @param pjp</span></span>
<span class="line"><span>     * @param method</span></span>
<span class="line"><span>     * @param annotationClass</span></span>
<span class="line"><span>     * @return List&lt;[annotation, value]&gt;</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    @SuppressWarnings(&quot;unchecked&quot;)</span></span>
<span class="line"><span>    protected &lt;T&gt; List&lt;Pair&lt;T, Object&gt;&gt; getMethodAnnotationAndParametersByAnnotation(final ProceedingJoinPoint pjp,</span></span>
<span class="line"><span>        Method method, Class&lt;T&gt; annotationClass) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        Annotation[][] parameterAnnotations = method.getParameterAnnotations();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        if (parameterAnnotations == null || parameterAnnotations.length == 0) {</span></span>
<span class="line"><span>            return Collections.emptyList();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        List&lt;Pair&lt;T, Object&gt;&gt; result = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>        int i = 0;</span></span>
<span class="line"><span>        for (Annotation[] annotations : parameterAnnotations) {</span></span>
<span class="line"><span>            for (Annotation annotation : annotations) {</span></span>
<span class="line"><span>                if (annotation.annotationType().equals(annotationClass)) {</span></span>
<span class="line"><span>                    result.add(Pair.of((T)annotation, pjp.getArgs()[i]));</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            i++;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        return result;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3、定义spring表达式-spel-工具类" tabindex="-1"><a class="header-anchor" href="#_3、定义spring表达式-spel-工具类"><span>3、定义Spring表达式（spEL）工具类</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class SpelUtils {</span></span>
<span class="line"><span>  private static final ExpressionParser expressionParser = new SpelExpressionParser();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  private SpelUtils() {</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static Object getValue(String expression) {</span></span>
<span class="line"><span>    return expressionParser.parseExpression(expression);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  public static Object getValue(Object object, String expression) {</span></span>
<span class="line"><span>    // 解析上下文</span></span>
<span class="line"><span>    EvaluationContext context = new StandardEvaluationContext(object);</span></span>
<span class="line"><span>    return expressionParser.parseExpression(expression).getValue(context);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4、拦截器拦截" tabindex="-1"><a class="header-anchor" href="#_4、拦截器拦截"><span>4、拦截器拦截</span></a></h3><h3 id="cacheableaspect继承baseaspect之后-核心代码如下" tabindex="-1"><a class="header-anchor" href="#cacheableaspect继承baseaspect之后-核心代码如下"><span>CacheableAspect继承BaseAspect之后，核心代码如下：</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class CacheableAspect extends BaseAspect {</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>    @Around(value = &quot;pointcut&quot;)</span></span>
<span class="line"><span>    public Object around(final ProceedingJoinPoint pjp) throws Throwable {</span></span>
<span class="line"><span>        Method method = MethodSignature.class.cast(pjp.getSignature()).getMethod();</span></span>
<span class="line"><span>        CacheableTtl cacheable = method.getAnnotation(CacheableTtl.class);</span></span>
<span class="line"><span>        String key = generateCacheKey(pjp, method, cacheable);</span></span>
<span class="line"><span>        Object value = getCache(cacheable, key);</span></span>
<span class="line"><span>        if (null == value) {</span></span>
<span class="line"><span>            value = pjp.proceed();//执行方法</span></span>
<span class="line"><span>            setCache(cacheable, key, value);//设置缓存</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return value;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>    //生成缓存的key</span></span>
<span class="line"><span>    private String generateCacheKey(ProceedingJoinPoint pjp, Method method, Cacheable cacheable) {</span></span>
<span class="line"><span>        List&lt;Pair&lt;CacheParam, Object&gt;&gt; pair = getMethodParametersByAnnotation(pjp, method, CacheParam.class);</span></span>
<span class="line"><span>        StringBuilder keyBuffer = new StringBuilder();</span></span>
<span class="line"><span>        for (Pair&lt;CacheParam, Object&gt; pair : pairs) {</span></span>
<span class="line"><span>            CacheParam cacheParam = pair.getKey();</span></span>
<span class="line"><span>            Object param = pair.getValue();</span></span>
<span class="line"><span>            // 支持表达式获取属性值</span></span>
<span class="line"><span>            if (param != null &amp;&amp; StringUtils.isNotBlank(cacheParam.value())) {</span></span>
<span class="line"><span>                try{</span></span>
<span class="line"><span>                    param = SpelUtils.getValue(param, cacheParam.value());</span></span>
<span class="line"><span>                }catch(Exception e){</span></span>
<span class="line"><span>                    param = param;</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>            if (param == null) {</span></span>
<span class="line"><span>                keyBuffer.append(&quot;:-&quot;);</span></span>
<span class="line"><span>            } else {</span></span>
<span class="line"><span>                String tmp = param.toString();</span></span>
<span class="line"><span>                keyBuffer.append(&quot;:&quot;).append(&quot;&quot;.equals(tmp) ? &quot;-&quot; : (param.toString().replace(&quot;:&quot;, &quot;-&quot;)));</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        keyBuffer.insert(0, cacheable.key());</span></span>
<span class="line"><span>        String cacheKey = keyBuffer.toString();</span></span>
<span class="line"><span>        return cacheKey;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5、接口实现" tabindex="-1"><a class="header-anchor" href="#_5、接口实现"><span>5、接口实现</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@CacheableTtl(key = &quot;abs&quot;, ttl = 10, ttlTimeUnit = TimeUnit.MINUTES)@GetMapping(&quot;/id&quot;)</span></span>
<span class="line"><span>public String getTtl(@CacheParam(&quot;id&quot;) @RequestParam(&quot;id&quot;) String id) {</span></span>
<span class="line"><span>    UserInfo user = userService.getById(id);</span></span>
<span class="line"><span>    return user.getName();</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="三、总结" tabindex="-1"><a class="header-anchor" href="#三、总结"><span>三、总结</span></a></h2><h3 id="_1、spel" tabindex="-1"><a class="header-anchor" href="#_1、spel"><span>1、spel</span></a></h3><p>在组装缓存key时，如果接口入参是一个对象，而@CacheParam的value值为该对象的某个属性，则用到了spring的表达式语言spel来解析参数：</p><p>param = SpelUtils.getValue(param, cacheParam.value());</p><h3 id="_2、annotation" tabindex="-1"><a class="header-anchor" href="#_2、annotation"><span>2、Annotation</span></a></h3><p>拦截器读取方法参数时，用到了method.getParameterAnnotations()，返回的是一个二维数组。</p><p>如果某个方法参数使用了多个注解，例如上述第五点接口使用的getTtl()方法中，入参id被@CacheParam和@RequestParam同时修饰，则parameterAnnotations[0][0]=@CacheParam，</p><p>parameterAnnotations[0][1]=@RequestParam</p>`,25);function v(h,b){const s=i("RouteLink");return r(),l("div",null,[o,a("p",null,[n("在之前的"),p(s,{to:"/skill/Spring%20Cache%E8%A7%A3%E6%9E%90/Spring%20Cache%E8%A7%A3%E6%9E%90.html"},{default:t(()=>[n("Spring Cache解析")]),_:1})]),u])}const g=e(d,[["render",v],["__file","实现Cacheable注解.html.vue"]]),k=JSON.parse('{"path":"/skill/spring/%E5%AE%9E%E7%8E%B0Cacheable%E6%B3%A8%E8%A7%A3.html","title":"实现Cacheable注解","lang":"zh-CN","frontmatter":{"description":"实现Cacheable注解 在之前的 小义已经实现@CacheableTtl支持配置缓存的过期时间，但是忽略了一个重要功能，就是@Cacheable是支持动态设置的，如： 而自己设计的@CacheableTtl注解并不能支持，需要继续优化！ 二、实现 1、@CacheParam 定义CacheParam注解用于标记缓存的参数 2、定义拦截器父类 创建A...","head":[["meta",{"property":"og:url","content":"https://mister-hope.github.io/my-docs/skill/spring/%E5%AE%9E%E7%8E%B0Cacheable%E6%B3%A8%E8%A7%A3.html"}],["meta",{"property":"og:site_name","content":"博客演示"}],["meta",{"property":"og:title","content":"实现Cacheable注解"}],["meta",{"property":"og:description","content":"实现Cacheable注解 在之前的 小义已经实现@CacheableTtl支持配置缓存的过期时间，但是忽略了一个重要功能，就是@Cacheable是支持动态设置的，如： 而自己设计的@CacheableTtl注解并不能支持，需要继续优化！ 二、实现 1、@CacheParam 定义CacheParam注解用于标记缓存的参数 2、定义拦截器父类 创建A..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-02T09:24:29.000Z"}],["meta",{"property":"article:author","content":"程序员小义"}],["meta",{"property":"article:modified_time","content":"2024-06-02T09:24:29.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"实现Cacheable注解\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2024-06-02T09:24:29.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"程序员小义\\",\\"url\\":\\"https://mister-hope.com\\"}]}"]]},"headers":[{"level":2,"title":"二、实现","slug":"二、实现","link":"#二、实现","children":[{"level":3,"title":"1、@CacheParam","slug":"_1、-cacheparam","link":"#_1、-cacheparam","children":[]},{"level":3,"title":"2、定义拦截器父类","slug":"_2、定义拦截器父类","link":"#_2、定义拦截器父类","children":[]},{"level":3,"title":"3、定义Spring表达式（spEL）工具类","slug":"_3、定义spring表达式-spel-工具类","link":"#_3、定义spring表达式-spel-工具类","children":[]},{"level":3,"title":"4、拦截器拦截","slug":"_4、拦截器拦截","link":"#_4、拦截器拦截","children":[]},{"level":3,"title":"CacheableAspect继承BaseAspect之后，核心代码如下：","slug":"cacheableaspect继承baseaspect之后-核心代码如下","link":"#cacheableaspect继承baseaspect之后-核心代码如下","children":[]},{"level":3,"title":"5、接口实现","slug":"_5、接口实现","link":"#_5、接口实现","children":[]}]},{"level":2,"title":"三、总结","slug":"三、总结","link":"#三、总结","children":[{"level":3,"title":"1、spel","slug":"_1、spel","link":"#_1、spel","children":[]},{"level":3,"title":"2、Annotation","slug":"_2、annotation","link":"#_2、annotation","children":[]}]}],"git":{"createdTime":1717320269000,"updatedTime":1717320269000,"contributors":[{"name":"whuhbz","email":"463436681@qq.com","commits":1}]},"readingTime":{"minutes":2.34,"words":701},"filePathRelative":"skill/spring/实现Cacheable注解.md","localizedDate":"2024年6月2日","excerpt":"\\n<p>在之前的<a href=\\"/my-docs/skill/Spring%20Cache%E8%A7%A3%E6%9E%90/Spring%20Cache%E8%A7%A3%E6%9E%90.html\\" target=\\"_blank\\">Spring Cache解析</a></p>\\n<p>小义已经实现@CacheableTtl支持配置缓存的过期时间，但是忽略了一个重要功能，就是@Cacheable是支持动态设置的，如：</p>\\n<div class=\\"language- line-numbers-mode\\" data-highlighter=\\"shiki\\" data-ext=\\"\\" data-title=\\"\\" style=\\"--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34\\"><pre class=\\"shiki shiki-themes github-light one-dark-pro vp-code\\"><code><span class=\\"line\\"><span>@Cacheable(value=\\"cityInfo\\", key=\\"#code\\", unless=\\"#result == null\\")</span></span>\\n<span class=\\"line\\"><span>public getCityInfoDto queryByCode(String code){</span></span>\\n<span class=\\"line\\"><span>    //...</span></span>\\n<span class=\\"line\\"><span>}</span></span></code></pre>\\n<div class=\\"line-numbers\\" aria-hidden=\\"true\\" style=\\"counter-reset:line-number 0\\"><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div><div class=\\"line-number\\"></div></div></div>","autoDesc":true}');export{g as comp,k as data};
