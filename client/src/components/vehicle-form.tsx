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
    photos: [] as string[],
    available: true,
    seats: "",
    horsepower: "",
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
        photos: vehicle.photos || [],
        available: vehicle.available ?? true,
        seats: vehicle.seats?.toString() || "",
        horsepower: vehicle.horsepower?.toString() || "",
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
        photos: formData.photos.length > 0 ? formData.photos : null,
        available: formData.available,
        seats: formData.seats ? parseInt(formData.seats) : null,
        horsepower: formData.horsepower ? parseInt(formData.horsepower) : null,
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
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner uniquement des fichiers image",
          variant: "destructive",
        });
        return;
      }

      // Check file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "Chaque image ne doit pas dépasser 20MB",
          variant: "destructive",
        });
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, base64String],
          photo: prev.photo || base64String, // Keep first photo as main photo for backwards compatibility
        }));
      };
      reader.readAsDataURL(file);
    });
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
          <Label htmlFor="horsepower" className="text-foreground">Chevaux (CV)</Label>
          <Input
            id="horsepower"
            type="number"
            min="1"
            placeholder="Ex: 450"
            value={formData.horsepower}
            onChange={(e) => handleInputChange("horsepower", e.target.value)}
            className="bg-muted border-border text-foreground"
            data-testid="input-vehicle-horsepower"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
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
        <Label htmlFor="photo" className="text-foreground font-semibold text-lg mb-3 block">Photos du véhicule *</Label>
        <div className="mt-2">
          {/* Photo Gallery */}
          {formData.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="relative rounded-xl overflow-hidden border-2 border-zinc-700">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-40 object-cover"
                      data-testid={`img-vehicle-preview-${index}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newPhotos = formData.photos.filter((_, i) => i !== index);
                      setFormData(prev => ({
                        ...prev,
                        photos: newPhotos,
                        photo: newPhotos[0] || "",
                      }));
                    }}
                    className="absolute top-2 right-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                    data-testid={`button-remove-photo-${index}`}
                  >
                    ✕
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary/90 text-white text-xs font-medium rounded">
                      Photo principale
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Add Photo Button */}
          <label
            htmlFor="photo-upload"
            className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-xl bg-zinc-900/50 hover:bg-zinc-800/50 transition-all duration-200"
            data-testid="button-upload-photo"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-zinc-100 font-medium">{formData.photos.length > 0 ? 'Ajouter d\'autres photos' : 'Ajouter des photos'}</p>
                <p className="text-zinc-400 text-sm">Sélectionnez plusieurs images</p>
              </div>
            </div>
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            data-testid="input-vehicle-photo-file"
          />
          <p className="text-sm text-muted-foreground mt-3 text-center">
            📷 Ajoutez plusieurs photos (max 20MB par photo) • JPG, PNG • La première sera la photo principale
          </p>
        </div>
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
