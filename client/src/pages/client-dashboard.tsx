import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Car, Clock, MapPin, Star, Eye } from "lucide-react";
import { useLocation } from "wouter";
import type { Reservation, Vehicle } from "@shared/schema";

interface ReservationWithVehicle extends Reservation {
  vehicle: Vehicle;
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
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-0 w-32 h-32 opacity-5">
          <div className="text-9xl">🌴</div>
        </div>
        <div className="absolute top-1/3 left-0 w-24 h-24 opacity-5">
          <div className="text-7xl">🌴</div>
        </div>
        <div className="absolute bottom-20 right-1/4 w-28 h-28 opacity-5">
          <div className="text-8xl">🌴</div>
        </div>
        
        {/* Neon Glow Effects */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <Navbar />
      
      <div className="pt-20 bg-background relative z-10">
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
                              {reservation.vehicle?.brand} {reservation.vehicle?.model}
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
                      
                      <div className="flex justify-end mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/vehicles/${reservation.vehicleId}`)}
                          data-testid={`button-view-vehicle-${reservation.id}`}
                        >
                          <Eye className="mr-2" size={16} />
                          Voir le véhicule
                        </Button>
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
