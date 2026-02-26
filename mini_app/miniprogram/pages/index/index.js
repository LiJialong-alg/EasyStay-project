/**
 * 首页 - 酒店查询
 * 
 */

//腾讯位置服务
import QQmapWx from "../../libs/qqmap-wx-jssdk"

import { reqRecHotels } from "../../api/index";
import { hotelAttrsStore } from "../../store/hotelAttrsStore";
import { calculateDays } from "../../utils/format.js";


// pages/index/index.js

Page({
    /**
     * 页面初始数据
     */
    data: {
        // 查询参数
        city: '',
        district:'',
        keyword: '',

        startDate: '',
        endDate: '',
        nights:'',
        // UI 状态
        showCalendar: false,
        calendarMode: 'startDate', // startDate 或 endDate
        isChooseStar:false,
        isRefresh:false,
        // 酒店数据
        recommendHotels: [],
        loading: true,

        // 轮播图
        bannerList: [
        ]
    },

    /**
     * 生命周期 - 页面加载
     */
    onLoad() {
      
      this.qqmapwx = new QQmapWx({
        key:'PL3BZ-Q2CC5-JT7IK-IFACL-TEYAV-EXB4L'
      })
      // 初始化日期
      this.initDate();

      // 获取推荐酒店
      this.loadRecommendedHotels();

      // 获取用户定位
      // this.getUserLocation();
    },
    onShow(){
      //用于控制列表页是否自动刷新
      const {startDate,endDate} = hotelAttrsStore.hotelAttrs
      const app =getApp()
      app.globalData.isSwitch = true
      this.setData({
        ...hotelAttrsStore.hotelAttrs,
        keyword:'',
        nights:calculateDays(startDate,endDate)
      })
    },
    /**
     * 初始化日期 - 设置默认入住日期为今天，离住日期为明天
     */
    initDate() {
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const startDate = formatDate(today)
        const endDate = formatDate(tomorrow)
        this.setData({
            startDate,
            endDate,
            nights:1
        });
        hotelAttrsStore.setHotelAttrs({startDate,endDate})
    },
    //下拉刷新
    async onPullDownRefresh(){
      this.setData({
        isRefresh:true
      })
      await this.loadRecommendedHotels()
      this.setData({
        isRefresh:false
      })
    },
    /**
     * 获取用户定位
     */
    async getUserLocation() {
      const {latitude,longitude} = await wx.getLocation()
      this.qqmapwx.reverseGeocoder({
        location:{
          longitude,
          latitude
        },
        success : res => {
          const {city,district} = res.result.address_component
          hotelAttrsStore.setHotelAttrs({
            city,
            district
          })
          this.setData({
            city,
            district
          })
        },
        fail : res => {
          console.error(res)
        }

      })

    },
    //地图定位
    async openMap(){
      const {latitude,longitude,name} = await wx.chooseLocation()
      this.qqmapwx.reverseGeocoder({
        location:{
          longitude,
          latitude
        },
        success : res => {
          const {city,district} = res.result.address_component
          hotelAttrsStore.setHotelAttrs({
            city,
            district
          })
          this.setData({
            city,
            district
          })
        },
        fail : res => {
          console.error(res)
        }

      })
    },
    //清空定位
    clearAddr(){
      hotelAttrsStore.setHotelAttrs({
        city:'',
        district:''
      })
      this.setData({
        city:'',
        district:''
      })
    },
    /**
     * 获取推荐酒店列表
     */
    async loadRecommendedHotels() {

      this.setData({ loading: true });
      const res = await reqRecHotels()
      if(res.code===200){
        this.setData({
          loading:false,
          recommendHotels:res.data.slice(5,15),
          bannerList:res.data.slice(0,5)
        })
      }

    },

    // 省市区选择
    onAddressChange(event) {
      this.setData({
        city:event.detail.value[1],
        district:event.detail.value[2]
      })
      hotelAttrsStore.setHotelAttrs({
        city:event.detail.value[1],
        district:event.detail.value[2]
      })
    },
    /**
     * 处理关键词搜索输入
     */
    onSearchInput(e) {
        this.setData({
            keyword: e.detail.value
        });
    },

    /**
     * 打开关闭日历
     */
    onStartDateTap(){
      this.setData({
        showCalendar: true
    });
    },
    onCalendarClose() {
      const { startDate, endDate } = hotelAttrsStore.hotelAttrs
      const nights = calculateDays(startDate,endDate)
      this.setData({
        startDate,
        endDate,
        nights,
        showCalendar: false
      });
    },

    /**
     * 搜索酒店
     */
    onSearch() {
        const {city,district,keyword,startDate,endDate} = this.data
        hotelAttrsStore.setHotelAttrs({city,district,keyword,startDate,endDate})
        // 跳转到列表页

        wx.switchTab({
            url: `/pages/list/list`
        });
    },



    /**
     * 快捷标签点击
     */
    onQuickTag(e) {
        const { tag } = e.currentTarget.dataset;
        this.setData({
            keyword: tag
        });
    },


    /**
     * Banner 点击
     */
    onBannerTap(e) {
        const { id } = e.currentTarget.dataset;
        // 跳转到对应的酒店详情页
        wx.navigateTo({
            url: `/pages/detail/detail?hotelId=${id}`
        });
    },

});
