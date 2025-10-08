import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FavoriteButtonProps {
  vehicleId: string;
  className?: string;
}

export function FavoriteButton({ vehicleId, className = "" }: FavoriteButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  const { data: favoriteCheck } = useQuery<{ isFavorite: boolean; favoriteId?: string }>({
    queryKey: ["/api/favorites/check", vehicleId],
    enabled: !!user,
  });

  useEffect(() => {
    if (favoriteCheck) {
      setIsFavorite(favoriteCheck.isFavorite);
      setFavoriteId(favoriteCheck.favoriteId || null);
    }
  }, [favoriteCheck]);

  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/favorites", "POST", { vehicleId });
    },
    onSuccess: (data: any) => {
      setIsFavorite(true);
      setFavoriteId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/check", vehicleId] });
      toast({
        title: "Ajouté aux favoris",
        description: "Véhicule ajouté à vos favoris",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter aux favoris",
        variant: "destructive",
      });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!favoriteId) throw new Error("No favorite ID");
      return await apiRequest(`/api/favorites/${favoriteId}`, "DELETE");
    },
    onSuccess: () => {
      setIsFavorite(false);
      setFavoriteId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      queryClient.invalidateQueries({ queryKey: ["/api/favorites/check", vehicleId] });
      toast({
        title: "Retiré des favoris",
        description: "Véhicule retiré de vos favoris",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de retirer des favoris",
        variant: "destructive",
      });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connectez-vous pour ajouter des favoris",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  if (!user || user.role !== "client") {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all ${className}`}
      data-testid={`button-favorite-${vehicleId}`}
    >
      <Heart
        className={`w-5 h-5 transition-all ${
          isFavorite ? "fill-primary text-primary" : "text-white"
        }`}
      />
    </button>
  );
}
