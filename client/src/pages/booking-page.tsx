import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowLeft, CreditCard, Shield, Check, Building2 } from "lucide-react";
import porscheNightBackground from "@assets/stock_images/porsche_rear_view_ba_b54491f8.jpg";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { Vehicle } from "@shared/schema";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface CheckoutFormProps {
  reservationId: string;
  total: number;
  onSuccess: () => void;
}

function CheckoutForm({ reservationId, total, onSuccess }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmPaymentMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/confirm-payment", { reservationId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations"] });
      onSuccess();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard/client",
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Erreur de paiement",
          description: error.message,
          variant: "destructive",
        });
      } else {
        confirmPaymentMutation.mutate();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Premium Payment Card */}
      <div className="relative">
        {/* Elegant decorative corner elements */}
        <div className="absolute -top-2 -left-2 w-16 h-16 border-l-2 border-t-2 border-zinc-400/30"></div>
        <div className="absolute -top-2 -right-2 w-16 h-16 border-r-2 border-t-2 border-zinc-400/30"></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 border-l-2 border-b-2 border-zinc-400/30"></div>
        <div className="absolute -bottom-2 -right-2 w-16 h-16 border-r-2 border-b-2 border-zinc-400/30"></div>
        
        <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-900 rounded-xl p-8 border border-zinc-700/50 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-zinc-100 tracking-wide">
              PAIEMENT SÉCURISÉ
            </h3>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Shield className="w-4 h-4" />
              <span>SSL 256-bit</span>
            </div>
          </div>
          
          {/* Payment Element with custom styling */}
          <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
            <PaymentElement 
              options={{
                layout: "tabs",
              }}
            />
          </div>
          
          {/* Payment methods badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span>Carte bancaire</span>
            </div>
            <div className="h-4 w-px bg-zinc-700"></div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
              <span>Apple Pay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Total and Confirm */}
      <div className="bg-gradient-to-br from-zinc-950 via-black to-zinc-900 rounded-xl p-6 border border-zinc-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-medium text-zinc-300">Montant total</span>
          <span className="text-3xl font-bold text-zinc-100">€{total.toFixed(2)}</span>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent mb-4"></div>
        <p className="text-sm text-zinc-500 mb-6 text-center">
          Commission plateforme incluse • Paiement traité par Stripe
        </p>
        
        <Button
          type="submit"
          disabled={!stripe || isProcessing || confirmPaymentMutation.isPending}
          className="w-full bg-zinc-100 hover:bg-white text-black font-bold py-6 text-lg rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          data-testid="button-confirm-payment"
        >
          {isProcessing || confirmPaymentMutation.isPending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin w-5 h-5 border-3 border-black border-t-transparent rounded-full mr-3" />
              Traitement en cours...
            </div>
          ) : (
            <>
              <CreditCard className="mr-3" size={20} />
              Confirmer le paiement de €{total.toFixed(2)}
            </>
          )}
        </Button>
        
        {/* Security badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Remboursable</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Crypté</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Sécurisé</span>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function BookingPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [days, setDays] = useState(0);
  const [total, setTotal] = useState(0);
  const [clientSecret, setClientSecret] = useState("");
  const [reservationId, setReservationId] = useState("");
  const [step, setStep] = useState<"booking" | "payment" | "success">("booking");
  const [depositMethod, setDepositMethod] = useState<"credit_card" | "bank_transfer">("credit_card");
  const depositAmount = total * 0.2;

  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", vehicleId],
    queryFn: async () => {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (!response.ok) throw new Error("Failed to fetch vehicle");
      return response.json();
    },
    enabled: !!vehicleId,
  });

  const createReservationMutation = useMutation({
    mutationFn: async (reservationData: any) => {
      const response = await apiRequest("POST", "/api/reservations", reservationData);
      return response.json();
    },
    onSuccess: (reservation) => {
      setReservationId(reservation.id);
      createPaymentIntentMutation.mutate({
        reservationId: reservation.id,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (paymentData: { reservationId: string }) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", paymentData);
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setStep("payment");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de paiement",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate days and total when dates change
  useEffect(() => {
    if (startDate && endDate && vehicle) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        setDays(diffDays);
        setTotal(diffDays * parseFloat(vehicle.pricePerDay));
      } else {
        setDays(0);
        setTotal(0);
      }
    }
  }, [startDate, endDate, vehicle]);

  const handleBooking = () => {
    if (!startDate || !endDate || days <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner des dates valides",
        variant: "destructive",
      });
      return;
    }

    createReservationMutation.mutate({
      vehicleId,
      startDate,
      endDate,
      depositMethod,
    });
  };

  const handlePaymentSuccess = () => {
    setStep("success");
    toast({
      title: "Paiement réussi !",
      description: "Votre réservation a été confirmée avec succès",
    });
  };

  if (!user || user.role !== "client") {
    setLocation("/auth");
    return null;
  }

  if (vehicleLoading) {
    return (
      <div className="min-h-screen relative overflow-x-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-20 right-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
          <div className="absolute bottom-40 left-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
        </div>

        <Navbar />
        <div className="pt-20 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen relative overflow-x-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-20 right-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
          <div className="absolute bottom-40 left-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
        </div>

        <Navbar />
        <div className="pt-20 bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Véhicule non trouvé</h1>
            <Button onClick={() => setLocation("/vehicles")} data-testid="button-back-to-vehicles">
              Retour aux véhicules
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen relative overflow-x-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-20 right-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
          <div className="absolute bottom-40 left-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
        </div>

        <Navbar />
        <div className="pt-20 bg-background">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="glass-morphism rounded-2xl p-12 neon-border">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-orbitron font-bold text-foreground mb-4">
                Réservation Confirmée !
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Votre réservation pour le {vehicle.title} a été confirmée avec succès.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setLocation("/dashboard/client")}
                  className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  data-testid="button-view-reservations"
                >
                  Voir mes réservations
                </Button>
                <Button
                  onClick={() => setLocation("/vehicles")}
                  variant="outline"
                  data-testid="button-continue-browsing"
                >
                  Continuer à explorer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={porscheNightBackground}
          alt="Porsche rear view night city" 
          className="w-full h-full object-cover opacity-5" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
      </div>

      {/* Subtle Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-20 right-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
        <div className="absolute bottom-40 left-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
      </div>

      <Navbar />
      
      <div className="pt-20 bg-background relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setLocation(`/vehicles/${vehicleId}`)}
            className="mb-8 text-muted-foreground hover:text-primary"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2" size={20} />
            Retour au véhicule
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Vehicle Summary */}
            <div>
              <Card className="glass-morphism neon-border mb-6">
                <CardHeader>
                  <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
                    Résumé de réservation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-6">
                    <img
                      src={vehicle.photo || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"}
                      alt={vehicle.title}
                      className="w-20 h-20 object-cover rounded-lg"
                      data-testid="img-vehicle-summary"
                    />
                    <div>
                      <h3 className="text-xl font-orbitron font-bold text-foreground" data-testid="text-vehicle-title">
                        {vehicle.title}
                      </h3>
                      <p className="text-muted-foreground">{vehicle.brand} {vehicle.model}</p>
                      <p className="text-muted-foreground">{vehicle.region}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 border-t border-border pt-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Prix par jour</span>
                      <span className="font-medium text-foreground">€{vehicle.pricePerDay}</span>
                    </div>
                    {days > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nombre de jours</span>
                          <span className="font-medium text-foreground" data-testid="text-booking-days">{days}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sous-total</span>
                          <span className="font-medium text-foreground">€{(days * parseFloat(vehicle.pricePerDay)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Commission Carivoo (10%)</span>
                          <span className="font-medium text-foreground">€{(total * 0.1).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-accent">
                          <span className="text-muted-foreground">Caution (20%)</span>
                          <span className="font-medium text-accent">€{(total * 0.2).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-3">
                          <span className="text-lg font-bold text-foreground">Total</span>
                          <span className="text-2xl font-orbitron font-bold text-primary" data-testid="text-total-price">
                            €{total.toFixed(2)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Safety Features */}
              <Card className="glass-morphism neon-border">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <Shield className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Paiement sécurisé</h3>
                      <p className="text-sm text-muted-foreground">
                        Vos données sont protégées par le chiffrement SSL
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking/Payment Form */}
            <div>
              {step === "booking" ? (
                <Card className="glass-morphism neon-border">
                  <CardHeader>
                    <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
                      Détails de réservation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="start-date" className="text-foreground">Date de début</Label>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="bg-muted border-border text-foreground"
                          data-testid="input-start-date"
                        />
                      </div>
                      <div>
                        <Label htmlFor="end-date" className="text-foreground">Date de fin</Label>
                        <Input
                          id="end-date"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate || new Date().toISOString().split('T')[0]}
                          className="bg-muted border-border text-foreground"
                          data-testid="input-end-date"
                        />
                      </div>
                    </div>

                    {days > 0 && (
                      <>
                        <div className="glass-morphism rounded-lg p-4 border border-border">
                          <p className="text-center text-lg font-medium text-foreground">
                            Durée de location : <span className="font-bold text-primary">{days} jour{days > 1 ? 's' : ''}</span>
                          </p>
                        </div>

                        {/* Deposit Section */}
                        <div className="border-t border-border pt-6">
                          <Label className="text-lg font-orbitron font-bold text-foreground mb-4 block">
                            Caution de garantie
                          </Label>
                          <p className="text-sm text-muted-foreground mb-4">
                            Une caution de 20% du montant total est requise (€{depositAmount.toFixed(2)})
                          </p>
                          
                          <div className="grid grid-cols-1 gap-4">
                            <button
                              type="button"
                              onClick={() => setDepositMethod("credit_card")}
                              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                depositMethod === "credit_card"
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                              data-testid="button-deposit-credit-card"
                            >
                              <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  depositMethod === "credit_card"
                                    ? "bg-gradient-to-r from-primary to-secondary"
                                    : "bg-muted"
                                }`}>
                                  <CreditCard className="text-white" size={24} />
                                </div>
                                <div className="text-left flex-1">
                                  <h4 className="font-bold text-foreground">Carte bancaire</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Caution bloquée puis restituée à la fin de la location
                                  </p>
                                </div>
                                {depositMethod === "credit_card" && (
                                  <Check className="text-primary" size={24} />
                                )}
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDepositMethod("bank_transfer")}
                              className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                depositMethod === "bank_transfer"
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                              data-testid="button-deposit-bank-transfer"
                            >
                              <div className="flex items-center space-x-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  depositMethod === "bank_transfer"
                                    ? "bg-gradient-to-r from-primary to-secondary"
                                    : "bg-muted"
                                }`}>
                                  <Building2 className="text-white" size={24} />
                                </div>
                                <div className="text-left flex-1">
                                  <h4 className="font-bold text-foreground">Virement bancaire</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Caution versée par virement, restituée sous 72h
                                  </p>
                                </div>
                                {depositMethod === "bank_transfer" && (
                                  <Check className="text-primary" size={24} />
                                )}
                              </div>
                            </button>
                          </div>
                        </div>
                      </>
                    )}

                    <Button
                      onClick={handleBooking}
                      disabled={!startDate || !endDate || days <= 0 || createReservationMutation.isPending}
                      className="btn-neon w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-4 text-lg font-bold"
                      data-testid="button-proceed-to-payment"
                    >
                      {createReservationMutation.isPending ? (
                        "Création de la réservation..."
                      ) : (
                        <>
                          <Calendar className="mr-2" size={20} />
                          Procéder au paiement
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : step === "payment" && clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm
                    reservationId={reservationId}
                    total={total}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <Card className="glass-morphism neon-border">
                  <CardContent className="p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-muted-foreground">Préparation du paiement...</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
