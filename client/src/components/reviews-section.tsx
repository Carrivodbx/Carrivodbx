import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@shared/schema";

interface ReviewsSectionProps {
  agencyId: string;
}

export function ReviewsSection({ agencyId }: ReviewsSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ["/api/agencies", agencyId, "reviews"],
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string; agencyId: string }) => {
      return await apiRequest(`/api/reviews`, "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agencies", agencyId, "reviews"] });
      setComment("");
      setRating(5);
      setShowForm(false);
      toast({
        title: "Avis ajouté",
        description: "Votre avis a été publié avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter votre avis",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour laisser un avis",
        variant: "destructive",
      });
      return;
    }
    
    createReviewMutation.mutate({
      rating,
      comment,
      agencyId,
    });
  };

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-orbitron font-bold mb-2" data-testid="text-reviews-title">
            Avis clients
          </h2>
          {reviews && reviews.length > 0 && (
            <div className="flex items-center gap-2" data-testid="text-average-rating">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(Number(averageRating))
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">{averageRating}</span>
              <span className="text-muted-foreground">({reviews.length} avis)</span>
            </div>
          )}
        </div>
        
        {user && user.role === "client" && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="premium-button"
            data-testid="button-add-review"
          >
            {showForm ? "Annuler" : "Laisser un avis"}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="glass-effect premium-border" data-testid="form-add-review">
          <CardHeader>
            <CardTitle>Votre avis</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Note</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                      data-testid={`button-rating-${star}`}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Commentaire (optionnel)</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  className="min-h-[100px]"
                  data-testid="input-review-comment"
                />
              </div>

              <Button
                type="submit"
                disabled={createReviewMutation.isPending}
                className="premium-button w-full"
                data-testid="button-submit-review"
              >
                {createReviewMutation.isPending ? "Publication..." : "Publier l'avis"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground text-center py-8">Chargement des avis...</p>
        ) : reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review.id} className="glass-effect premium-border" data-testid={`card-review-${review.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(review.createdAt!).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-muted-foreground" data-testid={`text-review-comment-${review.id}`}>
                    {review.comment}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="glass-effect premium-border">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground" data-testid="text-no-reviews">
                Aucun avis pour le moment. Soyez le premier à laisser un avis !
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
