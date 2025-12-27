import React, { useState } from "react";
import { X, Camera, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useZxing } from "react-zxing";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onClose,
}) => {
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manualCode, setManualCode] = useState("");

  const { ref } = useZxing({
    onDecodeResult(result) {
      onScan(result.getText());
    },
    paused: mode !== "camera",
    hints: new Map([
      [
        DecodeHintType.POSSIBLE_FORMATS,
        [
          BarcodeFormat.QR_CODE,
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.CODE_128,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_39,
        ],
      ],
    ]),
    constraints: {
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    },
    onError(error) {
      // Ignore routine errors like "NotFoundException" which happen every frame nothing is detected
      if (error.name !== "NotFoundException") {
        console.warn("Scan error:", error);
      }
    },
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4">
        <div className="bg-card rounded-2xl shadow-material-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold">Escanear Código</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex p-2 gap-2 border-b border-border">
            <button
              onClick={() => setMode("camera")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all",
                mode === "camera"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Camera className="w-4 h-4" />
              Cámara
            </button>
            <button
              onClick={() => setMode("manual")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all",
                mode === "manual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              <Keyboard className="w-4 h-4" />
              Manual
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {mode === "camera" ? (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                  <video ref={ref} className="w-full h-full object-cover" />
                  {/* Scan overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-1/2 border-2 border-primary rounded-lg relative">
                      <div
                        className="absolute inset-0 border-4 border-transparent animate-pulse"
                        style={{
                          background:
                            "linear-gradient(90deg, hsl(var(--primary)) 2px, transparent 2px), linear-gradient(hsl(var(--primary)) 2px, transparent 2px)",
                          backgroundSize: "20px 20px",
                        }}
                      />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/80 rounded-full text-sm">
                    Buscando código...
                  </div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Apunta la cámara al código de barras
                </p>
              </div>
            ) : (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Ingresa el código de barras manualmente:
                  </p>
                  <Input
                    type="text"
                    placeholder="Ej: 7501234567890"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="text-center text-lg tracking-widest"
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  disabled={!manualCode.trim()}
                >
                  Buscar Producto
                </Button>
              </form>
            )}
          </div>

          {/* Tips */}
          <div className="p-4 bg-muted/30 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              💡 Los códigos de barras se guardan automáticamente en cada
              producto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
