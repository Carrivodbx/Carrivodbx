import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { HelpCircle, Search, BookOpen, MessageCircle, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 sm:pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-6">
              <HelpCircle className="text-white" size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Centre d'Aide
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Trouvez rapidement les réponses à vos questions sur la location de véhicules de luxe.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Rechercher dans l'aide..."
                className="pl-12 h-14 bg-muted border-border text-lg"
                data-testid="input-search-help"
              />
            </div>
          </div>

          {/* FAQ */}
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-2xl font-orbitron font-bold mb-8 text-center">Questions Fréquentes</h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="glass-morphism neon-border px-6 rounded-lg">
                <AccordionTrigger className="text-lg font-semibold">
                  Comment réserver un véhicule ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Pour réserver un véhicule, parcourez notre catalogue, sélectionnez le véhicule souhaité, choisissez vos dates de location, et procédez au paiement sécurisé. Vous recevrez une confirmation par email immédiatement.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="glass-morphism neon-border px-6 rounded-lg">
                <AccordionTrigger className="text-lg font-semibold">
                  Quels sont les documents requis ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Pour louer un véhicule, vous devez fournir : une pièce d'identité valide, un permis de conduire en cours de validité (depuis plus de 2 ans), et une carte de crédit pour la caution.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="glass-morphism neon-border px-6 rounded-lg">
                <AccordionTrigger className="text-lg font-semibold">
                  Quelle est la politique d'annulation ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Vous pouvez annuler gratuitement jusqu'à 48h avant le début de la location. Au-delà, des frais d'annulation peuvent s'appliquer selon les conditions de l'agence.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="glass-morphism neon-border px-6 rounded-lg">
                <AccordionTrigger className="text-lg font-semibold">
                  Comment fonctionne la caution ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Une caution est prélevée sur votre carte de crédit au moment de la prise du véhicule. Elle est restituée sous 7 jours ouvrés après la restitution du véhicule, sous réserve de l'absence de dommages.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="glass-morphism neon-border px-6 rounded-lg">
                <AccordionTrigger className="text-lg font-semibold">
                  Puis-je prolonger ma location ?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Oui, sous réserve de disponibilité du véhicule. Contactez directement l'agence au moins 24h avant la fin de votre location pour organiser la prolongation.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Contact Options */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-morphism neon-border text-center">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mx-auto mb-4">
                  <MessageCircle className="text-primary" size={24} />
                </div>
                <CardTitle>Chat en Direct</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Discutez avec notre équipe support
                </CardDescription>
                <p className="text-sm text-muted-foreground">Lun-Ven: 9h-19h</p>
              </CardContent>
            </Card>

            <Card className="glass-morphism neon-border text-center">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mx-auto mb-4">
                  <Phone className="text-primary" size={24} />
                </div>
                <CardTitle>Téléphone</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Appelez-nous directement
                </CardDescription>
                <p className="text-sm font-medium">+33 1 84 80 99 99</p>
              </CardContent>
            </Card>

            <Card className="glass-morphism neon-border text-center">
              <CardHeader>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mx-auto mb-4">
                  <Mail className="text-primary" size={24} />
                </div>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  Envoyez-nous un message
                </CardDescription>
                <p className="text-sm font-medium">support@carivoo.com</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
