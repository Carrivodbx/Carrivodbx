import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertVehicleSchema, insertReservationSchema, insertAgencySchema } from "@shared/schema";
import Stripe from "stripe";
import { getChatResponse } from "./openai-chat";
import { z } from "zod";

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
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching vehicle: " + error.message });
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

      const vehicleData = insertVehicleSchema.parse({
        ...req.body,
        agencyId: agency.id,
      });

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

      const updatedVehicle = await storage.updateVehicle(req.params.id, req.body);
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

  // Reservation routes
  app.get("/api/reservations", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = req.user!;
      const reservations = await storage.getReservationsByUser(user.id);
      res.json(reservations);
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
            product: 'prod_carivoo_premium',
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
