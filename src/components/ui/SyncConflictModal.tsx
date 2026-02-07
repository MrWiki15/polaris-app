import React from "react";
import { useApp } from "@/contexts/AppContext";
import { Download } from "lucide-react";
import { saveData } from "@/lib/storage";
import { toast } from "@/hooks/use-toast";
import { DataComparisonModal } from "./DataComparisonModal";

export const SyncConflictModal: React.FC = () => {
  const { supabaseSync, refreshData, data } = useApp();
  const conflict = supabaseSync?.syncConflict;

  if (!conflict || !supabaseSync) return null;

  const handleRestore = async () => {
    try {
      const cloudData = await supabaseSync.restoreFromCloud();
      if (cloudData) {
        saveData(cloudData);
        localStorage.setItem("negocio360_data_updated", Date.now().toString());
        refreshData();
        supabaseSync.resolveConflict();
        toast({
          title: "Datos restaurados",
          description: "Se han recuperado los datos de la nube.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo restaurar desde la nube.",
        variant: "destructive",
      });
    }
  };

  const handleOverwrite = () => {
    supabaseSync.saveToSupabase(data, true);
    supabaseSync.resolveConflict();
    toast({
      title: "Nube actualizada",
      description: "Se han sobrescrito los datos de la nube con los locales.",
    });
  };

  return (
    <DataComparisonModal
      isOpen={!!conflict}
      onClose={() => {}}
      title="Conflicto de Datos Detectado"
      description="Hemos encontrado diferencias importantes entre los datos de tu dispositivo y los de la nube."
      localStats={conflict.localStats}
      cloudStats={conflict.cloudStats}
      onConfirm={handleRestore}
      onCancel={handleOverwrite}
      confirmLabel="Descargar datos de la nube"
      confirmIcon={<Download className="w-4 h-4" />}
      cancelLabel="Ignorar nube y mantener mis datos locales (Peligroso)"
      variant="warning"
    />
  );
};
