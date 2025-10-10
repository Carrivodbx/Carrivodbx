import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Building, ArrowLeft, Eye, EyeOff } from "lucide-react";
import logoPath from "@assets/Image4_1759292728996.jpg";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema } from "@shared/schema";
import { Link } from "wouter";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Login form state
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "client" as "client" | "agency",
    fullName: "",
    phone: "",
    region: "",
  });

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // If user is already authenticated, redirect to appropriate dashboard
  if (user) {
    setLocation(user.role === "agency" ? "/dashboard/agency" : "/dashboard/client");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate(loginData);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    // Validate password requirements
    if (registerData.password.length < 8) {
      toast({
        title: "Mot de passe trop court",
        description: "Le mot de passe doit contenir au moins 8 caractères",
        variant: "destructive",
      });
      return;
    }

    if (!/\d/.test(registerData.password)) {
      toast({
        title: "Mot de passe invalide",
        description: "Le mot de passe doit contenir au moins un chiffre",
        variant: "destructive",
      });
      return;
    }

    try {
      const userData = insertUserSchema.parse({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        role: registerData.role,
        fullName: registerData.fullName,
        phone: registerData.phone,
        region: registerData.region,
      });

      registerMutation.mutate(userData);
    } catch (error: any) {
      toast({
        title: "Erreur de validation",
        description: error.message,
        variant: "destructive",
      });
    }
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
        <Link href="/" className="flex items-center text-sm sm:text-base text-muted-foreground hover:text-primary transition-colors" data-testid="link-home">
          <ArrowLeft className="mr-2" size={20} />
          <span className="hidden sm:inline">Retour à l'accueil</span>
          <span className="sm:hidden">Retour</span>
        </Link>
        <img src={logoPath} alt="Carivoo Logo" className="h-8 sm:h-10 w-auto" />
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 relative z-10 py-6 sm:py-0">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
          
          {/* Auth Forms */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="glass-morphism neon-border">
              <CardHeader className="text-center p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl font-orbitron font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Bienvenue sur Carivoo
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-muted-foreground">
                  Connectez-vous ou créez votre compte pour accéder aux véhicules de luxe
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login" className="font-medium" data-testid="tab-login">Connexion</TabsTrigger>
                    <TabsTrigger value="register" className="font-medium" data-testid="tab-register">Inscription</TabsTrigger>
                  </TabsList>
                  
                  {/* Login Form */}
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="username">Nom d'utilisateur</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="votre.nom"
                          value={loginData.username}
                          onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                          className="bg-muted border-border"
                          data-testid="input-login-username"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="password">Mot de passe</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={loginData.password}
                            onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                            className="bg-muted border-border pr-10"
                            data-testid="input-login-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            data-testid="button-toggle-login-password"
                          >
                            {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      
                      <Button
                        type="submit"
                        className="btn-neon w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold"
                        disabled={loginMutation.isPending}
                        data-testid="button-submit-login"
                      >
                        {loginMutation.isPending ? "Connexion..." : "Se connecter"}
                      </Button>
                      
                      <div className="text-center">
                        <Link 
                          href="/forgot-password" 
                          className="text-sm text-muted-foreground hover:text-primary transition-colors" 
                          data-testid="link-forgot-password"
                        >
                          Mot de passe oublié ?
                        </Link>
                      </div>
                    </form>
                  </TabsContent>
                  
                  {/* Register Form */}
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      {/* Role Selection */}
                      <div>
                        <Label>Type de compte</Label>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant={registerData.role === "client" ? "default" : "outline"}
                            className={`flex-1 ${registerData.role === "client" ? "bg-gradient-to-r from-primary to-secondary" : ""}`}
                            onClick={() => setRegisterData(prev => ({ ...prev, role: "client" }))}
                            data-testid="button-select-client"
                          >
                            <User className="mr-2" size={16} />
                            Client
                          </Button>
                          <Button
                            type="button"
                            variant={registerData.role === "agency" ? "default" : "outline"}
                            className={`flex-1 ${registerData.role === "agency" ? "bg-gradient-to-r from-primary to-secondary" : ""}`}
                            onClick={() => setRegisterData(prev => ({ ...prev, role: "agency" }))}
                            data-testid="button-select-agency"
                          >
                            <Building className="mr-2" size={16} />
                            Agence
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reg-username">Nom d'utilisateur</Label>
                          <Input
                            id="reg-username"
                            type="text"
                            placeholder="votre.nom"
                            value={registerData.username}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, username: e.target.value }))}
                            className="bg-muted border-border"
                            data-testid="input-register-username"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="reg-email">Email</Label>
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="votre@email.com"
                            value={registerData.email}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                            className="bg-muted border-border"
                            data-testid="input-register-email"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="reg-fullname">Nom complet</Label>
                        <Input
                          id="reg-fullname"
                          type="text"
                          placeholder="Votre nom complet"
                          value={registerData.fullName}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="bg-muted border-border"
                          data-testid="input-register-fullname"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reg-phone">Téléphone</Label>
                          <Input
                            id="reg-phone"
                            type="tel"
                            placeholder="+33 6 12 34 56 78"
                            value={registerData.phone}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-muted border-border"
                            data-testid="input-register-phone"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="reg-region">Région</Label>
                          <Input
                            id="reg-region"
                            type="text"
                            placeholder="Paris, France"
                            value={registerData.region}
                            onChange={(e) => setRegisterData(prev => ({ ...prev, region: e.target.value }))}
                            className="bg-muted border-border"
                            data-testid="input-register-region"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="reg-password">Mot de passe</Label>
                          <div className="relative">
                            <Input
                              id="reg-password"
                              type={showRegisterPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={registerData.password}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                              className="bg-muted border-border pr-10"
                              data-testid="input-register-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              data-testid="button-toggle-register-password"
                            >
                              {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Minimum 8 caractères avec au moins 1 chiffre
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="reg-confirm-password">Confirmer</Label>
                          <div className="relative">
                            <Input
                              id="reg-confirm-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={registerData.confirmPassword}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="bg-muted border-border pr-10"
                              data-testid="input-register-confirm-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              data-testid="button-toggle-confirm-password"
                            >
                              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        type="submit"
                        className="btn-neon w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold"
                        disabled={registerMutation.isPending}
                        data-testid="button-submit-register"
                      >
                        {registerMutation.isPending ? "Création..." : "Créer mon compte"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Hero Section */}
          <div className="hidden lg:block">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"
                alt="Voiture de luxe dans un environnement premium"
                className="w-full h-[600px] object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-2xl"></div>
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl"></div>
              
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="text-center text-white">
                  <h2 className="text-4xl font-orbitron font-bold mb-4">
                    Votre Aventure Luxueuse Commence Ici
                  </h2>
                  <p className="text-xl mb-6">
                    Rejoignez la communauté exclusive des amateurs de véhicules d'exception
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-orbitron font-bold text-primary">500+</div>
                      <div className="text-sm">Véhicules Premium</div>
                    </div>
                    <div>
                      <div className="text-2xl font-orbitron font-bold text-secondary">50+</div>
                      <div className="text-sm">Agences Partenaires</div>
                    </div>
                    <div>
                      <div className="text-2xl font-orbitron font-bold text-accent">1000+</div>
                      <div className="text-sm">Clients Satisfaits</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
