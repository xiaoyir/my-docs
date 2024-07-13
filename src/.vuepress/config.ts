import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { viteBundler } from "@vuepress/bundler-vite";
import { getDirname, path } from "vuepress/utils";
import { searchPlugin } from "@vuepress/plugin-search";
import { readingTimePlugin } from '@vuepress/plugin-reading-time'
export default defineUserConfig({

  base: "/",

  lang: "zh-CN",
  title: "知识库",
  description: "程序员个人博客，分享Java面试经验、知识点复习，AI探索与实践等，关注程序员自身的成长经历！",
  head: [
    // meta
    ["meta", { name: "robots", content: "all" }],
    ["meta", { name: "author", content: "xiaoyi" }],
    [
      "meta",
      {
        "http-equiv": "Cache-Control",
        content: "no-cache, no-store, must-revalidate",
      },
    ],
    ["meta", { "http-equiv": "Pragma", content: "no-cache" }],
    ["meta", { "http-equiv": "Expires", content: "0" }],
    [
      "meta",
      {
        name: "keywords",
        content:
            "Java基础, 线上bug, JVM, 虚拟机, 数据库, MySQL, Spring, Redis, 微服务, RPC, 高可用, 高并发",
      },
    ],
    [
      "meta",
      {
        name: "description",
        content:
            "Java面试经验、知识点复习，AI探索与实践等，注重程序员全面发展！",
      },
    ],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    // 添加百度统计
    [
      "script",
      {},
      `var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?5dd2e8c97962d57b7b8fea1737c01743";
          var s = document.getElementsByTagName("script")[0]; 
          s.parentNode.insertBefore(hm, s);
        })();`,
    ],
  ],
  bundler: viteBundler(),
  theme,
  //permalink:"/:slug",
  // 和 PWA 一起启用
  // shouldPrefetch: false,
  alias: {
    "@theme-hope/modules/blog/components/BlogHero": path.resolve(
        __dirname,
        "./components/BlogHero.vue",
    ),
  },
  plugins: [
    //插件-为每个页面生成字数统计与预计阅读时间
    readingTimePlugin({
      // 配置项
    }),
      //搜索插件
    searchPlugin({
      // 配置项
    }),
  ],
});
