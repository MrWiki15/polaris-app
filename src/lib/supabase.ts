import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export type AuthUser = {
  id: string;
  email: string;
  subscription: boolean;
};

export type DataBackup = {
  id?: string;
  userId: string;
  data: string;
  updated_at?: string;
  created_at?: string;
};
