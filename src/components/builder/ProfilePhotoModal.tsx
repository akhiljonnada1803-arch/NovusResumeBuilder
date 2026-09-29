"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  UploadCloud,
  Camera,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2,
  Check,
  Circle,
  Square,
  Sparkles,
  Loader2,
  Sliders,
} from "lucide-react";
import { processProfileImage } from "@/lib/storage/photo-upload";

interface ProfilePhotoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhotoUrl?: string;
  initialShape?: "circle" | "rounded" | "square";
  onSave: (photoUrl: string, shape: "circle" | "rounded" | "square") => void;
  onRemove: () => void;
}

export function ProfilePhotoModal({
  open,
  onOpenChange,
  currentPhotoUrl,
  initialShape = "circle",
  onSave,
  onRemove,
}: ProfilePhotoModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(currentPhotoUrl || null);
  const [selectedShape, setSelectedShape] = useState<"circle" | "rounded" | "square">(initialShape);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Sync with current photo when modal opens
  useEffect(() => {
    if (open) {
      setImageSrc(currentPhotoUrl || null);
      setSelectedShape(initialShape);
      setZoom(1);
      setRotation(0);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [open, currentPhotoUrl, initialShape]);

  // Load image object whenever imageSrc changes
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageObjRef.current = img;
        drawCanvas();
      };
      img.src = imageSrc;
    } else {
      imageObjRef.current = null;
    }
  }, [imageSrc]);

  // Redraw canvas on transformation changes
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Background fill
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    // Center origin
    ctx.translate(size / 2, size / 2);
    if (rotation) {
      ctx.rotate((rotation * Math.PI) / 180);
    }
    ctx.scale(zoom, zoom);
    ctx.translate(panOffset.x, panOffset.y);

    // Calculate dimensions
    const minDim = Math.min(img.width, img.height);
    const scaleRatio = size / minDim;
    const drawW = img.width * scaleRatio;
    const drawH = img.height * scaleRatio;

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }, [zoom, rotation, panOffset]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
      setZoom(1);
      setRotation(0);
      setPanOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target?.result as string);
        setZoom(1);
        setRotation(0);
        setPanOffset({ x: 0, y: 0 });
      };
      reader.readAsDataURL(file);
    }
  };

  // Mouse pan dragging on canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan dragging for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageSrc || e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - panOffset.x,
      y: e.touches[0].clientY - panOffset.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPanOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleApply = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    setIsProcessing(true);
    try {
      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
      onSave(croppedDataUrl, selectedShape);
      onOpenChange(false);
    } catch (err) {
      console.error("Failed to crop photo:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    setImageSrc(null);
    onRemove();
    onOpenChange(false);
  };

  const getPreviewClipClass = () => {
    switch (selectedShape) {
      case "circle":
        return "rounded-full";
      case "rounded":
        return "rounded-2xl";
      case "square":
      default:
        return "rounded-none";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <DialogHeader>
        <div className="flex items-center gap-2 text-foreground">
          <Camera className="w-4 h-4 text-foreground" />
          <DialogTitle>Profile Photo Studio</DialogTitle>
        </div>
        <DialogDescription>
          Upload, crop, and configure your professional headshot for resume templates.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp,image/jpg"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="user"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!imageSrc ? (
          /* Dropzone Upload State */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragOver
                ? "border-foreground bg-secondary/60"
                : "border-border bg-secondary/30 hover:border-slate-400 dark:hover:border-slate-600"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <UploadCloud className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Upload Profile Headshot
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-4">
              Drag & drop a JPG, PNG, or WebP photo, or use your device camera.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="radiant"
                size="sm"
                className="gap-1.5 text-xs font-semibold shadow-2xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Browse Files
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-medium"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-3.5 h-3.5" />
                Take Photo
              </Button>
            </div>
          </div>
        ) : (
          /* Interactive Cropper State */
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-6 justify-center bg-secondary/40 p-5 rounded-xl border border-border">
              {/* Interactive Canvas */}
              <div className="relative">
                <div
                  className={`overflow-hidden border-2 border-primary/60 shadow-lg cursor-grab active:cursor-grabbing transition-all ${getPreviewClipClass()}`}
                  style={{ width: 220, height: 220 }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  <canvas
                    ref={canvasRef}
                    width={320}
                    height={320}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground text-center block mt-1.5 font-medium">
                  Drag image to reposition
                </span>
              </div>

              {/* Adjustments & Controls */}
              <div className="w-full sm:w-60 space-y-3.5">
                {/* Shape Selector */}
                <div>
                  <Label className="text-[11px]">Photo Shape</Label>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedShape("circle")}
                      className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors ${
                        selectedShape === "circle"
                          ? "bg-card border-foreground text-foreground shadow-2xs font-semibold"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Circle className="w-4 h-4" />
                      <span>Circle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedShape("rounded")}
                      className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors ${
                        selectedShape === "rounded"
                          ? "bg-card border-foreground text-foreground shadow-2xs font-semibold"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="w-4 h-4 border-2 border-current rounded-md" />
                      <span>Rounded</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedShape("square")}
                      className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-colors ${
                        selectedShape === "square"
                          ? "bg-card border-foreground text-foreground shadow-2xs font-semibold"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Square className="w-4 h-4" />
                      <span>Square</span>
                    </button>
                  </div>
                </div>

                {/* Zoom Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <Label className="text-[11px] mb-0">Zoom Level</Label>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ZoomOut className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <input
                      type="range"
                      min="0.6"
                      max="2.5"
                      step="0.05"
                      value={zoom}
                      onChange={(e) => setZoom(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-foreground"
                    />
                    <ZoomIn className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </div>
                </div>

                {/* Rotate Button & Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5 h-7"
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  >
                    <RotateCw className="w-3 h-3" />
                    Rotate 90°
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-xs gap-1.5 h-7"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="w-3 h-3" />
                    Replace
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-destructive hover:bg-destructive/10 gap-1"
                onClick={handleRemove}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Photo
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="radiant"
                  size="sm"
                  className="text-xs font-semibold gap-1.5 shadow-2xs"
                  disabled={isProcessing}
                  onClick={handleApply}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Apply to Resume
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
