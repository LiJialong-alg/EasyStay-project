export const HOTELS = [
    { id: 1, name: '海景度假酒店', address: '三亚市亚龙湾度假区', status: '营业中', rating: 4.8 },
    { id: 2, name: '山间民宿', address: '莫干山风景区', status: '休息中', rating: 4.9 },
    { id: 3, name: '城市商务酒店', address: '北京市朝阳区CBD', status: '营业中', rating: 4.6 }
];

export const ROOM_TYPES = {
    1: [ // 海景
        { id: 101, name: '豪华大床房', price: 1200, stock: 5, status: 'available' },
        { id: 102, name: '双床房', price: 1350, stock: 3, status: 'available' },
        { id: 103, name: '海景套房', price: 2800, stock: 1, status: 'sold_out' },
        { id: 104, name: '亲子房', price: 1500, stock: 4, status: 'available' }
    ],
    2: [ // 山间
        { id: 201, name: '观山大床房', price: 800, stock: 8, status: 'available' },
        { id: 202, name: '家庭套房', price: 1200, stock: 2, status: 'available' }
    ],
    3: [ // 城市
        { id: 301, name: '商务大床房', price: 500, stock: 10, status: 'available' },
        { id: 302, name: '行政套房', price: 880, stock: 5, status: 'available' }
    ]
};

export const ORDERS = [
    { id: 'ORD-20240201-001', customer: '张三', hotelId: 1, roomType: '豪华大床房', dates: ['2024-02-10', '2024-02-12'], amount: 2400, status: 'pending' },
    { id: 'ORD-20240201-002', customer: '李四', hotelId: 1, roomType: '海景套房', dates: ['2024-02-11', '2024-02-12'], amount: 2800, status: 'confirmed' },
    { id: 'ORD-20240201-003', customer: '王五', hotelId: 3, roomType: '商务大床房', dates: ['2024-02-10', '2024-02-15'], amount: 2500, status: 'checked_in' },
    { id: 'ORD-20240201-004', customer: '赵六', hotelId: 2, roomType: '观山大床房', dates: ['2024-02-14', '2024-02-15'], amount: 800, status: 'cancelled' },
];