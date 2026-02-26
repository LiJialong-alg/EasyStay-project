import { action, observable } from "mobx-miniprogram";

export const hotelAttrsStore = observable({
  hotelAttrs:{
    keyword : '', 
    city:'',
    district : '', 
    startDate : '', 
    endDate : '', 
    starRating : '',
    minPrice : '',
    maxPrice : ''
  },
  setHotelAttrs:action(function(attrs){
    this.hotelAttrs = {...this.hotelAttrs,...attrs}
  })
})