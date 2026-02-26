
App({
    globalData:{
      isSwitch:true
    },
    
    onLaunch() {
        // 检查登录状态
        this.checkLogin();
    },

    checkLogin() {
        wx.checkSession({
            success: () => {
                // session_key 未过期，可以正常使用
                console.log('[App] Session 有效');
            },
            fail: () => {
                // session_key 已过期，需要重新登录
                console.log('[App] Session 已过期');
                this.login();
            }
        });
    },

    /**
     * 用户登录
     */
    login() {
        wx.login({
            success: (res) => {
                if (res.code) {
                    console.log('[App] 登录成功，code:', res.code);
                    // 这里通常需要将 code 发送到后端获取 session_key
                    // 后端会返回 token，用于后续 API 调用
                } else {
                    console.error('[App] 获取用户登录态失败！' + res.errMsg);
                }
            }
        });
    },


});
