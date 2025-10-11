import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, ArrowRight, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertAgencySchema } from "@shared/schema";
import porscheNightBackground from "@assets/stock_images/porsche_rear_view_ba_b54491f8.jpg";

interface City {
  nom: string;
  code: string;
  codeDepartement: string;
  codeRegion: string;
}

interface Street {
  properties: {
    label: string;
    name: string;
    citycode: string;
    city: string;
  };
}

export default function AgencySetup() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    street: "",
    address: "",
    logo: "",
  });

  const [selectedCityCode, setSelectedCityCode] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<City[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [isCityLoading, setIsCityLoading] = useState(false);
  const citySuggestionsRef = useRef<HTMLDivElement>(null);

  const [streetSuggestions, setStreetSuggestions] = useState<Street[]>([]);
  const [showStreetSuggestions, setShowStreetSuggestions] = useState(false);
  const [isStreetLoading, setIsStreetLoading] = useState(false);
  const streetSuggestionsRef = useRef<HTMLDivElement>(null);

  const createAgencyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/agency/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency/profile"] });
      toast({
        title: "Profil créé !",
        description: "Votre agence a été créée avec succès",
      });
      setLocation("/dashboard/agency");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (citySuggestionsRef.current && !citySuggestionsRef.current.contains(event.target as Node)) {
        setShowCitySuggestions(false);
      }
      if (streetSuggestionsRef.current && !streetSuggestionsRef.current.contains(event.target as Node)) {
        setShowStreetSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddressChange = async (value: string) => {
    setFormData(prev => ({ ...prev, address: value }));
    
    if (value.trim().length >= 2) {
      setIsCityLoading(true);
      try {
        const response = await fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(value)}&fields=nom,code,codeDepartement,codeRegion&boost=population&limit=10`
        );
        const data: City[] = await response.json();
        setCitySuggestions(data);
        setShowCitySuggestions(data.length > 0);
      } catch (error) {
        console.error("Erreur lors de la recherche de villes:", error);
        setCitySuggestions([]);
      } finally {
        setIsCityLoading(false);
      }
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    }
  };

  const selectCity = (city: City) => {
    setFormData(prev => ({ ...prev, address: city.nom }));
    setSelectedCityCode(city.code);
    setShowCitySuggestions(false);
    // Clear street when city changes
    setFormData(prev => ({ ...prev, street: "" }));
  };

  const handleStreetChange = async (value: string) => {
    setFormData(prev => ({ ...prev, street: value }));
    
    if (value.trim().length >= 2 && selectedCityCode) {
      setIsStreetLoading(true);
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&type=street&citycode=${selectedCityCode}&limit=10`
        );
        const data = await response.json();
        setStreetSuggestions(data.features || []);
        setShowStreetSuggestions((data.features || []).length > 0);
      } catch (error) {
        console.error("Erreur lors de la recherche de rues:", error);
        setStreetSuggestions([]);
      } finally {
        setIsStreetLoading(false);
      }
    } else {
      setStreetSuggestions([]);
      setShowStreetSuggestions(false);
    }
  };

  const selectStreet = (street: Street) => {
    setFormData(prev => ({ ...prev, street: street.properties.name }));
    setShowStreetSuggestions(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 without any restrictions
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData(prev => ({ ...prev, logo: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== FORM SUBMIT ===");
    console.log("Form data:", formData);

    if (!formData.name || formData.name.trim() === "") {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer un nom pour votre agence",
        variant: "destructive",
      });
      return;
    }

    try {
      const agencyData = {
        name: formData.name,
        description: formData.description || null,
        address: formData.address || null,
        logo: formData.logo || null,
      };
      console.log("Sending agency data:", agencyData);
      createAgencyMutation.mutate(agencyData);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "agency")) {
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "agency") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
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
      
      <div className="pt-24 sm:pt-28 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <Building className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-orbitron font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Créez votre profil d'agence
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Dernière étape avant de commencer à louer vos véhicules de luxe
            </p>
          </div>

          <Card className="glass-morphism neon-border">
            <CardHeader>
              <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
                Informations de l'agence
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Ces informations seront visibles par vos clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-foreground">Nom de l'agence *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: Luxury Cars Monaco"
                    value={formData.name}
                    onChange={(e) => {
                      console.log("Name changed to:", e.target.value);
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                    }}
                    className="bg-muted border-border text-foreground"
                    required
                    data-testid="input-agency-name"
                  />
                  {!formData.name && (
                    <p className="text-sm text-yellow-500 mt-1">
                      ⚠️ Le nom de l'agence est obligatoire
                    </p>
                  )}
                </div>

                <div className="relative" ref={citySuggestionsRef}>
                  <Label htmlFor="address" className="text-foreground">Ville</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Ex: Paris, Lyon, Marseille..."
                    value={formData.address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    className="bg-muted border-border text-foreground"
                    data-testid="input-agency-address"
                  />
                  
                  {/* City Suggestions Dropdown */}
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                      {citySuggestions.map((city) => (
                        <button
                          key={city.code}
                          type="button"
                          onClick={() => selectCity(city)}
                          className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors flex items-center gap-2 text-gray-200 border-b border-zinc-800 last:border-b-0"
                          data-testid={`city-suggestion-${city.nom.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <MapPin className="w-4 h-4 text-zinc-500" />
                          <span className="font-medium">{city.nom}</span>
                          <span className="text-xs text-zinc-500 ml-auto">({city.codeDepartement})</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {isCityLoading && (
                    <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-3 text-center text-zinc-500 text-sm">
                      Recherche en cours...
                    </div>
                  )}
                </div>

                <div className="relative" ref={streetSuggestionsRef}>
                  <Label htmlFor="street" className="text-foreground">Rue</Label>
                  <Input
                    id="street"
                    type="text"
                    placeholder={selectedCityCode ? "Ex: Avenue des Champs-Élysées..." : "Sélectionnez d'abord une ville"}
                    value={formData.street}
                    onChange={(e) => handleStreetChange(e.target.value)}
                    className="bg-muted border-border text-foreground"
                    disabled={!selectedCityCode}
                    data-testid="input-agency-street"
                  />
                  
                  {/* Street Suggestions Dropdown */}
                  {showStreetSuggestions && streetSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                      {streetSuggestions.map((street, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectStreet(street)}
                          className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors flex items-center gap-2 text-gray-200 border-b border-zinc-800 last:border-b-0"
                          data-testid={`street-suggestion-${index}`}
                        >
                          <MapPin className="w-4 h-4 text-zinc-500" />
                          <span className="font-medium">{street.properties.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {isStreetLoading && (
                    <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-3 text-center text-zinc-500 text-sm">
                      Recherche en cours...
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="logo" className="text-foreground font-semibold text-lg mb-3 block">Logo de l'agence</Label>
                  <div className="mt-2">
                    {!formData.logo ? (
                      <label
                        htmlFor="logo-upload"
                        className="cursor-pointer flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/50 transition-all duration-200"
                        data-testid="button-upload-logo"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div className="text-center">
                            <p className="text-zinc-100 font-medium text-lg">Ajouter un logo</p>
                            <p className="text-zinc-400 text-sm mt-1">Cliquez pour sélectionner depuis votre galerie ou fichiers</p>
                          </div>
                        </div>
                      </label>
                    ) : (
                      <div className="relative">
                        <div className="relative rounded-xl overflow-hidden border-2 border-zinc-700 bg-zinc-900/50 p-4">
                          <img
                            src={formData.logo}
                            alt="Logo de l'agence"
                            className="w-full h-48 object-contain"
                            data-testid="img-agency-logo-preview"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, logo: "" }))}
                          className="absolute top-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg"
                          data-testid="button-remove-logo"
                        >
                          ✕ Supprimer
                        </button>
                      </div>
                    )}
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      data-testid="input-agency-logo-file"
                    />
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      📷 Logo de votre agence
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-foreground">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre agence, vos services, votre expertise..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-muted border-border text-foreground min-h-32"
                    data-testid="textarea-agency-description"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Mettez en valeur votre expertise et vos services premium
                  </p>
                </div>

                <div className="pt-6 border-t border-border">
                  <Button
                    type="submit"
                    disabled={createAgencyMutation.isPending}
                    onClick={() => console.log("=== BUTTON CLICKED ===", formData)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-8 text-2xl font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                    data-testid="button-create-agency"
                  >
                    {createAgencyMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <span className="animate-spin mr-2">⏳</span>
                        Création en cours...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <ArrowRight className="mr-3" size={32} />
                        CRÉER MON PROFIL D'AGENCE
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Une fois votre profil créé, vous pourrez commencer à ajouter vos véhicules
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
