import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { insertVehicleSchema } from "@shared/schema";
import type { Vehicle } from "@shared/schema";

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function VehicleForm({ vehicle, onSuccess, onCancel }: VehicleFormProps) {
  const { toast } = useToast();
  const isEditing = !!vehicle;

  const [formData, setFormData] = useState({
    title: "",
    brand: "",
    model: "",
    category: "",
    pricePerDay: "",
    depositAmount: "",
    cashDepositAllowed: false,
    region: "",
    description: "",
    photo: "",
    available: true,
    seats: "",
  });

  // Populate form when editing
  useEffect(() => {
    if (vehicle) {
      setFormData({
        title: vehicle.title,
        brand: vehicle.brand,
        model: vehicle.model,
        category: vehicle.category,
        pricePerDay: vehicle.pricePerDay,
        depositAmount: vehicle.depositAmount || "",
        cashDepositAllowed: vehicle.cashDepositAllowed ?? false,
        region: vehicle.region,
        description: vehicle.description || "",
        photo: vehicle.photo || "",
        available: vehicle.available ?? true,
        seats: vehicle.seats?.toString() || "",
      });
    }
  }, [vehicle]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/vehicles", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency/vehicles"] });
      toast({
        title: "Véhicule créé",
        description: "Le véhicule a été ajouté avec succès à votre flotte",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/vehicles/${vehicle!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agency/vehicles"] });
      toast({
        title: "Véhicule modifié",
        description: "Les modifications ont été enregistrées avec succès",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const vehicleData = {
        title: formData.title,
        brand: formData.brand,
        model: formData.model,
        category: formData.category,
        pricePerDay: formData.pricePerDay,
        depositAmount: formData.depositAmount || null,
        cashDepositAllowed: formData.cashDepositAllowed,
        region: formData.region,
        description: formData.description,
        photo: formData.photo,
        available: formData.available,
        seats: formData.seats ? parseInt(formData.seats) : null,
      };

      // Validate using schema (excluding agencyId as it's added server-side)
      const validatedData = insertVehicleSchema.omit({ agencyId: true }).parse(vehicleData);

      if (isEditing) {
        updateMutation.mutate(validatedData);
      } else {
        createMutation.mutate(validatedData);
      }
    } catch (error: any) {
      toast({
        title: "Erreur de validation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const categories = [
    "Sportive",
    "SUV Luxe",
    "Berline",
    "Cabriolet",
    "Électrique",
    "Hybride",
    "Classique",
    "Autre",
  ];

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-foreground">Titre du véhicule *</Label>
          <Input
            id="title"
            type="text"
            placeholder="Ex: BMW M4 Competition"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="bg-muted border-border text-foreground"
            required
            data-testid="input-vehicle-title"
          />
        </div>

        <div>
          <Label htmlFor="category" className="text-foreground">Catégorie *</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
            <SelectTrigger className="bg-muted border-border text-foreground" data-testid="select-vehicle-category">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent className="glass-morphism border-border">
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="brand" className="text-foreground">Marque *</Label>
          <Input
            id="brand"
            type="text"
            placeholder="Ex: BMW"
            value={formData.brand}
            onChange={(e) => handleInputChange("brand", e.target.value)}
            className="bg-muted border-border text-foreground"
            required
            data-testid="input-vehicle-brand"
          />
        </div>

        <div>
          <Label htmlFor="model" className="text-foreground">Modèle *</Label>
          <Input
            id="model"
            type="text"
            placeholder="Ex: M4 Competition"
            value={formData.model}
            onChange={(e) => handleInputChange("model", e.target.value)}
            className="bg-muted border-border text-foreground"
            required
            data-testid="input-vehicle-model"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price" className="text-foreground">Prix par jour (€) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 150.00"
            value={formData.pricePerDay}
            onChange={(e) => handleInputChange("pricePerDay", e.target.value)}
            className="bg-muted border-border text-foreground"
            required
            data-testid="input-vehicle-price"
          />
        </div>

        <div>
          <Label htmlFor="deposit" className="text-foreground">Caution (€)</Label>
          <Input
            id="deposit"
            type="number"
            step="0.01"
            min="0"
            placeholder="Ex: 500.00"
            value={formData.depositAmount}
            onChange={(e) => handleInputChange("depositAmount", e.target.value)}
            disabled={formData.cashDepositAllowed}
            className={`border-border text-foreground ${formData.cashDepositAllowed ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50' : 'bg-muted'}`}
            data-testid="input-vehicle-deposit"
          />
          <p className="text-sm text-muted-foreground mt-1">
            {formData.cashDepositAllowed 
              ? "Le montant sera défini lors de la prise du véhicule en espèces" 
              : "Montant de la caution qui sera rendu à la fin de la location"}
          </p>
          <div className="flex items-center space-x-2 mt-3">
            <Switch
              id="cashDeposit"
              checked={formData.cashDepositAllowed}
              onCheckedChange={(checked) => {
                handleInputChange("cashDepositAllowed", checked);
                if (checked) {
                  handleInputChange("depositAmount", "");
                }
              }}
              data-testid="switch-cash-deposit"
            />
            <Label htmlFor="cashDeposit" className="text-foreground text-sm">
              Possibilité de donner la caution en espèces
            </Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="seats" className="text-foreground">Nombre de places</Label>
          <Input
            id="seats"
            type="number"
            min="1"
            max="8"
            placeholder="Ex: 4"
            value={formData.seats}
            onChange={(e) => handleInputChange("seats", e.target.value)}
            className="bg-muted border-border text-foreground"
            data-testid="input-vehicle-seats"
          />
        </div>

        <div>
          <Label htmlFor="region" className="text-foreground">Région *</Label>
          <Input
            id="region"
            type="text"
            placeholder="Ex: Paris, France"
            value={formData.region}
            onChange={(e) => handleInputChange("region", e.target.value)}
            className="bg-muted border-border text-foreground"
            required
            data-testid="input-vehicle-region"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="photo" className="text-foreground">URL de la photo</Label>
        <Input
          id="photo"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={formData.photo}
          onChange={(e) => handleInputChange("photo", e.target.value)}
          className="bg-muted border-border text-foreground"
          data-testid="input-vehicle-photo"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Ajoutez l'URL d'une image haute qualité de votre véhicule
        </p>
      </div>

      <div>
        <Label htmlFor="description" className="text-foreground">Description</Label>
        <Textarea
          id="description"
          placeholder="Décrivez votre véhicule, ses caractéristiques spéciales, équipements inclus..."
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="bg-muted border-border text-foreground min-h-24"
          data-testid="textarea-vehicle-description"
        />
      </div>

      <div className="flex items-center space-x-3">
        <Switch
          id="available"
          checked={formData.available}
          onCheckedChange={(checked) => handleInputChange("available", checked)}
          data-testid="switch-vehicle-available"
        />
        <Label htmlFor="available" className="text-foreground">
          Véhicule disponible à la location
        </Label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          data-testid="button-cancel-vehicle-form"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="btn-neon flex-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-bold"
          data-testid="button-submit-vehicle-form"
        >
          {isLoading ? (
            isEditing ? "Modification..." : "Création..."
          ) : (
            isEditing ? "Modifier le véhicule" : "Ajouter le véhicule"
          )}
        </Button>
      </div>
    </form>
  );
}
