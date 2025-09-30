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
  category: text("category").notNull(),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }),
  region: text("region").notNull(),
  description: text("description"),
  photo: text("photo"),
  available: boolean("available").default(true),
  seats: integer("seats"),
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

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [users.id],
    references: [agencies.userId],
  }),
  reservations: many(reservations),
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
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [vehicles.agencyId],
    references: [agencies.id],
  }),
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  user: one(users, {
    fields: [reservations.userId],
    references: [users.id],
  }),
  vehicle: one(vehicles, {
    fields: [reservations.vehicleId],
    references: [vehicles.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  agency: one(agencies, {
    fields: [subscriptions.agencyId],
    references: [agencies.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  stripeCustomerId: true,
  stripeSubscriptionId: true,
});

export const insertAgencySchema = createInsertSchema(agencies).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
});

export const insertReservationSchema = createInsertSchema(reservations).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
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
