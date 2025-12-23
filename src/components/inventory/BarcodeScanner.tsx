import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Flashlight, SwitchCamera, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [mode]);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Note: Real barcode detection would use BarcodeDetector API or a library like quagga
      // For now we'll provide manual input option
      
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Usa el modo manual.');
      setMode('manual');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  const handleSimulateScan = () => {
    // Simulate a barcode scan for demo purposes
    const demoBarcode = `${Date.now()}`;
    onScan(demoBarcode);
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
              onClick={() => setMode('camera')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all',
                mode === 'camera'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <Camera className="w-4 h-4" />
              Cámara
            </button>
            <button
              onClick={() => setMode('manual')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all',
                mode === 'manual'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              <Keyboard className="w-4 h-4" />
              Manual
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {mode === 'camera' ? (
              <div className="space-y-4">
                {error ? (
                  <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-center">
                    <p>{error}</p>
                  </div>
                ) : (
                  <>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        autoPlay
                        muted
                      />
                      {/* Scan overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3/4 h-1/2 border-2 border-primary rounded-lg relative">
                          <div className="absolute inset-0 border-4 border-transparent animate-pulse" 
                               style={{ 
                                 background: 'linear-gradient(90deg, hsl(var(--primary)) 2px, transparent 2px), linear-gradient(hsl(var(--primary)) 2px, transparent 2px)',
                                 backgroundSize: '20px 20px'
                               }} 
                          />
                        </div>
                      </div>
                      {isScanning && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/80 rounded-full text-sm">
                          Escaneando...
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      Apunta la cámara al código de barras
                    </p>
                    <Button 
                      onClick={handleSimulateScan}
                      variant="outline"
                      className="w-full"
                    >
                      Simular escaneo (demo)
                    </Button>
                  </>
                )}
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
              💡 Los códigos de barras se guardan automáticamente en cada producto
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
