import{_ as n,c as s,o as a,d as e}from"./app-9aLaKr4C.js";const i={},l=e(`<h1 id="spring-cache解析" tabindex="-1"><a class="header-anchor" href="#spring-cache解析"><span>Spring cache解析</span></a></h1><p>本文基于springboot2.3.7版本进行分析，对应的spring-context版本为5.2.12，官方文档地址如下：</p><blockquote><p>https://docs.spring.io/spring-framework/docs/5.2.12.RELEASE/spring-framework-reference/integration.html#cache</p></blockquote><p>一、spring cache默认实现</p><ol><li>springboot启动类添加@EnableCaching注解开启缓存，新增SpringContextUtil应用上下文用于获取bean</li></ol><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@Component</span></span>
<span class="line"><span>public class SpringContextUtil implements ApplicationContextAware {</span></span>
<span class="line"><span>    private static ApplicationContext applicationContext;</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {</span></span>
<span class="line"><span>        this.applicationContext = applicationContext;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    public static ApplicationContext getApplicationContext() {</span></span>
<span class="line"><span>        return applicationContext;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    public static Object getBean(String name) throws BeansException {</span></span>
<span class="line"><span>        return applicationContext.getBean(name);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    public static &lt;T&gt; T getBean(Class&lt;T&gt; clazz) throws BeansException {</span></span>
<span class="line"><span>        return applicationContext.getBean(clazz);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>2.测试TestController类</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@RequestMapping(&quot;/test&quot;)</span></span>
<span class="line"><span>@RestController</span></span>
<span class="line"><span>public class TestController {</span></span>
<span class="line"><span>    @PostMapping(&quot;/name&quot;)</span></span>
<span class="line"><span>    @Cacheable(key = &quot;#root.args[0]&quot;, value = &quot;name&quot;)</span></span>
<span class="line"><span>    public String name(@RequestParam String id) {</span></span>
<span class="line"><span>        String value = id.concat(&quot;-&quot;).concat(String.valueOf(UUID.randomUUID()));</span></span>
<span class="line"><span>        return value;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    @PostMapping(&quot;/check&quot;)</span></span>
<span class="line"><span>    public void check() {</span></span>
<span class="line"><span>        CacheManager bean = SpringContextUtil.getBean(CacheManager.class);</span></span>
<span class="line"><span>        return;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>3.多次调用name接口，检查cacheManager，可以发现spring Cache默认实现是concurrentMapCacheManager，里面是一个嵌套的hashMap，外层cacheMap用于存放value定义的&quot;name&quot;名称，内层store存放真正的缓存数据</p><p><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180633.png" alt="img" loading="lazy"> 4.store存放/name接口返回值的具体逻辑由cacheInterceptor拦截器实现，cacheInterceptor会执行CacheAspectSupport中的apply方法缓存接口返回值</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public void apply(@Nullable Object result) {</span></span>
<span class="line"><span>    if (this.context.canPutToCache(result)) {</span></span>
<span class="line"><span>        Iterator var2 = this.context.getCaches().iterator();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        while(var2.hasNext()) {</span></span>
<span class="line"><span>            Cache cache = (Cache)var2.next();</span></span>
<span class="line"><span>            CacheAspectSupport.this.doPut(cache, this.key, result);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>二、设置缓存过期时间</p><p>concurrentMapCacheManager并没有提供ttl设置，删除缓存只能通过evict，可以利用java继承特性，覆盖spring默认获取缓存方法，增加ttl校验</p><ol><li>继承默认缓存处理器ConcurrentMapCacheManager</li></ol><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@EnableCaching</span></span>
<span class="line"><span>@Component</span></span>
<span class="line"><span>public class ConcurrentTTLCacheManager extends ConcurrentMapCacheManager {</span></span>
<span class="line"><span>    private SerializationDelegate serializationDelegate;</span></span>
<span class="line"><span>    @PostConstruct</span></span>
<span class="line"><span>    public void initSerialization() {</span></span>
<span class="line"><span>        Field serialization = ReflectionUtils.findField(ConcurrentMapCacheManager.class, &quot;serialization&quot;);</span></span>
<span class="line"><span>        ReflectionUtils.makeAccessible(serialization);</span></span>
<span class="line"><span>        this.serializationDelegate = (SerializationDelegate) ReflectionUtils.getField(serialization, this);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    protected Cache createConcurrentMapCache(String name) {</span></span>
<span class="line"><span>        SerializationDelegate actualSerialization = this.isStoreByValue() ? this.serializationDelegate : null;</span></span>
<span class="line"><span>        return new ConcurrentTTLCache(name, new ConcurrentHashMap(256), this.isAllowNullValues(), actualSerialization);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>2.继承默认缓存实现concurrentMapCache</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class ConcurrentTTLCache extends ConcurrentMapCache {</span></span>
<span class="line"><span>    public ConcurrentTTLCache(String name, ConcurrentHashMap&lt;Object, Object&gt; store, boolean allowNullValues, SerializationDelegate actualSerialization) {</span></span>
<span class="line"><span>        super(name, store, allowNullValues, actualSerialization);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    protected Object lookup(Object key) {</span></span>
<span class="line"><span>        Object lookup = super.lookup(key);</span></span>
<span class="line"><span>        if (lookup instanceof TTLCache &amp;&amp; ((TTLCache) lookup).isExpire()) {</span></span>
<span class="line"><span>            super.evict(key);</span></span>
<span class="line"><span>            return null;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return lookup;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>3.定义包含时间属性的抽象父类和继承子类</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@Data</span></span>
<span class="line"><span>public class TTLCache {</span></span>
<span class="line"><span>    private Date expire;</span></span>
<span class="line"><span>    public boolean isExpire(){</span></span>
<span class="line"><span>        return expire.before(new Date());</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>@Data</span></span>
<span class="line"><span>public class CustomVo extends TTLCache {</span></span>
<span class="line"><span>    private String code;</span></span>
<span class="line"><span>    private String age;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>4.实践测试，当触发缓存时会执行ConcurrentTTLCache中的lookup方法判断时间是否过期</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@GetMapping(&quot;/put&quot;)</span></span>
<span class="line"><span>@Cacheable(value = &quot;ttlCache&quot;, cacheManager = &quot;concurrentTTLCacheManager&quot;, key = &quot;#root.args[0]&quot;)</span></span>
<span class="line"><span>public CustomVo custom() throws Exception {</span></span>
<span class="line"><span>    CustomVo customVo = new CustomVo();</span></span>
<span class="line"><span>    //设置过期时间</span></span>
<span class="line"><span>    SimpleDateFormat simpleDateFormat = new SimpleDateFormat(&quot;yyyy-MM-dd HH:mm:ss&quot;);</span></span>
<span class="line"><span>    Date parse = simpleDateFormat.parse(&quot;2023-07-23 22:00:00&quot;);</span></span>
<span class="line"><span>    customVo.setExpire(parse);</span></span>
<span class="line"><span>    return customVo;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>三、切换为redis实现</p><p>concurrentMapCache是jvm缓存，无法满足分布式，而且过期时间设置较为麻烦，这时候就需要引入redis</p><p>1.添加maven依赖包</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>&lt;dependency&gt;</span></span>
<span class="line"><span>    &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;</span></span>
<span class="line"><span>    &lt;artifactId&gt;spring-boot-starter-data-redis&lt;/artifactId&gt;</span></span>
<span class="line"><span>    &lt;version&gt;2.3.7.RELEASE&lt;/version&gt;</span></span>
<span class="line"><span>&lt;/dependency&gt;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>2.系统参数配置</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>spring.redis.host=http://localhost</span></span>
<span class="line"><span>spring.redis.port=6379</span></span>
<span class="line"><span>spring.redis.database=0</span></span>
<span class="line"><span>spring.redis.password=</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>3.设置缓存管理器</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@Configuration</span></span>
<span class="line"><span>@EnableCaching</span></span>
<span class="line"><span>public class RedisCacheConfig extends CachingConfigurerSupport {</span></span>
<span class="line"><span>    @Bean</span></span>
<span class="line"><span>    @Primary</span></span>
<span class="line"><span>    public CacheManager cacheManager(RedisConnectionFactory factory) {</span></span>
<span class="line"><span>        ObjectMapper objectMapper = new ObjectMapper();</span></span>
<span class="line"><span>        objectMapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);</span></span>
<span class="line"><span>        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);</span></span>
<span class="line"><span>        objectMapper.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);</span></span>
<span class="line"><span>        GenericJackson2JsonRedisSerializer genericJackson2JsonRedisSerializer = new GenericJackson2JsonRedisSerializer(objectMapper);</span></span>
<span class="line"><span>        RedisCacheConfiguration redisCacheConfig = RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(10)).disableCachingNullValues()</span></span>
<span class="line"><span>                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))</span></span>
<span class="line"><span>                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(genericJackson2JsonRedisSerializer));</span></span>
<span class="line"><span>        return RedisCacheManager.builder(factory).cacheDefaults(redisCacheConfig).build();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>4.切换为redis后默认所有的缓存有效期设置了10分钟，如果想自定义过期时间，可以增设缓存处理器。做法如下，新增自定义的redisTtlCacheManager处理器，在redisCacheConfig配置类中新增bean</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class RedisTtlCacheManager extends RedisCacheManager {</span></span>
<span class="line"><span>    public RedisTtlCacheManager(RedisCacheWriter redisCacheWriter, RedisCacheConfiguration redisCacheConfiguration) {</span></span>
<span class="line"><span>        super(redisCacheWriter,redisCacheConfiguration);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    protected RedisCache createRedisCache(String name, RedisCacheConfiguration cacheConfig) {</span></span>
<span class="line"><span>        String[] strings = StringUtils.delimitedListToStringArray(name, &quot;-&quot;);</span></span>
<span class="line"><span>        name = strings[0];</span></span>
<span class="line"><span>        if (strings.length &gt; 1) {</span></span>
<span class="line"><span>            long l = Long.parseLong(strings[1]);</span></span>
<span class="line"><span>            cacheConfig = cacheConfig.entryTtl(Duration.ofSeconds(l));</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return super.createRedisCache(name, cacheConfig);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class RedisCacheConfig extends CachingConfigurerSupport {</span></span>
<span class="line"><span>    @Bean</span></span>
<span class="line"><span>    @Primary</span></span>
<span class="line"><span>    public CacheManager cacheManager(RedisConnectionFactory factory) {</span></span>
<span class="line"><span>        //...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Bean</span></span>
<span class="line"><span>    public RedisCacheManager ttlCacheManager(RedisTemplate&lt;String, Object&gt; redisTemplate) {</span></span>
<span class="line"><span>        RedisCacheWriter redisCacheWriter = RedisCacheWriter.nonLockingRedisCacheWriter(redisTemplate.getConnectionFactory());</span></span>
<span class="line"><span>        RedisCacheConfiguration redisCacheConfiguration = RedisCacheConfiguration.defaultCacheConfig().serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(redisTemplate.getValueSerializer()));</span></span>
<span class="line"><span>        return new RedisTtlCacheManager(redisCacheWriter, redisCacheConfiguration);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Bean</span></span>
<span class="line"><span>    public RedisTemplate redisTemplate(@Autowired RedisConnectionFactory redisConnectionFactory) {</span></span>
<span class="line"><span>        RedisTemplate&lt;Object, Object&gt; redisTemplate = new RedisTemplate&lt;&gt;();</span></span>
<span class="line"><span>        redisTemplate.setConnectionFactory(redisConnectionFactory);</span></span>
<span class="line"><span>        redisTemplate.setKeySerializer(new StringRedisSerializer());</span></span>
<span class="line"><span>        redisTemplate.setHashKeySerializer(new StringRedisSerializer());</span></span>
<span class="line"><span>        Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer(Object.class);</span></span>
<span class="line"><span>        ObjectMapper objectMapper = new ObjectMapper();</span></span>
<span class="line"><span>        objectMapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);</span></span>
<span class="line"><span>        objectMapper.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);</span></span>
<span class="line"><span>        jackson2JsonRedisSerializer.setObjectMapper(objectMapper);</span></span>
<span class="line"><span>        redisTemplate.setValueSerializer(jackson2JsonRedisSerializer);</span></span>
<span class="line"><span>        redisTemplate.afterPropertiesSet();</span></span>
<span class="line"><span>        return redisTemplate;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>5.使用实践，设置过期时间1000s</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@GetMapping(&quot;/name&quot;)</span></span>
<span class="line"><span>@Cacheable(key = &quot;#root.args[0]&quot;, value = &quot;name-1000&quot;, cacheManager = &quot;ttlCacheManager&quot;, unless = &quot;#result=null&quot;)</span></span>
<span class="line"><span>public String name(@RequestParam String id) {</span></span>
<span class="line"><span>    String value = id.concat(&quot;-&quot;).concat(String.valueOf(UUID.randomUUID()));</span></span>
<span class="line"><span>    return value;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>四、自定义缓存拦截器</p><p>1.redisTemplate和redisCacheManager</p><p>当添加spring-boot-starter-data-redis依赖包后，就可以使用如下代码操作redis</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>String value = (String) redisTemplate.opsForValue().get(&quot;ab&quot;);</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><p>当然也可以用继承了cacheManager的redisCacheManager来操作缓存</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>RedisCacheManager cacheManager = SpringContextUtil.getBean(RedisCacheManager.class);</span></span>
<span class="line"><span>Cache name = cacheManager.getCache(&quot;name&quot;);</span></span>
<span class="line"><span>String ab = name.get(&quot;ab&quot;, String.class);</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>两者都可以实现redis缓存运用，其区别是redisTemplate是redis的专用工具类，而cacheManager是spring cache模块提供的一个统一SPI接口，redisCacheManager是对它的实现</p><p>2.可以通过redisTemplate和Aspect来实现Spring Cache的整个缓存处理过程。首先参照@Cache注解，定义自己的新注解@CacheTtl，新增ttl时间属性</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@Target(ElementType.METHOD)</span></span>
<span class="line"><span>@Retention(RetentionPolicy.RUNTIME)</span></span>
<span class="line"><span>public @interface CacheableTtl {</span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 缓存key。推荐用xx:yy格式</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @return</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    public String key() default &quot;&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 缓存有效期，默认为30。时间单位{@link #ttlTimeUnit}</span></span>
<span class="line"><span>     * 注意ehcache仅支持0（表示永久）、5秒、30秒、60秒、5分钟、半小时、1小时</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @return</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    public long ttl() default 30;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 缓存有效期时间单位，默认为分钟。时间单位参考{@link TimeUnit java.util.concurrent.TimeUnit} ;如果cacheManager=ehCacheCacheManager时，该属性无效</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @return</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    public TimeUnit ttlTimeUnit() default TimeUnit.MINUTES;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    /**</span></span>
<span class="line"><span>     * 使用的缓存管理器，目前支持redisCacheManager、ehCacheCacheManager两种，默认redisCacheManager</span></span>
<span class="line"><span>     *</span></span>
<span class="line"><span>     * @return</span></span>
<span class="line"><span>     */</span></span>
<span class="line"><span>    public String cacheManager() default &quot;redis&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>3.新增缓存拦截器，针对使用了@CacheableTtl注解的方法设置缓存</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@Component</span></span>
<span class="line"><span>@Aspect</span></span>
<span class="line"><span>public class CacheableAspect {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private final RedisTemplate&lt;String, Object&gt; redisTemplate;</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public CacheableAspect(RedisTemplate&lt;String, Object&gt; redisTemplate) {</span></span>
<span class="line"><span>        this.redisTemplate = redisTemplate;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Pointcut(&quot;@annotation(com.team.thirdmanage.cache.CacheableTtl)&quot;)</span></span>
<span class="line"><span>    public void pointcut() {}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Around(value = &quot;pointcut()&quot;)</span></span>
<span class="line"><span>    public Object around(final ProceedingJoinPoint pjp) throws Throwable {</span></span>
<span class="line"><span>        Method method = MethodSignature.class.cast(pjp.getSignature()).getMethod();</span></span>
<span class="line"><span>        CacheableTtl cacheable = method.getAnnotation(CacheableTtl.class);</span></span>
<span class="line"><span>        String key = cacheable.key();</span></span>
<span class="line"><span>        Object value = getCache(cacheable, key);</span></span>
<span class="line"><span>        if (null == value) {</span></span>
<span class="line"><span>            value = pjp.proceed();</span></span>
<span class="line"><span>            setCache(cacheable, key, value);</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return value;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private void setCache(CacheableTtl cacheable, String key, Object value) {</span></span>
<span class="line"><span>        // 查询不到数据，设置NULL替换符</span></span>
<span class="line"><span>        if (value == null) {</span></span>
<span class="line"><span>            setRealCache(key, &quot;*&quot;, cacheable);</span></span>
<span class="line"><span>            return;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        setRealCache(key, value, cacheable);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private Object getCache(CacheableTtl cacheable, String key) {</span></span>
<span class="line"><span>        Object value = null;</span></span>
<span class="line"><span>        switch (cacheable.cacheManager()) {</span></span>
<span class="line"><span>            case &quot;redis&quot;:</span></span>
<span class="line"><span>                value = redisTemplate.opsForValue().get(key);</span></span>
<span class="line"><span>                break;</span></span>
<span class="line"><span>            default:</span></span>
<span class="line"><span>                break;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return value;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private void setRealCache(String key, Object value, CacheableTtl cacheable) {</span></span>
<span class="line"><span>        long ttl = cacheable.ttl();</span></span>
<span class="line"><span>        TimeUnit timeUnit = cacheable.ttlTimeUnit();</span></span>
<span class="line"><span>        switch (cacheable.cacheManager()) {</span></span>
<span class="line"><span>            case &quot;redis&quot;:</span></span>
<span class="line"><span>                redisTemplate.opsForValue().set(key, value, ttl, timeUnit);</span></span>
<span class="line"><span>                break;</span></span>
<span class="line"><span>            default:</span></span>
<span class="line"><span>                break;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>4.使用自定义注解测试</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>@GetMapping(&quot;/ttl&quot;)</span></span>
<span class="line"><span>@CacheableTtl(key = &quot;cacheTtl&quot;, ttl = 10, ttlTimeUnit = TimeUnit.MINUTES)</span></span>
<span class="line"><span>public String testTtl(@RequestParam String id) {</span></span>
<span class="line"><span>    String value = id.concat(&quot;-&quot;).concat(String.valueOf(UUID.randomUUID()));</span></span>
<span class="line"><span>    return value;</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以看到数据已经被存入redis中！</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180647.png" alt="img_1" tabindex="0" loading="lazy"><figcaption>img_1</figcaption></figure>`,49),p=[l];function c(t,r){return a(),s("div",null,p)}const u=n(i,[["render",c],["__file","Spring Cache解析.html.vue"]]),v=JSON.parse('{"path":"/skill/spring/Spring%20Cache%E8%A7%A3%E6%9E%90.html","title":"Spring cache解析","lang":"zh-CN","frontmatter":{"title":"Spring cache解析","description":"Spring cache解析 本文基于springboot2.3.7版本进行分析，对应的spring-context版本为5.2.12，官方文档地址如下： https://docs.spring.io/spring-framework/docs/5.2.12.RELEASE/spring-framework-reference/integration....","head":[["meta",{"property":"og:url","content":"https://mister-hope.github.io/my-docs/skill/spring/Spring%20Cache%E8%A7%A3%E6%9E%90.html"}],["meta",{"property":"og:site_name","content":"Java库"}],["meta",{"property":"og:title","content":"Spring cache解析"}],["meta",{"property":"og:description","content":"Spring cache解析 本文基于springboot2.3.7版本进行分析，对应的spring-context版本为5.2.12，官方文档地址如下： https://docs.spring.io/spring-framework/docs/5.2.12.RELEASE/spring-framework-reference/integration...."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180633.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-02T09:24:29.000Z"}],["meta",{"property":"article:author","content":"程序员小义"}],["meta",{"property":"article:modified_time","content":"2024-06-02T09:24:29.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Spring cache解析\\",\\"image\\":[\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180633.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180647.png\\"],\\"dateModified\\":\\"2024-06-02T09:24:29.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"程序员小义\\",\\"url\\":\\"https://mister-hope.com\\"}]}"]]},"headers":[],"git":{"createdTime":1717320269000,"updatedTime":1717320269000,"contributors":[{"name":"whuhbz","email":"463436681@qq.com","commits":1}]},"readingTime":{"minutes":4.91,"words":1472},"filePathRelative":"skill/spring/Spring Cache解析.md","localizedDate":"2024年6月2日","excerpt":"\\n<p>本文基于springboot2.3.7版本进行分析，对应的spring-context版本为5.2.12，官方文档地址如下：</p>\\n<blockquote>\\n<p>https://docs.spring.io/spring-framework/docs/5.2.12.RELEASE/spring-framework-reference/integration.html#cache</p>\\n</blockquote>\\n<p>一、spring cache默认实现</p>\\n<ol>\\n<li>springboot启动类添加@EnableCaching注解开启缓存，新增SpringContextUtil应用上下文用于获取bean</li>\\n</ol>","autoDesc":true}');export{u as comp,v as data};
