import Homeview from "@/views/HomeView.vue"
import { createRouter, createWebHashHistory } from "vue-router"
// import videosview from "../views/VideosView.vue"

const blockview = () => import("../views/BlockView.vue")
const videosview = () => import("../views/VideosView.vue")


const router = createRouter({
    history:createWebHashHistory(),
    routes:[
        {
        name:"home",
        path:"/",
        component:() => import("../views/HomeView.vue"),
        //重定向到路由
        redirect:"/tuijian",
        children: [
            { name: "jingxuan", path: "jingxuan", component: blockview },
            { name: "tuijian", path: "tuijian", component: videosview},
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
