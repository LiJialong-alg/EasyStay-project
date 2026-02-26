import http from "../utils/http";

export const reqHotelInfo = (id) => http.get(`/hotels/${id}`)