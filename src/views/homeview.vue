<script setup>
import { ref,onMounted } from "vue"
import router from "../router/index.ts"
import homeicon from "../components/icons/homeicon.vue"

// 存储所有导航信息
const navs = [
    { name: "精选", routeName: "jingxuan", position: "background-position: 0px 0px;" },
    { name: "推荐", routeName: "tuijian", position: "background-position: -48px 0px;" },
    { name: "搜索", routeName: "sousuo", position: "background-position: -96px 0px;" },
    { name: "line" },
    { name: "关注", routeName: "guanzhu", position: "background-position: -144px 0px;" },
    { name: "朋友", routeName: "pengyou", position: "background-position: -192px 0px;" },
    { name: "我的", routeName: "wode", position: "background-position: -816px 0px;" },
    { name: "line" },
    { name: "直播", routeName: "zhibo", position: "background-position: -240px 0px;" },
    { name: "放映厅", routeName: "fangyinting", position: "background-position: -288px 0px;" },
    { name: "短剧", routeName: "duanju", position: "background-position: -960px 0px;" },
    { name: "小游戏", routeName: "xiaoyouxi", position: "background-position: -336px 0px;" }
]

//当前导航
const curNav = ref("精选")

//动态计算css样式的class
function navClass(nav){
    let cls_list = []
    cls_list.push(nav.name != "line" ? "nav" : "nav-line")
    //根据当前选中的 设置高亮样式
    cls_list.push(curNav.value == nav.name ? "active" : "")
    return cls_list
}

function navClick(nav){
    //如果不加，点击line时会跳转到路由，导致页面空白
    if(nav.routeName){
        curNav.value = nav.name
        router.push({name:nav.routeName})
    }
}

onMounted(() => {
    curNav.value = "推荐"
})

const searchActive = ref(false)
const searchvalue =  ref("")

</script>

<template>
    <div class="home-container">
        <div class="left">
            <div class="logo"></div>
            <div class="nav-wrapper">
                <div v-for="nav, home in navs" :key="home" :class="navClass(nav)" @click="navClick(nav)">
                    <div v-if="nav.name != 'line'" class="nav-icon" :style="nav.position"></div>
                    <span v-if="nav.name != 'line'">{{ nav.name }}</span>
                </div>
            </div>
        </div>
        <div class="right">
            <div class="top">
                <!-- blur 鼠标移开后，失去焦点，恢复原有样式 -->
                <div class="search-bar" :class="{'active' : searchActive}" @blur="searchActive=false" @focus="searchActive=true">
                    <el-input v-model="searchvalue" placeholder="搜索你感兴趣的内容"></el-input>
                    <div class="shuxian"></div>
                    <el-button>搜索</el-button>
                </div>
                <div class="tool-bar">
                    <div class="tool-bar-item">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-douyin"></use>
                        </svg>
                        <div>充钻石</div>
                    </div>
                    <div class="tool-bar-item">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-download"></use>
                        </svg>
                        <div>客户端</div>
                    </div>
                    <div class="tool-bar-item">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-wallpaper"></use>
                        </svg>
                        <div>壁纸</div>
                    </div>
                    <div class="tool-bar-item">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-notice"></use>
                        </svg>
                        <div>通知</div>
                    </div>
                    <div class="tool-bar-item">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-reply"></use>
                        </svg>
                        <div>私信</div>
                    </div>
                    <div class="tool-bar-item">
                        <svg class="icon" aria-hidden="true">
                            <use xlink:href="#icon-create"></use>
                        </svg>
                        <div>投稿</div>
                    </div>
                    <div class="tool-bar-avatar">
                        <img src="../assets/img/avatar.png" alt="头像">
                    </div>
                </div>
            </div>

            <div class="icon-item">
                
            </div>

            <div>
                <router-view></router-view>
            </div>
        </div>
        
    </div>

</template>

<style scoped lang="less">
.home-container{
    display:flex;
    width:100%;
    height:100%;
}

.left{
    display:flex;
    //纵向
    flex-direction:column;
    width:160px;
    height:100%;
    .logo{
        height:50px;
        background-image: url("../assets/img/douyin_logo.png");
        background-repeat:no-repeat;
        background-position:32px;
    }
    .nav-wrapper{
        display:flex;
        flex-direction:column;
        color:rgba(255,255,255,0.75);
        align-items:center;
        .nav{
            display:flex;
            width:128px;
            height:40px;
            padding:8px 0 8px 16px;
            //content是否包含border
            box-sizing:border-box;
            cursor:pointer;
            opacity:0.75;
            border-radius:12px;

            &:hover{
                background-color:rgb(44,46,56);

            }
            .nav-icon{
                width:24px;
                height:24px;
                margin-right:12px;
                background-image:url("../assets/img/xuebi.png");
                background-repeat:no-repeat;
                background-size:1152px;
            }
        }
        .nav-line{
            height:1px;
            width:112px;
            margin:12px 24px;
            border-bottom:1px solid rgba(255,255,255,0.05);
        }
    }
}

.right{
    display:flex;
    flex-direction:column;
    margin:10px;
    flex-grow:1;
    //视频播放组件会设置绝对定位，所以父元素需要设置相对定位
    position:relative;
    .top{
        display:flex;
        justify-content:flex-end;
        height:56px;
        margin-right:16px;
        //开启相对定位，使搜索框能够相对于父元素进行绝对定位
        position:relative;
        .search-bar{
            //启用绝对定位
            position:absolute;
            right:640px;
            width:600px;
            height:40px;
            display:flex;
            align-items:center;
            background:rgba(255,255,255,0.15);
            border:1px solid rgba(255,255,255,0.16);
            box-sizing:border-box;
            border-radius:12px;
            :deep(.el-input){
                background:0 0;
                .el-input__wrapper{
                    padding:0 4px;
                    background: 0 0;
                    box-shadow:none;
                    .el-input__inner{
                        padding:0 12px;
                        height:38px;
                        font-size:16px;
                        line-height:22px;
                        color:rgba(255,255,255,0.75);
                        background:0 0;
                        //修改光标颜色
                        caret-color:#fe2c55;
                    }
                }
            }
            .shuxian{
                width:1px;
                height:16px;
                border-left:1px solid rgba(255,255,255,0.16);

            }
            //设置按钮样式，深度选择器，修改第三方组件样式
            :deep(.el-button){
                display:flex;
                width:80px;
                height:38px;
                padding:0;
                background:0 0 ;
                border:none;
                outline:none;
                box-shadow:none;
                color:#fff;
                border-radius:0 8px 8px 0;
                font-size:17px;
                // &.hover,
                // &.active{
                //     // color:#000;
                //     // background-color:#fff;
                // }

            }
            &:hover,
            &.active{
                border-width:2px;
                border-color:#fff;

                :deep(.el-button){
                    color:gray;
                    // color:#000;
                    background-color:#fff;
                }
                .shuxian{
                    height:100%;
                    background-color:#fff;
                    border-left:1px solid #fff;
                }
            }
        }

        .tool-bar{
            display:flex;
            color:rgba(255,255,255,0.6);
            .tool-bar-item{
                display:flex;
                flex-direction:column;
                align-items:center;
                margin-right:8px;
                width: auto;
                min-width:32px;
                cursor:pointer;
                &:hover{
                    color:white;
                }
                .icon{
                    width:15px;
                    height:15px;
                }
                div{
                    font-size:12px;
                    line-height:25px;
                }
            }
        }
        .tool-bar-avatar{
            img{
                width:32px;
                height:32px;
                border-radius:50%;
            }     

            

        }
    }
}
</style>