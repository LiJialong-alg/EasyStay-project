// 酒店卡片组件
// 用于在列表中显示单个酒店的信息

Component({
  properties: {
    // 接收酒店对象数据
    item: {
      type: Object,
      value: {} // 默认空对象
    }
  },

  methods: {
    // 组件内部的点击事件
    onTap() {
      const app = getApp()
      app.globalData.isSwitch = false
      // 获取传递进来的 ID
      const { id } = this.properties.item;
      // 页面跳转
      wx.navigateTo({
        url: `/pages/detail/detail?hotelId=${id}`
    });
    }
  }
})