import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { DataBackup } from "@/lib/supabase";
import type { AppData } from "@/lib/storage";

export const useSupabaseSync = (
  userId: string | undefined,
  isPremium: boolean
) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Save data to Supabase
  const saveToSupabase = useCallback(
    async (data: AppData) => {
      if (!userId || !isPremium || !isOnline) return;

      setIsSyncing(true);
      try {
        const backup: DataBackup = {
          user_id: userId,
          data: JSON.stringify(data),
        };

        // Check if backup exists
        const { data: existing } = await supabase
          .from("backups")
          .select("id")
          .eq("user_id", userId)
          .single();

        if (existing) {
          // Update existing
          await supabase
            .from("backups")
            .update({
              data: backup.data,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId);
        } else {
          // Insert new
          await supabase.from("backups").insert([backup]);
        }

        setLastSyncTime(new Date().toISOString());
      } catch (err) {
        console.error("Supabase sync error:", err);
      } finally {
        setIsSyncing(false);
      }
    },
    [userId, isPremium, isOnline]
  );

  // Load data from Supabase with comparison
  const loadFromSupabase = useCallback(async (): Promise<AppData | null> => {
    if (!userId || !isPremium || !isOnline) return null;

    try {
      const { data, error } = await supabase
        .from("backups")
        .select("data, updated_at")
        .eq("user_id", userId)
        .single();

      if (error || !data) return null;

      const remoteData = JSON.parse(data.data) as AppData;
      const remoteUpdated = data.updated_at
        ? new Date(data.updated_at).getTime()
        : 0;

      // Get local data timestamp from localStorage
      const localDataStr = localStorage.getItem("negocio360_data");
      const localData = localDataStr ? JSON.parse(localDataStr) : null;
      const localUpdated = localStorage.getItem("negocio360_data_updated");
      const localTime = localUpdated ? parseInt(localUpdated) : 0;

      // Return most recent data
      if (remoteUpdated > localTime) {
        return remoteData;
      }

      return localData;
    } catch (err) {
      console.error("Load from Supabase error:", err);
      return null;
    }
  }, [userId, isPremium, isOnline]);

  return {
    isSyncing,
    lastSyncTime,
    isOnline,
    saveToSupabase,
    loadFromSupabase,
  };
};
