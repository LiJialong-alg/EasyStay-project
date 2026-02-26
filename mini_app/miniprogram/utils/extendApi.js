//参数可传可不传，只能传对象
//消息提示框，dialog
export const toast = (options = {}) => {
  // 如果直接传字符串，处理成对象
  if (typeof options === 'string') {
    options = { title: options };
  }

  const {
    title = '数据加载中...',
    icon = 'none', // 默认 none，保证横向纯文字
    duration = 2000, // 增加到2秒，方便用户阅读
    mask = false // 提示框通常不建议开 mask，否则用户无法操作
  } = options;

  wx.showToast({
    title,
    icon,
    duration,
    mask
  });
}

//消息确认对话框 
export const modal=(options={})=>{
  //要返回Promise对象
  return new Promise(resolve=>{
    const defaultOpts={
      title:'提示',
      content:'您确认执行该操作吗？',
      confirmColor:'#f35114' 
    }
    const opts=Object.assign({},defaultOpts,options)
    wx.showModal({
      ...opts,
      complete({confirm,cancel}){
        confirm&&resolve(true)
        cancel&&resolve(false)
      }
    })
  })
}
wx.toast=toast
wx.modal=modal
