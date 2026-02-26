import { hotelAttrsStore } from "../../store/hotelAttrsStore"

// components/filterPicker/filterPicker.js
Component({
  data:{
    isOpen:false,
    isFilterActive:false,
    priceIndex:0,
    priceOptions: ['不限', '¥100以下', '¥100-200', '¥200-300', '¥300-400','¥400-500','¥500-600','¥600以上'],

    starIndex:0,
    starOptions:['不限', '2星/经济', '3星/舒适', '4星/高档', '5星/豪华'],
    
  },
  pageLifetimes: {
    show: function() {
      // 页面被展示时触发（类似于页面的 onShow）
      const {minPrice,starRating} = hotelAttrsStore.hotelAttrs
      this.setData({
        priceIndex: minPrice !== ''? Number(minPrice)/100 + 1 : 0,
        starIndex: starRating? Number(starRating) - 1 : 0
      })
    },
  },
  methods:{
    toggleFilter(){
      this.setData({
        isOpen:!this.data.isOpen
      })
    },
    selectPrice(e){
      this.setData({
        priceIndex:e.currentTarget.dataset.index
      })
    },
    selectStar(e){
      this.setData({
        starIndex:e.currentTarget.dataset.index
      })
    },
    resetFilter(){
      this.setData({
        starIndex:0,
        priceIndex:0
      })
    },
    confirmFilter(){
      const {priceIndex,starIndex} = this.data
      const params = {
        starRating:starIndex? Number(starIndex) + 1 : '',
        minPrice: priceIndex? Number(priceIndex)*100 - 100: '',
        maxPrice: priceIndex? Number(priceIndex)*100 : '',
      }
      if(priceIndex == 7)
        params.maxPrice = ''
      hotelAttrsStore.setHotelAttrs(params)
      this.triggerEvent('filterChange')
      this.setData({
        isOpen:false,
        isFilterActive:true
      })
    }
  }
})