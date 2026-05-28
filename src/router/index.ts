import { createRouter, createWebHashHistory } from "vue-router"

const blockview = () => import("../views/blockview.vue")

const router = createRouter({
    history:createWebHashHistory(),
    routes:[
        {
        name:"home",
        path:"/",
        component:() => import("../views/homeview.vue"),
        //重定向到路由
        redirect:"/tuijian",
        children: [
            // {
            //     name:"blcok",
            //     path:"block",
            //     component:() => import("../views/blockview.vue")
            // },
            { name: "jingxuan", path: "jingxuan", component: blockview },
            { name: "tuijian", path: "tuijian", component:  blockview},
            { name: "sousuo", path: "sousuo", component: blockview },
            { name: "guanzhu", path: "guanzhu", component: blockview },
            { name: "pengyou", path: "pengyou", component: blockview },
            { name: "wode", path: "wode", component: blockview },
            { name: "zhibo", path: "zhibo", component: blockview },
            { name: "fangyinting", path: "fangyinting", component: blockview },
            {name: "duanju", path: "duanju", component: blockview },
            { name: "xiaoyouxi", path: "xiaoyouxi", component: blockview }
            
        ]

        }
    ]
})


export default router
