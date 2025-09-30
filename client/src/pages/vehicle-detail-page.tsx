import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Star, ArrowLeft, Calendar, Shield, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle, Agency } from "@shared/schema";
import racingCarsBackground from "@assets/stock_images/two_luxury_sports_ca_818417ae.jpg";

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: vehicle, isLoading: vehicleLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", id],
    queryFn: async () => {
      const response = await fetch(`/api/vehicles/${id}`);
      if (!response.ok) throw new Error("Failed to fetch vehicle");
      return response.json();
    },
    enabled: !!id,
  });

  const handleBooking = () => {
    if (!user) {
      setLocation("/auth");
      return;
    }
    
    if (user.role !== "client") {
      setLocation("/auth");
      return;
    }

    setLocation(`/booking/${id}`);
  };

  if (vehicleLoading) {
    return (
      <div className="min-h-screen relative overflow-x-hidden">
        {/* Background Image */}
        <div className="fixed inset-0 z-0">
          <img 
            src={racingCarsBackground}
            alt="Two luxury sports cars racing" 
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
        <div className="pt-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Skeleton className="h-96 rounded-2xl" />
              <div className="space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen relative overflow-x-hidden">
        {/* Background Image */}
        <div className="fixed inset-0 z-0">
          <img 
            src={racingCarsBackground}
            alt="Two luxury sports cars racing" 
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

  const features = [
    { icon: Shield, label: "Assurance complète incluse" },
    { icon: Zap, label: "Assistance 24h/24" },
    { icon: Calendar, label: "Annulation flexible" },
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={racingCarsBackground}
          alt="Two luxury sports cars racing" 
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setLocation("/vehicles")}
            className="mb-8 text-muted-foreground hover:text-primary"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2" size={20} />
            Retour aux véhicules
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            
            {/* Vehicle Image */}
            <div className="relative">
              <img
                src={vehicle.photo || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-96 lg:h-[500px] object-cover rounded-2xl"
                data-testid="img-vehicle-main"
              />
              <div className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-accent to-secondary text-accent-foreground">
                  {vehicle.category}
                </Badge>
              </div>
              {vehicle.available && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-500 text-white">
                    Disponible
                  </Badge>
                </div>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-orbitron font-bold text-foreground mb-2" data-testid="text-vehicle-title">
                  {vehicle.title}
                </h1>
                <p className="text-xl text-muted-foreground mb-4">
                  {vehicle.brand} {vehicle.model}
                </p>
                
                <div className="flex items-center space-x-6 text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <MapPin className="mr-2" size={20} />
                    <span data-testid="text-vehicle-region">{vehicle.region}</span>
                  </div>
                  {vehicle.seats && (
                    <div className="flex items-center">
                      <Users className="mr-2" size={20} />
                      <span data-testid="text-vehicle-seats">{vehicle.seats} places</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Star className="mr-2 text-accent" size={20} />
                    <span>4.8 (24 avis)</span>
                  </div>
                </div>
              </div>

              <div className="glass-morphism rounded-2xl p-6 neon-border">
                <div className="text-center mb-4">
                  <span className="text-4xl font-orbitron font-bold text-primary" data-testid="text-vehicle-price">
                    €{vehicle.pricePerDay}
                  </span>
                  <span className="text-muted-foreground text-lg">/jour</span>
                </div>
                
                {vehicle.available ? (
                  <Button
                    onClick={handleBooking}
                    className="btn-neon w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-4 text-lg font-bold"
                    data-testid="button-book-vehicle"
                  >
                    <Calendar className="mr-2" size={20} />
                    Réserver maintenant
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="w-full py-4 text-lg font-bold"
                    data-testid="button-unavailable"
                  >
                    Non disponible
                  </Button>
                )}
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Commission Carivoo : 10% • Paiement sécurisé
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center text-muted-foreground">
                    <feature.icon className="mr-3 text-accent" size={20} />
                    <span>{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <Card className="glass-morphism neon-border mb-12">
            <CardHeader>
              <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed" data-testid="text-vehicle-description">
                {vehicle.description || "Description non disponible pour ce véhicule."}
              </p>
            </CardContent>
          </Card>

          {/* Agency Info */}
          <Card className="glass-morphism neon-border">
            <CardHeader>
              <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
                À propos de l'agence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Agence Premium</h3>
                  <p className="text-muted-foreground">Spécialiste des véhicules de luxe</p>
                  <div className="flex items-center mt-2">
                    <Star className="text-accent mr-1" size={16} />
                    <span className="text-sm">4.9 • Agence vérifiée</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
