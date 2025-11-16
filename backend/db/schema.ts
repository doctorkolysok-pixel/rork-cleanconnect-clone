import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  role: text("role", { enum: ["client", "cleaner", "courier", "admin", "partner"] })
    .notNull()
    .default("client"),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  rating: real("rating").notNull().default(5.0),
  balance: real("balance").notNull().default(0),
  cleanPoints: integer("clean_points").notNull().default(50),
  level: integer("level").notNull().default(1),
  completedOrders: integer("completed_orders").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const cleanerProfiles = sqliteTable("cleaner_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  businessName: text("business_name").notNull(),
  address: text("address").notNull(),
  description: text("description"),
  isEco: integer("is_eco", { mode: "boolean" }).notNull().default(false),
  tier: text("tier", {
    enum: ["novice", "verified", "premium", "corporate"],
  })
    .notNull()
    .default("novice"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  category: text("category", {
    enum: ["clothing", "furniture", "shoes", "carpets", "cleaning", "strollers"],
  }).notNull(),
  photos: text("photos").notNull(),
  comment: text("comment").notNull(),
  address: text("address").notNull(),
  priceOffer: real("price_offer").notNull(),
  urgency: text("urgency", {
    enum: ["standard", "fast", "urgent", "express"],
  })
    .notNull()
    .default("standard"),
  status: text("status", {
    enum: [
      "new",
      "offers_received",
      "in_progress",
      "courier_to_partner",
      "at_partner",
      "partner_working",
      "partner_done",
      "courier_to_client",
      "completed",
      "cancelled",
    ],
  })
    .notNull()
    .default("new"),
  chosenCleanerId: text("chosen_cleaner_id"),
  partnerId: text("partner_id").references(() => users.id),
  courierId: text("courier_id").references(() => users.id),
  aiAnalysis: text("ai_analysis"),
  commission: text("commission"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
});

export const offers = sqliteTable("offers", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  cleanerId: text("cleaner_id")
    .notNull()
    .references(() => users.id),
  proposedPrice: real("proposed_price").notNull(),
  comment: text("comment").notNull(),
  eta: text("eta").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  fromId: text("from_id")
    .notNull()
    .references(() => users.id),
  toId: text("to_id")
    .notNull()
    .references(() => users.id),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  cleanerId: text("cleaner_id")
    .notNull()
    .references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  photos: text("photos"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const charityOrders = sqliteTable("charity_orders", {
  id: text("id").primaryKey(),
  donorId: text("donor_id")
    .notNull()
    .references(() => users.id),
  recipientName: text("recipient_name").notNull(),
  category: text("category", {
    enum: ["clothing", "furniture", "shoes", "carpets", "cleaning", "strollers"],
  }).notNull(),
  description: text("description").notNull(),
  status: text("status", {
    enum: ["pending", "approved", "in_progress", "completed"],
  })
    .notNull()
    .default("pending"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const partnerProfiles = sqliteTable("partner_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  businessName: text("business_name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  description: text("description"),
  services: text("services").notNull(),
  workingHours: text("working_hours"),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  visibilityRating: real("visibility_rating").notNull().default(100),
  totalEarnings: real("total_earnings").notNull().default(0),
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const partnerServices = sqliteTable("partner_services", {
  id: text("id").primaryKey(),
  partnerId: text("partner_id")
    .notNull()
    .references(() => users.id),
  serviceName: text("service_name").notNull(),
  category: text("category", {
    enum: ["clothing", "furniture", "shoes", "carpets", "cleaning", "strollers"],
  }).notNull(),
  price: real("price").notNull(),
  description: text("description"),
  estimatedTime: text("estimated_time").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  priceQualityIndicator: text("price_quality_indicator", {
    enum: ["low", "optimal", "premium"],
  })
    .notNull()
    .default("optimal"),
  avgMarketPrice: real("avg_market_price"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const courierProfiles = sqliteTable("courier_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  vehicleType: text("vehicle_type", {
    enum: ["bike", "scooter", "car", "van"],
  }).notNull(),
  city: text("city").notNull(),
  isOnline: integer("is_online", { mode: "boolean" }).notNull().default(false),
  isVerified: integer("is_verified", { mode: "boolean" }).notNull().default(false),
  currentLatitude: real("current_latitude"),
  currentLongitude: real("current_longitude"),
  totalDeliveries: integer("total_deliveries").notNull().default(0),
  totalEarnings: real("total_earnings").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const courierDeliveries = sqliteTable("courier_deliveries", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  courierId: text("courier_id")
    .notNull()
    .references(() => users.id),
  type: text("type", {
    enum: ["to_partner", "to_client"],
  }).notNull(),
  status: text("status", {
    enum: ["assigned", "accepted", "picked_up", "in_transit", "delivered", "cancelled"],
  })
    .notNull()
    .default("assigned"),
  pickupAddress: text("pickup_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  pickupLatitude: real("pickup_latitude"),
  pickupLongitude: real("pickup_longitude"),
  deliveryLatitude: real("delivery_latitude"),
  deliveryLongitude: real("delivery_longitude"),
  estimatedTime: text("estimated_time"),
  actualPickupTime: text("actual_pickup_time"),
  actualDeliveryTime: text("actual_delivery_time"),
  price: real("price").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const orderPhotos = sqliteTable("order_photos", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  partnerId: text("partner_id")
    .notNull()
    .references(() => users.id),
  type: text("type", {
    enum: ["before", "after"],
  }).notNull(),
  photoUrl: text("photo_url").notNull(),
  comment: text("comment"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const orderHistory = sqliteTable("order_history", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  action: text("action").notNull(),
  performedBy: text("performed_by")
    .notNull()
    .references(() => users.id),
  details: text("details"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const partnerFinances = sqliteTable("partner_finances", {
  id: text("id").primaryKey(),
  partnerId: text("partner_id")
    .notNull()
    .references(() => users.id),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  amount: real("amount").notNull(),
  platformFee: real("platform_fee").notNull(),
  netAmount: real("net_amount").notNull(),
  status: text("status", {
    enum: ["pending", "paid", "cancelled"],
  })
    .notNull()
    .default("pending"),
  paidAt: text("paid_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const courierFinances = sqliteTable("courier_finances", {
  id: text("id").primaryKey(),
  courierId: text("courier_id")
    .notNull()
    .references(() => users.id),
  deliveryId: text("delivery_id")
    .notNull()
    .references(() => courierDeliveries.id),
  amount: real("amount").notNull(),
  platformFee: real("platform_fee").notNull(),
  netAmount: real("net_amount").notNull(),
  status: text("status", {
    enum: ["pending", "paid", "cancelled"],
  })
    .notNull()
    .default("pending"),
  paidAt: text("paid_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
