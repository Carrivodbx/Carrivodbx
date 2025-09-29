import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Menu } from "lucide-react";
import logoPath from "@assets/Image 2_1759187802515.jpg";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-morphism">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <img src={logoPath} alt="Carivoo Logo" className="h-12 w-auto mix-blend-lighten" style={{ filter: 'brightness(1.1) contrast(1.2)' }} />
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <span className={`font-medium transition-colors duration-200 ${
                location === "/" ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}>
                Accueil
              </span>
            </Link>
            <Link href="/vehicles">
              <span className={`font-medium transition-colors duration-200 ${
                location === "/vehicles" ? "text-primary" : "text-muted-foreground hover:text-primary"
              }`}>
                Véhicules
              </span>
            </Link>
          </div>
          
          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2" data-testid="user-menu">
                    <User size={20} />
                    <span>{user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-morphism border-border">
                  <DropdownMenuItem asChild>
                    <Link href={user.role === "agency" ? "/dashboard/agency" : "/dashboard/client"} data-testid="link-dashboard">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "agency" && (
                    <DropdownMenuItem asChild>
                      <Link href="/premium" data-testid="link-premium">
                        Premium
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive" data-testid="button-logout">
                    <LogOut size={16} className="mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="text-foreground hover:text-primary" data-testid="button-login">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground" data-testid="button-signup">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
                <Menu size={20} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
