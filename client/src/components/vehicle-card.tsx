import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Vehicle } from "@shared/schema";

interface VehicleCardProps {
  vehicle: Vehicle;
  isPremium?: boolean;
}

export default function VehicleCard({ vehicle, isPremium = false }: VehicleCardProps) {
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleViewDetails = () => {
    setLocation(`/vehicles/${vehicle.id}`);
  };

  // Get all photos (use photos array if available, otherwise fallback to single photo)
  const photos = vehicle.photos && vehicle.photos.length > 0 
    ? vehicle.photos 
    : vehicle.photo 
    ? [vehicle.photo] 
    : ["https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"];

  const hasMultiplePhotos = photos.length > 1;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="group glass-morphism rounded-2xl overflow-hidden neon-border hover:scale-105 active:scale-95 transition-all duration-300 relative" data-testid={`card-vehicle-${vehicle.id}`}>
      {isPremium && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
          <Badge className="bg-gradient-to-r from-accent to-secondary text-accent-foreground animate-pulse-glow text-xs sm:text-sm" data-testid="badge-premium">
            <Star className="mr-1" size={12} />
            PREMIUM
          </Badge>
        </div>
      )}
      
      <div className="relative overflow-hidden cursor-pointer" onClick={handleViewDetails}>
        <img 
          src={photos[currentImageIndex]} 
          alt={`${vehicle.brand} ${vehicle.model} - Photo ${currentImageIndex + 1}`}
          className="w-full h-48 sm:h-64 object-cover group-hover:scale-110 transition-transform duration-500"
          data-testid={`img-vehicle-${vehicle.id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Carousel Controls - Only show if multiple photos */}
        {hasMultiplePhotos && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
              data-testid={`button-prev-photo-${vehicle.id}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
              data-testid={`button-next-photo-${vehicle.id}`}
            >
              <ChevronRight size={20} />
            </button>
            
            {/* Photo Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-primary w-4' : 'bg-white/50'
                  }`}
                  data-testid={`indicator-photo-${index}-${vehicle.id}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-lg sm:text-xl font-orbitron font-bold text-foreground truncate pr-2" data-testid={`text-vehicle-title-${vehicle.id}`}>
            {vehicle.title}
          </h3>
          <div className="flex items-center text-accent flex-shrink-0">
            <Star className="text-sm" size={16} />
            <span className="ml-1 text-sm font-medium">4.8</span>
          </div>
        </div>
        
        <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 line-clamp-2" data-testid={`text-vehicle-description-${vehicle.id}`}>
          {vehicle.description}
        </p>
        
        <div className="flex items-center justify-between mb-3 sm:mb-4 text-sm sm:text-base">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-1 sm:mr-2 flex-shrink-0" size={16} />
            <span className="truncate" data-testid={`text-vehicle-region-${vehicle.id}`}>{vehicle.region}</span>
          </div>
          {vehicle.seats && (
            <div className="flex items-center text-muted-foreground flex-shrink-0">
              <Users className="mr-1 sm:mr-2" size={16} />
              <span data-testid={`text-vehicle-seats-${vehicle.id}`}>{vehicle.seats} places</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-xl sm:text-2xl font-orbitron font-bold text-primary" data-testid={`text-vehicle-price-${vehicle.id}`}>
              €{vehicle.pricePerDay}
            </span>
            <span className="text-sm sm:text-base text-muted-foreground">/jour</span>
          </div>
          <Button
            onClick={handleViewDetails}
            className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 sm:px-6 py-2 rounded-lg font-medium text-sm sm:text-base min-h-[40px]"
            data-testid={`button-view-vehicle-${vehicle.id}`}
          >
            Voir détails
          </Button>
        </div>
      </div>
    </div>
  );
}
