import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/forgot-password", { email });
      return response.json();
    },
    onSuccess: () => {
      setEmailSent(true);
      toast({
        title: "Email envoyé",
        description: "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre adresse email",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive",
      });
      return;
    }

    forgotPasswordMutation.mutate(email);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Subtle Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-20 left-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
        <div className="absolute top-1/2 right-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 relative z-10">
        <Link href="/auth" className="flex items-center text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors" data-testid="link-auth">
          <ArrowLeft className="mr-2" size={20} />
          <span className="hidden sm:inline">Retour à la connexion</span>
          <span className="sm:hidden">Retour</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12 relative z-10">
        <Card className="glass-morphism neon-border w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Mail className="text-white" size={32} />
              </div>
            </div>
            <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
              Mot de passe oublié
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {emailSent 
                ? "Un email de réinitialisation a été envoyé"
                : "Entrez votre adresse email pour recevoir un lien de réinitialisation"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm text-muted-foreground text-center">
                    Vérifiez votre boîte mail et cliquez sur le lien de réinitialisation. Le lien est valide pendant 1 heure.
                  </p>
                </div>
                <Button
                  onClick={() => setLocation("/auth")}
                  className="w-full btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  data-testid="button-back-to-login"
                >
                  Retour à la connexion
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Adresse email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted border-border text-foreground"
                    required
                    data-testid="input-email"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                  className="w-full btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  data-testid="button-send-reset-email"
                >
                  {forgotPasswordMutation.isPending ? "Envoi en cours..." : "Envoyer le lien de réinitialisation"}
                </Button>

                <div className="text-center">
                  <Link href="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-back-to-login">
                    Retour à la connexion
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
