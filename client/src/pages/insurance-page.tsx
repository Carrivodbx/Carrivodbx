import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Shield, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 sm:pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-6">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Assurance Premium
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Roulez l'esprit tranquille avec notre couverture d'assurance complète pour tous vos trajets en véhicule de luxe.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card className="glass-morphism neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="text-primary" size={20} />
                  Assistance en France
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Service d'assistance disponible jour et nuit partout en France.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-morphism neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="text-primary" size={20} />
                  Conducteur Additionnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Possibilité d'ajouter jusqu'à 2 conducteurs additionnels sans frais supplémentaires.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-morphism neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="text-primary" size={20} />
                  Kilométrage Illimité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Parcourez autant de kilomètres que nécessaire sans frais supplémentaires.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Pricing */}
          <Card className="glass-morphism neon-border max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-orbitron">Informations Importantes</CardTitle>
              <CardDescription>Conditions d'assurance et de location</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Les détails complets de l'assurance (couverture tous risques, véhicule de remplacement, protection juridique, etc.) seront définis avec chaque agence lors de la signature du contrat physique de location.
              </p>
              <Link href="/vehicles">
                <Button className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground" data-testid="button-browse-vehicles">
                  Découvrir nos véhicules
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
