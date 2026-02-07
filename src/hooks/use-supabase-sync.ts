import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { DataBackup } from "@/lib/supabase";
import type { AppData } from "@/lib/storage";

export const useSupabaseSync = (
  userId: string | undefined,
  isPremium: boolean,
) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  const [syncConflict, setSyncConflict] = useState<{
    cloudStats: { products: number; sales: number; clients: number };
    localStats: { products: number; sales: number; clients: number };
  } | null>(null);

  const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

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

  const getStats = (data: AppData) => ({
    products: data.products?.length || 0,
    sales: data.sales?.length || 0,
    clients: data.clients?.length || 0,
  });

  // Save data to Supabase
  const saveToSupabase = useCallback(
    async (data: AppData, force: boolean = false) => {
      if (!userId || !isPremium || !isOnline) return;

      // If initial check hasn't happened and we are not forcing,
      // we must prevent saving to avoid overwriting cloud with empty local
      if (!isInitialCheckDone && !force) {
        console.warn("Preventing save: Initial sync check not complete");
        return;
      }

      setIsSyncing(true);
      try {
        // Check cloud data first if not forcing
        if (!force) {
          const { data: existing } = await supabase
            .from("backups")
            .select("data")
            .eq("user_id", userId)
            .single();

          if (existing && existing.data) {
            const cloudData = JSON.parse(existing.data) as AppData;
            const cloudStats = getStats(cloudData);
            const localStats = getStats(data);

            // If cloud has significantly more data
            // OR if cloud has ANY data and local is effectively empty/default
            const hasCloudData =
              cloudStats.products > 0 ||
              cloudStats.sales > 0 ||
              cloudStats.clients > 0;

            const isLocalEmpty =
              localStats.products === 0 &&
              localStats.sales === 0 &&
              localStats.clients === 0;

            const hasCloudMore =
              cloudStats.products > localStats.products ||
              cloudStats.sales > localStats.sales ||
              cloudStats.clients > localStats.clients;

            // Trigger conflict if:
            // 1. Local is empty but cloud has data (New device scenario)
            // 2. Cloud has more data than local (Potential data loss)
            if ((isLocalEmpty && hasCloudData) || hasCloudMore) {
              setSyncConflict({ cloudStats, localStats });
              setIsSyncing(false);
              return; // Abort save
            }
          }
        }

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
    [userId, isPremium, isOnline],
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

  const checkSyncStatus = useCallback(async () => {
    if (!userId || !isPremium || !isOnline) return null;

    try {
      const { data, error } = await supabase
        .from("backups")
        .select("updated_at")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") return null;

      const remoteUpdated = data?.updated_at
        ? new Date(data.updated_at).getTime()
        : 0;
      const localUpdated = localStorage.getItem("negocio360_data_updated");
      const localTime = localUpdated ? parseInt(localUpdated) : 0;

      return {
        hasLocalChanges: localTime > remoteUpdated,
        hasRemoteChanges: remoteUpdated > localTime,
        localTime,
        remoteTime: remoteUpdated,
      };
    } catch (err) {
      console.error("Check sync status error:", err);
      return null;
    }
  }, [userId, isPremium, isOnline]);

  const restoreFromCloud = useCallback(async (): Promise<AppData | null> => {
    if (!userId || !isPremium || !isOnline) return null;

    try {
      const { data, error } = await supabase
        .from("backups")
        .select("data")
        .eq("user_id", userId)
        .single();

      if (error || !data) throw error;

      return JSON.parse(data.data) as AppData;
    } catch (err) {
      console.error("Restore from cloud error:", err);
      return null;
    }
  }, [userId, isPremium, isOnline]);

  const initializeSync = useCallback(async () => {
    if (!userId || !isPremium || !isOnline || isInitialCheckDone) return;

    try {
      const { data: existing } = await supabase
        .from("backups")
        .select("data")
        .eq("user_id", userId)
        .single();

      if (existing && existing.data) {
        const cloudData = JSON.parse(existing.data) as AppData;
        const cloudStats = getStats(cloudData);

        // Check local stats
        const localDataStr = localStorage.getItem("negocio360_data");
        const localData = localDataStr ? JSON.parse(localDataStr) : null;
        const localStats = localData
          ? getStats(localData)
          : { products: 0, sales: 0, clients: 0 };

        const hasCloudData =
          cloudStats.products > 0 ||
          cloudStats.sales > 0 ||
          cloudStats.clients > 0;

        const isLocalEmpty =
          localStats.products === 0 &&
          localStats.sales === 0 &&
          localStats.clients === 0;

        // If cloud has data and local is empty -> Conflict (Prompt restore)
        if (hasCloudData && isLocalEmpty) {
          setSyncConflict({ cloudStats, localStats });
        }
        // If cloud has MORE data -> Conflict
        else if (
          cloudStats.products > localStats.products ||
          cloudStats.sales > localStats.sales ||
          cloudStats.clients > localStats.clients
        ) {
          setSyncConflict({ cloudStats, localStats });
        }
      }
      setIsInitialCheckDone(true);
    } catch (err) {
      console.error("Initial sync check error:", err);
      // Even if error, mark as done so we don't block forever
      setIsInitialCheckDone(true);
    }
  }, [userId, isPremium, isOnline, isInitialCheckDone]);

  // Run initial check when userId changes
  useEffect(() => {
    if (userId) {
      initializeSync();
    }
  }, [userId, initializeSync]);

  return {
    isSyncing,
    lastSyncTime,
    isOnline,
    saveToSupabase,
    loadFromSupabase,
    checkSyncStatus,
    restoreFromCloud,
    syncConflict,
    resolveConflict: () => setSyncConflict(null),
    isInitialCheckDone,
  };
};
