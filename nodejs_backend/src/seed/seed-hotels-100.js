import bcrypt from 'bcryptjs'
import { initDB } from '../config/db.js'
import { ensureSchema } from '../config/ensureSchema.js'
import { sequelize, User, Hotel, RoomType, RoomDailyInventory } from '../models/index.js'

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randFloat = (min, max, digits = 1) => Number((Math.random() * (max - min) + min).toFixed(digits))
const dayKey = (d) => d.toISOString().split('T')[0]

async function ensureSeedMerchant() {
  const existing = await User.findOne({ where: { username: 'merchant' } })
  if (existing) return existing
  return User.create({
    username: 'merchant',
    password_hash: await bcrypt.hash('123456', 10),
    name: 'Alexander',
    role: 'merchant',
    status: 'active',
  })
}

function buildHotelName(i) {
  const city = pick(['北京', '上海', '广州', '深圳', '成都', '杭州', '重庆', '西安', '苏州', '南京', '厦门', '青岛', '武汉', '长沙', '昆明', '大理'])
  const theme = pick(['城市', '商务', '度假', '轻奢', '亲子', '精品', '悦居', '云端', '星河', '梧桐', '海岸', '山岚', '臻选'])
  const suffix = pick(['酒店', '公寓', '客栈', '民宿', '旅居', '会馆'])
  return `${city}${theme}${suffix}-${i}`
}

function buildAddress() {
  const city = pick(['北京市', '上海市', '广州市', '深圳市', '成都市', '杭州市', '重庆市', '西安市', '苏州市', '南京市', '厦门市', '青岛市', '武汉市', '长沙市', '昆明市'])
  const district = pick(['朝阳区', '浦东新区', '天河区', '南山区', '武侯区', '西湖区', '渝中区', '雁塔区', '工业园区', '鼓楼区', '思明区', '市南区', '江汉区', '岳麓区', '五华区'])
  const road = pick(['人民路', '中山路', '解放路', '建设路', '滨江路', '学府路', '锦绣路', '凯旋路', '长安街', '环城路', '文昌路', '龙腾大道'])
  return `${city}${district}${road}${randInt(1, 999)}号`
}

function buildHotelImages() {
  const base = [
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=80',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80',
    'https://images.unsplash.com/photo-1551887373-6a42a9c1b1c2?w=1200&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=80',
  ]
  const selected = Array.from(new Set([pick(base), pick(base), pick(base)])).slice(0, randInt(1, 3))
  return selected
}

function buildRoomTemplates() {
  return [
    { name: '标准大床房', bed_type: '1.8m大床', size: 28 },
    { name: '标准双床房', bed_type: '2×1.2m双床', size: 30 },
    { name: '高级大床房', bed_type: '1.8m大床', size: 32 },
    { name: '亲子房', bed_type: '1.8m大床+儿童床', size: 38 },
    { name: '行政套房', bed_type: '1.8m大床', size: 55 },
  ]
}

async function main() {
  await initDB()
  await sequelize.sync()
  await ensureSchema()

  const owner = await ensureSeedMerchant()

  const existingCount = await Hotel.count({ where: { owner_id: owner.id } })
  const target = 100
  const need = Math.max(0, target - existingCount)
  if (need === 0) {
    console.log('No seed needed; hotels already >= 100 for merchant.')
    process.exit(0)
  }

  const startIndex = existingCount + 1
  const now = new Date()
  const roomTemplates = buildRoomTemplates()
  const createdHotels = []

  for (let i = 0; i < need; i++) {
    const seq = startIndex + i
    const imgs = buildHotelImages()
    const hotel = await Hotel.create({
      owner_id: owner.id,
      name: buildHotelName(seq),
      address: buildAddress(),
      latitude: randFloat(18.2, 40.1, 6),
      longitude: randFloat(102.0, 121.7, 6),
      listed: true,
      unlist_reason: null,
      status: Math.random() < 0.12 ? 'closed' : 'operating',
      rating: randFloat(3.8, 5.0, 1),
      star_level: randInt(0, 5),
      description: pick([
        '地理位置优越，交通便利，适合商务出行与休闲度假。',
        '主打舒适睡眠体验，配套齐全，提供贴心服务。',
        '近地铁/商圈，适合短途旅行与家庭出游。',
        '安静私密，提供自助入住与管家服务。',
      ]),
      image_urls: JSON.stringify(imgs),
      image_url: imgs.length > 0 ? imgs[0] : null,
    })
    createdHotels.push(hotel)

    const roomCount = randInt(2, 5)
    const roomRows = []
    for (let r = 0; r < roomCount; r++) {
      const tpl = pick(roomTemplates)
      const base = randInt(199, 1299)
      const stock = randInt(4, 30)
      const facilities = pick([
        ['空调', '衣柜', '书桌'],
        ['空调', '书桌', '投影'],
        ['空调', '衣柜', '沙发', '迷你吧'],
        ['空调', '书桌', '电热水壶'],
      ])
      roomRows.push({
        hotel_id: hotel.id,
        name: tpl.name,
        base_price: base,
        total_stock: stock,
        description: pick(['采光充足，适合商务出行。', '空间宽敞，适合家庭出游。', '舒适安静，适合休闲度假。']),
        status: hotel.listed ? 'available' : 'offline',
        audit_status: 'approved',
        audit_reason: null,
        offline_reason: null,
        bed_type: tpl.bed_type,
        room_size_sqm: tpl.size + randInt(-2, 6),
        floor_info: `${randInt(2, 6)}-${randInt(8, 18)}层`,
        has_wifi: true,
        has_window: Math.random() < 0.9,
        has_housekeeping: true,
        is_non_smoking: Math.random() < 0.85,
        includes_breakfast: Math.random() < 0.35,
        guest_facilities: JSON.stringify(facilities),
        food_drink: JSON.stringify(pick([['瓶装水'], ['咖啡/茶包', '瓶装水']])),
        furniture: JSON.stringify(pick([['床头柜', '行李架'], ['床头柜', '沙发', '行李架']])),
        bathroom_facilities: JSON.stringify(pick([['淋浴', '吹风机'], ['淋浴', '浴缸', '吹风机']])),
        image_urls: JSON.stringify([]),
        image_url: null,
      })
    }
    const createdRooms = await RoomType.bulkCreate(roomRows)

    const inventories = []
    for (const rt of createdRooms) {
      for (let d = -30; d < 30; d++) {
        const date = new Date(now)
        date.setDate(date.getDate() + d)
        inventories.push({
          room_type_id: rt.id,
          date: dayKey(date),
          price: rt.base_price,
          available_stock: rt.total_stock,
          status: 'available',
        })
      }
    }
    await RoomDailyInventory.bulkCreate(inventories)
  }

  console.log(`Seeded hotels: ${createdHotels.length}, rooms: OK`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

