import express from 'express'
import { Op } from 'sequelize'
import { ActivityRoomPrice, Hotel, RoomType, Review } from '../models/index.js'
import { sequelize } from '../config/db.js'

const router = express.Router()

function formatHotel(hotel, activityPriceMap) {
  const plain = hotel.get({ plain: true })
  const prices = (plain.RoomTypes || []).map((rt) => {
    const base = Number(rt.base_price)
    const act = activityPriceMap?.get(rt.id)
    return Number.isFinite(act) ? Math.min(base, act) : base
  })
  plain.minPrice = prices.length > 0 ? Math.min(...prices) : 0
  plain.image_urls = plain.image_urls
    ? (() => {
      try {
        return JSON.parse(plain.image_urls)
      } catch {
        return plain.image_urls
      }
    })()
    : null
  plain.RoomTypes = (plain.RoomTypes || []).map((rt) => {
    const base = Number(rt.base_price)
    const act = activityPriceMap?.get(rt.id)
    const rtActivityPrice = rt.activity_price != null ? Number(rt.activity_price) : null
    const finalActivityPrice = Number.isFinite(act) ? act : rtActivityPrice
    const effectivePrice = Number.isFinite(finalActivityPrice) ? Math.min(base, finalActivityPrice) : base
    return {
      ...rt,
      activity_price: finalActivityPrice,
      effective_price: effectivePrice,
      image_urls: rt.image_urls
        ? (() => {
          try {
            return JSON.parse(rt.image_urls)
          } catch {
            return rt.image_urls
          }
        })()
        : null,
    }
  })
  return plain
}

async function getActivityPriceMap(roomTypeIds) {
  const ids = Array.isArray(roomTypeIds) ? roomTypeIds.filter(Boolean) : []
  if (ids.length === 0) return new Map()
  const now = new Date()
  const rows = await ActivityRoomPrice.findAll({
    where: {
      room_type_id: { [Op.in]: ids },
      [Op.and]: [
        { [Op.or]: [{ start_at: null }, { start_at: { [Op.lte]: now } }] },
        { [Op.or]: [{ end_at: null }, { end_at: { [Op.gte]: now } }] },
      ],
    },
    attributes: ['room_type_id', 'price'],
    raw: true,
  })
  const map = new Map()
  for (const r of rows) {
    const id = Number(r.room_type_id)
    const p = Number(r.price)
    if (!Number.isFinite(id) || !Number.isFinite(p)) continue
    const prev = map.get(id)
    map.set(id, Number.isFinite(prev) ? Math.min(prev, p) : p)
  }
  return map
}

router.get('/public/hotels/recommended', async (req, res) => {
  try {
    const hotels = await Hotel.findAll({
      where: { listed: true, status: 'operating' },
      include: [
        {
          model: RoomType,
          attributes: ['id', 'name', 'base_price', 'activity_price', 'total_stock', 'status', 'image_url', 'image_urls'],
        },
        {
          model: Review,
          attributes: ['id', 'rating', 'content', 'createdAt'],
        },
      ],
      order: [['rating', 'DESC'], ['createdAt', 'DESC']],
      limit: 15,
    })

    const roomTypeIds = hotels.flatMap((h) => (h.RoomTypes || []).map((rt) => rt.id))
    const activityPriceMap = await getActivityPriceMap(roomTypeIds)
    const formattedHotels = hotels.map((h) => formatHotel(h, activityPriceMap))

    res.json({
      code: 200,
      message: '获取推荐酒店列表成功',
      data: formattedHotels,
    })
  } catch (error) {
    console.error('获取推荐酒店列表出错:', error)
    res.status(500).json({
      code: 500,
      message: '获取推荐酒店列表失败',
      detail: error.message,
    })
  }
})

router.get('/public/hotels/:id', async (req, res) => {
  try {
    const hotelId = req.params.id

    const hotel = await Hotel.findOne({
      where: { id: hotelId, listed: true },
      include: [
        {
          model: RoomType,
          attributes: [
            'id',
            'name',
            'base_price',
            'activity_price',
            'total_stock',
            'status',
            'image_url',
            'image_urls',
            'bed_type',
            'room_size_sqm',
            'floor_info',
            'has_wifi',
            'has_window',
            'has_housekeeping',
            'is_non_smoking',
            'includes_breakfast',
            'guest_facilities',
            'food_drink',
            'furniture',
            'bathroom_facilities',
            'description',
          ],
        },
        {
          model: Review,
          attributes: ['id', 'rating', 'content', 'createdAt'],
        },
      ],
    })

    if (!hotel) {
      return res.status(404).json({
        code: 404,
        message: '酒店不存在或已下架',
      })
    }

    const activityPriceMap = await getActivityPriceMap((hotel.RoomTypes || []).map((rt) => rt.id))
    const formattedHotel = formatHotel(hotel, activityPriceMap)

    res.json({
      code: 200,
      message: '获取酒店详情成功',
      data: formattedHotel,
    })
  } catch (error) {
    console.error('获取酒店详情出错:', error)
    res.status(500).json({
      code: 500,
      message: '获取酒店详情失败',
      detail: error.message,
    })
  }
})

router.post('/public/hotels/search', async (req, res) => {
  try {
    // 参数验证和处理 - 注意前端可能传入空字符串
    let { page = 1, limit = 20, keyword = '', city = '', minPrice = '', maxPrice = '', starRating = '', sort = '' } = req.body || {}

    const pageNum = Math.max(1, parseInt(page) || 1)
    const pageSize = Math.max(1, Math.min(100, parseInt(limit) || 20))

    // 验证 sort 参数
    const validSort = ['', 'asc', 'desc'].includes(sort?.toLowerCase()) ? sort?.toLowerCase() : ''

    // 处理价格参数 - 忽略空字符串
    const minPriceVal = minPrice && minPrice !== '' ? parseFloat(minPrice) : undefined
    const maxPriceVal = maxPrice && maxPrice !== '' ? parseFloat(maxPrice) : undefined

    // 构建基础where条件
    const baseConditions = {
      listed: true,
      status: 'operating',
    }

    //星级筛选
    if (starRating !== '' && ['2', '3', '4', '5'].includes(String(starRating))) {
      baseConditions.star_level = Number(starRating)
    }



    // 构建最终的WHERE条件
    let whereConditions = { ...baseConditions }

    const andConditions = []

    // 关键词
    if (keyword && keyword.trim()) {
      const trimmedKeyword = keyword.trim()
      andConditions.push({
        [Op.or]: [
          { name: { [Op.like]: `%${trimmedKeyword}%` } },
          { address: { [Op.like]: `%${trimmedKeyword}%` } }
        ]
      })
    }

    // 地名（可能包含区）
    if (city && city.trim()) {
      const trimmedCity = city.trim()
      andConditions.push({
        address: { [Op.like]: `%${trimmedCity}%` }
      })
    }

    // 把 AND 条件加入 where
    if (andConditions.length > 0) {
      whereConditions[Op.and] = andConditions
    }

    // 第一步：获取符合筛选条件的酒店ID和基本信息（不包含关联数据以避免重复）
    const baseHotels = await Hotel.findAll({
      where: whereConditions,
      attributes: ['id', 'name', 'address', 'rating', 'createdAt'],
      raw: true,
    })

    // 如果没有结果，直接返回
    if (baseHotels.length === 0) {
      return res.json({
        code: 200,
        message: '搜索酒店成功',
        data: {
          hotels: [],
          pagination: {
            page: pageNum,
            limit: pageSize,
            total: 0,
            totalPages: 0,
          },
        },
      })
    }

    // 第二步：获取这些酒店的房间类型数据（可用状态）
    const hotelIds = baseHotels.map(h => h.id)
    const roomTypes = await RoomType.findAll({
      where: {
        hotel_id: { [Op.in]: hotelIds },
        status: 'available'
      },
      attributes: ['id', 'hotel_id', 'base_price', 'activity_price'],
      raw: true
    })

    // 第三步：获取活动价格并计算每个酒店的最低价格
    const roomTypeIds = roomTypes.map(rt => rt.id)
    const activityPriceMap = roomTypeIds.length > 0 ? await getActivityPriceMap(roomTypeIds) : new Map()

    // 构建酒店最低价格映射
    const hotelMinPriceMap = new Map()
    for (const rt of roomTypes) {
      const hotelId = rt.hotel_id
      const basePrice = Number(rt.base_price)
      const actPrice = activityPriceMap.get(rt.id)
      const effectivePrice = Number.isFinite(actPrice) ? Math.min(basePrice, actPrice) : basePrice

      const currentMinPrice = hotelMinPriceMap.get(hotelId)
      if (!currentMinPrice || effectivePrice < currentMinPrice) {
        hotelMinPriceMap.set(hotelId, effectivePrice)
      }
    }

    // 第四步：应用价格过滤和排序
    let filteredHotels = baseHotels
      .map(hotel => ({
        ...hotel,
        minPrice: hotelMinPriceMap.get(hotel.id),
      }))
      .filter(hotel => {
        // 只保留有可用房间的酒店
        if (!Number.isFinite(hotel.minPrice)) return false

        // 价格范围过滤
        const minVal = Number.isFinite(minPriceVal) ? minPriceVal : -Infinity
        const maxVal = Number.isFinite(maxPriceVal) ? maxPriceVal : Infinity
        return hotel.minPrice >= minVal && hotel.minPrice <= maxVal
      })

    // 排序逻辑
    if (validSort === 'asc') {
      // 按最低价格升序
      filteredHotels.sort((a, b) => a.minPrice - b.minPrice)
    } else if (validSort === 'desc') {
      // 按最低价格降序
      filteredHotels.sort((a, b) => b.minPrice - a.minPrice)
    } else {
      // 默认排序：按评分降序，相同评分按创建时间降序
      filteredHotels.sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0)
        if (ratingDiff !== 0) return ratingDiff
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    }

    const total = filteredHotels.length

    // 第五步：分页
    const paginatedHotelIds = filteredHotels
      .slice((pageNum - 1) * pageSize, pageNum * pageSize)
      .map(h => h.id)

    // 第六步：获取分页结果的完整数据（包括所有房间类型和评论）
    const fullHotels = await Hotel.findAll({
      where: { id: { [Op.in]: paginatedHotelIds } },
      include: [
        {
          model: RoomType,
          where: { status: 'available' },
          attributes: ['id', 'name', 'base_price', 'activity_price', 'total_stock', 'status', 'image_url', 'image_urls'],
          required: false,
        },
        {
          model: Review,
          attributes: ['id', 'rating', 'content', 'createdAt'],
          required: false,
          order: [['createdAt', 'DESC']],
        },
      ],
    })

    // 第七步：按照分页顺序重新排序，并格式化（保证顺序一致，避免wx:key重复）
    const hotelMap = new Map(fullHotels.map(h => [h.id, h]))
    const orderedHotels = paginatedHotelIds
      .map(id => hotelMap.get(id))
      .filter(Boolean)

    const formattedHotels = orderedHotels.map(h => formatHotel(h, activityPriceMap))

    res.json({
      code: 200,
      message: '搜索酒店成功',
      data: {
        hotels: formattedHotels,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total: total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    })
  } catch (error) {
    console.error('搜索酒店出错:', error)
    res.status(500).json({
      code: 500,
      message: '搜索酒店失败',
      detail: error.message,
    })
  }
})

export default router
