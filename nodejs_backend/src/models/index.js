import { sequelize } from '../config/db.js'
import { User } from './User.js'
import { Hotel } from './Hotel.js'
import { RoomType } from './RoomType.js'
import { RoomDailyInventory } from './RoomDailyInventory.js'
import { Order } from './Order.js'
import { Transaction } from './Transaction.js'
import { Schedule } from './Schedule.js'
import { Review } from './Review.js'
import { Announcement } from './Announcement.js'
import { ChatConversation } from './ChatConversation.js'
import { ChatMessage } from './ChatMessage.js'
import { Promotion } from './Promotion.js'
import { Notification } from './Notification.js'
import { HotelListingRequest } from './HotelListingRequest.js'
import { Banner } from './Banner.js'
import { HotelRegistrationRequest } from './HotelRegistrationRequest.js'
import { ActivityEnrollment } from './ActivityEnrollment.js'
import { ActivityRoomPrice } from './ActivityRoomPrice.js'

User.hasMany(Hotel, { foreignKey: 'owner_id', as: 'Hotels' })
Hotel.belongsTo(User, { foreignKey: 'owner_id', as: 'Owner' })

ChatConversation.belongsTo(User, { foreignKey: 'user_id' })
ChatConversation.hasMany(ChatMessage, { foreignKey: 'conversation_id' })
ChatMessage.belongsTo(ChatConversation, { foreignKey: 'conversation_id' })

Promotion.belongsTo(User, { foreignKey: 'merchant_id' })
Promotion.belongsTo(Hotel, { foreignKey: 'hotel_id' })

User.hasMany(Notification, { foreignKey: 'user_id' })
Notification.belongsTo(User, { foreignKey: 'user_id' })

Hotel.hasMany(RoomType, { foreignKey: 'hotel_id' })
RoomType.belongsTo(Hotel, { foreignKey: 'hotel_id' })

RoomType.hasMany(RoomDailyInventory, { foreignKey: 'room_type_id' })
RoomDailyInventory.belongsTo(RoomType, { foreignKey: 'room_type_id' })

Hotel.hasMany(Order, { foreignKey: 'hotel_id' })
RoomType.hasMany(Order, { foreignKey: 'room_type_id' })
Order.belongsTo(Hotel, { foreignKey: 'hotel_id' })
Order.belongsTo(RoomType, { foreignKey: 'room_type_id' })

Order.hasOne(Transaction, { foreignKey: 'order_id' })
Transaction.belongsTo(Order, { foreignKey: 'order_id' })

User.hasMany(Schedule, { foreignKey: 'user_id' })
Schedule.belongsTo(User, { foreignKey: 'user_id' })

Hotel.hasMany(Review, { foreignKey: 'hotel_id' })
Review.belongsTo(Hotel, { foreignKey: 'hotel_id' })

Hotel.hasMany(HotelListingRequest, { foreignKey: 'hotel_id' })
HotelListingRequest.belongsTo(Hotel, { foreignKey: 'hotel_id' })
User.hasMany(HotelListingRequest, { foreignKey: 'merchant_id' })
HotelListingRequest.belongsTo(User, { foreignKey: 'merchant_id', as: 'Merchant' })

User.hasMany(HotelRegistrationRequest, { foreignKey: 'merchant_id' })
HotelRegistrationRequest.belongsTo(User, { foreignKey: 'merchant_id', as: 'Merchant' })

User.hasMany(ActivityEnrollment, { foreignKey: 'merchant_id' })
ActivityEnrollment.belongsTo(User, { foreignKey: 'merchant_id', as: 'Merchant' })
Hotel.hasMany(ActivityEnrollment, { foreignKey: 'hotel_id' })
ActivityEnrollment.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'Hotel' })

Hotel.hasMany(ActivityRoomPrice, { foreignKey: 'hotel_id' })
RoomType.hasMany(ActivityRoomPrice, { foreignKey: 'room_type_id' })
ActivityRoomPrice.belongsTo(Hotel, { foreignKey: 'hotel_id', as: 'Hotel' })
ActivityRoomPrice.belongsTo(RoomType, { foreignKey: 'room_type_id', as: 'RoomType' })
ActivityRoomPrice.belongsTo(User, { foreignKey: 'merchant_id', as: 'Merchant' })

export {
  sequelize,
  User, Hotel, RoomType, RoomDailyInventory, Order, Transaction, Schedule, Review, Announcement, ChatConversation, ChatMessage, Promotion, Notification, HotelListingRequest, HotelRegistrationRequest, Banner, ActivityEnrollment, ActivityRoomPrice
}
