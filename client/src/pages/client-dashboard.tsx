import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Car, Clock, MapPin, Star, Eye } from "lucide-react";
import { useLocation } from "wouter";
import type { Reservation, Vehicle, Agency } from "@shared/schema";
import ReservationChat from "@/components/reservation-chat";

interface ReservationWithVehicle extends Reservation {
  vehicle: Vehicle & { agency?: Agency };
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: reservations, isLoading } = useQuery<ReservationWithVehicle[]>({
    queryKey: ["/api/reservations"],
    queryFn: async () => {
      const response = await fetch("/api/reservations");
      if (!response.ok) throw new Error("Failed to fetch reservations");
      return response.json();
    },
  });

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
      title: "Réservations actives",
      value: reservations?.filter(r => r.status === "paid").length || 0,
      icon: Car,
      color: "from-primary to-secondary",
    },
    {
      title: "Total réservations",
      value: reservations?.length || 0,
      icon: Calendar,
      color: "from-secondary to-accent",
    },
    {
      title: "En attente",
      value: reservations?.filter(r => r.status === "pending").length || 0,
      icon: Clock,
      color: "from-accent to-primary",
    },
  ];

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
                Mon Tableau de Bord
              </h1>
              <p className="text-xl text-muted-foreground">
                Bienvenue, {user?.fullName || user?.username}
              </p>
            </div>
            <Button
              onClick={() => setLocation("/vehicles")}
              className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground px-6 py-3 font-bold"
              data-testid="button-explore-vehicles"
            >
              <Car className="mr-2" size={20} />
              Explorer les véhicules
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-morphism neon-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium mb-2">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-orbitron font-bold text-foreground" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center`}>
                      <stat.icon className="text-white" size={24} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Reservations Section */}
          <Card className="glass-morphism neon-border">
            <CardHeader>
              <CardTitle className="text-2xl font-orbitron font-bold text-foreground">
                Mes Réservations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : reservations?.length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="mx-auto mb-4 text-muted-foreground" size={64} />
                  <h3 className="text-xl font-bold mb-2">Aucune réservation</h3>
                  <p className="text-muted-foreground mb-6">
                    Vous n'avez pas encore effectué de réservation. Découvrez notre collection de véhicules premium.
                  </p>
                  <Button
                    onClick={() => setLocation("/vehicles")}
                    className="btn-neon bg-gradient-to-r from-primary to-secondary text-primary-foreground"
                    data-testid="button-browse-vehicles"
                  >
                    <Car className="mr-2" size={20} />
                    Parcourir les véhicules
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {reservations?.map((reservation) => (
                    <div key={reservation.id} className="glass-morphism rounded-xl overflow-hidden border border-primary/20 hover:border-primary/40 transition-all duration-300" data-testid={`reservation-card-${reservation.id}`}>
                      {/* Top gradient bar */}
                      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary"></div>
                      
                      <div className="p-6">
                        {/* Header Section - Vehicle & Agency Info */}
                        <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-6">
                          {/* Left: Vehicle Info */}
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="relative group">
                              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                              <img
                                src={reservation.vehicle?.photo || "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1074&q=80"}
                                alt={reservation.vehicle?.title}
                                className="relative w-24 h-24 object-cover rounded-lg border-2 border-primary/30"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-2xl font-orbitron font-bold text-foreground mb-1" data-testid={`reservation-vehicle-${reservation.id}`}>
                                {reservation.vehicle?.title}
                              </h3>
                              <p className="text-muted-foreground mb-2">
                                {reservation.vehicle?.brand} {reservation.vehicle?.model}
                              </p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <MapPin className="mr-1 text-accent" size={14} />
                                <span>{reservation.vehicle?.region}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Agency Info + Status */}
                          <div className="flex flex-col items-end gap-3 min-w-[280px]">
                            <Badge className={`${getStatusColor(reservation.status || 'pending')} text-white px-4 py-1`} data-testid={`reservation-status-${reservation.id}`}>
                              {getStatusLabel(reservation.status || 'pending')}
                            </Badge>
                            
                            {reservation.vehicle?.agency && (
                              <div className="glass-effect rounded-lg p-3 w-full border border-primary/20">
                                <p className="text-xs text-muted-foreground mb-1">Agence partenaire</p>
                                <h4 className="font-bold text-foreground text-sm mb-2" data-testid={`agency-name-${reservation.id}`}>
                                  {reservation.vehicle.agency.name}
                                </h4>
                                {(reservation.vehicle.agency.street || reservation.vehicle.agency.address) && (
                                  <div className="flex items-start gap-2">
                                    <MapPin className="text-accent flex-shrink-0 mt-0.5" size={14} />
                                    <p className="text-xs text-muted-foreground" data-testid={`agency-address-${reservation.id}`}>
                                      {reservation.vehicle.agency.street && reservation.vehicle.agency.address 
                                        ? `${reservation.vehicle.agency.street}, ${reservation.vehicle.agency.address}`
                                        : reservation.vehicle.agency.street || reservation.vehicle.agency.address}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-6"></div>

                        {/* Bottom Section - Dates & Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Date de début</p>
                            <p className="font-semibold text-foreground" data-testid={`reservation-start-${reservation.id}`}>
                              {new Date(reservation.startDate).toLocaleDateString('fr-FR', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Date de fin</p>
                            <p className="font-semibold text-foreground" data-testid={`reservation-end-${reservation.id}`}>
                              {new Date(reservation.endDate).toLocaleDateString('fr-FR', { 
                                day: '2-digit', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Durée</p>
                            <p className="font-semibold text-foreground" data-testid={`reservation-days-${reservation.id}`}>
                              {reservation.days} jour{reservation.days > 1 ? 's' : ''}
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                            <p className="font-bold text-primary text-2xl font-orbitron" data-testid={`reservation-total-${reservation.id}`}>
                              €{reservation.total}
                            </p>
                          </div>

                          <div className="flex flex-col gap-2">
                            {reservation.vehicle?.agency?.userId && (
                              <ReservationChat
                                reservationId={reservation.id}
                                receiverId={reservation.vehicle.agency.userId}
                                vehicleTitle={reservation.vehicle.title}
                              />
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/vehicles/${reservation.vehicleId}`)}
                              className="border-primary/30 hover:border-primary/60"
                              data-testid={`button-view-vehicle-${reservation.id}`}
                            >
                              <Eye className="mr-2" size={16} />
                              Voir le véhicule
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
