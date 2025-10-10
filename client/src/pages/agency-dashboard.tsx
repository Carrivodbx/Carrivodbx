import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/navbar";
import VehicleForm from "@/components/vehicle-form";
import ReservationChat from "@/components/reservation-chat";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Car, Edit, Trash2, Eye, TrendingUp, Crown, Sparkles, Calendar, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Vehicle, Agency, Subscription, Reservation, User } from "@shared/schema";
import porscheNightBackground from "@assets/stock_images/porsche_rear_view_ba_b54491f8.jpg";

interface ReservationWithDetails extends Reservation {
  vehicle?: Vehicle;
  user?: User;
}

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const { data: agency } = useQuery<Agency>({
    queryKey: ["/api/agency/profile"],
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/agency/vehicles"],
  });

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ["/api/agency/subscription"],
    enabled: !!agency,
  });

  const { data: reservations, isLoading: reservationsLoading } = useQuery<ReservationWithDetails[]>({
    queryKey: ["/api/agency/reservations"],
    enabled: !!agency,
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      await apiRequest("DELETE", `/api/vehicles/${vehicleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency/vehicles"] });
      toast({
        title: "Véhicule supprimé",
        description: "Le véhicule a été supprimé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteVehicle = (vehicleId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
      deleteVehicleMutation.mutate(vehicleId);
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsVehicleFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsVehicleFormOpen(false);
    setEditingVehicle(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Payée";
      case "pending":
        return "En attente";
      case "completed":
        return "Terminée";
      case "cancelled":
        return "Annulée";
      default:
        return status;
    }
  };

  const stats = [
    {
      title: "Véhicules actifs",
      value: vehicles?.filter(v => v.available).length || 0,
      icon: Car,
      color: "from-primary to-secondary",
    },
    {
      title: "Total véhicules",
      value: vehicles?.length || 0,
      icon: TrendingUp,
      color: "from-secondary to-accent",
    },
    {
      title: "Réservations",
      value: "0", // TODO: Implement reservations count
      icon: Eye,
      color: "from-accent to-primary",
    },
  ];

  if (!agency) {
    return (
      <div className="min-h-screen relative overflow-x-hidden">
        {/* Background Image */}
        <div className="fixed inset-0 z-0">
          <img 
            src={porscheNightBackground}
            alt="Porsche rear view night city" 
            className="w-full h-full object-cover opacity-5" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
        </div>

        {/* Subtle Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-20 right-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
          <div className="absolute bottom-40 left-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
        </div>

        <Navbar />
        <div className="pt-32 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <Card className="glass-effect premium-border subtle-shadow p-8 md:p-12 animate-fade-in-up">
              <div className="text-center">
                {/* Icon */}
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                  <Car className="text-white" size={48} />
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-6 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Bienvenue dans votre espace agence
                </h1>

                {/* Description */}
                <div className="space-y-4 mb-10 text-lg text-foreground">
                  <p className="leading-relaxed">
                    Pour commencer à proposer vos véhicules de luxe sur la plateforme Carivoo,
                    vous devez d'abord <strong className="text-blue-500">créer votre profil d'agence</strong>.
                  </p>
                  
                  <p className="leading-relaxed text-muted-foreground">
                    Ce profil permettra à vos clients de découvrir votre agence, 
                    vos services et votre expertise dans la location de véhicules haut de gamme.
                  </p>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-6">
                    <p className="text-blue-900 dark:text-blue-100 font-semibold text-xl">
                      Une fois votre profil créé, vous pourrez :
                    </p>
                    <ul className="mt-4 space-y-2 text-left text-blue-800 dark:text-blue-200">
                      <li className="flex items-start">
                        <span className="mr-3 text-2xl">✓</span>
                        <span>Ajouter et gérer votre flotte de véhicules</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-3 text-2xl">✓</span>
                        <span>Recevoir des demandes de réservation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-3 text-2xl">✓</span>
                        <span>Suivre vos revenus et statistiques</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-3 text-2xl">✓</span>
                        <span>Accéder à la gestion complète de votre activité</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Big Blue Button */}
                <div className="mt-10">
                  <Button 
                    onClick={() => {
                      console.log("=== NAVIGATION TO SETUP ===");
                      setLocation("/dashboard/agency/setup");
                    }}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-16 py-8 text-2xl font-bold rounded-xl shadow-2xl transition-all hover:scale-105 hover:shadow-blue-500/50"
                    data-testid="button-create-agency-profile"
                  >
                    <Car className="mr-4" size={32} />
                    CRÉER MON PROFIL D'AGENCE
                  </Button>
                  
                  <p className="mt-6 text-sm text-muted-foreground">
                    Cela ne prendra que quelques minutes
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={porscheNightBackground}
          alt="Porsche rear view night city" 
          className="w-full h-full object-cover opacity-5" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background"></div>
      </div>

      {/* Subtle Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-20 right-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
        <div className="absolute bottom-40 left-20 w-px h-40 bg-gradient-to-b from-transparent via-border to-transparent"></div>
      </div>

      <Navbar />
      
      <div className="pt-24 sm:pt-28 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-orbitron font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
                Tableau de Bord Agence
              </h1>
              <p className="text-xl text-muted-foreground">
                Bienvenue, {agency.name}
              </p>
            </div>
            <Button
              onClick={() => setIsVehicleFormOpen(true)}
              className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-3 font-bold"
              data-testid="button-add-vehicle"
            >
              <Plus className="mr-2" size={20} />
              Ajouter un véhicule
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-effect premium-border hover-lift animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium mb-2">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-orbitron font-bold metallic-text" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center animate-glow`}>
                      <stat.icon className="text-white" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Premium Subscription Section */}
          {!subscription?.active && (
            <Card className="glass-effect premium-border subtle-shadow hover-lift mb-12 border-2 border-accent/30 animate-fade-in-up">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <Crown className="text-accent" size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-orbitron font-bold text-foreground mb-2 flex items-center gap-2">
                        Visibilité Premium
                        <Sparkles className="text-accent" size={20} />
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        Multipliez vos réservations avec un meilleur positionnement dans les résultats de recherche
                      </p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <span className="text-accent">✓</span>
                          <span>Badge "Premium" sur vos véhicules</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-accent">✓</span>
                          <span>Priorité dans les résultats de recherche</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-accent">✓</span>
                          <span>Statistiques avancées</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-center">
                      <p className="text-4xl font-orbitron font-bold text-accent">29,99€</p>
                      <p className="text-sm text-muted-foreground">par mois</p>
                    </div>
                    <Button
                      onClick={() => setLocation("/premium")}
                      className="btn-neon bg-gradient-to-r from-secondary to-accent text-white hover:from-accent hover:to-primary px-8 py-6 text-lg font-bold transition-all"
                      data-testid="button-subscribe-premium"
                    >
                      <Crown className="mr-2" size={20} />
                      S'abonner maintenant
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {subscription?.active && (
            <Card className="glass-morphism neon-border mb-12 border-2 border-accent/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center">
                    <Crown className="text-accent" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-orbitron font-bold text-foreground flex items-center gap-2">
                      Abonnement Premium Actif
                      <Badge className="bg-gradient-to-r from-secondary to-accent text-white">Active</Badge>
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Vos véhicules bénéficient d'une visibilité maximale
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vehicles Section */}
          <Card className="glass-morphism neon-border">
            <CardHeader>
              <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
                Mes Véhicules
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehiclesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : vehicles?.length === 0 ? (
                <div className="text-center py-16">
                  <Car className="mx-auto mb-4 text-muted-foreground" size={64} />
                  <h3 className="text-xl font-bold mb-2">Aucun véhicule</h3>
                  <p className="text-muted-foreground mb-6">
                    Commencez par ajouter votre premier véhicule à votre flotte.
                  </p>
                  <Button
                    onClick={() => setIsVehicleFormOpen(true)}
                    className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                    data-testid="button-add-first-vehicle"
                  >
                    <Plus className="mr-2" size={20} />
                    Ajouter un véhicule
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles?.map((vehicle) => (
                    <div key={vehicle.id} className="glass-morphism rounded-xl overflow-hidden" data-testid={`vehicle-card-${vehicle.id}`}>
                      <div className="relative">
                        <img
                          src={vehicle.photo || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"}
                          alt={vehicle.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant={vehicle.available ? "default" : "secondary"}>
                            {vehicle.available ? "Disponible" : "Indisponible"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2 text-foreground">{vehicle.title}</h3>
                        <p className="text-muted-foreground text-sm mb-2">{vehicle.brand} {vehicle.model}</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-primary">€{vehicle.pricePerDay}</span>
                          <span className="text-muted-foreground">/jour</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditVehicle(vehicle)}
                            className="flex-1"
                            data-testid={`button-edit-${vehicle.id}`}
                          >
                            <Edit size={16} className="mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="text-destructive hover:text-destructive"
                            data-testid={`button-delete-${vehicle.id}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reservations Section */}
          <Card className="glass-morphism neon-border">
            <CardHeader>
              <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
                Réservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reservationsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : reservations?.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="mx-auto mb-4 text-muted-foreground" size={64} />
                  <h3 className="text-xl font-bold mb-2">Aucune réservation</h3>
                  <p className="text-muted-foreground">
                    Vos clients pourront réserver vos véhicules et vous pourrez gérer les réservations ici.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reservations?.map((reservation) => (
                    <div key={reservation.id} className="glass-morphism rounded-xl p-6 border border-border" data-testid={`reservation-card-${reservation.id}`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={reservation.vehicle?.photo || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"}
                            alt={reservation.vehicle?.title}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="text-xl font-orbitron font-bold text-foreground" data-testid={`reservation-vehicle-${reservation.id}`}>
                              {reservation.vehicle?.title}
                            </h3>
                            <p className="text-muted-foreground">
                              Client: {reservation.user?.fullName || reservation.user?.username}
                            </p>
                            <div className="flex items-center mt-2 text-muted-foreground">
                              <MapPin className="mr-2" size={16} />
                              <span>{reservation.vehicle?.region}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(reservation.status || 'pending')} text-white`} data-testid={`reservation-status-${reservation.id}`}>
                          {getStatusLabel(reservation.status || 'pending')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date de début</p>
                          <p className="font-medium text-foreground" data-testid={`reservation-start-${reservation.id}`}>
                            {new Date(reservation.startDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Date de fin</p>
                          <p className="font-medium text-foreground" data-testid={`reservation-end-${reservation.id}`}>
                            {new Date(reservation.endDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Durée</p>
                          <p className="font-medium text-foreground" data-testid={`reservation-days-${reservation.id}`}>
                            {reservation.days} jour{reservation.days > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-bold text-primary text-lg" data-testid={`reservation-total-${reservation.id}`}>
                            €{reservation.total}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-4">
                        {reservation.user?.id && (
                          <ReservationChat
                            reservationId={reservation.id}
                            receiverId={reservation.user.id}
                            vehicleTitle={reservation.vehicle?.title || 'Véhicule'}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Vehicle Form Dialog */}
      <Dialog open={isVehicleFormOpen} onOpenChange={setIsVehicleFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-morphism border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-orbitron font-bold text-foreground">
              {editingVehicle ? "Modifier le véhicule" : "Ajouter un véhicule"}
            </DialogTitle>
          </DialogHeader>
          <VehicleForm
            vehicle={editingVehicle}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
