import { sidebar } from "vuepress-theme-hope";
export default sidebar({
    "/inAI/":[
        {
            text: "AI+",
            icon: "laptop-code",
            //prefix: "java/",
            collapsible: true,
            expanded: false,
            children: [
                "一个人一小时打造一个成熟的AI产品",
                "五分钟轻松搞定公众号AI机器人"
            ]
        },
    ],
    "/skill/":[
        {
            text: "Java",
            icon: "laptop-code",
            prefix: "java/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "JVM",
            icon: "laptop-code",
            prefix: "jvm/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "github",
            icon: "laptop-code",
            prefix: "github/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "nginx",
            icon: "laptop-code",
            prefix: "nginx/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "mysql",
            icon: "laptop-code",
            prefix: "mysql/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "redis",
            icon: "laptop-code",
            prefix: "redis/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "sentinel",
            icon: "laptop-code",
            prefix: "sentinel/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "canal",
            icon: "laptop-code",
            prefix: "canal/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "spring",
            icon: "laptop-code",
            prefix: "spring/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "其他",
            icon: "laptop-code",
            prefix: "other/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
        {
            text: "学习书籍",
            icon: "laptop-code",
            prefix: "books/",
            collapsible: true,
            expanded: false,
            children: "structure"
        },
    ]
})