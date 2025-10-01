import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 sm:pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-6">
              <FileText className="text-white" size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Conditions d'Utilisation
            </h1>
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : 1er Octobre 2024
            </p>
          </div>

          <Card className="glass-morphism neon-border">
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">1. Acceptation des Conditions</h2>
                <p className="text-muted-foreground leading-relaxed">
                  En accédant et en utilisant la plateforme Carivoo, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">2. Services Proposés</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Carivoo est une plateforme de mise en relation entre des agences de location de véhicules de luxe et des clients. Nous facilitons la réservation et la location de véhicules haut de gamme.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">3. Inscription et Compte Utilisateur</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Pour utiliser certains services, vous devez créer un compte. Vous vous engagez à :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Fournir des informations exactes et à jour</li>
                  <li>Maintenir la sécurité de votre mot de passe</li>
                  <li>Être responsable de toutes les activités sur votre compte</li>
                  <li>Avoir au minimum 21 ans et posséder un permis de conduire valide</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">4. Réservations et Paiements</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Les réservations sont soumises aux conditions suivantes :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Le paiement intégral est requis au moment de la réservation</li>
                  <li>Une caution est prélevée lors de la prise du véhicule</li>
                  <li>Les tarifs incluent l'assurance premium et les taxes</li>
                  <li>Les annulations sont possibles selon les conditions de l'agence</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">5. Utilisation du Véhicule</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Le locataire s'engage à :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Utiliser le véhicule conformément aux lois en vigueur</li>
                  <li>Ne pas sous-louer le véhicule à un tiers</li>
                  <li>Restituer le véhicule dans l'état de départ</li>
                  <li>Informer immédiatement l'agence en cas d'accident ou de dommage</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">6. Responsabilité</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Carivoo agit uniquement comme intermédiaire entre les agences et les clients. La responsabilité en cas de litige incombe principalement à l'agence de location. Nous déclinons toute responsabilité pour les dommages indirects ou consécutifs.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">7. Propriété Intellectuelle</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Tous les contenus de la plateforme (textes, images, logos, marques) sont la propriété exclusive de Carivoo ou de ses partenaires. Toute reproduction non autorisée est interdite.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">8. Modification des Conditions</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Carivoo se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements significatifs par email ou via la plateforme.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">9. Loi Applicable</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ces conditions sont régies par le droit français. Tout litige sera soumis aux tribunaux compétents de Paris.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">10. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Pour toute question concernant ces conditions, contactez-nous à : support@carivoo.com
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
