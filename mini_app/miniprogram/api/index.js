import http from "../utils/http";

export const reqRecHotels = () => http.get('/hotels/recommended')