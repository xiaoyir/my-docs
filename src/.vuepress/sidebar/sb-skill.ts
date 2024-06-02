import {arraySidebar} from "vuepress-theme-hope";

export const skill = arraySidebar([
        {
            text: "Java",
            icon: "laptop-code",
            link: "skill/java",
            collapsible: true,
            expanded: false,
            children: [
                "Java8code",
            ]
        },

    ]
);
