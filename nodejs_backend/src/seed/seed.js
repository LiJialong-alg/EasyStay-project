import bcrypt from 'bcryptjs'
import { initDB } from '../config/db.js'
import { ensureSchema } from '../config/ensureSchema.js'
import { sequelize, User, Hotel, RoomType, RoomDailyInventory, Order, Transaction, Schedule, Review, Announcement, ChatConversation, ChatMessage, Promotion, Notification } from '../models/index.js'

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randNum = (min, max, digits = 1) => Number((Math.random() * (max - min) + min).toFixed(digits))
const randFloat = randNum
const dayKey = (d) => d.toISOString().split('T')[0]

function buildHotelName(i) {
  const cities = [
    '北京', '上海', '广州', '深圳', '成都', '杭州', '重庆', '西安', '苏州', '南京',
    '厦门', '青岛', '武汉', '长沙', '昆明', '大理', '郑州', '沈阳', '天津', '福州',
    '南昌', '石家庄', '太原', '海口', '银川', '拉萨', '呼和浩特', '乌鲁木齐', '嘉兴', '廊坊'
  ]
  const keywords = ['商务', '亲子', '经济', '豪华', '精品', '度假', '轻奢', '城市', '悦居', '云端', '星河', '臻选', '海岸', '都会', '雅致']
  const themes = ['酒店', '公寓', '客栈', '民宿', '旅居', '会馆', '酒家', '驿站', '庄园']

  const city = pick(cities)
  const keyword = pick(keywords)
  const theme = pick(themes)
  return `${city}${keyword}${theme}-${i}`
}

function buildHotelNameEn(i) {
  const cities = [
    'Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Chongqing', 'Xi\'an', 'Suzhou', 'Nanjing',
    'Xiamen', 'Qingdao', 'Wuhan', 'Changsha', 'Kunming', 'Dali', 'Zhengzhou', 'Shenyang', 'Tianjin', 'Fuzhou',
    'Nanchang', 'Shijiazhuang', 'Taiyuan', 'Haikou', 'Yinchuan', 'Lhasa', 'Hohhot', 'Urumqi', 'Jiaxing', 'Langfang'
  ]
  const adjectives = ['Business', 'Family', 'Budget', 'Luxury', 'Boutique', 'Resort', 'Urban', 'Deluxe', 'Comfort', 'Coastal']
  const types = ['Hotel', 'Inn', 'Suites', 'Residence', 'Lodge', 'Apartments']
  const city = pick(cities)
  const adj = pick(adjectives)
  const type = pick(types)
  return `${city} ${adj} ${type} ${i}`
}

function buildAddress() {
  const cities = [
    '北京市', '上海市', '广州市', '深圳市', '成都市', '杭州市', '重庆市', '西安市', '苏州市', '南京市',
    '厦门市', '青岛市', '武汉市', '长沙市', '昆明市', '大理市', '郑州市', '沈阳市', '天津市', '福州市',
    '南昌市', '石家庄市', '太原市', '海口市', '银川市', '拉萨市', '呼和浩特市', '乌鲁木齐市', '嘉兴市', '廊坊市'
  ]
  const districts = [
    '朝阳区', '浦东新区', '天河区', '南山区', '武侯区', '西湖区', '渝中区', '雁塔区', '工业园区',
    '鼓楼区', '思明区', '市南区', '江汉区', '岳麓区', '五华区', '下关区', '二七区', '和平区',
    '河西区', '仓山区', '青云谱区', '长安区', '小店区', '秀英区', '兴庆区', '城关区', '回民区'
  ]
  const roads = [
    '人民路', '中山路', '解放路', '建设路', '滨江路', '学府路', '锦绣路', '凯旋路', '长安街', '环城路',
    '文昌路', '龙腾大道', '中华大街', '滨河路', '府城大道', '新街路', '文化路', '体育路', '淮河路',
    '和平路', '建设南路', '环市西路', '人民东路'
  ]

  const city = pick(cities)
  const district = pick(districts)
  const road = pick(roads)
  return `${city}${district}${road}${randInt(1, 999)}号`
}

function buildHotelImages() {
  // 使用 picsum 提供占位图，确保每个酒店有若干不同图
  const baseId = 2305772039
  const imgIds = []
  for (let i = 0; i < 10; i++) {
    imgIds.push(`https://picsum.photos/600/400?random=${baseId + Math.floor(Math.random() * 200)}`)
  }
  // 去重并随机截取 3-6 张
  const selected = Array.from(new Set(imgIds)).slice(0, randInt(3, 6))
  return selected
}

function buildRoomImages() {
  const baseId = 640000000
  const imgs = []
  const count = randInt(1, 4)
  for (let i = 0; i < count; i++) {
    imgs.push(`https://picsum.photos/400/300?random=${baseId + Math.floor(Math.random() * 300)}`)
  }
  return imgs
}

function buildRoomTemplates() {
  return [
    { name: '商务大床房', bed_type: '大床', size: 28 },
    { name: '豪华双床房', bed_type: '双床', size: 35 },
    { name: '家庭套房', bed_type: '双床+沙发床', size: 45 },
    { name: '亲子房', bed_type: '大床+儿童床', size: 40 },
    { name: '经济单床房', bed_type: '单床', size: 18 },
    { name: '标准间', bed_type: '大床或双床', size: 25 },
    { name: '行政套房', bed_type: '大床+客厅', size: 52 },
  ]
}

async function main() {
  await initDB()
  await sequelize.sync({ force: true })

  const owner = await User.create({ username: 'merchant', password_hash: await bcrypt.hash('123456', 10), name: 'Alexander', role: 'merchant', status: 'active' })
  const admin = await User.create({ username: 'admin', password_hash: await bcrypt.hash('123456', 10), name: 'Admin', role: 'admin' })
  await User.create({ username: 'banned_merchant', password_hash: await bcrypt.hash('123456', 10), name: 'Banned Merchant', role: 'merchant', status: 'banned', ban_reason: '多次虚假宣传，已封禁处理' })

  // 目标数量
  const target = 100
  const need = target

  const now = new Date()
  const roomTemplates = buildRoomTemplates()
  const createdHotels = []

  for (let i = 0; i < need; i++) {
    const seq = i + 1
    const imgs = buildHotelImages()

    // starLevel 2-5
    const starLevel = randInt(2, 5)
    const rating = 3.5 + (starLevel - 2) * 0.4 + Math.random() * 0.4
    const randfloat = randFloat(rating - 0.2, rating + 0.3, 1)
    const hotel = await Hotel.create({
      owner_id: owner.id,
      name: buildHotelName(seq),
      hotelNameEn: buildHotelNameEn(seq), // 新增英文名属性
      address: buildAddress(),
      latitude: randFloat(18.2, 40.1, 6),
      longitude: randFloat(102.0, 121.7, 6),
      listed: true,
      unlist_reason: null,
      status: Math.random() < 0.05 ? 'closed' : 'operating',
      rating: randfloat >= 5 ? 5.0 : randfloat,
      star_level: starLevel,
      description: pick([
        '位置优越，交通便利，是商务出行与家庭度假的理想选择。',
        '注重舒适睡眠体验，家电设施齐全，提供人性化贴心服务。',
        '距离地铁/商圈近，适合短期旅行与亲子出游。',
        '环境安静私密，配备智能入住系统与专业管家团队。',
        '经济实惠，品质稳定，是自由行游客的首选。',
        '豪华配置，五星服务，尽享奢侈度假体验。',
        '亲子主题，儿童娱乐设施完善，家长放心省心。',
      ]),
      image_urls: JSON.stringify(imgs),
      image_url: imgs.length > 0 ? imgs[0] : null,
    })

    createdHotels.push(hotel)

    const roomCount = randInt(2, 6)
    const createdRooms = []

    // 为确保 room_type 的 id 可用，这里逐条 create（安全可靠）
    for (let r = 0; r < roomCount; r++) {
      const tpl = pick(roomTemplates)

      // basePrice 可以低到 60-100 区间以满足“价格可以低到100以内”的要求
      // 上限根据星级浮动
      const minBase = 60
      const maxBase = 400 + starLevel * 120
      const basePrice = randInt(minBase, maxBase)

      const stock = randInt(3, 40)
      const facilities = pick([
        ['空调', '衣柜', '书桌', 'USB充电'],
        ['空调', '书桌', '投影', '迷你吧'],
        ['空调', '衣柜', '沙发', '迷你吧', '音响'],
        ['空调', '书桌', '电热水壶', '保险柜'],
        ['空调', '衣柜', '智能床控', '语音助手'],
      ])

      // 生成房间图片
      const rtImgs = buildRoomImages()

      // activity_price：部分房间有活动价（随机部分）
      const hasActivity = Math.random() < 0.5 // 50% 概率存在活动价
      const activityPrice = hasActivity
        ? Math.max(20, basePrice - randInt(5, Math.min(80, Math.floor(basePrice * 0.4)))) // 确保>0
        : null

      const rt = await RoomType.create({
        hotel_id: hotel.id,
        name: tpl.name,
        base_price: basePrice,
        activity_price: activityPrice, // 新增字段（部分房间会有值）
        total_stock: stock,
        description: pick([
          '采光充足，适合商务出行与办公。',
          '空间宽敞，非常适合家庭出游。',
          '温馨舒适，安静私密，适合休闲度假。',
          '设施现代化，性价比高，经济实惠。',
          '豪华配置，尊享服务，体验卓越。',
          '儿童友好，家长放心，亲子乐园。',
        ]),
        status: hotel.listed ? 'available' : 'offline',
        audit_status: 'approved',
        audit_reason: null,
        offline_reason: null,
        bed_type: tpl.bed_type,
        room_size_sqm: tpl.size + randInt(-3, 8),
        floor_info: `${randInt(2, 6)}-${randInt(8, 18)}层`,
        has_wifi: true,
        has_window: Math.random() < 0.92,
        has_housekeeping: Math.random() < 0.85,
        is_non_smoking: Math.random() < 0.88,
        includes_breakfast: starLevel >= 4 ? Math.random() < 0.7 : Math.random() < 0.3,
        guest_facilities: JSON.stringify(pick([
          ['免费WiFi', '空调', '液晶电视'],
          ['免费WiFi', '空调', '液晶电视', '咖啡机'],
          ['免费WiFi', '空调', '智能面板', '语音控制', '影音系统'],
        ])),
        food_drink: JSON.stringify(pick([
          ['矿泉水', '咖啡/茶包'],
          ['矿泉水', '咖啡/茶包', '饮料'],
          ['矿泉水', '咖啡/茶包', '饮料', '果汁机'],
        ])),
        furniture: JSON.stringify(pick([
          ['床头柜', '行李架', '书桌'],
          ['床头柜', '沙发', '行李架', '衣柜'],
          ['床头柜', '沙发', '行李架', '衣柜', '茶几'],
        ])),
        bathroom_facilities: JSON.stringify(pick([
          ['淋浴', '吹风机', '浴帘'],
          ['淋浴', '浴缸', '吹风机'],
          ['淋浴', '浴缸', '吹风机', '按摩淋浴', '智能马桶'],
          ['淋浴', '浴缸', '吹风机', '浴盐', '浴球'],
        ])),
        image_urls: JSON.stringify(rtImgs),
        image_url: rtImgs.length > 0 ? rtImgs[0] : null,
      })

      createdRooms.push(rt)
    }

    // 创建库存：-30 天到 +90 天
    const inventories = []
    for (const rt of createdRooms) {
      for (let d = -30; d < 90; d++) {
        const date = new Date(now)
        date.setDate(date.getDate() + d)
        // 库存价格基于 base_price，保留一定波动；activity_price 不是库存价字段，这里保持库存价为实际售卖价基础
        const price = rt.base_price + randInt(-20, 50)
        inventories.push({
          room_type_id: rt.id,
          date: dayKey(date),
          price: Math.max(20, price),
          available_stock: rt.total_stock,
          status: 'available',
        })
      }
    }

    // 批量插入库存
    if (inventories.length > 0) {
      await RoomDailyInventory.bulkCreate(inventories)
    }

    if ((i + 1) % 10 === 0) {
      console.log(`-> Created ${i + 1}/${need} hotels`)
    }
  }

  console.log(`✓ Seed finished. Created ${createdHotels.length} hotels.`)

  const roomTypes = await RoomType.bulkCreate([
    { id: 101, hotel_id: 1, name: '豪华大床房', base_price: 1200, total_stock: 10, image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80']), bed_type: '1.8m大床', room_size_sqm: 35, floor_info: '5-10层', has_wifi: true, has_window: true, has_housekeeping: true, is_non_smoking: true, includes_breakfast: true, guest_facilities: JSON.stringify(['空调', '衣柜', '书桌', '沙发']), food_drink: JSON.stringify(['免费瓶装水', '咖啡/茶包']), furniture: JSON.stringify(['床头柜', '行李架']), bathroom_facilities: JSON.stringify(['淋浴', '吹风机', '洗漱用品']), description: '适合商务与度假，采光充足。' },
    { id: 102, hotel_id: 1, name: '双床房', base_price: 1350, total_stock: 8, image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80', image_urls: JSON.stringify(['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80']), bed_type: '2×1.2m双床', room_size_sqm: 38, floor_info: '3-8层', has_wifi: true, has_window: true, has_housekeeping: true, is_non_smoking: true, includes_breakfast: false, guest_facilities: JSON.stringify(['空调', '衣柜', '书桌']), food_drink: JSON.stringify(['瓶装水']), furniture: JSON.stringify(['床头柜', '行李架']), bathroom_facilities: JSON.stringify(['淋浴', '吹风机']), description: '适合亲友出行。' },
    { id: 103, hotel_id: 1, name: '海景套房', base_price: 2800, total_stock: 5, status: 'sold_out' },
    { id: 104, hotel_id: 1, name: '亲子房', base_price: 1500, total_stock: 6 },
    { id: 201, hotel_id: 2, name: '观山大床房', base_price: 800, total_stock: 12, status: 'offline', offline_reason: '酒店已下线', audit_status: 'pending', audit_reason: '请补充消防验收证明' },
    { id: 202, hotel_id: 2, name: '家庭套房', base_price: 1200, total_stock: 4, status: 'offline', offline_reason: '酒店已下线' },
    { id: 301, hotel_id: 3, name: '商务大床房', base_price: 500, total_stock: 20 },
    { id: 302, hotel_id: 3, name: '行政套房', base_price: 880, total_stock: 8 },
  ])

  // 生成过去30天 + 未来30天的每日房态
  const today = new Date()
  const inventories = []
  for (const rt of roomTypes) {
    for (let i = -30; i < 30; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() + i)
      inventories.push({
        room_type_id: rt.id,
        date: d.toISOString().split('T')[0],
        price: rt.base_price,
        available_stock: rt.total_stock,
        status: rt.status === 'sold_out' ? 'sold_out' : 'available',
      })
    }
  }
  await RoomDailyInventory.bulkCreate(inventories)

  // 模拟过去30天的订单 (Past Orders)
  const pastOrders = []
  for (let i = 0; i < 50; i++) {
    const randomHotel = hotels[Math.floor(Math.random() * hotels.length)]
    const randomRoom = roomTypes.filter(r => r.hotel_id === randomHotel.id)[0]
    const daysAgo = Math.floor(Math.random() * 30) + 1
    const checkIn = new Date(today)
    checkIn.setDate(checkIn.getDate() - daysAgo)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 3) + 1)

    pastOrders.push({
      customer_name: `Customer ${i}`,
      hotel_id: randomHotel.id,
      room_type_id: randomRoom.id,
      check_in_date: checkIn.toISOString().split('T')[0],
      check_out_date: checkOut.toISOString().split('T')[0],
      room_count: 1,
      total_amount: Number(randomRoom.base_price) * ((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
      status: 'completed',
      created_at: checkIn // Approximate
    })
  }
  const createdPastOrders = await Order.bulkCreate(pastOrders)

  // 模拟未来订单 (Future Orders)
  const futureOrders = []
  const statuses = ['pending', 'confirmed', 'checked_in', 'cancelled']
  for (let i = 0; i < 20; i++) {
    const randomHotel = hotels[Math.floor(Math.random() * hotels.length)]
    const randomRoom = roomTypes.filter(r => r.hotel_id === randomHotel.id)[0]
    const daysLater = Math.floor(Math.random() * 10)
    const checkIn = new Date(today)
    checkIn.setDate(checkIn.getDate() + daysLater)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + Math.floor(Math.random() * 3) + 1)

    futureOrders.push({
      customer_name: `FutureGuest ${i}`,
      hotel_id: randomHotel.id,
      room_type_id: randomRoom.id,
      check_in_date: checkIn.toISOString().split('T')[0],
      check_out_date: checkOut.toISOString().split('T')[0],
      room_count: 1,
      total_amount: Number(randomRoom.base_price) * ((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    })
  }
  await Order.bulkCreate(futureOrders)

  // 生成交易流水 (Transactions) - 仅为 completed/confirmed/checked_in 订单生成
  const validOrders = [...createdPastOrders, ...futureOrders].filter(o => ['completed', 'confirmed', 'checked_in'].includes(o.status))
  const transactions = validOrders.map(o => ({
    order_id: o.id || Math.floor(Math.random() * 1000), // Note: bulkCreate might not return ids for all dialects, but sqlite usually ok. If fail, mock it.
    type: 'income',
    amount: o.total_amount,
    status: 'success',
    timestamp: o.check_in_date // Approximate
  }))
  // Fix: Order IDs need to be real. Let's fetch orders again or rely on createdPastOrders having IDs.
  // Sequelize bulkCreate returns instances with IDs by default.
  // We need to map correctly. Let's simplify: Loop created orders.
  const allOrders = await Order.findAll()
  const transactionData = allOrders
    .filter(o => ['completed', 'confirmed', 'checked_in'].includes(o.status))
    .map(o => ({
      order_id: o.id,
      type: 'income',
      amount: o.total_amount,
      status: 'success',
      timestamp: o.createdAt
    }))
  await Transaction.bulkCreate(transactionData)

  // 生成评价 (Reviews) - 仅为 completed 订单生成
  const completedOrders = allOrders.filter(o => o.status === 'completed')
  const reviews = completedOrders.slice(0, 15).map((o, idx) => {
    const room = roomTypes.find(r => r.id === o.room_type_id)
    return {
      hotel_id: o.hotel_id,
      customer_name: o.customer_name,
      room_type_name: room ? room.name : 'Unknown',
      rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars mostly
      content: idx % 3 === 0 ? '非常棒的入住体验，服务周到！' : '房间干净整洁，性价比高，推荐入住。',
      reply: idx % 2 === 0 ? '感谢您的好评，期待再次光临！' : null,
      is_highlight: idx < 3, // Top 3 highlight
      created_at: o.check_out_date
    }
  })
  await Review.bulkCreate(reviews)

  await Schedule.bulkCreate([
    { user_id: owner.id, event_content: '早班例会', event_time: '09:00', location: '会议室A', type: 'meeting' },
    { user_id: owner.id, event_content: 'OTA 平台活动报名截止', event_time: '10:30', location: '线上', type: 'task' },
    { user_id: owner.id, event_content: '检查VIP房 (302)', event_time: '11:30', location: '302房', type: 'task' },
  ])

  await Announcement.bulkCreate([
    {
      title: '关于五一假期流量扶持政策的通知',
      type: 'notification',
      content: '五一期间平台将对高评分酒店进行流量扶持，建议提前优化房态与价格策略。',
      target_role: 'merchant',
      status: 'published',
      published_at: new Date(),
    },
    {
      title: '系统维护升级公告（本周五凌晨）',
      type: 'maintenance',
      content: '本周五 02:00-03:00 进行系统维护升级，期间可能短暂影响下单与对账功能。',
      target_role: 'all',
      status: 'published',
      published_at: new Date(),
    },
    {
      title: '新增“钟点房”售卖模式操作指南',
      type: 'feature',
      content: '商家端已新增钟点房售卖模式配置入口，欢迎试用并反馈建议。',
      target_role: 'merchant',
      status: 'published',
      published_at: new Date(),
    },
  ])

  const conv = await ChatConversation.create({ user_id: owner.id, title: '平台客服', status: 'open' })
  await ChatMessage.bulkCreate([
    { conversation_id: conv.id, sender_role: 'support', content: '您好，这里是平台客服，有任何问题都可以随时咨询。' },
    { conversation_id: conv.id, sender_role: 'merchant', content: '你好，我想咨询一下酒店下线的原因。' },
    { conversation_id: conv.id, sender_role: 'support', content: '已收到，我们会在 1 个工作日内反馈具体原因与处理建议。' },
  ])

  await Promotion.bulkCreate([
    { merchant_id: owner.id, hotel_id: 1, title: '新客立减 30', promo_type: 'coupon', discount_type: 'amount', discount_value: 30, min_amount: 300, max_uses: 500, used_count: 82, code: 'NEW30', status: 'active' },
    { merchant_id: owner.id, hotel_id: 1, title: '连住 2 晚 9 折', promo_type: 'coupon', discount_type: 'percent', discount_value: 0.9, min_nights: 2, max_uses: 999, used_count: 137, code: 'STAY2', status: 'active' },
    { merchant_id: owner.id, hotel_id: 3, title: '周末闪促 - 立减 80', promo_type: 'flash', discount_type: 'amount', discount_value: 80, min_amount: 800, max_uses: 200, used_count: 34, start_at: new Date(Date.now() - 2 * 24 * 3600 * 1000), end_at: new Date(Date.now() + 5 * 24 * 3600 * 1000), status: 'active' },
  ])

  const allReviews = await Review.findAll()
  await Notification.bulkCreate(
    allReviews
      .filter((r) => r.hotel_id)
      .map((r) => ({
        user_id: owner.id,
        kind: 'interaction',
        title: '收到新的评价',
        description: `${(hotels.find((h) => h.id === r.hotel_id)?.name) || ''} · ${r.customer_name || ''} · ${r.rating || 0}分`,
        ref_type: 'review',
        ref_id: r.id,
        is_read: false,
        createdAt: r.created_at || new Date(),
        updatedAt: r.created_at || new Date(),
      }))
  )

  console.log('Seed completed with realistic data!')
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
