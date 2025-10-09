import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass-morphism neon-border p-6 sm:p-8 rounded-2xl bg-black/90 backdrop-blur-xl border border-primary/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Icon and Text */}
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Cookie className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2" data-testid="text-cookie-title">
                  Nous utilisons des cookies
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed" data-testid="text-cookie-description">
                  Nous utilisons des cookies pour améliorer votre expérience sur notre site, analyser le trafic et personnaliser le contenu. 
                  En cliquant sur "Accepter", vous acceptez l'utilisation de tous les cookies.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                onClick={handleDecline}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                data-testid="button-decline-cookies"
              >
                Refuser
              </Button>
              <Button
                onClick={handleAccept}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                data-testid="button-accept-cookies"
              >
                Accepter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
