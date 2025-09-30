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
    year: "",
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
        year: vehicle.year?.toString() || "",
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
        year: formData.year ? parseInt(formData.year) : null,
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "L'image ne doit pas dépasser 5MB",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      handleInputChange("photo", base64String);
    };
    reader.readAsDataURL(file);
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
          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} required>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div>
          <Label htmlFor="year" className="text-foreground">Année</Label>
          <Input
            id="year"
            type="number"
            min="1900"
            max="2030"
            placeholder="Ex: 2023"
            value={formData.year}
            onChange={(e) => handleInputChange("year", e.target.value)}
            className="bg-muted border-border text-foreground"
            data-testid="input-vehicle-year"
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
        <Label htmlFor="photo" className="text-foreground">Photo du véhicule</Label>
        <div className="mt-2">
          <div className="flex items-center gap-4">
            <label
              htmlFor="photo-upload"
              className="cursor-pointer inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-zinc-100 font-medium rounded-lg border border-zinc-700 transition-all duration-200"
              data-testid="button-upload-photo"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Choisir une image
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              data-testid="input-vehicle-photo-file"
            />
            {formData.photo && (
              <button
                type="button"
                onClick={() => handleInputChange("photo", "")}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
                data-testid="button-remove-photo"
              >
                Supprimer
              </button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Téléchargez une image haute qualité de votre véhicule (max 5MB)
          </p>
        </div>
        
        {/* Image Preview */}
        {formData.photo && (
          <div className="mt-4">
            <Label className="text-foreground mb-2 block">Aperçu de la photo</Label>
            <div className="relative rounded-lg overflow-hidden border-2 border-zinc-700">
              <img
                src={formData.photo}
                alt="Aperçu du véhicule"
                className="w-full h-64 object-cover"
                data-testid="img-vehicle-preview"
              />
            </div>
          </div>
        )}
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
