// 数据格式化模块
// 提供日期、价格、时间等数据的格式化方法

/**
 * 格式化日期为 YYYY-MM-DD
 */
export function formatDate(date) {
    if (typeof date === 'string') {
        return date;
    }

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * 格式化为可读的日期字符串
 */
export function formatReadableDate(date) {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];

    return `${month}月${day}日 周${weekday}`;
}

/**
 * 获取距离指定日期的天数
 */
export function getDaysFromDate(date) {
    const d = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    const diffTime = d - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '明天';
    if (diffDays === -1) return '昨天';

    return `${diffDays > 0 ? '' : ''}${diffDays}天`;
}

/**
 * 计算两个日期之间的天数
 */
export function calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(1, diffDays);
}

/**
 * 格式化价格
 */
export function formatPrice(price) {
    if (!price) return '¥0';

    const numPrice = Number(price);
    return `¥${numPrice.toFixed(0)}`;
}

/**
 * 格式化价格范围
 */
export function formatPriceRange(minPrice, maxPrice) {
    if (minPrice === maxPrice) {
        return formatPrice(minPrice);
    }

    return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
}

/**
 * 格式化时间为 HH:mm
 */
export function formatTime(time) {
    if (typeof time === 'string') {
        const [hour, minute] = time.split(':');
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }

    return time;
}

/**
 * 格式化星级显示
 */
export function formatStarRating(rating) {
    return Array(5).fill().map((_, i) => i < rating ? '★' : '☆').join('');
}

/**
 * 格式化订单状态
 */
export function formatOrderStatus(status) {
    const statusMap = {
        'pending': '待确认',
        'confirmed': '已确认',
        'checked_in': '已入住',
        'checked_out': '已离店',
        'cancelled': '已取消',
        'completed': '已完成',
        'no_show': '未入住'
    };

    return statusMap[status] || status;
}



/**
 * 截断文本
 */
export function truncateText(text, length = 30) {
    if (!text || text.length <= length) {
        return text;
    }

    return text.slice(0, length) + '...';
}

/**
 * 格式化电话号码
 */
export function formatPhone(phone) {
    if (!phone || phone.length !== 11) {
        return phone;
    }

    return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
}

/**
 * 隐藏电话号码中间位数
 */
export function maskPhone(phone) {
    if (!phone || phone.length !== 11) {
        return phone;
    }

    return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}
