// 酒店详情页面
// 展示酒店的详细信息、房间类型、评价等

import { reqHotelInfo } from "../../api/detail";
import { hotelAttrsStore } from "../../store/hotelAttrsStore";
import { calculateDays } from "../../utils/format";

Page({
    /**
     * 页面的初始数据
     */
    data: {
        hotelId: '',
        hotel:{
          address: "",
          hotelName: "",
          hotelNameEn: "",
          id: "",
          images: [],
          roomTypes:[],
          starRating: 0,
          phoneNumber:'000-12345678',
          facilities:['免费WIFI','均有窗','提供热水','提供早餐'],
          reviews:[
            {
              userName:'柳智敏',
              rating:5,
              date:'2026-2-3',
              content:'环境舒适，阳光充足'
            },
            {
              userName:'张元英',
              rating:4,
              date:'2026-1-27',
              content:'方便点外卖，很安静'
            }

          ]
        },
        checkInDate: '',
        checkOutDate: '',
        nights:'',
        selectedRoomType: null,
        quantity: 1,
        loading: false,
        imageIndex: 0,

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

        // 获取酒店ID和日期参数
        const hotelId = options.hotelId || '1';
        const checkInDate = hotelAttrsStore.hotelAttrs.startDate
        const checkOutDate = hotelAttrsStore.hotelAttrs.endDate
        const nights = calculateDays(checkInDate,checkOutDate)
        this.setData({
            hotelId,
            checkInDate,
            checkOutDate,
            nights
        });

        // 加载酒店详情
        this.loadHotelDetail(hotelId);
    },

    //打开地图
    openMap(){
      wx.chooseLocation()
    },
    /**
     * 加载酒店详情数据
     */
    async loadHotelDetail(hotelId) {
        this.setData({ loading: true });
        const res = await reqHotelInfo(hotelId)
        //后端json数据处理
        res.data.RoomTypes.sort((a, b) => a.base_price - b.base_price)
        res.data.RoomTypes.forEach(e => {
          e.guest_facilities = JSON.parse(e.guest_facilities)
        });
        if(res.code===200){
          this.setData({
            hotel:{
              ...this.data.hotel,
              ...res.data
            },
            loading:false
          })
        }
    },


    /**
     * 选择房间类型
     */
    onSelectRoomType(event) {
        const roomType = event.currentTarget.dataset.roomtype;
        this.setData({ selectedRoomType: roomType });
    },

    /**
     * 增加房间数量
     */
    onIncreaseQuantity() {
        const quantity = this.data.quantity + 1;
        this.setData({ quantity });
    },

    /**
     * 减少房间数量
     */
    onDecreaseQuantity() {
        const quantity = Math.max(1, this.data.quantity - 1);
        this.setData({ quantity });
    },

    /**
     * 立即预订
     */
    onBooking() {
        const { selectedRoomType, quantity, hotel,checkInDate,checkOutDate,nights } = this.data;

        if (!selectedRoomType) {
            wx.showToast({
                title: '请先选择房间类型',
                icon: 'none'
            });
            return;
        }

        // 跳转到订单页面
        wx.navigateTo({
            url: `/pages/order/order?hotelName=${hotel.name}&roomType=${selectedRoomType.name}&roomPrice=${selectedRoomType.base_price}&quantity=${quantity}&nights=${nights}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`,
            fail: (err) => {
                console.error('导航失败:', err);
            }
        });
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            title: this.data.hotel.hotelName,
            path: '/pages/detail/detail?hotelId=' + this.data.hotelId
        };
    }
});
