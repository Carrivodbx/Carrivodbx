import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import VehicleCard from "@/components/vehicle-card";
import { ReviewsSection } from "@/components/reviews-section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin } from "lucide-react";
import type { Vehicle, Agency } from "@shared/schema";
import porscheNightBackground from "@assets/stock_images/porsche_rear_view_ba_b54491f8.jpg";

export default function AgencyVehiclesPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: agency, isLoading: agencyLoading } = useQuery<Agency>({
    queryKey: ["/api/agencies", id],
    enabled: !!id,
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/agencies", id, "vehicles"],
    enabled: !!id,
  });

  const isLoading = agencyLoading || vehiclesLoading;

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

          {/* Agency Header */}
          {agencyLoading ? (
            <div className="mb-12">
              <div className="flex items-center space-x-4 mb-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-10 w-64 mb-2" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </div>
            </div>
          ) : agency ? (
            <div className="mb-12 animate-fade-in-up">
              <div className="flex items-center space-x-6 mb-6">
                {agency.logo ? (
                  <img 
                    src={agency.logo} 
                    alt={agency.name}
                    className="w-24 h-24 rounded-full object-cover glass-effect premium-border"
                    data-testid="img-agency-logo"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center glass-effect premium-border">
                    <span className="text-white font-bold text-3xl" data-testid="text-agency-initial">
                      {agency.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-orbitron font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" data-testid="text-agency-name">
                    {agency.name}
                  </h1>
                  {agency.description && (
                    <p className="text-lg text-muted-foreground mb-2" data-testid="text-agency-description">
                      {agency.description}
                    </p>
                  )}
                  {(agency.street || agency.address) && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2" size={16} />
                      <span data-testid="text-agency-address">
                        {agency.street && agency.address 
                          ? `${agency.street}, ${agency.address}`
                          : agency.street || agency.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Vehicles Grid */}
          <div>
            <h2 className="text-2xl font-orbitron font-bold mb-6" data-testid="text-vehicles-title">
              {vehicles && vehicles.length > 0 
                ? `${vehicles.length} véhicule${vehicles.length > 1 ? 's' : ''} disponible${vehicles.length > 1 ? 's' : ''}`
                : "Véhicules disponibles"
              }
            </h2>

            {vehiclesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-64 rounded-2xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : vehicles && vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg" data-testid="text-no-vehicles">
                  Cette agence n'a pas encore de véhicules disponibles.
                </p>
              </div>
            )}
          </div>

          {/* Reviews Section */}
          {agency && (
            <div className="mt-16">
              <ReviewsSection agencyId={agency.id} />
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
