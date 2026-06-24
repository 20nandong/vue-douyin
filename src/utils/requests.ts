//pexels api密鑰:7ekWZjWOO7A62NXKYz9lfTfmcU8LprNqtRg4lTrRujwFXayqUYdFHjkp
import axios from 'axios';

const API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
let response: any = null;

const pexelsClient = axios.create({
    baseURL:'https://api.pexels.com/videos',
    headers:{
        Authorization:  API_KEY, //在请求头中携带API密钥
    }
});

console.log('API_KEY:',API_KEY)


/**
 * 获取热门视频（支持分页）
 * @param {number} page - 页码（从1开始）
 * @param {number} perPage - 每页数量（最大40）
 * @returns {Promise<{ videos: Array }>} 视频数据
 */


export const fetchPopularVideos = async (page = 1,perPage = 15) => {
    try {
        const response = await pexelsClient.get('search',{
            params:{
                query:'nature',//搜索关键词，这里使用'nature'作为示例
                page,
                per_page:perPage
            },
        });
        return response.data;//返回视频数据
    } catch (error: any) {
        console.error('获取视频失败', error);

        if (error.response) {
            console.error('状态码:', error.response.status);
            console.error('响应数据',error.response.data);
        }
        
        return { videos:[]};//失败返回空数组，避免页面崩溃
    }
}
