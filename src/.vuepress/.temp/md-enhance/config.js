import { defineClientConfig } from "vuepress/client";
import CodeTabs from "D:/20xxCRPrograms/blog/my-docs/node_modules/vuepress-plugin-md-enhance/lib/client/components/CodeTabs.js";
import { hasGlobalComponent } from "D:/20xxCRPrograms/blog/my-docs/node_modules/@vuepress/helper/lib/client/index.js";
import { CodeGroup, CodeGroupItem } from "D:/20xxCRPrograms/blog/my-docs/node_modules/vuepress-plugin-md-enhance/lib/client/compact/index.js";
import CodeDemo from "D:/20xxCRPrograms/blog/my-docs/node_modules/vuepress-plugin-md-enhance/lib/client/components/CodeDemo.js";
import MdDemo from "D:/20xxCRPrograms/blog/my-docs/node_modules/vuepress-plugin-md-enhance/lib/client/components/MdDemo.js";
import "D:/20xxCRPrograms/blog/my-docs/node_modules/vuepress-plugin-md-enhance/lib/client/styles/figure.scss";
import { useHintContainers } from "D:/20xxCRPrograms/blog/my-docs/node_modules/vuepress-plugin-md-enhance/lib/client/composables/useHintContainers.js";
import "D:/20xxCRPrograms/blog/my-docs/node_modules/vuepress-plugin-md-enhance/lib/client/styles/hint/index.scss";
import Tabs from "D:/20xxCRPrograms/blog/my-docs/node_modules/vuepress-plugin-md-enhance/lib/client/components/Tabs.js";
import "D:/20xxCRPrograms/blog/my-docs/node_modules/@mdit/plugin-spoiler/spoiler.css";
import "D:/20xxCRPrograms/blog/my-docs/node_modules/vuepress-plugin-md-enhance/lib/client/styles/tasklist.scss";

export default defineClientConfig({
  enhance: ({ app }) => {
    app.component("CodeTabs", CodeTabs);
    if(!hasGlobalComponent("CodeGroup", app)) app.component("CodeGroup", CodeGroup);
    if(!hasGlobalComponent("CodeGroupItem", app)) app.component("CodeGroupItem", CodeGroupItem);
    app.component("CodeDemo", CodeDemo);
    app.component("MdDemo", MdDemo);
    app.component("Tabs", Tabs);
  },
  setup: () => {
useHintContainers();
  }
});
