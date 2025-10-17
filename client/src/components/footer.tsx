import { Link } from "wouter";
import { Instagram, Twitter } from "lucide-react";
import { SiTiktok } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <span className="text-3xl font-bold tracking-wider">CARIVOO</span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-md">
              La plateforme de référence pour la location de véhicules de luxe. 
              Connectons les passionnés d'automobile aux plus belles voitures du monde.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/carivoo_officiel" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-200" data-testid="link-instagram">
                <Instagram size={20} />
              </a>
              <a href="https://www.tiktok.com/@carivoo_" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-200" data-testid="link-tiktok">
                <SiTiktok size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-200" data-testid="link-twitter">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-lg font-orbitron font-bold text-foreground mb-4">Services</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/vehicles">
                  <span className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Location courte durée
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/vehicles">
                  <span className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Location longue durée
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/concierge">
                  <span className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Conciergerie
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/insurance">
                  <span className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Assurance premium
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-lg font-orbitron font-bold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/help">
                  <span className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Centre d'aide
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Contact
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <span className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Conditions d'utilisation
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <span className="text-muted-foreground hover:text-primary transition-colors duration-200">
                    Politique de confidentialité
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 Carivoo. Tous droits réservés. Développé avec passion pour les amateurs de belles voitures.
          </p>
        </div>
      </div>
    </footer>
  );
}
