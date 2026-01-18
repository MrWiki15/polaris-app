import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { AuthUser } from "@/lib/supabase";
import { ethers } from "ethers";
import { encrypt } from "@/lib/crypto";

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            subscription: true,
          });
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          subscription: true,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const register = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    setVerificationPending(false);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;

      // Show verification pending message
      setVerificationPending(true);
      setRegisteredEmail(email);

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          subscription: true,
        });

        try {
          const { data: existing, error: checkError } = await supabase
            .from("wallets")
            .select("*")
            .eq("userId", data.user.id)
            .limit(1)
            .maybeSingle();
          if (checkError) {
            console.error("Wallet check error:", checkError);
          }
          if (!existing) {
            const wallet = ethers.Wallet.createRandom();
            const privateKey = wallet.privateKey;
            const address = wallet.address;
            const passphrase = import.meta.env.VITE_ENCRIPTED_KEY || "";
            const encryptedKey = await encrypt(privateKey, passphrase);
            const { error: insertError } = await supabase
              .from("wallets")
              .insert({
                userId: data.user.id,
                address,
                privateKey: encryptedKey,
              });
            if (insertError) {
              console.error("Wallet insert error:", insertError);
            }
          }
        } catch (err) {
          console.error("Wallet creation error:", err);
        }
      }
      return { success: true, requiresVerification: true };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );
      if (authError) throw authError;
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || "",
          subscription: true,
        });
      }
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setVerificationPending(false);
      setRegisteredEmail(null);
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearVerificationPending = () => {
    setVerificationPending(false);
    setRegisteredEmail(null);
  };

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    verificationPending,
    registeredEmail,
    clearVerificationPending,
  };
};
