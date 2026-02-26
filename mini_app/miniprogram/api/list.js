import http from "../utils/http";

export const reqHotels = () => http.get('/hotels')

export const reqSearchHotels = 
({ page = 1, limit = 10, keyword = '',city = '', district = '', startDate = '', endDate = '',starRating='',minPrice = '',maxPrice = '', sort = '' }) => 
http.post('/hotels/search',{ 
  page, 
  limit, 
  keyword, 
  city:city + district, 
  startDate, 
  endDate, 
  starRating,
  minPrice,
  maxPrice,
  sort 
})