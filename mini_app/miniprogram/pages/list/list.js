/**
 * 酒店列表页面
 * 
 */
import { reqHotels, reqSearchHotels } from "../../api/list";
import { hotelAttrsStore } from '../../store/hotelAttrsStore';

// pages/list/list.js

Page({
    /**
     * 页面初始数据
     */
    data: {
       
        
        //仓库存储的搜索参数
        keyword : '', 
        city:'',
        district : '', 
        startDate : '', 
        endDate : '', 
        
        //非共用参数
        page : 1, 
        limit : 10, 
        sort : '' ,

        displayedHotels: [], // 列表显示的数据

        
        total: 0,
        //日历组件
        showCalendar:false,
        // 加载状态
        loading: true,
        isRefresh:false,
        //是否获取全部
        isFinished:false,
        startDateLabel: '',
        endDateLabel: '',
    },
    // 简单的日期格式化辅助函数
  updateDateLabels() {
    this.setData({
      startDateLabel: this.data.startDate.slice(5),
      endDateLabel: this.data.endDate.slice(5)
    });
  },
    /**
     * 生命周期 - 页面加载
     */
    onShow() {
      //保证只有切换条件才刷新，浏览酒店详情不刷新
      const app = getApp()
      if(!app.globalData.isSwitch)
        return
      this.setData({
        page: 1,
        displayedHotels: [],
        isFinished:false,
        sort:'',
        ...hotelAttrsStore.hotelAttrs
      })
      this.updateDateLabels()
        // 加载酒店列表
      this.loadHotels();
    },

    /**
     * 加载酒店列表
     */
    async loadHotels() {
        this.setData({ loading: true });
        const params = {
          ...this.data,
          ...hotelAttrsStore.hotelAttrs,
          
        }
        const res = await reqSearchHotels(params)
        // console.log('params:',params,'res:',res)
        if(res.code===200){
          this.setData({
            displayedHotels:[...this.data.displayedHotels,...res.data.hotels],
            loading:false,
            total:res.data.pagination.total
          })
        }


    },

    //搜索框
    onPutChange(e){
      this.setData({
        keyword:e.detail.value,
      })
    },
    //地址变化
    onAddrChange(event) {
      this.setData({
        city : event.detail.value[1],
        district:event.detail.value[2]
      })
      hotelAttrsStore.setHotelAttrs({
        city:event.detail.value[1],
        district:event.detail.value[2]
      })
      this.onSearch()
    },
    //搜索事件触发
    onSearch(){
      const {keyword} = this.data
      hotelAttrsStore.setHotelAttrs({keyword})
      this.setData({
        page: 1,
        displayedHotels: [],
        isFinished:false,
      })
      this.loadHotels()
    },
    /**
     * 排序选项切换
     */
    onSortChange(e) {
        const { sort } = e.currentTarget.dataset;

        this.setData({
            sort,
            page: 1,
            displayedHotels: [],
            isFinished:false,

        });
        this.loadHotels();
    },
    //下拉刷新
    async onPullDownRefresh(){
      
      this.setData({
        page: 1,
        displayedHotels: [],
        isFinished:false,
        isRefresh:true
      })
      await this.loadHotels()
      this.setData({
        isRefresh:false
      })
    },
    //到底部刷新
    async onReachBottom(){
      if(this.data.loading)
        return
      if(this.data.displayedHotels.length===this.data.total){
        this.setData({
          isFinished:true,
        })
        return
      }
      this.setData({
        page:this.data.page + 1,
        
      })
      this.loadHotels()
    },

    //打开关闭日历组件
    onStartDateTap(){
      this.setData({
        showCalendar: true
    });
    },
    onCalendarClose() {
      const { startDate, endDate } = hotelAttrsStore.hotelAttrs
      this.setData({
        startDate,
        endDate,
        showCalendar: false
      });
      this.updateDateLabels()
    },
});
