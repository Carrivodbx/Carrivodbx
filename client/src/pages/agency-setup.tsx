import { useState, useEffect } from "react";
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
import { Building, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { insertAgencySchema } from "@shared/schema";

export default function AgencySetup() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    logo: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const agencyData = insertAgencySchema.omit({ userId: true }).parse(formData);
      createAgencyMutation.mutate(agencyData);
    } catch (error: any) {
      toast({
        title: "Erreur de validation",
        description: error.message,
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
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-28 h-28 opacity-5">
          <div className="text-8xl">🌴</div>
        </div>
        <div className="absolute bottom-20 right-10 w-32 h-32 opacity-5">
          <div className="text-9xl">🌴</div>
        </div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 opacity-5">
          <div className="text-7xl">🌴</div>
        </div>
        
        {/* Neon Glow Effects */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Navbar />
      
      <div className="pt-20 relative z-10">
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
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-muted border-border text-foreground"
                    required
                    data-testid="input-agency-name"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-foreground">Adresse</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Ex: 12 Avenue de Monte-Carlo, Monaco"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="bg-muted border-border text-foreground"
                    data-testid="input-agency-address"
                  />
                </div>

                <div>
                  <Label htmlFor="logo" className="text-foreground">Logo (URL)</Label>
                  <Input
                    id="logo"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                    className="bg-muted border-border text-foreground"
                    data-testid="input-agency-logo"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    URL d'une image pour le logo de votre agence
                  </p>
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
                    disabled={createAgencyMutation.isPending || !formData.name}
                    className="btn-neon w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground py-4 text-lg font-bold"
                    data-testid="button-create-agency"
                  >
                    {createAgencyMutation.isPending ? (
                      "Création en cours..."
                    ) : (
                      <>
                        <ArrowRight className="mr-2" size={20} />
                        Créer mon agence
                      </>
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
