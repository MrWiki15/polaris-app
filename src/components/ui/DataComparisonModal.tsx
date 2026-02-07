import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Cloud, HardDrive } from "lucide-react";

interface Stats {
  products: number;
  sales: number;
  clients: number;
}

interface DataComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  localStats: Stats;
  cloudStats: Stats;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
  cancelLabel: string;
  confirmIcon?: React.ReactNode;
  variant?: "default" | "destructive" | "warning";
}

export const DataComparisonModal: React.FC<DataComparisonModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  localStats,
  cloudStats,
  onConfirm,
  onCancel,
  confirmLabel,
  cancelLabel,
  confirmIcon,
  variant = "warning",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div
            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              variant === "destructive"
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500"
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-center text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
              <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Dispositivo</h4>
            <div className="text-xs text-muted-foreground space-y-1 w-full">
              <div className="flex justify-between">
                <span>Productos:</span>
                <span className="font-mono font-medium">
                  {localStats.products}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ventas:</span>
                <span className="font-mono font-medium">{localStats.sales}</span>
              </div>
              <div className="flex justify-between">
                <span>Clientes:</span>
                <span className="font-mono font-medium">
                  {localStats.clients}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
              <Cloud className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-semibold text-sm mb-1">Nube (Respaldo)</h4>
            <div className="text-xs text-muted-foreground space-y-1 w-full">
              <div className="flex justify-between">
                <span>Productos:</span>
                <span className="font-mono font-medium">
                  {cloudStats.products}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ventas:</span>
                <span className="font-mono font-medium">
                  {cloudStats.sales}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Clientes:</span>
                <span className="font-mono font-medium">
                  {cloudStats.clients}
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:gap-0">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
            onClick={onConfirm}
          >
            {confirmIcon}
            {confirmLabel}
          </Button>

          <Button
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
