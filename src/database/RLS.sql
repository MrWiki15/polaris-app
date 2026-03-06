-- ============================================
-- POLARISHUB: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Row Level Security configuration for secure data access
-- Execute this script in the Supabase SQL Editor
-- https://supabase.com/dashboard
--
-- IMPORTANT: This file contains all RLS policies needed to ensure
-- secure data access for users, projects and teams in Polarishub.

-- ============================================
-- SECURITY FUNCTIONS
-- ============================================

-- Verify if a user is a member of a project
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id bigint)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.projects p, 
         jsonb_array_elements(p.members) m
    WHERE p.id = _project_id 
      AND m->>'email' = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TABLE: BACKUPS (User Data Backups)
-- ============================================
-- Almacena respaldos completos de los datos de los usuarios
-- Estado: RLS HABILITADO

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own backups" ON public.backups;
DROP POLICY IF EXISTS "Users can insert their own backups" ON public.backups;
DROP POLICY IF EXISTS "Users can update their own backups" ON public.backups;
DROP POLICY IF EXISTS "Users can delete their own backups" ON public.backups;

-- Enable RLS
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- POLICY: SELECT - Users can only view their own backups
CREATE POLICY "Users can view their own backups"
  ON public.backups
  FOR SELECT
  USING (auth.uid() = user_id);

-- POLICY: INSERT - Users can only insert their own backups
CREATE POLICY "Users can insert their own backups"
  ON public.backups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- POLICY: UPDATE - Users can only update their own backups
CREATE POLICY "Users can update their own backups"
  ON public.backups
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- POLICY: DELETE - Users can only delete their own backups
CREATE POLICY "Users can delete their own backups"
  ON public.backups
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.backups TO authenticated;

-- ============================================
-- TABLE: WALLETS (Hedera Wallets)
-- ============================================
-- Almacena wallets de Hedera con claves encriptadas
-- Estado: RLS HABILITADO

DROP POLICY IF EXISTS "Users can view their own wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users can insert their own wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users can update their own wallets" ON public.wallets;
DROP POLICY IF EXISTS "Users can delete their own wallets" ON public.wallets;

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- POLICY: SELECT - Users can only view their own wallets
CREATE POLICY "Users can view their own wallets"
  ON public.wallets
  FOR SELECT
  USING (auth.uid() = "userId"::uuid);

-- POLICY: INSERT - Users can only insert their own wallets
CREATE POLICY "Users can insert their own wallets"
  ON public.wallets
  FOR INSERT
  WITH CHECK (auth.uid() = "userId"::uuid);

-- POLICY: UPDATE - Users can only update their own wallets
CREATE POLICY "Users can update their own wallets"
  ON public.wallets
  FOR UPDATE
  USING (auth.uid() = "userId"::uuid)
  WITH CHECK (auth.uid() = "userId"::uuid);

-- POLICY: DELETE - Users can only delete their own wallets
CREATE POLICY "Users can delete their own wallets"
  ON public.wallets
  FOR DELETE
  USING (auth.uid() = "userId"::uuid);

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wallets TO authenticated;

-- ============================================
-- TABLE: PERSONAL_WALLETS (Internal User Wallets)
-- ============================================
-- Wallets personales internas del usuario (Principal, USDC, etc.)
-- Estado: RLS HABILITADO

DROP POLICY IF EXISTS "Users can view their own personal wallets" ON public.personal_wallets;
DROP POLICY IF EXISTS "Users can insert their own personal wallets" ON public.personal_wallets;
DROP POLICY IF EXISTS "Users can update their own personal wallets" ON public.personal_wallets;
DROP POLICY IF EXISTS "Users can delete their own personal wallets" ON public.personal_wallets;

ALTER TABLE public.personal_wallets ENABLE ROW LEVEL SECURITY;

-- POLICY: SELECT
CREATE POLICY "Users can view their own personal wallets"
  ON public.personal_wallets
  FOR SELECT
  USING (auth.uid() = "userId"::uuid);

-- POLICY: INSERT
CREATE POLICY "Users can insert their own personal wallets"
  ON public.personal_wallets
  FOR INSERT
  WITH CHECK (auth.uid() = "userId"::uuid);

-- POLICY: UPDATE
CREATE POLICY "Users can update their own personal wallets"
  ON public.personal_wallets
  FOR UPDATE
  USING (auth.uid() = "userId"::uuid)
  WITH CHECK (auth.uid() = "userId"::uuid);

-- POLICY: DELETE
CREATE POLICY "Users can delete their own personal wallets"
  ON public.personal_wallets
  FOR DELETE
  USING (auth.uid() = "userId"::uuid);

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_wallets TO authenticated;

-- ============================================
-- TABLE: PERSONAL_WALLET_TRANSFERS (Wallet Transfers)
-- ============================================
-- Registro de transferencias entre wallets personales
-- Estado: RLS HABILITADO

DROP POLICY IF EXISTS "Users can view their own transfers" ON public.personal_wallet_transfers;
DROP POLICY IF EXISTS "Users can insert their own transfers" ON public.personal_wallet_transfers;
DROP POLICY IF EXISTS "Users can update their own transfers" ON public.personal_wallet_transfers;
DROP POLICY IF EXISTS "Users can delete their own transfers" ON public.personal_wallet_transfers;

ALTER TABLE public.personal_wallet_transfers ENABLE ROW LEVEL SECURITY;

-- POLICY: SELECT
CREATE POLICY "Users can view their own transfers"
  ON public.personal_wallet_transfers
  FOR SELECT
  USING (auth.uid() = "userId"::uuid);

-- POLICY: INSERT
CREATE POLICY "Users can insert their own transfers"
  ON public.personal_wallet_transfers
  FOR INSERT
  WITH CHECK (auth.uid() = "userId"::uuid);

-- POLICY: UPDATE
CREATE POLICY "Users can update their own transfers"
  ON public.personal_wallet_transfers
  FOR UPDATE
  USING (auth.uid() = "userId"::uuid)
  WITH CHECK (auth.uid() = "userId"::uuid);

-- POLICY: DELETE
CREATE POLICY "Users can delete their own transfers"
  ON public.personal_wallet_transfers
  FOR DELETE
  USING (auth.uid() = "userId"::uuid);

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personal_wallet_transfers TO authenticated;

-- ============================================
-- TABLE: PROJECTS (Team Projects)
-- ============================================
-- Shared projects between team members
-- Structure: id, name, members (JSONB array), created_at, etc.
-- Status: RLS ENABLED

DROP POLICY IF EXISTS "Project members can view projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project members can update projects" ON public.projects;
DROP POLICY IF EXISTS "Project members can delete projects" ON public.projects;

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- POLICY: SELECT - Only members and project creator can view
CREATE POLICY "Project members can view projects"
  ON public.projects
  FOR SELECT
  USING (public.is_project_member(id));

-- POLICY: INSERT - Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- POLICY: UPDATE - Only members can update projects
CREATE POLICY "Project members can update projects"
  ON public.projects
  FOR UPDATE
  USING (public.is_project_member(id))
  WITH CHECK (public.is_project_member(id));

-- POLICY: DELETE - Only members can delete projects
CREATE POLICY "Project members can delete projects"
  ON public.projects
  FOR DELETE
  USING (public.is_project_member(id));

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;

-- ============================================
-- FINAL VERIFICATION
-- ============================================
-- Execute the following queries to verify that policies were created correctly:

-- View all RLS policies created:
-- SELECT tablename, policyname, permissive, roles, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- Verify that RLS is enabled on all tables:
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public' AND tablename IN ('backups', 'wallets', 'personal_wallets', 'personal_wallet_transfers', 'projects')
-- ORDER BY tablename;

-- View all security functions created:
-- SELECT n.nspname, p.proname, pg_get_functiondef(p.oid) as definition
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public' AND p.proname = 'is_project_member'
-- ORDER BY p.proname;

-- ============================================
-- SECURITY SUMMARY
-- ============================================
--
-- TABLE                       RLS TYPE          DESCRIPTION
-- ================================================================
-- backups                     User-based        Only backup owner
-- wallets                     User-based        Only wallet owner
-- personal_wallets            User-based        Only owner
-- personal_wallet_transfers   User-based        Only owner
-- projects                    Members-based     Only project members
--
-- GENERAL POLICY:
-- ✓ Each user can only view/edit their own data
-- ✓ Project members can collaborate on project data  
-- ✓ Wallet transactions are protected per user
-- ✓ Backups are encrypted and only owner can access
--
-- ============================================
