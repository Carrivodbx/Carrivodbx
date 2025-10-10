import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["client", "agency"] }).notNull(),
  fullName: text("full_name"),
  phone: text("phone"),
  region: text("region"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationTokenHash: text("verification_token_hash"),
  verificationTokenExpires: timestamp("verification_token_expires"),
  resetTokenHash: text("reset_token_hash"),
  resetTokenExpires: timestamp("reset_token_expires"),
  resetChannel: text("reset_channel", { enum: ["email", "sms"] }),
  resetTarget: text("reset_target"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agencies = pgTable("agencies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  logo: text("logo"),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  category: text("category").notNull(),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  cashDepositAllowed: boolean("cash_deposit_allowed").default(false),
  region: text("region").notNull(),
  description: text("description"),
  photo: text("photo"),
  thumbnail: text("thumbnail"), // Small thumbnail for list view
  photos: text("photos").array(),
  available: boolean("available").default(true),
  seats: integer("seats"),
  horsepower: integer("horsepower"),
  maxKilometers: integer("max_kilometers"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  agencyId: varchar("agency_id").notNull().references(() => agencies.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reservations = pgTable("reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  days: integer("days").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: ["pending", "paid", "completed", "cancelled"] }).default("pending"),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  depositMethod: text("deposit_method", { enum: ["credit_card", "bank_transfer"] }),
  depositStatus: text("deposit_status", { enum: ["pending", "held", "refunded"] }).default("pending"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  userId: varchar("user_id").notNull().references(() => users.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  agencyId: varchar("agency_id").notNull().references(() => agencies.id),
  active: boolean("active").default(false),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  userId: varchar("user_id").notNull().references(() => users.id),
  agencyId: varchar("agency_id").notNull().references(() => agencies.id),
  reservationId: varchar("reservation_id").references(() => reservations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type", { enum: ["reservation", "payment", "review", "general"] }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  reservationId: varchar("reservation_id").notNull().references(() => reservations.id),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Session table managed by express-session / connect-pg-simple
export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(), // JSON stored as text
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [users.id],
    references: [agencies.userId],
  }),
  reservations: many(reservations),
  reviews: many(reviews),
  favorites: many(favorites),
  notifications: many(notifications),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
}));

export const agenciesRelations = relations(agencies, ({ one, many }) => ({
  user: one(users, {
    fields: [agencies.userId],
    references: [users.id],
  }),
  vehicles: many(vehicles),
  subscription: one(subscriptions, {
    fields: [agencies.id],
    references: [subscriptions.agencyId],
  }),
  reviews: many(reviews),
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [vehicles.agencyId],
    references: [agencies.id],
  }),
  reservations: many(reservations),
  favorites: many(favorites),
}));

export const reservationsRelations = relations(reservations, ({ one, many }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [reservations.vehicleId],
    references: [vehicles.id],
  }),
  reviews: many(reviews),
  messages: many(messages),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  agency: one(agencies, {
    fields: [subscriptions.agencyId],
    references: [agencies.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  agency: one(agencies, {
    fields: [reviews.agencyId],
    references: [agencies.id],
  }),
  reservation: one(reservations, {
    fields: [reviews.reservationId],
    references: [reservations.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [favorites.vehicleId],
    references: [vehicles.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
  reservation: one(reservations, {
    fields: [messages.reservationId],
    references: [reservations.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
  emailVerified: true,
  verificationTokenHash: true,
  verificationTokenExpires: true,
  resetTokenHash: true,
  resetTokenExpires: true,
  resetChannel: true,
  resetTarget: true,
});

export const insertAgencySchema = createInsertSchema(agencies).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const updateVehicleSchema = insertVehicleSchema.partial().omit({
  agencyId: true, // Cannot change agency
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Agency = typeof agencies.$inferSelect;
export type InsertAgency = z.infer<typeof insertAgencySchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
