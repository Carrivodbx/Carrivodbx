import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { setupAuth } from "./auth";
import { insertVehicleSchema, updateVehicleSchema, insertReservationSchema, insertAgencySchema, insertReviewSchema, insertFavoriteSchema, insertNotificationSchema, insertMessageSchema, reviews, favorites } from "@shared/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { getChatResponse } from "./openai-chat";
import { z } from "zod";
import { compressBase64Image, compressImageArray, createThumbnail } from './utils/image-compression';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-11-20.acacia" as any,
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const { region, category } = req.query;
      const vehicles = await storage.searchVehicles(
        region as string,
        category as string
      );
      
      // Photos array already optimized at DB level (only first photo loaded)
      res.json(vehicles);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching vehicles: " + error.message });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicleWithAgency(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching vehicle: " + error.message });
    }
  });

  app.get("/api/vehicles/:id/info", async (req, res) => {
    try {
      const vehicleInfo = await storage.getVehicleInfoWithAgency(req.params.id);
      if (!vehicleInfo) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicleInfo);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching vehicle info: " + error.message });
    }
  });

  app.get("/api/vehicles/:id/photos", async (req, res) => {
    try {
      const photos = await storage.getVehiclePhotos(req.params.id);
      if (!photos) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(photos);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching vehicle photos: " + error.message });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      if (user.role !== "agency") {
        return res.status(403).json({ message: "Only agencies can create vehicles" });
      }

      const agency = await storage.getAgencyByUserId(user.id);
      if (!agency) {
        return res.status(400).json({ message: "Agency profile not found" });
      }

      // Validate first
      const vehicleData = insertVehicleSchema.parse({
        ...req.body,
        agencyId: agency.id,
      });

      // Then compress validated images and generate thumbnail
      if (vehicleData.photo) {
        vehicleData.photo = await compressBase64Image(vehicleData.photo);
        vehicleData.thumbnail = await createThumbnail(vehicleData.photo);
      }
      if (vehicleData.photos && Array.isArray(vehicleData.photos)) {
        vehicleData.photos = await compressImageArray(vehicleData.photos);
      }

      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating vehicle: " + error.message });
    }
  });

  app.put("/api/vehicles/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const agency = await storage.getAgencyByUserId(user.id);
      if (!agency || agency.id !== vehicle.agencyId) {
        return res.status(403).json({ message: "Unauthorized to modify this vehicle" });
      }

      // Validate update data with schema
      const updateData = updateVehicleSchema.parse(req.body);

      // Compress validated images and generate thumbnail
      if (updateData.photo) {
        updateData.photo = await compressBase64Image(updateData.photo);
        updateData.thumbnail = await createThumbnail(updateData.photo);
      }
      if (updateData.photos && Array.isArray(updateData.photos)) {
        updateData.photos = await compressImageArray(updateData.photos);
      }

      const updatedVehicle = await storage.updateVehicle(req.params.id, updateData);
      res.json(updatedVehicle);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating vehicle: " + error.message });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const agency = await storage.getAgencyByUserId(user.id);
      if (!agency || agency.id !== vehicle.agencyId) {
        return res.status(403).json({ message: "Unauthorized to delete this vehicle" });
      }

      await storage.deleteVehicle(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: "Error deleting vehicle: " + error.message });
    }
  });

  // Agency routes
  // Public agency route - get agency by ID
  app.get("/api/agencies/:id", async (req, res) => {
    try {
      const agency = await storage.getAgency(req.params.id);
      if (!agency) {
        return res.status(404).json({ message: "Agency not found" });
      }
      res.json(agency);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching agency: " + error.message });
    }
  });

  // Public route - get all vehicles for a specific agency
  app.get("/api/agencies/:id/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehiclesByAgency(req.params.id);
      
      // Optimize: only send first photo in list view
      const optimizedVehicles = vehicles.map(vehicle => ({
        ...vehicle,
        photos: vehicle.photos && vehicle.photos.length > 0 ? [vehicle.photos[0]] : vehicle.photo ? [vehicle.photo] : []
      }));
      
      res.json(optimizedVehicles);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching agency vehicles: " + error.message });
    }
  });

  app.get("/api/agency/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      const agency = await storage.getAgencyByUserId(user.id);
      res.json(agency);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching agency profile: " + error.message });
    }
  });

  app.post("/api/agency/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      if (user.role !== "agency") {
        return res.status(403).json({ message: "Only agencies can create agency profiles" });
      }

      const agencyData = insertAgencySchema.parse({
        ...req.body,
        userId: user.id,
      });

      const agency = await storage.createAgency(agencyData);
      res.status(201).json(agency);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating agency profile: " + error.message });
    }
  });

  app.get("/api/agency/vehicles", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      const agency = await storage.getAgencyByUserId(user.id);
      if (!agency) {
        return res.status(400).json({ message: "Agency profile not found" });
      }

      const vehicles = await storage.getVehiclesByAgency(agency.id);
      res.json(vehicles);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching agency vehicles: " + error.message });
    }
  });

  app.get("/api/agency/reservations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      const agency = await storage.getAgencyByUserId(user.id);
      if (!agency) {
        return res.status(400).json({ message: "Agency profile not found" });
      }

      const reservations = await storage.getReservationsByAgency(agency.id);
      
      // Enrich reservations with vehicle and user data
      const enrichedReservations = await Promise.all(
        reservations.map(async (reservation) => {
          const vehicle = await storage.getVehicle(reservation.vehicleId);
          const client = await storage.getUser(reservation.userId);
          return {
            ...reservation,
            vehicle,
            user: client,
          };
        })
      );
      
      res.json(enrichedReservations);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching agency reservations: " + error.message });
    }
  });

  // Reservation routes
  app.get("/api/reservations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      const reservations = await storage.getReservationsByUser(user.id);
      
      // Enrich reservations with vehicle and agency data
      const enrichedReservations = await Promise.all(
        reservations.map(async (reservation) => {
          const vehicle = await storage.getVehicle(reservation.vehicleId);
          let vehicleWithAgency: any = vehicle;
          
          if (vehicle) {
            const agency = await storage.getAgency(vehicle.agencyId);
            vehicleWithAgency = { ...vehicle, agency };
          }
          
          return {
            ...reservation,
            vehicle: vehicleWithAgency,
          };
        })
      );
      
      res.json(enrichedReservations);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching reservations: " + error.message });
    }
  });

  app.post("/api/reservations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      if (user.role !== "client") {
        return res.status(403).json({ message: "Only clients can create reservations" });
      }

      const { vehicleId, startDate, endDate } = req.body;

      // Fetch vehicle to get accurate pricing
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      // Calculate days and total server-side
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (days <= 0) {
        return res.status(400).json({ message: "Invalid date range" });
      }

      const pricePerDay = parseFloat(vehicle.pricePerDay);
      const total = days * pricePerDay;

      const reservationData = insertReservationSchema.parse({
        vehicleId,
        startDate,
        endDate,
        days,
        total: total.toString(),
        depositAmount: "0",
        depositMethod: "credit_card",
        depositStatus: "pending",
        status: "pending",
        userId: user.id,
      });

      const reservation = await storage.createReservation(reservationData);
      res.status(201).json(reservation);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating reservation: " + error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured. Please add STRIPE_SECRET_KEY." });
    }

    try {
      const { reservationId } = req.body;
      const user = req.user!;
      
      // Fetch reservation and verify ownership
      const reservation = await storage.getReservation(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      
      if (reservation.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized: This reservation does not belong to you" });
      }
      
      // Use the actual reservation amount from the database
      const amount = parseFloat(reservation.total);
      
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid reservation amount" });
      }
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "eur",
        metadata: {
          reservationId,
          userId: user.id,
        },
      });

      // Store PaymentIntent ID with reservation
      await storage.updateReservationPaymentIntent(reservationId, paymentIntent.id);

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post("/api/confirm-payment", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured. Please add STRIPE_SECRET_KEY." });
    }

    try {
      const { reservationId } = req.body;
      const user = req.user!;
      
      // Verify reservation ownership
      const reservation = await storage.getReservation(reservationId);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
      
      if (reservation.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized: This reservation does not belong to you" });
      }

      // Verify we have a PaymentIntent ID stored
      if (!reservation.stripePaymentIntentId) {
        return res.status(400).json({ message: "No payment intent found for this reservation" });
      }
      
      // Retrieve the specific PaymentIntent from Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(reservation.stripePaymentIntentId);
      
      // Verify payment succeeded and amount matches
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment has not succeeded yet" });
      }

      const expectedAmountInCents = Math.round(parseFloat(reservation.total) * 100);
      if (paymentIntent.amount !== expectedAmountInCents) {
        return res.status(400).json({ message: "Payment amount mismatch" });
      }

      // Verify metadata matches
      if (paymentIntent.metadata.reservationId !== reservationId || 
          paymentIntent.metadata.userId !== user.id) {
        return res.status(400).json({ message: "Payment metadata mismatch" });
      }
      
      // Update reservation status only if all checks pass
      await storage.updateReservationStatus(reservationId, "paid");
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error confirming payment: " + error.message });
    }
  });

  // Premium subscription routes
  app.post("/api/create-subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!stripe) {
      return res.status(500).json({ message: "Stripe not configured. Please add STRIPE_SECRET_KEY." });
    }

    try {
      const user = req.user!;
      if (user.role !== "agency") {
        return res.status(403).json({ message: "Only agencies can subscribe" });
      }

      const agency = await storage.getAgencyByUserId(user.id);
      if (!agency) {
        return res.status(400).json({ message: "Agency profile not found" });
      }

      let stripeCustomerId = user.stripeCustomerId;

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: agency.name,
        });
        stripeCustomerId = customer.id;
        await storage.updateUserStripeInfo(user.id, stripeCustomerId);
      }

      const subscription = await stripe!.subscriptions.create({
        customer: stripeCustomerId,
        items: [{
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Carivoo Premium',
              description: 'Abonnement Premium pour visibilité accrue',
            },
            unit_amount: 2999,
            recurring: {
              interval: 'month',
            },
          } as any,
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.createSubscription({
        agencyId: agency.id,
        active: false,
        stripeSubscriptionId: subscription.id,
      });

      await storage.updateUserStripeInfo(user.id, stripeCustomerId, subscription.id);

      res.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating subscription: " + error.message });
    }
  });

  app.post("/api/confirm-subscription", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      const agency = await storage.getAgencyByUserId(user.id);
      if (!agency) {
        return res.status(400).json({ message: "Agency profile not found" });
      }

      const subscription = await storage.getSubscriptionByAgency(agency.id);
      if (subscription) {
        await storage.updateSubscription(subscription.id, { active: true });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: "Error confirming subscription: " + error.message });
    }
  });

  // Review routes
  app.get("/api/agencies/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByAgency(req.params.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching reviews: " + error.message });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating review: " + error.message });
    }
  });

  app.put("/api/reviews/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const [review] = await db.select().from(reviews).where(eq(reviews.id, req.params.id)).limit(1);
      if (!review || review.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only edit your own reviews" });
      }

      const reviewUpdateSchema = z.object({
        rating: z.number().int().min(1).max(5).optional(),
        comment: z.string().optional(),
      }).refine(data => data.rating !== undefined || data.comment !== undefined, {
        message: "At least one field (rating or comment) must be provided",
      });
      const updateData = reviewUpdateSchema.parse(req.body);
      
      const updatedReview = await storage.updateReview(req.params.id, updateData);
      res.json(updatedReview);
    } catch (error: any) {
      res.status(400).json({ message: "Error updating review: " + error.message });
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const [review] = await db.select().from(reviews).where(eq(reviews.id, req.params.id)).limit(1);
      if (!review || review.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only delete your own reviews" });
      }

      await storage.deleteReview(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: "Error deleting review: " + error.message });
    }
  });

  // Favorite routes
  app.get("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const favorites = await storage.getFavoritesByUser(req.user!.id);
      res.json(favorites);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching favorites: " + error.message });
    }
  });

  app.get("/api/favorites/check/:vehicleId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const favorite = await storage.checkFavorite(req.user!.id, req.params.vehicleId);
      res.json({ isFavorite: !!favorite, favoriteId: favorite?.id });
    } catch (error: any) {
      res.status(500).json({ message: "Error checking favorite: " + error.message });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const favoriteData = insertFavoriteSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const favorite = await storage.createFavorite(favoriteData);
      res.status(201).json(favorite);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating favorite: " + error.message });
    }
  });

  app.delete("/api/favorites/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const [favorite] = await db.select().from(favorites).where(eq(favorites.id, req.params.id)).limit(1);
      if (!favorite || favorite.userId !== req.user!.id) {
        return res.status(403).json({ message: "You can only delete your own favorites" });
      }

      await storage.deleteFavorite(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: "Error deleting favorite: " + error.message });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const notifications = await storage.getNotificationsByUser(req.user!.id);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching notifications: " + error.message });
    }
  });

  app.post("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const notificationData = insertNotificationSchema.parse({
        ...req.body,
        userId: req.user!.id,
      });

      const notification = await storage.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error: any) {
      res.status(400).json({ message: "Error creating notification: " + error.message });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const notification = await storage.markNotificationAsRead(req.params.id);
      res.json(notification);
    } catch (error: any) {
      res.status(400).json({ message: "Error marking notification as read: " + error.message });
    }
  });

  app.delete("/api/notifications/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      await storage.deleteNotification(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: "Error deleting notification: " + error.message });
    }
  });

  // Message routes
  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: user.id,
      });

      // Verify that the user is part of this reservation (either client or agency owner)
      const reservation = await storage.getReservation(messageData.reservationId);
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      const vehicle = await storage.getVehicle(reservation.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const agency = await storage.getAgency(vehicle.agencyId);
      if (!agency) {
        return res.status(404).json({ message: "Agency not found" });
      }

      // Check if user is authorized (either the client who made the reservation or the agency that owns the vehicle)
      if (reservation.userId !== user.id && agency.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized to send message for this reservation" });
      }

      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ message: "Error sending message: " + error.message });
    }
  });

  app.get("/api/reservations/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      const reservation = await storage.getReservation(req.params.id);
      
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      const vehicle = await storage.getVehicle(reservation.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }

      const agency = await storage.getAgency(vehicle.agencyId);
      if (!agency) {
        return res.status(404).json({ message: "Agency not found" });
      }

      // Check if user is authorized to view messages
      if (reservation.userId !== user.id && agency.userId !== user.id) {
        return res.status(403).json({ message: "Unauthorized to view messages for this reservation" });
      }

      const messages = await storage.getMessagesByReservation(req.params.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching messages: " + error.message });
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const message = await storage.markMessageAsRead(req.params.id);
      res.json(message);
    } catch (error: any) {
      res.status(400).json({ message: "Error marking message as read: " + error.message });
    }
  });

  // AI Chat route
  const chatSchema = z.object({
    messages: z.array(z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })),
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = chatSchema.parse(req.body);
      const response = await getChatResponse(messages);
      res.json({ message: response });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid request format", errors: error.issues });
      }
      res.status(500).json({ message: error.message || "Erreur lors de la communication avec l'assistant" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
