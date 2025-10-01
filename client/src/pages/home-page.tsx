import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import VehicleCard from "@/components/vehicle-card";
import Footer from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { Shield, Crown, Zap, ChartLine, Users, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import type { Vehicle } from "@shared/schema";
import video1 from "@assets/5309378-hd_1920_1080_25fps_1759286916838.mp4";
import video2 from "@assets/5309319-hd_1920_1080_25fps_1759286936761.mp4";
import video3 from "@assets/5309381-hd_1920_1080_25fps_1759286956209.mp4";
import video4 from "@assets/3066451-uhd_4096_2160_24fps_1759286966291.mp4";

export default function HomePage() {
  const [, setLocation] = useLocation();
  
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
    queryFn: async () => {
      const response = await fetch("/api/vehicles");
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      return response.json();
    },
  });

  const featuredVehicles = vehicles?.slice(0, 6) || [];

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-orbitron font-bold mb-4 sm:mb-6 px-4">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Pourquoi Choisir Carivoo ?
              </span>
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              La plateforme de référence pour la location de véhicules de luxe. 
              Simplicité, sécurité et style premium.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="glass-morphism rounded-2xl p-6 sm:p-8 text-center neon-border hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl font-orbitron font-bold mb-3 sm:mb-4 text-foreground">Sécurité Garantie</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Toutes nos agences sont vérifiées. Assurance complète et assistance 24h/24.
              </p>
            </div>
            
            <div className="glass-morphism rounded-2xl p-6 sm:p-8 text-center neon-border hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Crown className="text-white" size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl font-orbitron font-bold mb-3 sm:mb-4 text-foreground">Véhicules Premium</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Collection exclusive de voitures de luxe, sportives et SUV haut de gamme.
              </p>
            </div>
            
            <div className="glass-morphism rounded-2xl p-6 sm:p-8 text-center neon-border hover:scale-105 transition-transform duration-300">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Zap className="text-white" size={24} />
              </div>
              <h3 className="text-xl sm:text-2xl font-orbitron font-bold mb-3 sm:mb-4 text-foreground">Réservation Instant</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Réservez en quelques clics avec paiement sécurisé et confirmation immédiate.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-12 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-orbitron font-bold mb-4 sm:mb-6 px-4">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Véhicules en Vedette
              </span>
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground px-4">
              Découvrez notre sélection de véhicules d'exception
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="glass-morphism rounded-2xl h-80 sm:h-96 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-8 sm:mt-12 px-4">
            <Button
              onClick={() => setLocation("/vehicles")}
              className="btn-neon w-full sm:w-auto bg-transparent border-2 border-primary text-primary px-6 sm:px-8 py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 min-h-[48px]"
              data-testid="button-view-more-vehicles"
            >
              Voir plus de véhicules
            </Button>
          </div>
        </div>
      </section>

      {/* Video Gallery */}
      <section className="py-12 sm:py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-orbitron font-bold mb-4 sm:mb-6 px-4">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                L'Expérience Carivoo
              </span>
            </h2>
            <p className="text-base sm:text-xl text-muted-foreground px-4">
              Découvrez nos véhicules de luxe en mouvement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group overflow-hidden rounded-2xl neon-border glass-morphism">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-110"
              >
                <source src={video1} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl font-orbitron font-bold mb-2">Performance & Style</h3>
                  <p className="text-sm text-gray-200">Vivez l'expérience ultime</p>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl neon-border glass-morphism">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-110"
              >
                <source src={video2} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl font-orbitron font-bold mb-2">Luxe & Confort</h3>
                  <p className="text-sm text-gray-200">Raffinement à chaque instant</p>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl neon-border glass-morphism">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-110"
              >
                <source src={video3} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl font-orbitron font-bold mb-2">Élégance</h3>
                  <p className="text-sm text-gray-200">Design intemporel</p>
                </div>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-2xl neon-border glass-morphism">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-64 md:h-80 object-cover transition-transform duration-500 group-hover:scale-110"
              >
                <source src={video4} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="text-xl font-orbitron font-bold mb-2">Puissance</h3>
                  <p className="text-sm text-gray-200">Sensations garanties</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agency Partnership CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={video1} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20"></div>
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-orbitron font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Rejoignez Notre Réseau Premium
              </span>
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Vous êtes une agence de location ? Développez votre activité avec Carivoo 
              et accédez à une clientèle exclusive recherchant le luxe.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="glass-morphism rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartLine className="text-2xl text-white" size={24} />
                </div>
                <h3 className="text-xl font-orbitron font-bold mb-2 text-foreground">Revenus Optimisés</h3>
                <p className="text-gray-300">Commission avantageuse de 90% sur chaque réservation</p>
              </div>
              
              <div className="glass-morphism rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-2xl text-white" size={24} />
                </div>
                <h3 className="text-xl font-orbitron font-bold mb-2 text-foreground">Clientèle Ciblée</h3>
                <p className="text-gray-300">Accès direct aux clients recherchant le haut de gamme</p>
              </div>
              
              <div className="glass-morphism rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="text-2xl text-white" size={24} />
                </div>
                <h3 className="text-xl font-orbitron font-bold mb-2 text-foreground">Mise en Avant Premium</h3>
                <p className="text-gray-300">Abonnement à 29,99€/mois pour plus de visibilité</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => setLocation("/auth")}
                className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg"
                data-testid="button-become-partner"
              >
                Devenir Partenaire
              </Button>
              <Button
                className="btn-neon bg-transparent border-2 border-accent text-accent px-8 py-4 rounded-lg font-bold text-lg hover:bg-accent hover:text-background transition-all duration-300"
                data-testid="button-learn-more"
              >
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
