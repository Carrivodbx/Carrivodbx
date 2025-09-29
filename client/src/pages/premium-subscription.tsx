import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, TrendingUp, Users, Crown, ArrowLeft, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import type { Subscription } from "@shared/schema";

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

interface SubscriptionFormProps {
  clientSecret: string;
  onSuccess: () => void;
}

function SubscriptionForm({ clientSecret, onSuccess }: SubscriptionFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmSubscriptionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/confirm-subscription");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency"] });
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
          return_url: window.location.origin + "/premium",
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
        confirmSubscriptionMutation.mutate();
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-morphism rounded-2xl p-6 neon-border">
        <h3 className="text-lg font-orbitron font-bold mb-4 text-foreground">
          Informations de paiement
        </h3>
        <PaymentElement />
      </div>
      
      <Button
        type="submit"
        disabled={!stripe || isProcessing || confirmSubscriptionMutation.isPending}
        className="btn-neon w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-4 text-lg font-bold"
        data-testid="button-confirm-subscription"
      >
        {isProcessing || confirmSubscriptionMutation.isPending ? (
          "Traitement en cours..."
        ) : (
          <>
            <CreditCard className="mr-2" size={20} />
            Confirmer l'abonnement
          </>
        )}
      </Button>
    </form>
  );
}

export default function PremiumSubscription() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [step, setStep] = useState<"features" | "payment" | "success">("features");

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ["/api/agency/subscription"],
    queryFn: async () => {
      const response = await fetch("/api/agency/subscription");
      if (!response.ok) throw new Error("Failed to fetch subscription");
      return response.json();
    },
    enabled: !!user && user.role === "agency",
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-subscription");
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
      setStep("payment");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = () => {
    createSubscriptionMutation.mutate();
  };

  const handleSubscriptionSuccess = () => {
    setStep("success");
    toast({
      title: "Abonnement activé !",
      description: "Votre abonnement Premium a été activé avec succès",
    });
  };

  if (!user || user.role !== "agency") {
    setLocation("/auth");
    return null;
  }

  if (step === "success") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 bg-background">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="glass-morphism rounded-2xl p-12 neon-border">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-orbitron font-bold text-foreground mb-4">
                Bienvenue dans Premium !
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Votre abonnement Premium a été activé. Profitez de tous les avantages exclusifs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setLocation("/dashboard/agency")}
                  className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  data-testid="button-go-to-dashboard"
                >
                  Aller au tableau de bord
                </Button>
                <Button
                  onClick={() => setStep("features")}
                  variant="outline"
                  data-testid="button-view-features"
                >
                  Voir les fonctionnalités
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: TrendingUp,
      title: "Mise en avant prioritaire",
      description: "Vos véhicules apparaissent en premier dans les résultats de recherche",
    },
    {
      icon: Star,
      title: "Badge Premium",
      description: "Badge distinctif sur tous vos véhicules pour attirer plus de clients",
    },
    {
      icon: Users,
      title: "Analytics avancées",
      description: "Statistiques détaillées sur vos performances et vos réservations",
    },
    {
      icon: Crown,
      title: "Support prioritaire",
      description: "Assistance dédiée et réponse prioritaire à vos demandes",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard/agency")}
            className="mb-8 text-muted-foreground hover:text-primary"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2" size={20} />
            Retour au tableau de bord
          </Button>

          {step === "features" ? (
            <>
              {/* Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-orbitron font-bold mb-6">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Carivoo Premium
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Boostez votre visibilité et maximisez vos réservations avec notre plan Premium
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                
                {/* Features */}
                <div>
                  <h2 className="text-2xl font-orbitron font-bold text-foreground mb-6">
                    Fonctionnalités Premium
                  </h2>
                  <div className="space-y-6">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                          <feature.icon className="text-white" size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                          <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Card */}
                <div>
                  <Card className="glass-morphism neon-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Crown className="text-white" size={24} />
                      </div>
                      <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
                        Plan Premium
                      </CardTitle>
                      <div className="text-center">
                        <span className="text-4xl font-orbitron font-bold text-primary">€29,99</span>
                        <span className="text-muted-foreground">/mois</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center text-foreground">
                          <Check className="mr-3 text-green-500" size={20} />
                          <span>Mise en avant prioritaire</span>
                        </div>
                        <div className="flex items-center text-foreground">
                          <Check className="mr-3 text-green-500" size={20} />
                          <span>Badge Premium visible</span>
                        </div>
                        <div className="flex items-center text-foreground">
                          <Check className="mr-3 text-green-500" size={20} />
                          <span>Analytics détaillées</span>
                        </div>
                        <div className="flex items-center text-foreground">
                          <Check className="mr-3 text-green-500" size={20} />
                          <span>Support prioritaire</span>
                        </div>
                        <div className="flex items-center text-foreground">
                          <Check className="mr-3 text-green-500" size={20} />
                          <span>Annulation à tout moment</span>
                        </div>
                      </div>

                      {subscription?.active ? (
                        <div className="text-center p-4 bg-green-500/20 rounded-lg border border-green-500">
                          <Badge className="bg-green-500 text-white mb-2">
                            <Crown className="mr-1" size={16} />
                            Abonnement actif
                          </Badge>
                          <p className="text-sm text-green-400">
                            Vous profitez déjà de tous les avantages Premium
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={handleSubscribe}
                          disabled={createSubscriptionMutation.isPending}
                          className="btn-neon w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-4 text-lg font-bold"
                          data-testid="button-subscribe"
                        >
                          {createSubscriptionMutation.isPending ? (
                            "Préparation..."
                          ) : (
                            <>
                              <Crown className="mr-2" size={20} />
                              Passer au Premium
                            </>
                          )}
                        </Button>
                      )}

                      <p className="text-center text-sm text-muted-foreground">
                        Paiement sécurisé • Annulation à tout moment
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Benefits Section */}
              <Card className="glass-morphism neon-border">
                <CardHeader>
                  <CardTitle className="text-2xl font-orbitron font-bold text-foreground text-center">
                    Pourquoi choisir Premium ?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div>
                      <div className="text-3xl font-orbitron font-bold text-primary mb-2">+300%</div>
                      <p className="text-muted-foreground">Augmentation moyenne de la visibilité</p>
                    </div>
                    <div>
                      <div className="text-3xl font-orbitron font-bold text-secondary mb-2">+150%</div>
                      <p className="text-muted-foreground">Plus de réservations en moyenne</p>
                    </div>
                    <div>
                      <div className="text-3xl font-orbitron font-bold text-accent mb-2">24h</div>
                      <p className="text-muted-foreground">Support prioritaire sous 24h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : step === "payment" && clientSecret ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-orbitron font-bold text-foreground mb-4">
                  Finaliser votre abonnement
                </h1>
                <p className="text-muted-foreground">
                  Dernière étape pour accéder à tous les avantages Premium
                </p>
              </div>

              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscriptionForm
                  clientSecret={clientSecret}
                  onSuccess={handleSubscriptionSuccess}
                />
              </Elements>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center">
              <Card className="glass-morphism neon-border">
                <CardContent className="p-6">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-muted-foreground">Préparation de votre abonnement...</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
