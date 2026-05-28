<script setup >
  // import Homeview from "./views/homeview.vue"
</script>

<template>
    <div class="app-wrapper">
        <router-view></router-view>
    </div>
    

</template>

<style >
  *{
    margin:0;
    padding:0;
  }

  body,html{
    overflow:hidden;
    background-color:rgb(22,24,35);
  }

 .app-wrapper{
    /*把视口的宽度和高度分成100份 一份是1vw或1vh */
    width:100vw;
    height:100vh;
    display:flex;
  }

  .icon{
    /* 1em是body中的字体大小 */
    width:1em;
    height:1em;
    vertical-align:-0.15em;
    fill:currentColor;
    overflow:hidden;
  }
</style>
