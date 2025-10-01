import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 sm:pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-6">
              <Mail className="text-white" size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Contactez-nous
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Notre équipe est là pour répondre à toutes vos questions sur la location de véhicules de luxe.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="glass-morphism neon-border">
              <CardHeader>
                <CardTitle className="text-2xl font-orbitron">Envoyez-nous un message</CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="bg-muted border-border"
                        data-testid="input-firstname"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="bg-muted border-border"
                        data-testid="input-lastname"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      className="bg-muted border-border"
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+33 6 12 34 56 78"
                      className="bg-muted border-border"
                      data-testid="input-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Sujet</Label>
                    <Input
                      id="subject"
                      placeholder="Objet de votre message"
                      className="bg-muted border-border"
                      data-testid="input-subject"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Décrivez votre demande..."
                      rows={5}
                      className="bg-muted border-border resize-none"
                      data-testid="input-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                    data-testid="button-submit-contact"
                  >
                    <Send className="mr-2" size={20} />
                    Envoyer le message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="glass-morphism neon-border">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Phone className="text-primary" size={24} />
                    </div>
                    <div>
                      <CardTitle>Téléphone</CardTitle>
                      <CardDescription className="text-base mt-1">+33 1 84 80 99 99</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Lundi - Vendredi: 9h00 - 19h00<br />
                    Samedi: 10h00 - 18h00<br />
                    Dimanche: Fermé
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-morphism neon-border">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Mail className="text-primary" size={24} />
                    </div>
                    <div>
                      <CardTitle>Email</CardTitle>
                      <CardDescription className="text-base mt-1">support@carivoo.com</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Nous répondons généralement sous 24 heures ouvrées.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-morphism neon-border">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <MapPin className="text-primary" size={24} />
                    </div>
                    <div>
                      <CardTitle>Adresse</CardTitle>
                      <CardDescription className="text-base mt-1">
                        Paris, France
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Notre siège social est basé à Paris. Nos agences partenaires sont présentes dans toute la France.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
