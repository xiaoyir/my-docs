import { sidebar } from "vuepress-theme-hope";
export default sidebar({
    "/inAI/":[
        {
            text: "必看必会",
            icon: "palette",
            collapsible: true,
            expanded: false,
            children: [
                "一个人一小时打造一个成熟的AI产品",
                "五分钟轻松搞定公众号AI机器人"
            ]
        },
    ],
    "/self/":[
        {
            text: "心路历程",
            icon: "palette",
            collapsible: true,
            expanded: false,
            children: [
                "一个普通程序员的前五年",
            ]
        },
    ],
    "/skill/":[
        {
            text: "Java",
            icon: "bookmark",
            prefix: "java/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "JVM",
            icon: "key",
            prefix: "jvm/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "github",
            icon: "layer-group",
            prefix: "github/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "nginx",
            icon: "circle-half-stroke",
            prefix: "nginx/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "mysql",
            icon: "droplet",
            prefix: "mysql/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "redis",
            icon: "magnet",
            prefix: "redis/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "sentinel",
            icon: "globe",
            prefix: "sentinel/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "canal",
            icon: "eye",
            prefix: "canal/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "spring",
            icon: "lemon",
            prefix: "spring/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "其他",
            icon: "paper-plane",
            prefix: "other/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "学习书籍",
            icon: "folder",
            prefix: "books/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
    ]
})