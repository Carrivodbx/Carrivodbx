import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Car, Building } from "lucide-react";
import heroVideo from "@assets/5309354-hd_1920_1080_25fps_1759286891675.mp4";

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const [searchRegion, setSearchRegion] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchRegion) params.set("region", searchRegion);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    
    setLocation(`/vehicles${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-8">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-orbitron font-black mb-4 sm:mb-6 leading-tight" data-testid="text-hero-title">
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            LE FUTUR DU RAFFINEMENT
          </span>
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-gray-200 max-w-3xl mx-auto px-4" data-testid="text-hero-subtitle">
          Découvrez le meilleur pour vous, l'alliance parfaite entre design et exclusivité basé en France.
        </p>
        
        {/* Search Bar */}
        <div className="glass-effect rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 max-w-4xl mx-auto premium-border animate-fade-in-up subtle-shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="md:col-span-2 w-full">
              <Label className="block text-sm font-medium text-gray-300 mb-2">
                Où souhaitez-vous conduire ?
              </Label>
              <Input
                type="text"
                placeholder="Ville, région..."
                value={searchRegion}
                onChange={(e) => setSearchRegion(e.target.value)}
                className="bg-muted border-border text-foreground h-12 text-base w-full max-w-full"
                data-testid="input-search-region"
              />
            </div>
            <div className="w-full">
              <Label className="block text-sm font-medium text-gray-300 mb-2">
                Date de début
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-muted border-border text-foreground h-12 text-base w-full max-w-full"
                data-testid="input-start-date"
              />
            </div>
            <div className="w-full">
              <Label className="block text-sm font-medium text-gray-300 mb-2">
                Date de fin
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-muted border-border text-foreground h-12 text-base w-full max-w-full"
                data-testid="input-end-date"
              />
            </div>
          </div>
          <Button
            onClick={handleSearch}
            className="btn-neon w-full md:w-auto bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 sm:px-8 py-4 rounded-lg font-bold mt-4 text-base sm:text-lg min-h-[48px]"
            data-testid="button-search"
          >
            <Search className="mr-2" size={20} />
            Rechercher
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Button
            onClick={() => setLocation("/vehicles")}
            className="btn-neon w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 sm:px-8 py-4 rounded-lg font-bold text-base sm:text-lg min-h-[48px]"
            data-testid="button-explore-vehicles"
          >
            <Car className="mr-2" size={20} />
            Explorer les véhicules
          </Button>
          <Button
            onClick={() => setLocation("/auth")}
            className="btn-neon w-full sm:w-auto bg-transparent border-2 border-accent text-accent px-6 sm:px-8 py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-accent hover:text-background transition-all duration-300 min-h-[48px]"
            data-testid="button-become-partner"
          >
            <Building className="mr-2" size={20} />
            Devenir partenaire
          </Button>
        </div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 right-10 w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full opacity-20 animate-float"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full opacity-20 animate-float" style={{animationDelay: "1s"}}></div>
    </section>
  );
}
