import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface ImageGalleryModalProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageGalleryModal({ 
  images, 
  initialIndex = 0, 
  isOpen, 
  onClose 
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex, isOpen]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 1));
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "Escape") onClose();
      else if (e.key === "+") handleZoomIn();
      else if (e.key === "-") handleZoomOut();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen]);

  if (!images || images.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none" data-testid="dialog-image-gallery">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            data-testid="button-close-gallery"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <Button
                onClick={handlePrev}
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                data-testid="button-prev-image"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                onClick={handleNext}
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                data-testid="button-next-image"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
            <Button
              onClick={handleZoomOut}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              disabled={zoom <= 1}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <span className="text-white px-4 py-2 bg-black/50 rounded-lg" data-testid="text-zoom-level">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              onClick={handleZoomIn}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              disabled={zoom >= 3}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </div>

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-lg" data-testid="text-image-counter">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center overflow-auto p-8">
            <img
              src={images[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
              data-testid={`img-gallery-${currentIndex}`}
            />
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 flex gap-2 max-w-[90vw] overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setZoom(1);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex
                      ? "border-primary scale-110"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  data-testid={`button-thumbnail-${index}`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
