//本地存储
export const setStorage = (key,data)=>{
  try {
    wx.setStorageSync(key,data)
  } catch (error) {
    console.error(`存储指定${key}数据发生了异常`,error)
  }
}
//读取数据，key是本地缓存中指定的键，value是要读取的数据
export const getStorage = (key) => {
  try {
    const value=wx.getStorageSync(key)
    if(value)
      return value
  } catch (error) {
    console.error(`读取指定${key}数据发生了异常`,error)
  }
}
//移除指定数据
export const removeStorage = (key)=>{
  try {
    wx.removeStorageSync(key)
  } catch (error) {
    console.error(`删除指定${key}数据发生了异常`,error)
  }
}
//清楚本地缓存
export const clearStorage=()=>{
  try {
    wx.clearStorageSync()
  } catch (error) {
    console.error(`清空数据发生了异常`,error)
  }
}