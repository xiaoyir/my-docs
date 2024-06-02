import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    "",
    // {
    //   text: "如何使用",
    //   icon: "laptop-code",
    //   prefix: "demo/",
    //   link: "demo/",
    //   children: "structure",
    // },
    // {
    //   text: "文章",
    //   icon: "book",
    //   prefix: "posts/",
    //   children: "structure",
    // },
    // "intro",
    // {
    //   text: "幻灯片",
    //   icon: "person-chalkboard",
    //   link: "https://plugin-md-enhance.vuejs.press/zh/guide/content/revealjs/demo.html",
    // },
    {
      text: "Java",
      icon: "laptop-code",
      prefix: "skill/java",
      collapsible: true,
      expanded: false,
      children: "structure"
    },
    {
      text: "JVM",
      icon: "laptop-code",
      prefix: "skill/jvm",
      collapsible: true,
      expanded: false,
      children: "structure"
    },
    {
      text: "github",
      icon: "laptop-code",
      prefix: "skill/github",
      collapsible: true,
      expanded: false,
      children: "structure"
    },
    {
      text: "nginx",
      icon: "laptop-code",
      prefix: "skill/nginx",
      collapsible: true,
      expanded: false,
      children: "structure"
    },
    {
      text: "mysql",
      icon: "laptop-code",
      prefix: "skill/mysql",
      collapsible: true,
      expanded: false,
      children: "structure"
    },
    {
      text: "redis",
      icon: "laptop-code",
      prefix: "skill/redis",
      collapsible: true,
      expanded: false,
      children: "structure"
    },
    {
      text: "sentinel",
      icon: "laptop-code",
      prefix: "skill/sentinel",
      collapsible: true,
      expanded: false,
      children: "structure"
    },
    {
      text: "canal",
      icon: "laptop-code",
      prefix: "skill/canal",
      collapsible: true,
      expanded: false,
      children: "structure"
    },
    {
      text: "spring",
      icon: "laptop-code",
      prefix: "skill/spring",
      collapsible: true,
      expanded: false,
      children: "structure"
    },
    {
      text: "其他",
      icon: "laptop-code",
      prefix: "skill/other",
      collapsible: true,
      expanded: false,
      children: "structure"
    },
    {
      text: "学习书籍",
      icon: "laptop-code",
      prefix: "skill/books",
      collapsible: true,
      expanded: false,
      children: "structure"
    },
  ],
});
