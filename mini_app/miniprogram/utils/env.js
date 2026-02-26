const {miniProgram} = wx.getAccountInfoSync()
const {envVersion}=miniProgram
let env={
  baseURL:'http://localhost:3002/api/public'
}
switch(envVersion){
  //开发版
  case'develop':
    env.baseURL='http://localhost:3002/api/public'
    break
  //体验版
  case'trial':
    env.baseURL='http://localhost:3002/api/public'
    break
  //正式版
  case'release':
    env.baseURL='http://localhost:3002/api/public'
    break
  default:
    env.baseURL='http://localhost:3002/api/public'
    break
}

export {env}