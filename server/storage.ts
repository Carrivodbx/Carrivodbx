import {
  users,
  agencies,
  vehicles,
  reservations,
  subscriptions,
  reviews,
  favorites,
  notifications,
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
  type Review,
  type InsertReview,
  type Favorite,
  type InsertFavorite,
  type Notification,
  type InsertNotification,
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
  getVehicleWithAgency(id: string): Promise<(Vehicle & { agency?: Agency }) | undefined>;
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

  // Review operations
  getReviewsByAgency(agencyId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, review: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: string): Promise<void>;

  // Favorite operations
  getFavoritesByUser(userId: string): Promise<Favorite[]>;
  checkFavorite(userId: string, vehicleId: string): Promise<Favorite | undefined>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: string): Promise<void>;

  // Notification operations
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<Notification>;
  deleteNotification(id: string): Promise<void>;

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

  async getVehicleWithAgency(id: string): Promise<(Vehicle & { agency?: Agency }) | undefined> {
    const result = await db
      .select({
        vehicle: vehicles,
        agency: agencies,
      })
      .from(vehicles)
      .leftJoin(agencies, eq(vehicles.agencyId, agencies.id))
      .where(eq(vehicles.id, id))
      .limit(1);

    if (!result.length) return undefined;

    const { vehicle, agency } = result[0];
    return { ...vehicle, agency: agency || undefined };
  }

  async getVehicleInfoWithAgency(id: string): Promise<(Omit<Vehicle, 'photos' | 'photo'> & { firstPhoto?: string; agency?: Agency }) | undefined> {
    const result = await db
      .select({
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
        firstPhoto: sql<string>`CASE WHEN photos IS NOT NULL AND array_length(photos, 1) > 0 THEN photos[1] ELSE photo END`.as('firstPhoto'),
        available: vehicles.available,
        seats: vehicles.seats,
        horsepower: vehicles.horsepower,
        maxKilometers: vehicles.maxKilometers,
        latitude: vehicles.latitude,
        longitude: vehicles.longitude,
        agencyId: vehicles.agencyId,
        createdAt: vehicles.createdAt,
        agency: agencies,
      })
      .from(vehicles)
      .leftJoin(agencies, eq(vehicles.agencyId, agencies.id))
      .where(eq(vehicles.id, id))
      .limit(1);

    if (!result.length) return undefined;

    const row = result[0];
    return {
      id: row.id,
      title: row.title,
      brand: row.brand,
      model: row.model,
      year: row.year,
      category: row.category,
      pricePerDay: row.pricePerDay,
      depositAmount: row.depositAmount,
      cashDepositAllowed: row.cashDepositAllowed,
      region: row.region,
      description: row.description,
      firstPhoto: row.firstPhoto || undefined,
      available: row.available,
      seats: row.seats,
      horsepower: row.horsepower,
      maxKilometers: row.maxKilometers,
      latitude: row.latitude,
      longitude: row.longitude,
      agencyId: row.agencyId,
      createdAt: row.createdAt,
      agency: row.agency || undefined,
    };
  }

  async getVehiclePhotos(id: string): Promise<{ photos: string[] } | undefined> {
    const [result] = await db
      .select({
        photo: vehicles.photo,
        photos: vehicles.photos,
      })
      .from(vehicles)
      .where(eq(vehicles.id, id))
      .limit(1);

    if (!result) return undefined;

    const photos = result.photos && result.photos.length > 0 
      ? result.photos 
      : result.photo 
      ? [result.photo] 
      : [];

    return { photos };
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
    // Use CASE to handle NULL arrays and only extract first element when array exists
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
      photos: sql<string[]>`CASE WHEN photos IS NOT NULL AND array_length(photos, 1) > 0 THEN ARRAY[photos[1]] ELSE NULL END`.as('photos'),
      available: vehicles.available,
      seats: vehicles.seats,
      horsepower: vehicles.horsepower,
      maxKilometers: vehicles.maxKilometers,
      latitude: vehicles.latitude,
      longitude: vehicles.longitude,
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

  // Review operations
  async getReviewsByAgency(agencyId: string): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.agencyId, agencyId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(insertReview).returning();
    return review;
  }

  async updateReview(id: string, updateReview: Partial<InsertReview>): Promise<Review> {
    const [review] = await db
      .update(reviews)
      .set(updateReview)
      .where(eq(reviews.id, id))
      .returning();
    return review;
  }

  async deleteReview(id: string): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // Favorite operations
  async getFavoritesByUser(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(desc(favorites.createdAt));
  }

  async checkFavorite(userId: string, vehicleId: string): Promise<Favorite | undefined> {
    const [favorite] = await db.select().from(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.vehicleId, vehicleId))
    );
    return favorite || undefined;
  }

  async createFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const [favorite] = await db.insert(favorites).values(insertFavorite).returning();
    return favorite;
  }

  async deleteFavorite(id: string): Promise<void> {
    await db.delete(favorites).where(eq(favorites.id, id));
  }

  // Notification operations
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }
}

export const storage = new DatabaseStorage();
