import{_ as n,c as s,o as a,d as e}from"./app-BeG2TDbG.js";const i={},l=e(`<h1 id="手写rpc框架-一小时足矣" tabindex="-1"><a class="header-anchor" href="#手写rpc框架-一小时足矣"><span>手写RPC框架，一小时足矣！</span></a></h1><h2 id="一、项目结构" tabindex="-1"><a class="header-anchor" href="#一、项目结构"><span>一、项目结构</span></a></h2><p>RPC即远程过程调用，也叫远程方法调用，RPC框架可以实现调用方可以像调用本地方法一样调用远程服务的方法。要了解微服务和分布式，RPC必不可少，话不多说，下面直接开整。</p><p>环境：JDK1.8，Intellij idea. 新建rpc maven项目，分别创建comsumer、provider、provider-com、rpc-framework四个maven项目子模块，其中provider和provider-com都属于方法提供者，用来模拟远程服务，下面一一介绍。</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180521.png" alt="img" tabindex="0" loading="lazy"><figcaption>img</figcaption></figure><h2 id="二、框架封装" tabindex="-1"><a class="header-anchor" href="#二、框架封装"><span>二、框架封装</span></a></h2><h3 id="_1-maven依赖" tabindex="-1"><a class="header-anchor" href="#_1-maven依赖"><span>1. maven依赖</span></a></h3><p>rpc-framwork是框架的核心，需要处理网络请求，这里引入内嵌tomcat，通过http协议来实现远程过程调用。具体pom.xml文件如下：</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;</span></span>
<span class="line"><span>&lt;project xmlns=&quot;http://maven.apache.org/POM/4.0.0&quot;</span></span>
<span class="line"><span>         xmlns:xsi=&quot;http://www.w3.org/2001/XMLSchema-instance&quot;</span></span>
<span class="line"><span>         xsi:schemaLocation=&quot;http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd&quot;&gt;</span></span>
<span class="line"><span>    &lt;parent&gt;</span></span>
<span class="line"><span>        &lt;artifactId&gt;rpc&lt;/artifactId&gt;</span></span>
<span class="line"><span>        &lt;groupId&gt;org.example&lt;/groupId&gt;</span></span>
<span class="line"><span>        &lt;version&gt;1.0-SNAPSHOT&lt;/version&gt;</span></span>
<span class="line"><span>    &lt;/parent&gt;</span></span>
<span class="line"><span>    &lt;modelVersion&gt;4.0.0&lt;/modelVersion&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &lt;artifactId&gt;rpc-framework&lt;/artifactId&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>    &lt;dependencies&gt;</span></span>
<span class="line"><span>        &lt;dependency&gt;</span></span>
<span class="line"><span>            &lt;groupId&gt;org.apache.tomcat.embed&lt;/groupId&gt;</span></span>
<span class="line"><span>            &lt;artifactId&gt;tomcat-embed-core&lt;/artifactId&gt;</span></span>
<span class="line"><span>            &lt;version&gt;9.0.69&lt;/version&gt;</span></span>
<span class="line"><span>        &lt;/dependency&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        &lt;dependency&gt;</span></span>
<span class="line"><span>            &lt;groupId&gt;org.apache.commons&lt;/groupId&gt;</span></span>
<span class="line"><span>            &lt;artifactId&gt;commons-io&lt;/artifactId&gt;</span></span>
<span class="line"><span>            &lt;version&gt;1.3.2&lt;/version&gt;</span></span>
<span class="line"><span>        &lt;/dependency&gt;</span></span>
<span class="line"><span>    &lt;/dependencies&gt;</span></span>
<span class="line"><span>&lt;/project&gt;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-模块结构" tabindex="-1"><a class="header-anchor" href="#_2-模块结构"><span>2.模块结构</span></a></h3><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180532.png" alt="img_1" tabindex="0" loading="lazy"><figcaption>img_1</figcaption></figure><h3 id="_3-common包" tabindex="-1"><a class="header-anchor" href="#_3-common包"><span>3.common包</span></a></h3><p>该包存放公共的实体，新建Invocation类用来存放接口信息， URLInfo类存放服务器信息。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>//Invocation</span></span>
<span class="line"><span>public class Invocation implements Serializable {</span></span>
<span class="line"><span>    private String interfaceName;</span></span>
<span class="line"><span>    private String methodName;</span></span>
<span class="line"><span>    private Class[] parameterTypes;</span></span>
<span class="line"><span>    private Object[] parameters;</span></span>
<span class="line"><span>    private String version;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public Invocation(String interfaceName, String methodName, Class[] parameterTypes, Object[] parameters) {</span></span>
<span class="line"><span>        this.interfaceName = interfaceName;</span></span>
<span class="line"><span>        this.methodName = methodName;</span></span>
<span class="line"><span>        this.parameterTypes = parameterTypes;</span></span>
<span class="line"><span>        this.parameters = parameters;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>//URLInfo</span></span>
<span class="line"><span>public class URLInfo implements Serializable {</span></span>
<span class="line"><span>    private String host;</span></span>
<span class="line"><span>    private Integer port;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public URLInfo(String host, Integer port) {</span></span>
<span class="line"><span>        this.host = host;</span></span>
<span class="line"><span>        this.port = port;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>    //...</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-loadbalance包" tabindex="-1"><a class="header-anchor" href="#_4-loadbalance包"><span>4.loadBalance包</span></a></h3><p>该包存放负载均衡的一些算法实现。一般服务都会多节点部署，rpc框架需要通过负载均衡算法来决定消费者要调用哪一个服务的具体方法。这里只是简单的实现一个随机算法，实际的rpc框架如dubbo、spring Cloud的负载均衡实现都要复杂得多的多。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class LoadBalanceRandom {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static URLInfo random(List&lt;URLInfo&gt; list) {</span></span>
<span class="line"><span>        Random random = new Random();</span></span>
<span class="line"><span>        int i = random.nextInt(list.size());</span></span>
<span class="line"><span>        return list.get(i);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-protocol" tabindex="-1"><a class="header-anchor" href="#_5-protocol"><span>5.protocol</span></a></h3><p>顾名思义，protocol 包用来处理协议的交互逻辑。首先新建一个HttpServer类用来启动tomcat服务。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class HttpServer {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public void start(String hostname, Integer port) {</span></span>
<span class="line"><span>        Tomcat tomcat = new Tomcat();</span></span>
<span class="line"><span>        Server server = tomcat.getServer();</span></span>
<span class="line"><span>        Service service = server.findService(&quot;Tomcat&quot;);</span></span>
<span class="line"><span>        Connector connector = new Connector();</span></span>
<span class="line"><span>        connector.setPort(port);</span></span>
<span class="line"><span>        Engine engine = new StandardEngine();</span></span>
<span class="line"><span>        engine.setDefaultHost(hostname);</span></span>
<span class="line"><span>        StandardHost host = new StandardHost();</span></span>
<span class="line"><span>        host.setName(hostname);</span></span>
<span class="line"><span>        String contextPath = &quot;&quot;;</span></span>
<span class="line"><span>        Context context = new StandardContext();</span></span>
<span class="line"><span>        context.setPath(contextPath);</span></span>
<span class="line"><span>        context.addLifecycleListener(new Tomcat.FixContextListener());</span></span>
<span class="line"><span>        host.addChild(context);</span></span>
<span class="line"><span>        engine.addChild(host);</span></span>
<span class="line"><span>        service.setContainer(engine);</span></span>
<span class="line"><span>        service.addConnector(connector);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        tomcat.addServlet(contextPath, &quot;dispatcher&quot;, new DispatchServlet());</span></span>
<span class="line"><span>        context.addServletMappingDecoded(&quot;/*&quot;, &quot;dispatcher&quot;);</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>            tomcat.start();</span></span>
<span class="line"><span>            tomcat.getServer().await();</span></span>
<span class="line"><span>        } catch (LifecycleException e) {</span></span>
<span class="line"><span>            e.printStackTrace();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>接着新建DispatchServlet和HttpServerHandler处理http请求。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>//DispatchServlet </span></span>
<span class="line"><span>public class DispatchServlet extends HttpServlet {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    @Override</span></span>
<span class="line"><span>    protected void service(HttpServletRequest req, HttpServletResponse resp) {</span></span>
<span class="line"><span>        new HttpServerHandler().handler(req, resp);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>//处理接收到的http请求</span></span>
<span class="line"><span>public class HttpServerHandler {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public void handler(HttpServletRequest req, HttpServletResponse resp) {</span></span>
<span class="line"><span>        Invocation invocation = null;</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>            invocation = (Invocation) new ObjectInputStream(req.getInputStream()).readObject();</span></span>
<span class="line"><span>            String interfaceName = invocation.getInterfaceName();</span></span>
<span class="line"><span>            Class classImpl = LocalRegister.get(interfaceName + &quot;v1.0&quot;);</span></span>
<span class="line"><span>            Method method = classImpl.getMethod(invocation.getMethodName(), invocation.getParameterTypes());</span></span>
<span class="line"><span>            String result = (String) method.invoke(classImpl.newInstance(), invocation.getParameters());</span></span>
<span class="line"><span>            IOUtils.write(result, resp.getOutputStream());</span></span>
<span class="line"><span>        } catch (IOException e) {</span></span>
<span class="line"><span>            e.printStackTrace();</span></span>
<span class="line"><span>        } catch (ClassNotFoundException e) {</span></span>
<span class="line"><span>            e.printStackTrace();</span></span>
<span class="line"><span>        } catch (NoSuchMethodException e) {</span></span>
<span class="line"><span>            e.printStackTrace();</span></span>
<span class="line"><span>        } catch (IllegalAccessException e) {</span></span>
<span class="line"><span>            e.printStackTrace();</span></span>
<span class="line"><span>        } catch (InstantiationException e) {</span></span>
<span class="line"><span>            e.printStackTrace();</span></span>
<span class="line"><span>        } catch (InvocationTargetException e) {</span></span>
<span class="line"><span>            e.printStackTrace();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>最后建一个http客户端，用来发送请求</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>import java.net.URL;</span></span>
<span class="line"><span>//发送http请求</span></span>
<span class="line"><span>public class HttpClient {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public &lt;T&gt; T send(String hostName, Integer post, Invocation invocation) throws IOException {</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>            URL url = new URL(&quot;http&quot;, hostName, post, &quot;/&quot;);</span></span>
<span class="line"><span>            //打开连接</span></span>
<span class="line"><span>            HttpURLConnection urlConnection = (HttpURLConnection)url.openConnection();</span></span>
<span class="line"><span>            urlConnection.setRequestMethod(&quot;POST&quot;);</span></span>
<span class="line"><span>            urlConnection.setDoOutput(true);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            OutputStream outputStream = urlConnection.getOutputStream();</span></span>
<span class="line"><span>            ObjectOutputStream objectOutputStream = new ObjectOutputStream(outputStream);</span></span>
<span class="line"><span>            //通过对象输出流，将invocation对象序列化并写入到输出流中，发送给服务器</span></span>
<span class="line"><span>            objectOutputStream.writeObject(invocation);</span></span>
<span class="line"><span>            objectOutputStream.flush();</span></span>
<span class="line"><span>            objectOutputStream.close();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            //获取服务器返回结果</span></span>
<span class="line"><span>            InputStream inputStream = urlConnection.getInputStream();</span></span>
<span class="line"><span>            String s = IOUtils.toString(inputStream);</span></span>
<span class="line"><span>            return (T) s;</span></span>
<span class="line"><span>        } catch (MalformedURLException e) {</span></span>
<span class="line"><span>            e.printStackTrace();</span></span>
<span class="line"><span>        } catch (IOException e) {</span></span>
<span class="line"><span>            throw e;</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_6-proxy包" tabindex="-1"><a class="header-anchor" href="#_6-proxy包"><span>6.proxy包</span></a></h3><p>消费者在结合rpc框架之后，不需要像发送http请求调用服务端接口那么麻烦去调远程的方法，而是可以通过代理来实现，把麻烦的东西统统丢给框架，</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class ProxyFactory {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static &lt;T&gt; T getProxy(final Class interfaceClass) {</span></span>
<span class="line"><span>        Object o = Proxy.newProxyInstance(interfaceClass.getClassLoader(), new Class[]{interfaceClass}, new InvocationHandler() {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {</span></span>
<span class="line"><span>                Invocation invocation = new Invocation(interfaceClass.getName(), method.getName(), method.getParameterTypes(), args);</span></span>
<span class="line"><span>                HttpClient httpClient = new HttpClient();</span></span>
<span class="line"><span>                //服务发现</span></span>
<span class="line"><span>                List&lt;URLInfo&gt; urlInfos = RemoteRegister.get(interfaceClass.getName());</span></span>
<span class="line"><span>                //服务调用, 服务重试</span></span>
<span class="line"><span>                List&lt;URLInfo&gt; invokeList = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>                Object result = null;</span></span>
<span class="line"><span>                int max = 3;</span></span>
<span class="line"><span>                while (max &gt; 0) {</span></span>
<span class="line"><span>                    //负载均衡</span></span>
<span class="line"><span>                    urlInfos.remove(invokeList);</span></span>
<span class="line"><span>                    URLInfo urlInfo = LoadBalanceRandom.random(urlInfos);</span></span>
<span class="line"><span>                    invokeList.add(urlInfo);</span></span>
<span class="line"><span>                    try {</span></span>
<span class="line"><span>                        result = httpClient.send(urlInfo.getHost(), urlInfo.getPort(), invocation);</span></span>
<span class="line"><span>                        return result;</span></span>
<span class="line"><span>                    } catch (Exception e) {</span></span>
<span class="line"><span>                        if (--max != 0) {</span></span>
<span class="line"><span>                            System.out.println(&quot;服务异常，正在重试&quot;);</span></span>
<span class="line"><span>                            continue;</span></span>
<span class="line"><span>                        }</span></span>
<span class="line"><span>                        //e.printStackTrace();</span></span>
<span class="line"><span>                        return &quot;服务调用出错&quot;;</span></span>
<span class="line"><span>                    }</span></span>
<span class="line"><span>                }</span></span>
<span class="line"><span>                return result;</span></span>
<span class="line"><span>            }</span></span>
<span class="line"><span>        });</span></span>
<span class="line"><span>        return (T) o;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-register" tabindex="-1"><a class="header-anchor" href="#_7-register"><span>7.register</span></a></h3><p>注册分本地注册和注册中心注册，本地注册存放接口名和接口实现类的映射，注册中心注册存放接口名和ip地址的映射。一般注册中心可以通过redis、zookeeper、nacos等来实现，其目的是将服务提供方暴露给消费者，这里简化方式，通过读取本地文件来实现。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class LocalRegister {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private static Map&lt;String, Class&gt; map = new HashMap&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static void register(String interfaceName, String version, Class implClass) {</span></span>
<span class="line"><span>        map.put(interfaceName + &quot;v&quot; + version, implClass);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static Class get(String interfaceName) {</span></span>
<span class="line"><span>        return map.get(interfaceName);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>public class RemoteRegister {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private static Map&lt;String, List&lt;URLInfo&gt;&gt; map = new HashMap&lt;&gt;();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static void register(String interfaceName, URLInfo urlInfo) {</span></span>
<span class="line"><span>        List&lt;URLInfo&gt; urlInfos = map.get(interfaceName);</span></span>
<span class="line"><span>        if (urlInfos == null){</span></span>
<span class="line"><span>            urlInfos = new ArrayList&lt;&gt;();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        urlInfos.add(urlInfo);</span></span>
<span class="line"><span>        map.put(interfaceName, urlInfos);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        saveFile();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static List&lt;URLInfo&gt; get(String interfaceName) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        map = getFile();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        return map.get(interfaceName);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private static void saveFile() {</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>            FileOutputStream fileOutputStream = new FileOutputStream(&quot;/temp.txt&quot;);</span></span>
<span class="line"><span>            ObjectOutputStream objectOutputStream = new ObjectOutputStream(fileOutputStream);</span></span>
<span class="line"><span>            objectOutputStream.writeObject(map);</span></span>
<span class="line"><span>        } catch (IOException e) {</span></span>
<span class="line"><span>            e.printStackTrace();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private static Map&lt;String, List&lt;URLInfo&gt;&gt; getFile() {</span></span>
<span class="line"><span>        try {</span></span>
<span class="line"><span>            FileInputStream fileInputStream = new FileInputStream(&quot;/temp.txt&quot;);</span></span>
<span class="line"><span>            ObjectInputStream objectInputStream = new ObjectInputStream(fileInputStream);</span></span>
<span class="line"><span>            return (Map&lt;String, List&lt;URLInfo&gt;&gt;) objectInputStream.readObject();</span></span>
<span class="line"><span>        } catch (IOException e) {</span></span>
<span class="line"><span>            e.printStackTrace();</span></span>
<span class="line"><span>        } catch (ClassNotFoundException e) {</span></span>
<span class="line"><span>            e.printStackTrace();</span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span>        return null;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_8-封装启动类" tabindex="-1"><a class="header-anchor" href="#_8-封装启动类"><span>8.封装启动类</span></a></h3><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class Bootstrap {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private String host;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    private Integer port;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public Bootstrap(String host, Integer port) {</span></span>
<span class="line"><span>        this.host = host;</span></span>
<span class="line"><span>        this.port = port;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public void start() {</span></span>
<span class="line"><span>        HttpServer httpServer = new HttpServer();</span></span>
<span class="line"><span>        httpServer.start(host, port);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public &lt;T&gt; void localRegister(Class&lt;T&gt; clazz, String version, Class&lt;? extends T&gt; clazzImpl) {</span></span>
<span class="line"><span>        //本地注册 &lt;接口名,接口实现类&gt;</span></span>
<span class="line"><span>        LocalRegister.register(clazz.getName(),version, clazzImpl);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public &lt;T&gt; void remoteRegister(Class&lt;T&gt; clazz) {</span></span>
<span class="line"><span>        //注册中心注册 &lt;接口名, ip地址&gt;</span></span>
<span class="line"><span>        URLInfo urlInfo = new URLInfo(host, port);</span></span>
<span class="line"><span>        RemoteRegister.register(clazz.getName(), urlInfo);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="三、方法提供者" tabindex="-1"><a class="header-anchor" href="#三、方法提供者"><span>三、方法提供者</span></a></h2><h3 id="_1-provider-com模块" tabindex="-1"><a class="header-anchor" href="#_1-provider-com模块"><span>1.provider-com模块</span></a></h3><p>该模块用来放置对外接口，即从provider模块中抽离出可供外部调用的服务接口，不存放其他内容，方便消费者引用。</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180551.png" alt="img_2" tabindex="0" loading="lazy"><figcaption>img_2</figcaption></figure><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public interface SampleService {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    String milk(String brand);</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-provider模块" tabindex="-1"><a class="header-anchor" href="#_2-provider模块"><span>2.provider模块</span></a></h3><p>pom.xml引入provider-com和rpc-framework依赖包</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>    &lt;dependencies&gt;</span></span>
<span class="line"><span>        &lt;dependency&gt;</span></span>
<span class="line"><span>            &lt;groupId&gt;org.example&lt;/groupId&gt;</span></span>
<span class="line"><span>            &lt;artifactId&gt;provider-com&lt;/artifactId&gt;</span></span>
<span class="line"><span>            &lt;version&gt;1.0-SNAPSHOT&lt;/version&gt;</span></span>
<span class="line"><span>        &lt;/dependency&gt;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        &lt;dependency&gt;</span></span>
<span class="line"><span>            &lt;groupId&gt;org.example&lt;/groupId&gt;</span></span>
<span class="line"><span>            &lt;artifactId&gt;rpc-framework&lt;/artifactId&gt;</span></span>
<span class="line"><span>            &lt;version&gt;1.0-SNAPSHOT&lt;/version&gt;</span></span>
<span class="line"><span>        &lt;/dependency&gt;</span></span>
<span class="line"><span>    &lt;/dependencies&gt;</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>//接口实现类</span></span>
<span class="line"><span>public class SampleServiceImpl implements SampleService {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public String milk(String brand) {</span></span>
<span class="line"><span>        return &quot;make &quot;+ brand + &quot; milk&quot;;</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>//服务启动类</span></span>
<span class="line"><span>public class Provider {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>//    public static void main(String[] args) {</span></span>
<span class="line"><span>//        //本地注册</span></span>
<span class="line"><span>//        LocalRegister.register(SampleService.class.getName(),&quot;1.0&quot;, SampleServiceImpl.class);</span></span>
<span class="line"><span>//        //LocalRegister.register(SampleService.class.getName(),&quot;2.0&quot;, SampleServiceImpl2.class);</span></span>
<span class="line"><span>//        //注册中心注册</span></span>
<span class="line"><span>//        URLInfo urlInfo = new URLInfo(&quot;localhost&quot;,8080);</span></span>
<span class="line"><span>//        RemoteRegister.register(SampleService.class.getName(), urlInfo);</span></span>
<span class="line"><span>//</span></span>
<span class="line"><span>//        HttpServer httpServer = new HttpServer();</span></span>
<span class="line"><span>//        httpServer.start(urlInfo.getHost(),urlInfo.getPort());</span></span>
<span class="line"><span>//    }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>    public static void main(String[] args) {</span></span>
<span class="line"><span>        Bootstrap bootstrap = new Bootstrap(&quot;localhost&quot;, 8080);</span></span>
<span class="line"><span>        bootstrap.localRegister(SampleService.class, &quot;1.0&quot;, SampleServiceImpl.class);</span></span>
<span class="line"><span>        bootstrap.remoteRegister(SampleService.class);</span></span>
<span class="line"><span>        bootstrap.start();</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="四、方法消费者" tabindex="-1"><a class="header-anchor" href="#四、方法消费者"><span>四、方法消费者</span></a></h2><p>同样引入provider-com和rpc-framework依赖包，然后通过代理来调用provider模块中SampleService的milk方法。</p><div class="language- line-numbers-mode" data-highlighter="shiki" data-ext="" data-title="" style="--shiki-light:#24292e;--shiki-dark:#abb2bf;--shiki-light-bg:#fff;--shiki-dark-bg:#282c34;"><pre class="shiki shiki-themes github-light one-dark-pro vp-code"><code><span class="line"><span>public class Consumer {</span></span>
<span class="line"><span>    public static void main(String[] args) {</span></span>
<span class="line"><span>        SampleService proxy = ProxyFactory.getProxy(SampleService.class);</span></span>
<span class="line"><span>        String blue = proxy.milk(&quot;yili&quot;);</span></span>
<span class="line"><span>        System.out.println(blue);</span></span>
<span class="line"><span>    }</span></span>
<span class="line"><span>}</span></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="五、远程调用" tabindex="-1"><a class="header-anchor" href="#五、远程调用"><span>五、远程调用</span></a></h2><p>通过以上四大步骤，rpc框架代码已写完毕，启动provider，打印出tomcat日志说明服务正常运行。</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180602.png" alt="img_3" tabindex="0" loading="lazy"><figcaption>img_3</figcaption></figure><p>接着启动comsumer，可以看到远程方法已被调用</p><figure><img src="https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180609.png" alt="img_4" tabindex="0" loading="lazy"><figcaption>img_4</figcaption></figure><h2 id="六、总结" tabindex="-1"><a class="header-anchor" href="#六、总结"><span>六、总结</span></a></h2><p>在上述项目中，当生产者模块启动服务时，就已经将自己注册到了注册中心中，消费费者这边通过ProxyFactory，会生成一个生产者对外暴露的接口类的代理对象，包含具体的服务器IP地址。当consumer调用provider接口时，rpc框架就会利用httpClient向生产者发起http请求。而生产者这边同样通过框架对http做了接收处理，请求最终会走到HttpServerHandler中，执行具体的方法调用，然后返回结果。</p>`,52),p=[l];function t(c,r){return a(),s("div",null,p)}const v=n(i,[["render",t],["__file","手写RPC框架.html.vue"]]),o=JSON.parse('{"path":"/skill/spring/%E6%89%8B%E5%86%99RPC%E6%A1%86%E6%9E%B6.html","title":"手写RPC框架，一小时足矣！","lang":"zh-CN","frontmatter":{"description":"手写RPC框架，一小时足矣！ 一、项目结构 RPC即远程过程调用，也叫远程方法调用，RPC框架可以实现调用方可以像调用本地方法一样调用远程服务的方法。要了解微服务和分布式，RPC必不可少，话不多说，下面直接开整。 环境：JDK1.8，Intellij idea. 新建rpc maven项目，分别创建comsumer、provider、provider-...","head":[["meta",{"property":"og:url","content":"https://mister-hope.github.io/my-docs/skill/spring/%E6%89%8B%E5%86%99RPC%E6%A1%86%E6%9E%B6.html"}],["meta",{"property":"og:site_name","content":"Java库"}],["meta",{"property":"og:title","content":"手写RPC框架，一小时足矣！"}],["meta",{"property":"og:description","content":"手写RPC框架，一小时足矣！ 一、项目结构 RPC即远程过程调用，也叫远程方法调用，RPC框架可以实现调用方可以像调用本地方法一样调用远程服务的方法。要了解微服务和分布式，RPC必不可少，话不多说，下面直接开整。 环境：JDK1.8，Intellij idea. 新建rpc maven项目，分别创建comsumer、provider、provider-..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:image","content":"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180521.png"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-06-02T09:24:29.000Z"}],["meta",{"property":"article:author","content":"程序员小义"}],["meta",{"property":"article:modified_time","content":"2024-06-02T09:24:29.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"手写RPC框架，一小时足矣！\\",\\"image\\":[\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180521.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180532.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180551.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180602.png\\",\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180609.png\\"],\\"dateModified\\":\\"2024-06-02T09:24:29.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"程序员小义\\",\\"url\\":\\"https://mister-hope.com\\"}]}"]]},"headers":[{"level":2,"title":"一、项目结构","slug":"一、项目结构","link":"#一、项目结构","children":[]},{"level":2,"title":"二、框架封装","slug":"二、框架封装","link":"#二、框架封装","children":[{"level":3,"title":"1. maven依赖","slug":"_1-maven依赖","link":"#_1-maven依赖","children":[]},{"level":3,"title":"2.模块结构","slug":"_2-模块结构","link":"#_2-模块结构","children":[]},{"level":3,"title":"3.common包","slug":"_3-common包","link":"#_3-common包","children":[]},{"level":3,"title":"4.loadBalance包","slug":"_4-loadbalance包","link":"#_4-loadbalance包","children":[]},{"level":3,"title":"5.protocol","slug":"_5-protocol","link":"#_5-protocol","children":[]},{"level":3,"title":"6.proxy包","slug":"_6-proxy包","link":"#_6-proxy包","children":[]},{"level":3,"title":"7.register","slug":"_7-register","link":"#_7-register","children":[]},{"level":3,"title":"8.封装启动类","slug":"_8-封装启动类","link":"#_8-封装启动类","children":[]}]},{"level":2,"title":"三、方法提供者","slug":"三、方法提供者","link":"#三、方法提供者","children":[{"level":3,"title":"1.provider-com模块","slug":"_1-provider-com模块","link":"#_1-provider-com模块","children":[]},{"level":3,"title":"2.provider模块","slug":"_2-provider模块","link":"#_2-provider模块","children":[]}]},{"level":2,"title":"四、方法消费者","slug":"四、方法消费者","link":"#四、方法消费者","children":[]},{"level":2,"title":"五、远程调用","slug":"五、远程调用","link":"#五、远程调用","children":[]},{"level":2,"title":"六、总结","slug":"六、总结","link":"#六、总结","children":[]}],"git":{"createdTime":1717320269000,"updatedTime":1717320269000,"contributors":[{"name":"whuhbz","email":"463436681@qq.com","commits":1}]},"readingTime":{"minutes":6.14,"words":1842},"filePathRelative":"skill/spring/手写RPC框架.md","localizedDate":"2024年6月2日","excerpt":"\\n<h2>一、项目结构</h2>\\n<p>RPC即远程过程调用，也叫远程方法调用，RPC框架可以实现调用方可以像调用本地方法一样调用远程服务的方法。要了解微服务和分布式，RPC必不可少，话不多说，下面直接开整。</p>\\n<p>环境：JDK1.8，Intellij idea. 新建rpc maven项目，分别创建comsumer、provider、provider-com、rpc-framework四个maven项目子模块，其中provider和provider-com都属于方法提供者，用来模拟远程服务，下面一一介绍。</p>\\n<figure><img src=\\"https://javacool.oss-cn-shenzhen.aliyuncs.com/img/xyr/20240525180521.png\\" alt=\\"img\\" tabindex=\\"0\\" loading=\\"lazy\\"><figcaption>img</figcaption></figure>","autoDesc":true}');export{v as comp,o as data};
