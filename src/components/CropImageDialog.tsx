import "react-advanced-cropper/dist/style.css";
import { useRef } from "react";
import { CropperRef, Cropper, CircleStencil } from "react-advanced-cropper";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface CropImageDialogProps {
  src: string;
  cropAspectRatio: number;
  onCropped: (blob: Blob | null) => void;
  onClose: () => void;
}

export default function CropImageDialog({
  src,
  cropAspectRatio,
  onCropped,
  onClose,
}: CropImageDialogProps) {
  const cropperRef = useRef<CropperRef>(null);

  function crop() {
    if (cropperRef.current) {
      cropperRef.current
        .getCanvas()
        ?.toBlob((blob) => onCropped(blob), "image/webp");
      onClose();
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
        </DialogHeader>
        <Cropper
          src={src}
          ref={cropperRef}
          stencilComponent={CircleStencil}
          stencilProps={{
            aspectRatio: cropAspectRatio,
          }}
          className="h-[500px]"
        />
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={crop}>Crop</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
