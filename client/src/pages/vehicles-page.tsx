import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import VehicleCard from "@/components/vehicle-card";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import type { Vehicle } from "@shared/schema";
import luxuryCarBackground from "@assets/stock_images/black_luxury_sedan_b_24b4a2aa.jpg";

export default function VehiclesPage() {
  const [searchRegion, setSearchRegion] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles", searchRegion, selectedCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchRegion) params.set("region", searchRegion);
      if (selectedCategory && selectedCategory !== "all") params.set("category", selectedCategory);
      
      const response = await fetch(`/api/vehicles?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch vehicles");
      return response.json();
    },
  });

  // Filter vehicles based on search query
  const filteredVehicles = vehicles?.filter(vehicle => 
    !searchQuery || 
    vehicle.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.region.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const categories = [
    "Sportive",
    "SUV Luxe", 
    "Berline",
    "Cabriolet",
    "Électrique",
    "Hybride"
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={luxuryCarBackground}
          alt="Black luxury car at night" 
          className="w-full h-full object-cover opacity-5" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
      </div>

      {/* Subtle Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-20 right-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
        <div className="absolute bottom-40 left-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
        <div className="absolute top-1/2 right-40 w-40 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </div>

      <Navbar />
      
      <div className="pt-20 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-orbitron font-bold mb-4 sm:mb-6 px-4">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Véhicules de Luxe
              </span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
              Explorez notre collection exclusive de véhicules premium disponibles à la location
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass-morphism rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 neon-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    type="text"
                    placeholder="Rechercher un véhicule, marque, modèle..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted border-border text-foreground h-12 text-base"
                    data-testid="input-search-vehicles"
                  />
                </div>
              </div>
              
              <div>
                <Input
                  type="text"
                  placeholder="Région..."
                  value={searchRegion}
                  onChange={(e) => setSearchRegion(e.target.value)}
                  className="bg-muted border-border text-foreground h-12 text-base"
                  data-testid="input-filter-region"
                />
              </div>
              
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-muted border-border text-foreground h-12 text-base" data-testid="select-category">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent className="glass-morphism border-border">
                    <SelectItem value="all">Toutes catégories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              className={`${selectedCategory === "all" ? "btn-neon bg-gradient-to-r from-primary to-secondary" : "btn-neon border-border hover:border-primary"} min-h-[40px] text-sm sm:text-base px-3 sm:px-4`}
              onClick={() => setSelectedCategory("all")}
              data-testid="button-filter-all"
            >
              Tous
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`${selectedCategory === category ? "btn-neon bg-gradient-to-r from-primary to-secondary" : "btn-neon border-border hover:border-primary"} min-h-[40px] text-sm sm:text-base px-3 sm:px-4`}
                onClick={() => setSelectedCategory(category)}
                data-testid={`button-filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 px-4">
            <p className="text-sm sm:text-base text-muted-foreground" data-testid="text-results-count">
              {isLoading ? "Chargement..." : `${filteredVehicles.length} véhicule${filteredVehicles.length > 1 ? 's' : ''} trouvé${filteredVehicles.length > 1 ? 's' : ''}`}
            </p>
          </div>

          {/* Vehicle Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="glass-morphism rounded-2xl h-80 sm:h-96 animate-pulse" />
              ))}
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="glass-morphism rounded-2xl p-8 sm:p-12 max-w-md mx-auto">
                <Filter className="mx-auto mb-4 text-muted-foreground" size={48} />
                <h3 className="text-xl sm:text-2xl font-orbitron font-bold mb-3 sm:mb-4 text-foreground">Aucun véhicule trouvé</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  Essayez de modifier vos critères de recherche pour voir plus de résultats.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchRegion("");
                    setSelectedCategory("");
                  }}
                  className="btn-neon w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-primary-foreground min-h-[44px]"
                  data-testid="button-clear-filters"
                >
                  Effacer les filtres
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle}
                  isPremium={Math.random() > 0.7} // Simulate premium vehicles
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
