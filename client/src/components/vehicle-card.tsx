import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Star } from "lucide-react";
import type { Vehicle } from "@shared/schema";

interface VehicleCardProps {
  vehicle: Vehicle;
  isPremium?: boolean;
}

export default function VehicleCard({ vehicle, isPremium = false }: VehicleCardProps) {
  const [, setLocation] = useLocation();

  const handleViewDetails = () => {
    setLocation(`/vehicles/${vehicle.id}`);
  };

  return (
    <div className="group glass-morphism rounded-2xl overflow-hidden neon-border hover:scale-105 transition-all duration-300 relative" data-testid={`card-vehicle-${vehicle.id}`}>
      {isPremium && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-accent to-secondary text-accent-foreground animate-pulse-glow" data-testid="badge-premium">
            <Star className="mr-1" size={12} />
            PREMIUM
          </Badge>
        </div>
      )}
      
      <div className="relative overflow-hidden">
        <img 
          src={vehicle.photo || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"} 
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          data-testid={`img-vehicle-${vehicle.id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-orbitron font-bold text-foreground" data-testid={`text-vehicle-title-${vehicle.id}`}>
            {vehicle.title}
          </h3>
          <div className="flex items-center text-accent">
            <Star className="text-sm" size={16} />
            <span className="ml-1 text-sm font-medium">4.8</span>
          </div>
        </div>
        
        <p className="text-muted-foreground mb-4 line-clamp-2" data-testid={`text-vehicle-description-${vehicle.id}`}>
          {vehicle.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2" size={16} />
            <span data-testid={`text-vehicle-region-${vehicle.id}`}>{vehicle.region}</span>
          </div>
          {vehicle.seats && (
            <div className="flex items-center text-muted-foreground">
              <Users className="mr-2" size={16} />
              <span data-testid={`text-vehicle-seats-${vehicle.id}`}>{vehicle.seats} places</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-orbitron font-bold text-primary" data-testid={`text-vehicle-price-${vehicle.id}`}>
              €{vehicle.pricePerDay}
            </span>
            <span className="text-muted-foreground">/jour</span>
          </div>
          <Button
            onClick={handleViewDetails}
            className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-2 rounded-lg font-medium"
            data-testid={`button-view-vehicle-${vehicle.id}`}
          >
            Voir détails
          </Button>
        </div>
      </div>
    </div>
  );
}
