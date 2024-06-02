import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { getDirname, path } from "vuepress/utils";
import { searchPlugin } from "@vuepress/plugin-search";

export default defineUserConfig({

  base: "/my-docs/",

  lang: "zh-CN",
  title: "Java库",
  description: "个人博客",

  theme,

  // 和 PWA 一起启用
  // shouldPrefetch: false,
  alias: {
    "@theme-hope/modules/blog/components/BlogHero": path.resolve(
        __dirname,
        "./components/BlogHero.vue",
    ),
  },
  plugins: [
    searchPlugin({
      // 配置项
    }),
  ],
});
