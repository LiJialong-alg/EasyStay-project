// 订单创建页面
// 用户确认预订信息并创建订单

Page({
    /**
     * 页面的初始数据
     */
    data: {
      //发送后台必需数据
      hotelId : '（模拟数据）',
      roomTypeId : '（模拟数据）',
      checkInDate : '（模拟数据）',
      checkOutDate : '（模拟数据）',
      
      //用于订单页面展示数据
      hotelName: '',
      roomType: '',
      quantity: 1,
      nights:1,
      guest: {
          name: '',
          phone: '',
          idNumber: ''
      },
      remark: '',
      agreeTerms: false,
      loading: false,
      totalPrice: 0,
      nights: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        const hotelName = options.hotelName || ''
        const roomType = options.roomType || ''
        const roomPrice = options.roomPrice || ''
        const nights = options.nights || 1
        const quantity = parseInt(options.quantity) || 1
        const totalPrice = roomPrice * nights * quantity
        const checkInDate = options.checkInDate
        const checkOutDate = options.checkOutDate
        this.setData({
            hotelName,
            roomType,
            roomPrice,
            quantity,
            nights,
            totalPrice,
            checkInDate,
            checkOutDate
        })


    },




    /**
     * 处理客人名字输入
     */
    onGuestNameChange(event) {
        const guest = this.data.guest;
        guest.name = event.detail.value;
        this.setData({ guest });
    },

    /**
     * 处理客人电话输入
     */
    onGuestPhoneChange(event) {
        const guest = this.data.guest;
        guest.phone = event.detail.value;
        this.setData({ guest });
    },

    /**
     * 处理证件号输入
     */
    onIdNumberChange(event) {
        const guest = this.data.guest;
        guest.idNumber = event.detail.value;
        this.setData({ guest });
    },

    /**
     * 处理备注输入
     */
    onRemarkChange(event) {
        this.setData({ remark: event.detail.value });
    },

    /**
     * 处理协议复选框
     */
    onAgreeTermsChange(event) {
        this.setData({ agreeTerms: event.detail.value[0]? true:false });
    },

    /**
     * 提交订单
     */
    onSubmitOrder() {
        const { guest, agreeTerms, hotelId, roomTypeId, quantity,checkInDate,checkOutDate } = this.data

        // 验证客人信息
        if (!guest.name.trim()) {
            wx.toast({
                title: '请输入旅客姓名'
            });
            return;
        }

        if (!guest.phone.trim()) {
            wx.toast({
                title: '请输入联系电话',
                icon: 'none'
            });
            return;
        }

        // 验证电话格式
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(guest.phone)) {
            wx.toast({
                title: '请输入有效的手机号',
                icon: 'none'
            });
            return;
        }
        if (!guest.idNumber.trim()||guest.idNumber.length !== 18) {
            wx.toast({
                title: '请输入完整的证件号',
                icon: 'none'
            });
            return;
        }

        if (!agreeTerms) {
            wx.toast({
                title: '请同意预订条款',
                icon: 'none'
            });
            return;
        }

        // 提交订单
        this.setData({ loading: true });
        const orderData = {
          hotelId,
          roomTypeId,
          checkInDate,
          checkOutDate,
          quantity,
          guestName: guest.name,
          guestPhone: guest.phone,
          idNumber: guest.idNumber,
          remark: this.data.remark,
          totalPrice: this.data.totalPrice
        };
        console.log('向后台发送订单信息中...',orderData)

        setTimeout(() => {
          this.setData({ loading: false });
          wx.toast({
            title: '支付成功！',
            icon: 'success',
            duration: 2000
          });
          // 跳转到订单详情
          setTimeout(() => {
            wx.switchTab({
              url: '/pages/index/index',
            })
            
          }, 1000);

        }, 1000);
    },


});
