import { createApp } from 'vue'
import App from './App.vue'
//引入路由
import router from "./router/index"
import ElementPlus from "element-plus"
import "element-plus/dist/index.css"
//引入字体图标
import "@/assets/iconfont/iconfont.js"


// createApp(App).mount('#app')
const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
