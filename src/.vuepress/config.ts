import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { getDirname, path } from "vuepress/utils";


export default defineUserConfig({

  base: "/my-docs/",

  lang: "zh-CN",
  title: "博客演示",
  description: "vuepress-theme-hope 的博客演示",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
  alias: {
    "@theme-hope/modules/blog/components/BlogHero": path.resolve(
        __dirname,
        "./components/BlogHero.vue",
    ),
  },
});
