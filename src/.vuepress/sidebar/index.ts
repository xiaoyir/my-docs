import { sidebar } from "vuepress-theme-hope";

import { inAI } from "./sb-inAI.js";
import { skill } from "./sb-skill.js";

export default sidebar({
    // 把更精确的路径放置在前边
    "/skill/": skill,
    "/inAI/": inAI,
    // 放在最后面
    // "/":[
    //
    // ],
});