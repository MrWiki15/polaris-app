import React from "react";
import { Download, FileText, FileSpreadsheet, Lock, Crown } from "lucide-react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ExportData, exportToPDF, exportToExcelXLSX } from "@/lib/exportUtils";

interface ExportButtonsProps {
  data: ExportData;
  filename?: string;
  isPremium?: boolean;
  className?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  data,
  filename = "reporte",
  isPremium = false,
  className,
}) => {
  const handleExportPDF = () => {
    if (!isPremium) {
      toast({
        title: "Funcionalidad Premium",
        description:
          "La exportación a PDF está disponible solo para usuarios premium",
        variant: "destructive",
      });
      return;
    }

    try {
      exportToPDF(data, filename);
      toast({
        title: "Exportación exitosa",
        description: "El archivo PDF se ha descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el archivo PDF",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    if (!isPremium) {
      toast({
        title: "Funcionalidad Premium",
        description:
          "La exportación a Excel está disponible solo para usuarios premium",
        variant: "destructive",
      });
      return;
    }

    try {
      exportToExcelXLSX(data, filename);
      toast({
        title: "Exportación exitosa",
        description: "El archivo Excel se ha descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el archivo Excel",
        variant: "destructive",
      });
    }
  };

  if (!isPremium) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2", className)}
            disabled
          >
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
            <Crown className="w-3 h-3 text-primary" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled className="opacity-60">
            <FileText className="w-4 h-4 mr-2" />
            PDF (Premium)
          </DropdownMenuItem>
          <DropdownMenuItem disabled className="opacity-60">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel (Premium)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("gap-2 w-full", className)}>
          <Download className="w-4 h-4" />
          <span className="inline">Exportar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="w-4 h-4 mr-2" />
          Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Exportar Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
