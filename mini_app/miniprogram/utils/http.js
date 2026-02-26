import WxRequest from 'mina-request'
import { env } from './env'
import { modal, toast } from './extendApi'
import { clearStorage, getStorage, removeStorage } from './storage'

//类实例化
const instance = new WxRequest({
  //接口要在微信开发工具右上角打开本地设置中开启不校验合法域名
  baseURL: env.baseURL,
  timeout: 5000,
  isLoading:false
})
// 添加请求拦截器
instance.interceptors.request = (config) => {
  //获取token
  const token = getStorage('token')
  if (token) {
    config.header['token'] = token
  }
  return config
}

// 添加响应拦截器
instance.interceptors.response = async (response) => {
  const {data}=response
  // response.isSuccess = true，代码执行了 wx.request 的 success 回调函数
  // response.isSuccess = false，代码执行了 wx.request 的 fail 回调函数

  // response.statusCode // http 响应状态码

  // response.config // 网络请求请求参数

  // response.data 服务器响应的真正数据

  // 对响应数据做点什么
  if(data.code==401){
    const res=await modal({
      content:'请重新登录',
      showCancel:false
    })
    if(res){
      removeStorage('token')
      wx.reLaunch({
        url:'/pages/login/login'
      })
    }
    return Promise.reject(response)
  }
  if(data.code==200)
    return response.data
  toast({
    title:'您访问的页面不见了~'
  })
  return Promise.reject(response)
}

export default instance
