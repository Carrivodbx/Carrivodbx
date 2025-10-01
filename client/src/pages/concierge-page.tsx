import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Sparkles, Check, Clock, Car, MapPin, Gift } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function ConciergePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 sm:pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-6">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Service Conciergerie
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Un service sur-mesure pour une expérience de location exceptionnelle. Nous nous occupons de tout pour que vous n'ayez qu'à profiter.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <Card className="glass-morphism neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="text-primary" size={20} />
                  Livraison du Véhicule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Nous livrons votre véhicule de luxe à l'adresse de votre choix : hôtel, aéroport, domicile ou bureau.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-morphism neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="text-primary" size={20} />
                  Véhicule Préparé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Chaque véhicule est méticuleusement nettoyé, inspecté et préparé avec le plein de carburant avant livraison.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-morphism neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="text-primary" size={20} />
                  Disponibilité 24/7
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Notre équipe est disponible jour et nuit pour répondre à vos demandes et assurer votre confort.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-morphism neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="text-primary" size={20} />
                  Itinéraires Personnalisés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Conseils sur les meilleurs itinéraires, restaurants, hôtels et lieux d'intérêt selon vos préférences.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-morphism neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="text-primary" size={20} />
                  Services Premium
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Réservations de restaurants, événements exclusifs, et accès VIP sur demande pour une expérience complète.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-morphism neon-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-primary" size={20} />
                  Demandes Spéciales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Toute demande particulière est étudiée pour personnaliser votre expérience selon vos besoins.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <Card className="glass-morphism neon-border max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-orbitron">Contactez Notre Conciergerie</CardTitle>
              <CardDescription>Notre équipe est à votre écoute pour organiser votre expérience sur-mesure</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Appelez-nous au <span className="font-bold text-primary">06 81 18 88 52</span> ou envoyez-nous un message via notre formulaire de contact.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/contact">
                  <Button className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground" data-testid="button-contact-concierge">
                    Nous contacter
                  </Button>
                </Link>
                <Link href="/vehicles">
                  <Button variant="outline" data-testid="button-browse-vehicles-concierge">
                    Voir nos véhicules
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
