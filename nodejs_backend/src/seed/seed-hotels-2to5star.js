// src/seed/seed-reset-hotels.js
/**
 * 重置并重新种子（开发环境专用）
 *
 * 使用方法（在项目根目录运行）：
 *  1) 在确认是开发库且已备份数据的情况下运行：
 *     RESET_DB=true node src/seed/seed-reset-hotels.js
 *
 *  2) 若使用 npm script:
 *     "seed:reset": "node src/seed/seed-reset-hotels.js"
 *     然后运行：
 *     RESET_DB=true npm run seed:reset
 *
 * 脚本会在 NODE_ENV=production 时拒绝执行以防误删线上数据。
 */

import bcrypt from 'bcryptjs'
import { initDB } from '../config/db.js'
import { ensureSchema } from '../config/ensureSchema.js'
import { sequelize, User, Hotel, RoomType, RoomDailyInventory } from '../models/index.js'

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randNum = (min, max, digits = 1) => Number((Math.random() * (max - min) + min).toFixed(digits))
const randFloat = randNum
const dayKey = (d) => d.toISOString().split('T')[0]

async function ensureSeedMerchant() {
    const existing = await User.findOne({ where: { username: 'merchant' } })
    if (existing) return existing
    return User.create({
        username: 'merchant',
        password_hash: await bcrypt.hash('123456', 10),
        name: 'Merchant User',
        role: 'merchant',
        status: 'active',
    })
}

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
    try {
        // 安全保护：不允许在生产环境运行
        if (process.env.NODE_ENV === 'production') {
            console.error('Refusing to run reset in production environment (NODE_ENV=production).')
            process.exit(1)
        }
        // 必须显式允许重置
        if (process.env.RESET_DB !== 'true') {
            console.error('要执行清空并重建数据库，请在运行前设置环境变量 RESET_DB=true 。例如：');
            console.error('  RESET_DB=true node src/seed/seed-reset-hotels.js');
            process.exit(1)
        }

        await initDB()
        await sequelize.authenticate()
        console.log('Database connected. DB name:', process.env.DB_NAME || process.env.DB_DATABASE || 'unknown')

        // 强制删除所有表并重建（会丢失所有数据）
        console.log('⚠️  running sequelize.sync({ force: true }) -> DROPPING and RECREATING ALL TABLES')
        await sequelize.sync({ force: true })
        console.log('Database synced (force).')

        await ensureSchema()
        console.log('Database schema ensured.')

        const owner = await ensureSeedMerchant()
        console.log(`Merchant user: ${owner.username}`)

        // 目标数量
        const target = 100
        const need = target // we just reset, 所以全部重建

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
        process.exit(0)
    } catch (e) {
        console.error('❌ Seed error:', e)
        process.exit(1)
    }
}

main()
