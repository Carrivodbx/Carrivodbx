import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 sm:pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mb-6">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-orbitron font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Politique de Confidentialité
            </h1>
            <p className="text-sm text-muted-foreground">
              Dernière mise à jour : 1er Octobre 2024
            </p>
          </div>

          <Card className="glass-morphism neon-border">
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Chez Carivoo, nous accordons une grande importance à la protection de vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations conformément au RGPD.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">2. Données Collectées</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nous collectons les informations suivantes :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Informations d'identification (nom, prénom, email, téléphone)</li>
                  <li>Informations de paiement (traitées de manière sécurisée via Stripe)</li>
                  <li>Permis de conduire et documents d'identité (pour la location)</li>
                  <li>Historique de réservations et préférences</li>
                  <li>Données de navigation (cookies, adresse IP)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">3. Utilisation des Données</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Vos données sont utilisées pour :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Traiter vos réservations et paiements</li>
                  <li>Vous fournir un service client personnalisé</li>
                  <li>Améliorer notre plateforme et nos services</li>
                  <li>Vous envoyer des communications marketing (avec votre consentement)</li>
                  <li>Respecter nos obligations légales et réglementaires</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">4. Partage des Données</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nous partageons vos données uniquement avec :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Les agences de location pour traiter vos réservations</li>
                  <li>Nos prestataires de services (paiement, hébergement)</li>
                  <li>Les autorités légales si la loi l'exige</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Nous ne vendons jamais vos données personnelles à des tiers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">5. Sécurité des Données</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, destruction ou altération. Cela inclut le chiffrement SSL, des serveurs sécurisés et des contrôles d'accès stricts.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">6. Conservation des Données</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nous conservons vos données personnelles aussi longtemps que nécessaire pour les finalités décrites dans cette politique, sauf si la loi exige ou autorise une période de conservation plus longue. Les données de réservation sont conservées pendant 3 ans après la fin du contrat.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">7. Vos Droits</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Droit d'accès à vos données personnelles</li>
                  <li>Droit de rectification de vos données</li>
                  <li>Droit à l'effacement (droit à l'oubli)</li>
                  <li>Droit à la limitation du traitement</li>
                  <li>Droit à la portabilité des données</li>
                  <li>Droit d'opposition au traitement</li>
                  <li>Droit de retirer votre consentement à tout moment</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Pour exercer vos droits, contactez-nous à : privacy@carivoo.com
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">8. Cookies</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nous utilisons des cookies pour améliorer votre expérience sur notre site. Vous pouvez contrôler et gérer les cookies via les paramètres de votre navigateur. Pour plus d'informations, consultez notre politique de cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">9. Modifications de la Politique</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Nous pouvons mettre à jour cette politique de confidentialité périodiquement. Nous vous informerons de tout changement significatif par email ou via une notification sur notre plateforme.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-orbitron font-bold mb-4">10. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Pour toute question concernant cette politique de confidentialité ou le traitement de vos données personnelles :<br/><br/>
                  Email : privacy@carivoo.com<br/>
                  Adresse : Carivoo, Paris, France<br/>
                  Délégué à la Protection des Données : dpo@carivoo.com
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
