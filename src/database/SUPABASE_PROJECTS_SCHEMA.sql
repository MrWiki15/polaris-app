-- ============================================
-- PROJECT TABLES SCHEMA
-- ============================================

-- Function to check membership (Security)
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

-- 1. SALES
CREATE TABLE IF NOT EXISTS public.project_sales (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  product_id TEXT,
  quantity NUMERIC,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  client_id TEXT,
  payment_method TEXT DEFAULT 'efectivo',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view sales" ON public.project_sales FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert sales" ON public.project_sales FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update sales" ON public.project_sales FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete sales" ON public.project_sales FOR DELETE USING (public.is_project_member(project_id));

-- 2. EXPENSES
CREATE TABLE IF NOT EXISTS public.project_expenses (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  tags TEXT[], -- Array of strings
  is_recurring BOOLEAN DEFAULT false,
  recurring_id TEXT,
  client_id TEXT, -- Optional relation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view expenses" ON public.project_expenses FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert expenses" ON public.project_expenses FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update expenses" ON public.project_expenses FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete expenses" ON public.project_expenses FOR DELETE USING (public.is_project_member(project_id));

-- 3. PRODUCTS (INVENTORY)
CREATE TABLE IF NOT EXISTS public.project_products (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  price NUMERIC DEFAULT 0,
  category TEXT,
  min_stock NUMERIC,
  barcode TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view products" ON public.project_products FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert products" ON public.project_products FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update products" ON public.project_products FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete products" ON public.project_products FOR DELETE USING (public.is_project_member(project_id));

-- 4. CLIENTS
CREATE TABLE IF NOT EXISTS public.project_clients (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view clients" ON public.project_clients FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert clients" ON public.project_clients FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update clients" ON public.project_clients FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete clients" ON public.project_clients FOR DELETE USING (public.is_project_member(project_id));

-- 5. WORKERS
CREATE TABLE IF NOT EXISTS public.project_workers (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  salary NUMERIC DEFAULT 0,
  start_date TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_workers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view workers" ON public.project_workers FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert workers" ON public.project_workers FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update workers" ON public.project_workers FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete workers" ON public.project_workers FOR DELETE USING (public.is_project_member(project_id));

-- 6. EVENTS (Calendar)
CREATE TABLE IF NOT EXISTS public.project_events (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  type TEXT, -- 'recordatorio', 'cita', 'pago', etc.
  description TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view events" ON public.project_events FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert events" ON public.project_events FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update events" ON public.project_events FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete events" ON public.project_events FOR DELETE USING (public.is_project_member(project_id));

-- 7. GOALS
CREATE TABLE IF NOT EXISTS public.project_goals (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  deadline TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view goals" ON public.project_goals FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert goals" ON public.project_goals FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update goals" ON public.project_goals FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete goals" ON public.project_goals FOR DELETE USING (public.is_project_member(project_id));

-- 8. DEBTS
CREATE TABLE IF NOT EXISTS public.project_debts (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'por_cobrar' or 'por_pagar'
  entity_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  concept TEXT,
  due_date TEXT,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view debts" ON public.project_debts FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert debts" ON public.project_debts FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update debts" ON public.project_debts FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete debts" ON public.project_debts FOR DELETE USING (public.is_project_member(project_id));

-- 9. RECURRING PAYMENTS
CREATE TABLE IF NOT EXISTS public.project_recurring_payments (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT,
  frequency TEXT, -- 'mensual', 'anual', etc.
  day_of_month NUMERIC,
  last_paid_date TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_recurring_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view recurring" ON public.project_recurring_payments FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert recurring" ON public.project_recurring_payments FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update recurring" ON public.project_recurring_payments FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete recurring" ON public.project_recurring_payments FOR DELETE USING (public.is_project_member(project_id));

-- 10. SUPPLIERS
CREATE TABLE IF NOT EXISTS public.project_suppliers (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view suppliers" ON public.project_suppliers FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert suppliers" ON public.project_suppliers FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update suppliers" ON public.project_suppliers FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete suppliers" ON public.project_suppliers FOR DELETE USING (public.is_project_member(project_id));

-- 11. SUPPLIER ORDERS
CREATE TABLE IF NOT EXISTS public.project_supplier_orders (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  supplier_id TEXT NOT NULL,
  date TEXT NOT NULL,
  expected_date TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'received', 'cancelled'
  total_amount NUMERIC DEFAULT 0,
  items JSONB, -- Store items as JSON for simplicity: [{productId, quantity, unitCost}]
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_supplier_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view orders" ON public.project_supplier_orders FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert orders" ON public.project_supplier_orders FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update orders" ON public.project_supplier_orders FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete orders" ON public.project_supplier_orders FOR DELETE USING (public.is_project_member(project_id));

-- 12. SERVICES
CREATE TABLE IF NOT EXISTS public.project_services (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  category TEXT,
  duration_minutes NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view services" ON public.project_services FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert services" ON public.project_services FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update services" ON public.project_services FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete services" ON public.project_services FOR DELETE USING (public.is_project_member(project_id));

-- 13. SERVICE INCOMES
CREATE TABLE IF NOT EXISTS public.project_service_incomes (
  id TEXT PRIMARY KEY,
  project_id BIGINT NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  service_id TEXT,
  client_id TEXT,
  amount NUMERIC NOT NULL,
  date TEXT NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.project_service_incomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view service incomes" ON public.project_service_incomes FOR SELECT USING (public.is_project_member(project_id));
CREATE POLICY "Members can insert service incomes" ON public.project_service_incomes FOR INSERT WITH CHECK (public.is_project_member(project_id));
CREATE POLICY "Members can update service incomes" ON public.project_service_incomes FOR UPDATE USING (public.is_project_member(project_id));
CREATE POLICY "Members can delete service incomes" ON public.project_service_incomes FOR DELETE USING (public.is_project_member(project_id));
