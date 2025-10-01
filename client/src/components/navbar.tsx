import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { User, LogOut, Menu, Home, Car, LayoutDashboard, Crown } from "lucide-react";
import logoPath from "@assets/imafe 3_1759282435961.jpg";
import { useState } from "react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full z-50 glass-morphism">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
            <img src={logoPath} alt="Carivoo Logo" className="h-16 sm:h-20 w-auto" style={{ mixBlendMode: 'screen', filter: 'brightness(2) contrast(2.5) saturate(1.5)' }} />
          </Link>
          
          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
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
                Tous les véhicules
              </span>
            </Link>
            <Link href="/vehicles?category=Sportive">
              <span className={`font-medium text-sm transition-colors duration-200 text-muted-foreground hover:text-primary`}>
                Sportive
              </span>
            </Link>
            <Link href="/vehicles?category=Berline">
              <span className={`font-medium text-sm transition-colors duration-200 text-muted-foreground hover:text-primary`}>
                Berline
              </span>
            </Link>
            <Link href="/vehicles?category=SUV Luxe">
              <span className={`font-medium text-sm transition-colors duration-200 text-muted-foreground hover:text-primary`}>
                SUV Luxe
              </span>
            </Link>
            <Link href="/vehicles?category=Cabriolet">
              <span className={`font-medium text-sm transition-colors duration-200 text-muted-foreground hover:text-primary`}>
                Cabriolet
              </span>
            </Link>
            <Link href="/vehicles?category=Électrique">
              <span className={`font-medium text-sm transition-colors duration-200 text-muted-foreground hover:text-primary`}>
                Électrique
              </span>
            </Link>
            <Link href="/vehicles?category=Hybride">
              <span className={`font-medium text-sm transition-colors duration-200 text-muted-foreground hover:text-primary`}>
                Hybride
              </span>
            </Link>
            <Link href="/vehicles?category=Supercar">
              <span className={`font-medium text-sm transition-colors duration-200 text-muted-foreground hover:text-primary`}>
                Supercar
              </span>
            </Link>
          </div>
          
          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2" data-testid="user-menu">
                    <User size={20} />
                    <span className="hidden lg:inline">{user.username}</span>
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
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
                  <Menu size={24} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] glass-morphism border-l border-border">
                <SheetHeader>
                  <SheetTitle className="text-left font-orbitron bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Navigation Links */}
                  <Link href="/" onClick={handleNavClick}>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start text-lg ${
                        location === "/" ? "text-primary bg-primary/10" : "text-foreground"
                      }`}
                      data-testid="mobile-link-home"
                    >
                      <Home className="mr-3" size={20} />
                      Accueil
                    </Button>
                  </Link>
                  
                  <Link href="/vehicles" onClick={handleNavClick}>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start text-lg ${
                        location === "/vehicles" ? "text-primary bg-primary/10" : "text-foreground"
                      }`}
                      data-testid="mobile-link-vehicles"
                    >
                      <Car className="mr-3" size={20} />
                      Tous les véhicules
                    </Button>
                  </Link>

                  <div className="h-px bg-border my-2" />
                  <p className="text-xs font-semibold text-muted-foreground px-3 py-1">CATÉGORIES</p>
                  
                  <Link href="/vehicles?category=Sportive" onClick={handleNavClick}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-base text-foreground"
                      data-testid="mobile-link-sportive"
                    >
                      Sportive
                    </Button>
                  </Link>
                  
                  <Link href="/vehicles?category=Berline" onClick={handleNavClick}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-base text-foreground"
                      data-testid="mobile-link-berline"
                    >
                      Berline
                    </Button>
                  </Link>
                  
                  <Link href="/vehicles?category=SUV Luxe" onClick={handleNavClick}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-base text-foreground"
                      data-testid="mobile-link-suv"
                    >
                      SUV Luxe
                    </Button>
                  </Link>
                  
                  <Link href="/vehicles?category=Cabriolet" onClick={handleNavClick}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-base text-foreground"
                      data-testid="mobile-link-cabriolet"
                    >
                      Cabriolet
                    </Button>
                  </Link>
                  
                  <Link href="/vehicles?category=Électrique" onClick={handleNavClick}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-base text-foreground"
                      data-testid="mobile-link-electrique"
                    >
                      Électrique
                    </Button>
                  </Link>
                  
                  <Link href="/vehicles?category=Hybride" onClick={handleNavClick}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-base text-foreground"
                      data-testid="mobile-link-hybride"
                    >
                      Hybride
                    </Button>
                  </Link>
                  
                  <Link href="/vehicles?category=Supercar" onClick={handleNavClick}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-base text-foreground"
                      data-testid="mobile-link-supercar"
                    >
                      Supercar
                    </Button>
                  </Link>

                  {/* User Section */}
                  {user ? (
                    <>
                      <div className="h-px bg-border my-4" />
                      
                      <Link href={user.role === "agency" ? "/dashboard/agency" : "/dashboard/client"} onClick={handleNavClick}>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-lg text-foreground"
                          data-testid="mobile-link-dashboard"
                        >
                          <LayoutDashboard className="mr-3" size={20} />
                          Dashboard
                        </Button>
                      </Link>

                      {user.role === "agency" && (
                        <Link href="/premium" onClick={handleNavClick}>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-lg text-foreground"
                            data-testid="mobile-link-premium"
                          >
                            <Crown className="mr-3" size={20} />
                            Premium
                          </Button>
                        </Link>
                      )}

                      <Button 
                        variant="ghost" 
                        onClick={handleLogout} 
                        className="w-full justify-start text-lg text-destructive"
                        data-testid="mobile-button-logout"
                      >
                        <LogOut className="mr-3" size={20} />
                        Déconnexion
                      </Button>

                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                            <User size={20} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.username}</p>
                            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-px bg-border my-4" />
                      
                      <Link href="/auth" onClick={handleNavClick}>
                        <Button 
                          variant="outline" 
                          className="w-full text-lg border-border"
                          data-testid="mobile-button-login"
                        >
                          Connexion
                        </Button>
                      </Link>
                      
                      <Link href="/auth" onClick={handleNavClick}>
                        <Button 
                          className="w-full btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground text-lg"
                          data-testid="mobile-button-signup"
                        >
                          Inscription
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
