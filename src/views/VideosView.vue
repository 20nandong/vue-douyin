<script setup >
import { ref, onMounted, onUnmounted ,nextTick,watch } from 'vue'
import { fetchPopularVideos } from '../utils/requests.ts'
import homeicon from '../components/icons/HomeIcon.vue'
import Swiper from 'swiper'
import 'swiper/css'

// 响应式数据
const videoList = ref([])
const currentVideoIndex = ref(0)
const currentVideoUrl = ref('')
const currentVideoData = ref(null)
const loading = ref(false)
const error = ref(null)
const videoPlayer = ref(null)
const isPlaying = ref(true)
const videoReady = ref(false) //视频就绪状态
const currentPoster = ref('')

//音量控制
//控制音量大小
const volumeLevel = ref(50)//默认音量为0
//控制静音状态
const isMuted = ref(false)//默认静音
// const previousVolume = ref(0.5)
//控制显示/印象
const showVolumePanel = ref(true)
//默认音量为50,即静音前的音量
const previousVolume = ref(50)


//本地视频测试使用
const localVideos = [
  { id: 1, user: { name: "视频1" }, video_files: [{ link: "./苦力怕娘和末影女王怎么选_我的世界_minecraft_mc_文艺复兴我的世界动画.mp4" }] ,image: ""},
  { id: 2, user: { name: "视频2" }, video_files: [{ link: "./video_这么看来黑海岸的忧郁程度应该在我..._0.mp4" }], image: "" },
  { id: 3, user: { name: "视频3" }, video_files: [{ link: "./我想_伦敦或许适合两个人来_我的意思是我们见面吧_英国_伦敦_机位天才已就位_好久没见_梅见.mp4" }], image: "" },
  { id: 4, user: { name: "视频4" }, video_files: [{ link: "./黎明时分的阳光总能唤醒我沉睡的灵魂_阳光高架桥清晨治愈系.mp4" }], image: "" },
  { id: 5, user: { name: "视频5" }, video_files: [{ link: "./这么年轻_又何必太执着呢_梁祝_了不起的混剪团.mp4" }], image: "" },
  { id: 6, user: { name: "视频6" }, video_files: [{ link: "./你给我站住京剧花旦_东方戏曲血脉觉醒_国潮花旦_谁能拒绝京剧的魅力.mp4" }] ,image: ""},
  { id: 7, user: { name: "视频7" }, video_files: [{ link: "./百吨王_危险动作请勿模仿_陕汽德龙_组合技吗有点意思.mp4" }], image: "" },
  { id: 8, user: { name: "视频8" }, video_files: [{ link: "./video_遇到我_就算是阎王也要叫声爷爷齐..._0.mp4" }], image: "" },
]

const loadVideos = () => {
  loading.value = false;
  videoList.value = localVideos;
  isMuted.value = true
  updateCurrentVideo();
  nextTick(() => {
    if(videoPlayer.value){
      videoPlayer.value.muted = true;
      videoPlayer.value.volume = 0
      videoPlayer.value.play().catch(e => console.log('自动播放被阻止:',e))
    }
  })
}




// 加载视频数据
// const loadVideos = async () => {
//   loading.value = true
//   error.value = null
//   videoReady.value = false
  
//   try {
//     // 使用真实的 API 调用
//     const data = await fetchPopularVideos(1,10) // 获取第一页，20个视频
    
//     console.log('API返回数据:', data)
    
//     if (data.videos && data.videos.length > 0) {
//       videoList.value = data.videos
//       updateCurrentVideo()
      
//       // 确保DOM更新后播放
//       nextTick(() => {
//         if (videoPlayer.value) {
//           // videoPlayer.value.muted  = true //用js静音，避免浏览器自动播放限制
//           videoPlayer.value.play().catch(e => {
//             console.log('自动播放被阻止:', e)
//             //
//           })
//         }
//       })
//     } else {
//       // API返回成功但没有视频数据，使用备用数据
//       console.warn('未从API获取到视频,使用备用数据')
//       videoList.value = getFallbackVideos()
//       updateCurrentVideo()
//     }
    
//   } catch (err) {
//     console.error('加载视频失败:', err)
//     error.value = '视频加载失败,请检查网络或api接口'
    
//     // 加载失败时使用备用数据
//     videoList.value = getFallbackVideos()
//     updateCurrentVideo()
//   } finally {
//     loading.value = false
//   }
// }

// 备用视频数据
// const getFallbackVideos = () => {
//   return [
//     {
//       id: 1,
//       user: { 
//         name: "示例用户1", 
//         url: "https://www.pexels.com/@example1" 
//       },
//       video_files: [{ 
//         quality: 'sd', 
//         file_type: 'video/mp4', 
//         link: "https://player.vimeo.com/external/371433846.sd.mp4?s=2e4c6b8f3f82b7b7a2c2c2c2c2c2c2c2c2c2c2c2&profile_id=164&oauth2_token_id=57447761" 
//       }]
//     },
//     {
//       id: 2,
//       user: { 
//         name: "示例用户2", 
//         url: "https://www.pexels.com/@example2" 
//       },
//       video_files: [{ 
//         quality: 'sd', 
//         file_type: 'video/mp4', 
//         link: "https://player.vimeo.com/external/371433846.sd.mp4?s=2e4c6b8f3f82b7b7a2c2c2c2c2c2c2c2c2c2c2c2&profile_id=164&oauth2_token_id=57447761" 
//       }]
//     }
//   ]
// }

    

//更新当前视频数据和URL
const updateCurrentVideo = () => {
  if (videoList.value.length > 0 && currentVideoIndex.value >= 0) {
    const video = videoList.value[currentVideoIndex.value]
    currentVideoData.value = video
    
    currentPoster.value = video.image || ''

    //从video_files中选择合适的视频链接
    if(video.video_files && video.video_files.length > 0){
      const videoFile = video.video_files[0]
      console.log('设置视频URL:',videoFile.link)
      currentVideoUrl.value = videoFile.link
      videoReady.value = false //新视频加载，重置就绪状态
    } 
  }else{
    currentVideoData.value = null
    currentVideoUrl.value = ''
  }

  // nextTick(() => {
  //   if (videoPlayer.value){
  //     videoPlayer.value.muted = isMuted.value
  //     videoPlayer.value.volume = volumeLevel.value
  //     videoPlayer.value.play().catch(e => {
  //       console.log('自动播放被阻止:',e)
  //     })
  //   }
  // })
}

//视频事件监听
const setupVideoEvents = () => {
  if(videoPlayer.value){
    const video = videoPlayer.value

    video.addEventListener('error',(e) =>  {
      console.error('视频加载错误:',e)
      console.error('视频错误代码:',video.error?.code)
      console.error('视频错误信息:',video.error?.message)
      error.value = '视频加载失败，请检查网络'
    })

    video.addEventListener('canplay',() => {
      console.log('视频可以播放了')
    })
  }
}

// 播放/暂停
const togglePlay = () => {
  if (!videoPlayer.value) return
  if (videoPlayer.value.paused) {
    videoPlayer.value.play()
    isPlaying.value = true
  } else {
    videoPlayer.value.pause()
    isPlaying.value = false
  }
}

// 播放下一个视频
const playNextVideo = () => {
  if (videoList.value.length === 0) return
  currentVideoIndex.value = (currentVideoIndex.value + 1) % videoList.value.length
  updateCurrentVideo()
  isPlaying.value = true
}

// 播放上一个视频
const playPrevVideo = () => {
  if (videoList.value.length === 0) return
  currentVideoIndex.value = (currentVideoIndex.value - 1 + videoList.value.length) % videoList.value.length
  updateCurrentVideo()
  isPlaying.value = true
}

// 组件挂载时加载视频
onMounted(() => {
  console.log('组件挂载，开始加载视频')
  loadVideos()

  //等待DOM更新后设置事件监听
  nextTick(() => {
    setupVideoEvents()
  })

  //全屏状态监听
  document.addEventListener('fullscreenchange',handleFullscreenChange)
})

onUnmounted(() => {
  //移除全屏状态监听
  document.removeEventListener('fullscreenchange',handleFullscreenChange)
})





//切换静音
const toggleMute = () =>{
  if(!videoPlayer.value) return

  isMuted.value = !isMuted.value

  if(isMuted.value){
    //静音:保存当前音量，设为0
    previousVolume.value = volumeLevel.value || 50
    volumeLevel.value = 0
    videoPlayer.value.muted = true
    videoPlayer.value.volume = 0
  }else{
    // 取消静音时恢复到50%或上次音量
    const restoreVol = previousVolume.value > 0 ? previousVolume.value : 50
    volumeLevel.value = restoreVol
    videoPlayer.value.muted = false
    videoPlayer.value.volume = restoreVol / 100
  }

}

// 拖动滑块时触发
const onSliderChange = () => {
  if(!videoPlayer.value) return

  const vol = volumeLevel.value / 100
  videoPlayer.value.volume = vol

  if(vol > 0){
    videoPlayer.value.muted = false
    isMuted.value = false
    previousVolume.value = volumeLevel.value
  }else{
    videoPlayer.value.muted = true
    isMuted.value = true
  }
}

const onVolumeChange = () => {
  if(!videoPlayer.value) return
  //如果通过系统快捷方式改变音量，同步到UI
  isMuted.value = videoPlayer.value.muted || videoPlayer.value.volume === 0
  if(!isMuted.value){
    volumeLevel.value = Math.round(videoPlayer.value.volume * 100)
  }
}



//全屏控制
const videoContainer = ref(null)//获取视频容器ref
const isFullscreen = ref(false)

//播放/暂停状态同步
const onVideoPlay = () => { isPlaying.value = true }
const onVideoPause = () => {isPlaying.value = false}

//切换全屏
const toggleFullscreen = () => {
  if(!videoContainer.value) return
  if(!document.fullscreenElement) {
    videoContainer.value.requestFullscreen().catch(err => {
      console.log('全屏失败:',err)
    })
  }else{
    document.exitFullscreen()
  }
}

//监听全屏状态变化
const handleFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}




//视频进度条
const videoDuration = ref(0)
const currentTime = ref(0)
const progressPercent = ref(0)
const isDragging = ref(false)
const progressBar = ref(null)

//视频元数据加载好后，拿到总时长
const onLoadedMetadata = () =>{
  if(videoPlayer.value){
    videoDuration.value = videoPlayer.value.duration || 0
    console.log('视频总时长:',videoDuration.value)
  }
}

//视频播放时持续更新进度
const onTimeUpdate = () =>{
  if(videoPlayer.value && !isDragging.value) {
    currentTime.value = videoPlayer.value.currentTime
    //计算进度百分比
    if(videoDuration.value > 0){
      progressPercent.value = (currentTime.value/videoDuration.value) * 100
    }

  }
}

//点击进度条跳转
const onProgressClick = (e) => {
  if(!videoPlayer.value || !progressBar.value) return

  const rect = progressBar.value.getBoundingClientRect()
  //计算点击位置再进度条的百分比
  const clickPercent = (e.clientX - rect.left)/rect.width
  //限制为0-1之间
  const clampedPercent = Math.max(0,Math.min(1,clickPercent))
  //设置视频当前时间
  const newTime = clampedPercent * videoDuration.value
  videoPlayer.value.currentTime = newTime

  console.log('跳转到:',newTime,'秒')//调试用
}

//格式化时间显示
const formatTime = (seconds) => {
  if(!seconds || isNaN(seconds)) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`
}
</script>


<template>
    <div class="main">
        <div class="videos-view">
          <!-- 加载状态 -->
          <div v-if="loading" class="loading">加载视频中...</div>
          <div v-else-if="error" class="error" >{{ error }}</div>
          
          <!-- 主内容：左右布局 -->
          <div v-else class="content-wrapper">
            <!-- 左侧：视频播放区域 -->
            <div class="left video-container" ref="videoContainer">
              <div class="video-player-wrapper">
              <!-- 视频加载中提示 -->
                <div v-if="currentVideoUrl && !videoReady" class="loading" style="color:red">
                  视频加载中...
                </div>

                <video
                  v-if="currentVideoUrl"
                  ref="videoPlayer"
                  :src="currentVideoUrl"
                  :poster="currentPoster"
                  class="video-player"
                  object-fit="cover"
                  
                  autoplay
                  playsinline
                  @ended="playNextVideo"
                  @loadeddata="videoReady = true"
                  @loadedmetadata="onLoadedMetadata" 
                  @timeupdate="onTimeUpdate"
                  @volumechange="onVolumeChange"
                  @click="togglePlay"
                >
                  <p>您的浏览器不支持视频播放</p>
                </video>
                <div v-else-if="videoList.length === 0" class="error" >
                  暂无视频播放
                </div>

                <!-- 音量控制区域 -->
                <div class="volume-control" v-show="showVolumePanel">

                  <!-- 纵向滑块 -->
                  <div class="slider-area">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    v-model="volumeLevel"
                    @input="onSliderChange"
                    class="volume-slider-vertical"
                  >
                  <!-- 百分比显示 -->
                  <div class="volume-percent">{{ volumeLevel }}%</div>
                  </div>

                  <div class="volume-icon" @click="toggleMute">
                    <button  class="icon-btn">
                      <!-- 有声图标 非静音且音量> 0 -->
                      <svg v-if="!isMuted && volumeLevel > 0" t="1781702244162" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10838" width="200" height="200">
                        <path d="M509.226667 167.722667l-222.442667 184.341333c-16.704 13.866667-43.178667 23.402667-64.896 23.402667H170.730667A42.666667 42.666667 0 0 0 128 418.090667v187.434666c0 23.466667 19.178667 42.624 42.730667 42.624H221.866667c21.802667 0 48.170667 9.536 64.896 23.402667l222.421333 184.32V167.744zM259.541333 704.426667c-9.045333-7.509333-25.770667-13.589333-37.674666-13.589334H170.730667A85.418667 85.418667 0 0 1 85.333333 605.525333v-187.434666A85.333333 85.333333 0 0 1 170.730667 332.8H221.866667c11.776 0 28.629333-6.08 37.674666-13.589333L519.125333 104.106667c18.090667-14.997333 32.746667-8.170667 32.746667 15.402666v784.64c0 23.488-14.677333 30.378667-32.746667 15.402667L259.562667 704.405333z m436.117334-4.821334a21.333333 21.333333 0 1 1-26.026667-33.834666A196.608 196.608 0 0 0 746.666667 509.504c0-57.408-29.269333-112.32-77.482667-151.637333a21.333333 21.333333 0 1 1 26.965333-33.066667C753.792 371.797333 789.333333 438.485333 789.333333 509.504c0 75.370667-35.050667 144.981333-93.653333 190.08z m64 170.666667a21.333333 21.333333 0 1 1-26.026667-33.834667A414.506667 414.506667 0 0 0 896 507.029333c0-121.642667-61.696-237.354667-162.816-319.829333a21.333333 21.333333 0 1 1 26.965333-33.066667C870.698667 244.309333 938.666667 371.776 938.666667 507.029333a457.173333 457.173333 0 0 1-178.986667 363.221334z" fill="#ffffff" p-id="10839">
                        </path>
                      </svg>

                      <!--静音图标 -->
                      <svg v-else t="1781750553922" class="icon" viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="14416" width="200" height="200">
                        <path d="M652.569422 94.472586a25.86878 25.86878 0 0 1 17.409787-6.491785 26.262221 26.262221 0 0 1 26.163861 26.262221V529.22546l78.688303 78.688303V114.243022a104.950524 104.950524 0 0 0-173.99951-78.688303L388.176725 221.259114l55.770334 55.770335zM1012.470048 956.798025l-944.259635-944.259634-1.967207-1.967208a39.344151 39.344151 0 1 0-53.704767 57.639182l189.73717 189.63881A157.376606 157.376606 0 0 0 92.800508 407.553671v219.146924a157.376606 157.376606 0 0 0 157.376606 148.13073H355.127637l245.900947 214.917427 6.196704 5.11474a104.950524 104.950524 0 0 0 167.802806-84.098124v-80.360429l181.9667 182.065061a39.344151 39.344151 0 0 0 55.671974-55.671975z m-316.326978-46.032657v4.426217a26.557302 26.557302 0 0 1-6.098343 12.88521 26.163861 26.163861 0 0 1-36.983503 2.459009l-245.900946-214.917427-6.393425-5.11474a78.688303 78.688303 0 0 0-45.442495-14.360615H242.701725a78.688303 78.688303 0 0 1-71.212914-78.688303v-217.376436a78.688303 78.688303 0 0 1 78.688303-71.212915h23.114689l422.949627 422.949628z" p-id="14417" fill="#ffffff">
                        </path>
                      </svg>
                    </button>
                  </div>
                </div>

                
                <!-- 播放/暂停按钮 -->
                 <div class="center-play-control" @click="togglePlay">
                  <!-- 暂停显示播放键 -->
                  <svg v-if="!isPlaying" t="1781701207958" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5004" width="200" height="200">
                      <path d="M122.112664 953.98846l816.371172-407.954319c0.723477-0.342808 1.411139-0.689708 2.099824-1.051959l1.107217-0.550539 0-0.077771c11.644201-6.757914 19.488867-19.377326 19.488867-33.827433 0-14.452153-7.844665-27.070542-19.488867-33.828456l0-0.228197L120.241037 65.955154c-1.14508-0.649799-2.310625-1.24127-3.51301-1.77646l-2.481518-1.240247-0.230244 0.170892c-4.047176-1.431605-8.41874-2.196015-12.96222-2.196015-21.589714 0-39.096437 17.506722-39.096437 39.096437 0 0.192382 0 0.382717 0 0.593518l0 821.276902 0.01842 0c0.438998 21.210068 17.754363 38.255279 39.078017 38.255279C108.80559 960.13546 116.040365 957.887256 122.112664 953.98846z" fill="#ffffff" p-id="5005">
                      </path>
                  </svg>
                  <!-- 播放显示暂停键 -->
                   <svg v-else t="1781701345925" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6309" width="200" height="200">
                      <path d="M128 106.858667C128 94.976 137.621333 85.333333 149.12 85.333333h85.76c11.648 0 21.12 9.6 21.12 21.525334V917.12c0 11.882667-9.621333 21.525333-21.12 21.525333H149.12A21.290667 21.290667 0 0 1 128 917.141333V106.88z m640 0c0-11.882667 9.621333-21.525333 21.12-21.525334h85.76c11.648 0 21.12 9.6 21.12 21.525334V917.12c0 11.882667-9.621333 21.525333-21.12 21.525333h-85.76a21.290667 21.290667 0 0 1-21.12-21.525333V106.88z" fill="#ffffff" p-id="6310">
                      </path>
                  </svg>
                 </div>

                 <!-- 全屏按钮 -->
                  <div class="fullscreen-control" @click="toggleFullscreen">
                    <svg t="1781701558435" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9575" width="200" height="200">
                        <path d="M95.500388 368.593511c0 11.905658-9.637914 21.543572-21.543573 21.543572-11.877311 0-21.515225-9.637914-21.515225-21.543572V188.704684c0-37.502824 15.307275-71.575684 39.997343-96.265751s58.762928-39.997342 96.265751-39.997343h179.888827c11.905658 0 21.543572 9.637914 21.543572 21.515225 0 11.905658-9.637914 21.543572-21.543572 21.543573H188.704684c-25.625512 0-48.926586 10.488318-65.821282 27.383014s-27.383014 40.19577-27.383014 65.821282v179.888827z m559.906101-273.093123c-11.877311 0-21.515225-9.637914-21.515226-21.543573 0-11.877311 9.637914-21.515225 21.515226-21.515225h179.917174c37.502824 0 71.547337 15.307275 96.237404 39.997343s40.025689 58.762928 40.02569 96.265751v179.888827c0 11.905658-9.637914 21.543572-21.543572 21.543572-11.877311 0-21.515225-9.637914-21.515226-21.543572V188.704684c0-25.625512-10.488318-48.926586-27.411361-65.821282-16.894696-16.894696-40.19577-27.383014-65.792935-27.383014h-179.917174z m273.12147 559.906101c0-11.877311 9.637914-21.515225 21.515226-21.515226 11.905658 0 21.543572 9.637914 21.543572 21.515226v179.917174c0 37.474477-15.335622 71.547337-40.02569 96.237404s-58.734581 39.997342-96.237404 39.997343h-179.917174c-11.877311 0-21.515225-9.637914-21.515226-21.515225s9.637914-21.543572 21.515226-21.543573h179.917174c25.597165 0 48.898239-10.488318 65.792935-27.383014 16.923043-16.894696 27.411361-40.19577 27.411361-65.792935v-179.917174z m-559.934448 273.093123c11.905658 0 21.543572 9.666261 21.543572 21.543573s-9.637914 21.515225-21.543572 21.515225H188.704684c-37.502824 0-71.575684-15.307275-96.265751-39.997343s-39.997342-58.762928-39.997343-96.237404v-179.917174c0-11.877311 9.637914-21.515225 21.515225-21.515226 11.905658 0 21.543572 9.637914 21.543573 21.515226v179.917174c0 25.597165 10.488318 48.898239 27.383014 65.792935s40.19577 27.383014 65.821282 27.383014h179.888827z" fill="#ffffff" p-id="9576">
                        </path>
                    </svg>
                  </div>

                </div>

                <div class="right-icon">
                  <!-- 关注 -->
                  <!-- <div class="icon-item">
                    <div class="icon-wrapper">
                      <svg t="1782132120372" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="17516" width="200" height="200">
                        <path d="M443.2 159a362.032 362.032 0 1 0 141.664 710.064A362.032 362.032 0 0 0 443.2 159z m70.864 111.792a48 48 0 0 1 48 48v149.992h143.504a48 48 0 0 1 0 96H562.064v138.008a48 48 0 0 1-96 0V564.784H321.568a48 48 0 0 1 0-96h144.496V318.792a48 48 0 0 1 48-48z" fill="#e93323" p-id="17517"></path>
                      </svg>
                    </div>
                  </div> -->
                  <!-- 点赞 -->
                   <div class="icon-item">
                    <div class="icon-wrapper">
                      <svg t="1779966505168" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3710" width="200" height="200">
                        <path d="M533.504 268.288q33.792-41.984 71.68-75.776 32.768-27.648 74.24-50.176t86.528-19.456q63.488 5.12 105.984 30.208t67.584 63.488 34.304 87.04 6.144 99.84-17.92 97.792-36.864 87.04-48.64 74.752-53.248 61.952q-40.96 41.984-85.504 78.336t-84.992 62.464-73.728 41.472-51.712 15.36q-20.48 1.024-52.224-14.336t-69.632-41.472-79.872-61.952-82.944-75.776q-26.624-25.6-57.344-59.392t-57.856-74.24-46.592-87.552-21.504-100.352 11.264-99.84 39.936-83.456 65.536-61.952 88.064-35.328q24.576-5.12 49.152-1.536t48.128 12.288 45.056 22.016 40.96 27.648q45.056 33.792 86.016 80.896z" p-id="3711" fill="#ffffff"></path>
                      </svg>
                    </div>
                   </div>
                  <!-- 评论 -->
                  <div class="icon-item">
                    <div class="icon-wrapper">
                      <svg t="1779966347345" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2223" width="200" height="200">
                          <path d="M512 0C226.742857 0 0 197.485714 0 446.171429c0 138.971429 73.142857 270.628571 190.171429 351.085714L190.171429 1024l226.742857-138.971429c29.257143 7.314286 65.828571 7.314286 95.085714 7.314286 285.257143 0 512-197.485714 512-446.171429C1024 197.485714 797.257143 0 512 0zM256 512C219.428571 512 190.171429 482.742857 190.171429 446.171429S219.428571 380.342857 256 380.342857c36.571429 0 65.828571 29.257143 65.828571 65.828571S292.571429 512 256 512zM512 512C475.428571 512 446.171429 482.742857 446.171429 446.171429S475.428571 380.342857 512 380.342857c36.571429 0 65.828571 29.257143 65.828571 65.828571S548.571429 512 512 512zM768 512C731.428571 512 702.171429 482.742857 702.171429 446.171429s29.257143-65.828571 65.828571-65.828571c36.571429 0 65.828571 29.257143 65.828571 65.828571S804.571429 512 768 512z" p-id="2224" fill="#ffffff"></path>
                      </svg>
                    </div>
                  </div>
                  <!-- 收藏 -->
                   <div class="icon-item">
                    <div class="icon-wrapper">
                      <svg t="1782132327072" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="18704" width="200" height="200">
                        <path d="M536.9344 860.3136c-26.8288-14.7968-70.5024-14.6944-97.1776 0L251.2384 964.096c-53.6064 29.5424-88.7808 2.56-78.5408-59.8016l35.9936-219.8016c5.12-31.3344-8.448-74.752-30.0544-96.768L26.1632 431.9744c-43.4176-44.288-29.696-87.6544 30.0032-96.768l210.7392-32c30.0032-4.608 65.28-31.5392 78.6432-59.8528L439.808 43.4176c26.8288-56.8832 70.4512-56.6784 97.1264 0l94.208 199.9872c13.4656 28.4672 48.896 55.296 78.6944 59.8528l210.7392 32.0512c60.0064 9.1136 73.216 52.5824 30.0544 96.7168l-152.5248 155.648c-21.7088 22.1696-35.1232 65.6896-30.0544 96.8192l35.9936 219.8016c10.24 62.5664-25.1392 89.1904-78.5408 59.8016l-188.5696-103.7824z" fill="#ffffff" p-id="18705"></path>
                      </svg>
                    </div>
                   </div>
                  <!-- 分享 -->
                   <div class="icon-item">
                    <div class="icon-wrapper">
                      <svg t="1782132370506" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="19742" width="200" height="200">
                        <path d="M609.010526 323.368421C229.052632 377.263158 67.368421 646.736842 13.473684 918.905263c134.736842-188.631579 326.063158-274.863158 595.536842-274.863158v220.968421L988.968421 485.052632 609.010526 105.094737V323.368421z m0 0" p-id="19743" fill="#ffffff"></path>
                      </svg>
                    </div>
                   </div>
                </div>
                

                <div 
                class="progress-bar"
                ref="progressBar"
                @click="onProgressClick"
                >
                  <!-- 背景轨道 -->
                  <div class="progress-track"></div>
                  <!-- 已播放进度 -->
                  <div class="progress-fill" :style="{ width:progressPercent + '%' }"></div>
                  <!-- 进度点 -->
                   <div class="progress-dot" :style="{left:progressPercent + '%'}"></div>
                </div>

                

                <!-- 视频信息 -->
                <div v-if="currentVideoData" class="video-info">
                  <h3>{{ currentVideoData.user?.name || '未知用户' }}</h3>
                  <p>{{ currentVideoData.user?.url || '' }}</p>
                  <p>当前视频: {{ currentVideoIndex + 1 }} / {{ videoList.length }}</p>
                </div>
              </div>



            </div>
            
          </div>
          <!-- 右侧：按钮区域 -->
          <div class="right button-panel">
            <!-- 上下切换按钮 -->
            <div class="button-container">
                <button @click="playPrevVideo" class="nav-button prev-btn">
                    <svg t="1780234300015" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7302" width="200" height="200">
                        <path d="M904 692c0 8.189-3.124 16.379-9.372 22.628-12.497 12.496-32.759 12.496-45.256 0L512 377.255 174.628 714.628c-12.497 12.496-32.758 12.496-45.255 0-12.497-12.498-12.497-32.758 0-45.256l360-360c12.497-12.496 32.758-12.496 45.255 0l360 360C900.876 675.621 904 683.811 904 692z" fill="#bfbfbf" p-id="7303"></path>
                    </svg>
                </button>
    
                <button @click="playNextVideo" class="nav-button next-btn">
                    <svg t="1780234300015" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7302" width="200" height="200">
                        <path d="M904 692c0 8.189-3.124 16.379-9.372 22.628-12.497 12.496-32.759 12.496-45.256 0L512 377.255 174.628 714.628c-12.497 12.496-32.758 12.496-45.255 0-12.497-12.498-12.497-32.758 0-45.256l360-360c12.497-12.496 32.758-12.496 45.255 0l360 360C900.876 675.621 904 683.811 904 692z" fill="#bfbfbf" p-id="7303"></path>
                    </svg>
                </button>
            </div>
          </div>
      
    </div>
</template>


<style scoped lang="scss">
.main{
    display:flex;
    height:100vh;
    width:100vw;
    max-width:100%;
    /* max-height:50%; */
    /* border-radius:15%; */
    /* background-color: #000; */
    /* background-color: rgba(22,24,35); */
    

    /* 左侧：视频播放 */
    .videos-view {
        position: relative;
        width: 85vw;
        height: 92vh;
        max-width: 100%;
        // max-height: 100%;

        background-color: #000;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;
        border-radius:2%;

        /* forceToAxis:true; */

        /* 加载和错误状态 */
        .loading, .error {
            color: white;
            font-size: 20px;
            text-align: center;

            z-index:10;
            position:absolute;
            left:50%;
            top:50%;
            transform:translate(-50%,-50%);
        }
        
        /* 左右布局容器 */
        .content-wrapper {
            display: flex;
            width: 100%;
            height: 100%;
            max-width: 1400px; /* PC端最大宽度限制 */
            padding: 20px;
            box-sizing: border-box;
            gap: 20px; /* 左右区域之间的间距 */
        }
        
        /* 视频区域 */
        .left.video-container {
            flex: 1; 
            width: 85vw;
            height: 88vh;
            // height:92vh;
            max-height:100%;
            max-width:100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            /* overflow: hidden; */
            background-color: #000;
            border-radius: 8px;
            position: relative;
            // cover:true;
            min-height:0;/* 防止flex子元素溢出 */
            overflow:hidden;/*隐藏溢出内容，确保视频不超出容器边界*/
        }
        
        /* 视频播放器包装 */
        .video-player-wrapper {
          width: 100%;
          height: 100%;
          // max-width:100%;
          // max-height:100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;//相对定位，用作按钮定位
          overflow: hidden;/*隐藏超出容器的视频部分*/
          
        }
        
        /* 视频播放器 */
        .video-player {
          // width: 100vw;
          // height: 100vh;
          width:100%;
          height:100%;
          // object-fit: cover; /* 保持视频原始比例，铺满容器，裁剪多余部分 */
          background-color: #000;

          display:block;
        }
        
        


        /* 视频信息 */
        .video-info {
            position: absolute;
            bottom: 20px;
            left: 20px;
            bottom:10%;
            color: white;
            z-index: 10;
            background-color: rgba(0, 0, 0, 0.5);
            padding: 10px 15px;
            border-radius: 5px;
        }
        
        .video-info h3 {
            margin: 0 0 5px 0;
            font-size: 16px;
        }
        
        .video-info p {
            margin: 0;
            font-size: 12px;
            color: #aaa;
        }

        .error{
            color:red;
        }


        // 居中显示播放/暂停按钮
        .center-play-control{
          position: absolute;
          bottom: 20px;
          left: 20px;
          z-index: 15;
          cursor: pointer;
          width: 50px;
          height: 50px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.4);
          transition: background 0.2s;

          &:hover {
            background: rgba(0, 0, 0, 0.6);
          }

          .icon {
            width: 32px;
            height: 32px;
            fill: rgba(255, 255, 255, 0.9);
            transition: all 0.2s ease;
          }

          &:hover .icon {
            fill: #ffffff;
            transform: scale(1.1);
          }
        }

        // 右下角全屏按钮
        .fullscreen-control{
          position:absolute;
          bottom:20px;
          right: 10px;
          z-index: 15;
          width: 30px;
          height: 30px;
          display:flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          border-radius:50%;
          background:rgba(255,255,255,0.4);
          transition: background 0.2s;

          &.hober{
            background: rgba(255,255,255,0.6);
          }
          .icon{
            width: 24px;
            height: 24px;
            fill:#fff;
          }
        }      


        //音量控制
        .volume-control {
          position: absolute;
          bottom: 20px;
          right: 40px;
          z-index: 20;

          display: flex;
          flex-direction: column; // 垂直排列：文档流中先写的在上（滑块），后写的在下（图标）
          align-items: center;
          gap: 12px;

          background: rgba(0, 0, 0, 0.5);
          padding: 15px 10px;
          border-radius: 30px;
          color: white;
          font-size: 14px;
          user-select: none;

          // 音量图标按钮
          .volume-icon {
            width: 30px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            border-radius: 50%;
            transition: background 0.2s;

            &:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          }

          .icon-btn {
            background: none;
            border: none;
            padding: 0;
            width: 28px;
            height: 28px;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .icon {
            width: 24px;
            height: 24px;
            fill: #fff;
            display: block;
          }

          // 滑块容器（相对定位，作为百分比文字的参照）
          .slider-area {
            position: relative;
            height: 100px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          // 百分比显示
          .volume-percent {
            position: absolute;
            top: -28px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 12px;
            background: rgba(0, 0, 0, 0.6);
            padding: 2px 6px;
            border-radius: 10px;
            font-variant-numeric: tabular-nums;
            white-space: nowrap;
            pointer-events: none;
          }

          // 纵向滑块
          .volume-slider-vertical {
            -webkit-appearance: none;
            appearance: none;
            
            width: 70px;   // 旋转后的视觉高度
            height: 5px;    // 旋转后的视觉宽度
            
            transform: rotate(-90deg);
            transform-origin: center;
            
            background: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
            outline: none;
            cursor: pointer;
            margin: 0;

            &::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 16px;
              height: 16px;
              background: #fff;
              border-radius: 50%;
              cursor: pointer;
              border: none;
              box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
            }

            &::-moz-range-thumb {
              width: 16px;
              height: 16px;
              background: #fff;
              border-radius: 50%;
              cursor: pointer;
              border: none;
              box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
            }

            
          }
        }


        .right-icon {
          position: absolute;
          right: 20px;
          top: 50%;//垂直居中起点
          transform: translateY(-50%);
          z-index: 15;

          display: flex;
          flex-direction: column;//垂直排列
          align-items: center;
          gap: 20px;//每个图标间距

          .icon-item{
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            padding: 8px 0;

            .icon-wrapper{
              width:27px;
              height: 27px;
              display: flex;
              justify-content: center;
              align-items: center;
              transition: transform 0.2s ease;//过渡动画

              //悬停放大图标
              &:hover{
                transform: scale(1.25);//放大到1.15倍
              }
              .icon{
                width: 100%;
                height: 100%;
                fill: #fff;
              }
            }
          }
        }


        //进度条
        .progress-bar{
          position:absolute;
          bottom:80px;
          left:20px;
          right:20px;
          height: 4px;
          z-index:15;
          cursor: pointer;

          //背景轨道
          .progress-track{
            position:absolute;
            top: 0;
            left:0;
            right:0;
            height: 100%;
            background: rgba(255,255,255,0.3);
            border-radius: 2px;
          }

          //已播放进度
          .progress-fill{
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: #fff;
            border-radius: 2px;
            transition: width 0.1s linear;
          }

          //进度条
          .progress-dot{
            position: absolute;
            top: 50%;
            width: 10px;
            height: 10px;
            background: #fff;
            border-radius: 50%;
            transform: translate(-50%,-50%);//居中
            transition: left 0.1s linear;
            opacity: 0;//默认隐藏
          }

          //鼠标悬停显示进度点
          &:hover .progress-dot{
            opacity:1;
          }
          //悬停进度条变高
          &:hover{
            height: 6px;
            .progress-track,
            .progress-fill{
              border-radius:3px;
            }
          }
        }

    }
    

    /* 右侧：按钮 */
    .right.button-panel {
        width: 4vw; 
        height:88vh;
        max-width:10%;
        // max-width: 70px; /* 最大宽度限制 */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px 0;
        /* background-color:#fff; */

        /* 按钮容器 */
        .button-container {
            width: 50%; /* 固定宽度 */
            height: 10%; /* 固定高度 */
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 28px; /* 圆角 */
            padding: 15px 0;
            box-sizing: border-box;
        }
        
        /* 导航按钮（上/下一个） */
        .nav-button {
            width: 15px;
            height: 15px;
            background-color: rgba(255, 255, 255, 0);
            border: none;
            /* border-radius: 50%; */
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0;
            transition: background-color 0.2s;
    
            /* &:hover {
                color: white;
                background-color: white;
            } */
        }
        
        .nav-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
          /* color: white; */
        } 
        
        
        .nav-button .icon {
            width: 24px;
            height: 24px;
            fill: #fff;
        }
        
        /* 下一个按钮图标需要旋转180度 */
        .next-btn .icon {
            transform: rotate(180deg);
        }
    }
    
    
}


</style>