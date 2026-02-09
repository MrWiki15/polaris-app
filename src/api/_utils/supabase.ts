import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.warn("⚠️ Supabase credentials not configured");
}

// Client with service role for server-side operations (bypasses RLS)
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Get user's backup data from Supabase
 */
export async function getUserData(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("backups")
    .select("*")
    .eq("userId", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user data:", error);
    return null;
  }

  return data;
}

/**
 * Save user's data to Supabase
 */
export async function saveUserData(userId: string, data: any) {
  // Check if backup exists
  const existing = await getUserData(userId);

  if (existing) {
    // Update existing backup
    const { error } = await supabaseAdmin
      .from("backups")
      .update({
        data: JSON.stringify(data),
        updated_at: new Date().toISOString(),
      })
      .eq("userId", userId);

    if (error) throw error;
  } else {
    // Create new backup
    const { error } = await supabaseAdmin.from("backups").insert({
      userId,
      data: JSON.stringify(data),
    });

    if (error) throw error;
  }
}

/**
 * Get user by userId
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return data.user;
}
