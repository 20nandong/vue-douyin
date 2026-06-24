import axios, { type AxiosInstance } from 'axios'
// import type { video } from 'pexels';


//创建Axios实例
const pexelsClient: AxiosInstance = axios.create({
    baseURL:'https://api.pexels.com/videos',
    timeout:5000,
    headers:{
        //从环境变量获取api密钥
        'Authorization':import.meta.env.VITE_PEXELS_API_KEY
    }
});


//获取视频
export const fetchPopularVideos = (perPage = 5,page = 1) => {
   return pexelsClient.get('/popular',{
    params:{
        per_page:perPage,
        page:page,
    }
   })
   .then(response => {
    //返回api响应的数据
    return response.data;
   })
   .catch(error => {
    console.error('获取视频失败:',error);
    throw error;
   })
}


