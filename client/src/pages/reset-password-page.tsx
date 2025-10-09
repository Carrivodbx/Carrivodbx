import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Lock, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  // Extract token from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast({
        title: "Token manquant",
        description: "Le lien de réinitialisation est invalide",
        variant: "destructive",
      });
    }
  }, [search]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await apiRequest("POST", "/api/reset-password", data);
      return response.json();
    },
    onSuccess: () => {
      setResetSuccess(true);
      toast({
        title: "Mot de passe réinitialisé",
        description: "Votre mot de passe a été changé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Le token est invalide ou expiré",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    // Validate password requirements
    if (password.length < 8) {
      toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive",
      });
      return;
    }

    if (!/\d/.test(password)) {
      toast({
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir au moins un chiffre",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Token manquant",
        description: "Le lien de réinitialisation est invalide",
        variant: "destructive",
      });
      return;
    }

    resetPasswordMutation.mutate({ token, password });
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
                {resetSuccess ? (
                  <CheckCircle className="text-white" size={32} />
                ) : (
                  <Lock className="text-white" size={32} />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
              {resetSuccess ? "Mot de passe réinitialisé" : "Nouveau mot de passe"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {resetSuccess 
                ? "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe"
                : "Entrez votre nouveau mot de passe"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resetSuccess ? (
              <Button
                onClick={() => setLocation("/auth")}
                className="w-full btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                data-testid="button-go-to-login"
              >
                Se connecter
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Nouveau mot de passe
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted border-border text-foreground"
                    required
                    data-testid="input-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Le mot de passe doit contenir au moins 8 caractères et un chiffre
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    Confirmer le mot de passe
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-muted border-border text-foreground"
                    required
                    data-testid="input-confirm-password"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                  data-testid="button-reset-password"
                >
                  {resetPasswordMutation.isPending ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
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
