import {
  users,
  agencies,
  vehicles,
  reservations,
  subscriptions,
  type User,
  type InsertUser,
  type Agency,
  type InsertAgency,
  type Vehicle,
  type InsertVehicle,
  type Reservation,
  type InsertReservation,
  type Subscription,
  type InsertSubscription,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, like, or, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;

  // Agency operations
  getAgency(id: string): Promise<Agency | undefined>;
  getAgencyByUserId(userId: string): Promise<Agency | undefined>;
  createAgency(agency: InsertAgency): Promise<Agency>;
  updateAgency(id: string, agency: Partial<InsertAgency>): Promise<Agency>;

  // Vehicle operations
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehiclesByAgency(agencyId: string): Promise<Vehicle[]>;
  searchVehicles(region?: string, category?: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;

  // Reservation operations
  getReservation(id: string): Promise<Reservation | undefined>;
  getReservationsByUser(userId: string): Promise<Reservation[]>;
  getReservationsByVehicle(vehicleId: string): Promise<Reservation[]>;
  createReservation(reservation: InsertReservation): Promise<Reservation>;
  updateReservationStatus(id: string, status: string): Promise<Reservation>;
  updateReservationPaymentIntent(id: string, paymentIntentId: string): Promise<Reservation>;

  // Subscription operations
  getSubscriptionByAgency(agencyId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: string, subscription: Partial<InsertSubscription>): Promise<Subscription>;

  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        ...(stripeSubscriptionId && { stripeSubscriptionId }),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Agency operations
  async getAgency(id: string): Promise<Agency | undefined> {
    const [agency] = await db.select().from(agencies).where(eq(agencies.id, id));
    return agency || undefined;
  }

  async getAgencyByUserId(userId: string): Promise<Agency | undefined> {
    const [agency] = await db.select().from(agencies).where(eq(agencies.userId, userId));
    return agency || undefined;
  }

  async createAgency(insertAgency: InsertAgency): Promise<Agency> {
    const [agency] = await db.insert(agencies).values(insertAgency).returning();
    return agency;
  }

  async updateAgency(id: string, updateAgency: Partial<InsertAgency>): Promise<Agency> {
    const [agency] = await db
      .update(agencies)
      .set(updateAgency)
      .where(eq(agencies.id, id))
      .returning();
    return agency;
  }

  // Vehicle operations
  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.available, true)).orderBy(desc(vehicles.createdAt));
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async getVehiclesByAgency(agencyId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.agencyId, agencyId)).orderBy(desc(vehicles.createdAt));
  }

  async searchVehicles(region?: string, category?: string): Promise<Vehicle[]> {
    const conditions = [eq(vehicles.available, true)];
    
    if (region) {
      conditions.push(like(vehicles.region, `%${region}%`));
    }
    
    if (category) {
      conditions.push(eq(vehicles.category, category));
    }
    
    // Optimize: load only first photo for list view to reduce payload size
    // PostgreSQL array indexing: photos[1] gets first element (1-indexed in PostgreSQL)
    return await db.select({
      id: vehicles.id,
      title: vehicles.title,
      brand: vehicles.brand,
      model: vehicles.model,
      year: vehicles.year,
      category: vehicles.category,
      pricePerDay: vehicles.pricePerDay,
      depositAmount: vehicles.depositAmount,
      cashDepositAllowed: vehicles.cashDepositAllowed,
      region: vehicles.region,
      description: vehicles.description,
      photo: vehicles.photo, // Keep legacy photo field
      photos: sql<string[]>`ARRAY[photos[1]]`.as('photos'), // Only first photo from array
      available: vehicles.available,
      seats: vehicles.seats,
      horsepower: vehicles.horsepower,
      maxKilometers: vehicles.maxKilometers,
      agencyId: vehicles.agencyId,
      createdAt: vehicles.createdAt,
    }).from(vehicles).where(and(...conditions)).orderBy(desc(vehicles.createdAt));
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db.insert(vehicles).values(insertVehicle).returning();
    return vehicle;
  }

  async updateVehicle(id: string, updateVehicle: Partial<InsertVehicle>): Promise<Vehicle> {
    const [vehicle] = await db
      .update(vehicles)
      .set(updateVehicle)
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle;
  }

  async deleteVehicle(id: string): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Reservation operations
  async getReservation(id: string): Promise<Reservation | undefined> {
    const [reservation] = await db.select().from(reservations).where(eq(reservations.id, id));
    return reservation || undefined;
  }

  async getReservationsByUser(userId: string): Promise<Reservation[]> {
    return await db.select().from(reservations).where(eq(reservations.userId, userId)).orderBy(desc(reservations.createdAt));
  }

  async getReservationsByVehicle(vehicleId: string): Promise<Reservation[]> {
    return await db.select().from(reservations).where(eq(reservations.vehicleId, vehicleId)).orderBy(desc(reservations.createdAt));
  }

  async createReservation(insertReservation: InsertReservation): Promise<Reservation> {
    const [reservation] = await db.insert(reservations).values(insertReservation).returning();
    return reservation;
  }

  async updateReservationStatus(id: string, status: string): Promise<Reservation> {
    const [reservation] = await db
      .update(reservations)
      .set({ status: status as any })
      .where(eq(reservations.id, id))
      .returning();
    return reservation;
  }

  async updateReservationPaymentIntent(id: string, paymentIntentId: string): Promise<Reservation> {
    const [reservation] = await db
      .update(reservations)
      .set({ stripePaymentIntentId: paymentIntentId })
      .where(eq(reservations.id, id))
      .returning();
    return reservation;
  }

  // Subscription operations
  async getSubscriptionByAgency(agencyId: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.agencyId, agencyId));
    return subscription || undefined;
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();
    return subscription;
  }

  async updateSubscription(id: string, updateSubscription: Partial<InsertSubscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set(updateSubscription)
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }
}

export const storage = new DatabaseStorage();
