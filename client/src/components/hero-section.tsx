import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Car, Building } from "lucide-react";
import heroBackground from "@assets/stock_images/dubai_skyline_at_nig_895bbdaf.jpg";

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
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBackground}
          alt="Dubai skyline at night with luxury cars" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-orbitron font-black mb-6" data-testid="text-hero-title">
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            LOCATION DE LUXE
          </span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto" data-testid="text-hero-subtitle">
          Découvrez notre collection exclusive de véhicules premium. 
          De Dubaï à votre ville, vivez l'expérience ultime du luxe automobile.
        </p>
        
        {/* Search Bar */}
        <div className="glass-morphism rounded-2xl p-6 mb-8 max-w-4xl mx-auto neon-border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label className="block text-sm font-medium text-gray-300 mb-2">
                Où souhaitez-vous conduire ?
              </Label>
              <Input
                type="text"
                placeholder="Ville, région..."
                value={searchRegion}
                onChange={(e) => setSearchRegion(e.target.value)}
                className="bg-muted border-border text-foreground"
                data-testid="input-search-region"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-300 mb-2">
                Date de début
              </Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-muted border-border text-foreground"
                data-testid="input-start-date"
              />
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-300 mb-2">
                Date de fin
              </Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-muted border-border text-foreground"
                data-testid="input-end-date"
              />
            </div>
          </div>
          <Button
            onClick={handleSearch}
            className="btn-neon w-full md:w-auto bg-gradient-to-r from-primary to-secondary text-primary-foreground px-8 py-4 rounded-lg font-bold mt-4 text-lg"
            data-testid="button-search"
          >
            <Search className="mr-2" size={20} />
            Rechercher
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={() => setLocation("/vehicles")}
            className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground px-8 py-4 rounded-lg font-bold text-lg"
            data-testid="button-explore-vehicles"
          >
            <Car className="mr-2" size={20} />
            Explorer les véhicules
          </Button>
          <Button
            onClick={() => setLocation("/auth")}
            className="btn-neon bg-transparent border-2 border-accent text-accent px-8 py-4 rounded-lg font-bold text-lg hover:bg-accent hover:text-background transition-all duration-300"
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
