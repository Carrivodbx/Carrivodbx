import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageGalleryModal } from "@/components/image-gallery-modal";
import { MapPin, Users, Star, ArrowLeft, Calendar, Shield, Zap, ChevronLeft, ChevronRight, Gauge, CreditCard, Banknote, Car } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle, Agency } from "@shared/schema";
import porscheNightBackground from "@assets/stock_images/porsche_rear_view_ba_b54491f8.jpg";

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Load vehicle info first (fast - no photos)
  const { data: vehicleInfo, isLoading: vehicleLoading, error } = useQuery<any>({
    queryKey: ["/api/vehicles", id, "info"],
    queryFn: async () => {
      const response = await fetch(`/api/vehicles/${id}/info`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to fetch vehicle");
      }
      return response.json();
    },
    enabled: !!id,
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Load photos separately (slow - lazy loaded)
  const { data: photosData, isLoading: photosLoading } = useQuery<{ photos: string[] }>({
    queryKey: ["/api/vehicles", id, "photos"],
    queryFn: async () => {
      const response = await fetch(`/api/vehicles/${id}/photos`);
      if (!response.ok) {
        return { photos: [] };
      }
      return response.json();
    },
    enabled: !!id && !!vehicleInfo,
    retry: false,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const vehicle = vehicleInfo;
  const agency = vehicle?.agency;

  // Generate consistent rating between 4.4 and 5.0 based on vehicle ID
  const generateRating = (vehicleId: string): number => {
    let hash = 0;
    for (let i = 0; i < vehicleId.length; i++) {
      hash = ((hash << 5) - hash) + vehicleId.charCodeAt(i);
      hash = hash & hash;
    }
    const normalized = Math.abs(hash % 100) / 100;
    return Math.round((4.4 + normalized * 0.6) * 10) / 10;
  };

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Loading State with Progress Indicator */}
            <div className="animate-in fade-in duration-300">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/vehicles")}
                className="mb-6 gap-2"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              
              <div className="text-center py-20">
                <div className="inline-block relative">
                  <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">Chargement du véhicule...</h2>
                <p className="text-muted-foreground">Veuillez patienter quelques secondes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center px-4">
            <h1 className="text-3xl font-bold mb-4">
              {error ? "Erreur de chargement" : "Véhicule non trouvé"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {error ? "Le véhicule n'a pas pu être chargé. Veuillez réessayer." : "Ce véhicule n'existe pas ou n'est plus disponible."}
            </p>
            <Button 
              onClick={() => setLocation("/vehicles")} 
              data-testid="button-back-to-vehicles"
              className="btn-neon"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
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

  // Get all photos (from separate query or use placeholder)
  const placeholderPhoto = "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80";
  
  const photos = photosData?.photos && photosData.photos.length > 0
    ? photosData.photos
    : [placeholderPhoto];

  const hasMultiplePhotos = photos.length > 1;
  const photosFullyLoaded = !photosLoading && photosData?.photos;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const openLightbox = () => {
    setLightboxOpen(true);
  };

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            
            {/* Vehicle Image Gallery */}
            <div className="relative group">
              <div 
                className="relative rounded-2xl cursor-pointer bg-muted/30 flex items-center justify-center overflow-hidden"
                style={{ minHeight: '384px', height: '600px' }}
                onClick={openLightbox}
              >
                <img
                  src={photos[currentImageIndex]}
                  alt={`${vehicle.brand} ${vehicle.model} - Photo ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-cover lg:object-contain rounded-2xl transition-transform duration-500 hover:scale-105"
                  data-testid="img-vehicle-main"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Loading indicator for photos */}
                {photosLoading && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Chargement des photos...</span>
                    </div>
                  </div>
                )}
                
                {/* Carousel Controls - Only show if multiple photos */}
                {hasMultiplePhotos && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all"
                      data-testid="button-prev-photo"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-3 rounded-full transition-all"
                      data-testid="button-next-photo"
                    >
                      <ChevronRight size={24} />
                    </button>
                    
                    {/* Photo Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {photos.map((_, index) => (
                        <div
                          key={index}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            index === currentImageIndex ? 'bg-accent w-8' : 'bg-white/50 w-2'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                          data-testid={`indicator-photo-${index}`}
                        />
                      ))}
                    </div>
                  </>
                )}

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

              {/* Thumbnail Gallery */}
              {hasMultiplePhotos && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all ${
                        index === currentImageIndex ? 'ring-2 ring-accent scale-105' : 'opacity-60 hover:opacity-100'
                      }`}
                      data-testid={`thumbnail-${index}`}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
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
                
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
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
                  {vehicle.maxKilometers && (
                    <div className="flex items-center">
                      <span className="font-medium text-accent" data-testid="text-vehicle-max-km">
                        {vehicle.maxKilometers} km/jour max
                      </span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Star className="mr-2 text-accent" size={20} />
                    <span>4.8 (24 avis)</span>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-2xl p-6 premium-border subtle-shadow animate-fade-in-up">
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
          <Card className="glass-morphism neon-border mb-8">
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

          {/* Specifications */}
          <Card className="glass-morphism neon-border mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
                Spécifications techniques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vehicle.year && (
                  <div className="flex items-start space-x-3">
                    <Calendar className="text-accent mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-foreground">Année</p>
                      <p className="text-muted-foreground" data-testid="text-vehicle-year">{vehicle.year}</p>
                    </div>
                  </div>
                )}
                {vehicle.horsepower && (
                  <div className="flex items-start space-x-3">
                    <Gauge className="text-accent mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-foreground">Puissance</p>
                      <p className="text-muted-foreground" data-testid="text-vehicle-horsepower">{vehicle.horsepower} chevaux</p>
                    </div>
                  </div>
                )}
                {vehicle.seats && (
                  <div className="flex items-start space-x-3">
                    <Users className="text-accent mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-foreground">Places</p>
                      <p className="text-muted-foreground" data-testid="text-vehicle-seats-spec">{vehicle.seats} places</p>
                    </div>
                  </div>
                )}
                {vehicle.maxKilometers && (
                  <div className="flex items-start space-x-3">
                    <Zap className="text-accent mt-1" size={20} />
                    <div>
                      <p className="font-semibold text-foreground">Kilométrage maximum</p>
                      <p className="text-muted-foreground" data-testid="text-vehicle-max-km-spec">{vehicle.maxKilometers} km/jour</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start space-x-3">
                  <Car className="text-accent mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-foreground">Catégorie</p>
                    <p className="text-muted-foreground" data-testid="text-vehicle-category">{vehicle.category}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="text-accent mt-1" size={20} />
                  <div>
                    <p className="font-semibold text-foreground">Localisation</p>
                    <p className="text-muted-foreground" data-testid="text-vehicle-location">{vehicle.region}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deposit Information */}
          {vehicle.depositAmount && (
            <Card className="glass-morphism neon-border mb-12 border-accent/50">
              <CardHeader>
                <CardTitle className="text-2xl font-orbitron font-bold text-foreground flex items-center gap-2">
                  <Shield className="text-accent" size={24} />
                  Caution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <div>
                      <p className="text-sm text-muted-foreground">Montant de la caution</p>
                      <p className="text-3xl font-orbitron font-bold text-accent" data-testid="text-deposit-amount">
                        €{vehicle.depositAmount}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 p-4 rounded-lg bg-muted/30">
                    <p className="font-semibold text-foreground">Modalités de paiement de la caution :</p>
                    <p className="text-muted-foreground text-sm" data-testid="text-deposit-info">
                      La caution sera collectée sur place lors de la prise en charge du véhicule selon les modalités suivantes :
                    </p>
                    <div className="space-y-2 ml-4">
                      <div className="flex items-start space-x-3">
                        <CreditCard className="text-accent mt-0.5" size={18} />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Empreinte bancaire</span> - Empreinte de carte bancaire (montant bloqué temporairement)
                        </p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Banknote className="text-accent mt-0.5" size={18} />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">Espèces</span> - Paiement en espèces
                        </p>
                      </div>
                      {vehicle.cashDepositAllowed && (
                        <div className="flex items-start space-x-3">
                          <Car className="text-accent mt-0.5" size={18} />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-foreground">Échange de véhicule</span> - L'agence accepte un véhicule en garantie
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Note :</strong> La caution vous sera intégralement restituée à la fin de la location si le véhicule est rendu en bon état.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Agency Info - Enhanced Design */}
          {vehicleLoading || !agency ? (
            <Card className="glass-morphism neon-border">
              <CardHeader>
                <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
                  Agence partenaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : agency ? (
            <Card 
              className="glass-morphism neon-border overflow-hidden relative"
              data-testid={`card-agency-${agency.id}`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
              
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-orbitron font-bold text-foreground flex items-center gap-2">
                  <MapPin className="text-accent" size={24} />
                  Agence partenaire
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Left Section - Agency Logo & Name */}
                  <div className="flex items-center space-x-4 flex-1">
                    {agency.logo ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-md opacity-50"></div>
                        <img 
                          src={agency.logo} 
                          alt={agency.name}
                          className="relative w-20 h-20 rounded-full object-cover border-2 border-primary/30"
                          data-testid="img-agency-logo"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-md opacity-50"></div>
                        <div className="relative w-20 h-20 bg-gradient-to-br from-primary via-accent to-secondary rounded-full flex items-center justify-center border-2 border-primary/30">
                          <span className="text-white font-bold text-2xl" data-testid="text-agency-initial">
                            {agency.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-foreground mb-1 font-orbitron" data-testid="text-agency-name">
                        {agency.name}
                      </h3>
                      
                      {(agency.street || agency.address) && (
                        <div className="flex items-start mt-2 space-x-2">
                          <MapPin className="text-accent mt-0.5 flex-shrink-0" size={18} />
                          <div>
                            <p className="text-muted-foreground font-medium" data-testid="text-agency-address">
                              {agency.street && agency.address 
                                ? `${agency.street}, ${agency.address}`
                                : agency.street || agency.address}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {agency.description && (
                        <p className="text-sm text-muted-foreground mt-2 italic" data-testid="text-agency-description">
                          "{agency.description}"
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Right Section - Action Button */}
                  <div className="flex flex-col gap-2 md:ml-4">
                    <Button 
                      className="btn-neon bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold"
                      onClick={() => setLocation(`/agencies/${agency.id}`)}
                      data-testid="button-view-agency"
                    >
                      <Star className="mr-2" size={18} />
                      Voir tous les véhicules
                    </Button>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Star className="text-accent" size={12} />
                      <span>{generateRating(agency.id)} / 5</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        images={photos}
        initialIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
      
      <Footer />
    </div>
  );
}
