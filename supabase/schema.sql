-- Nour Optics Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Create Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Lens Types Table
CREATE TABLE IF NOT EXISTS lens_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Pricing Rules Table
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    lens_type_id UUID NOT NULL REFERENCES lens_types(id) ON DELETE CASCADE,
    min_range NUMERIC NOT NULL,
    max_range NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    phone TEXT,
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    lens_type_id UUID REFERENCES lens_types(id) ON DELETE SET NULL,
    company_name TEXT,
    lens_type_name TEXT,
    ordered_eye TEXT NOT NULL CHECK (ordered_eye IN ('both', 'right', 'left')),
    right_sph NUMERIC,
    right_cyl NUMERIC,
    left_sph NUMERIC,
    left_cyl NUMERIC,
    price NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lens_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 7. Create Policies for Anon Access (authenticated by client session)
CREATE POLICY "Allow all operations for anon" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON lens_types FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON pricing_rules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations for anon" ON orders FOR ALL USING (true) WITH CHECK (true);

-- 8. Seed Initial Default Data
INSERT INTO companies (name) VALUES 
('ZEISS'),
('Essilor'),
('HOYA')
ON CONFLICT (name) DO NOTHING;

INSERT INTO lens_types (name) VALUES 
('Single Vision'),
('Blue Cut'),
('Photochromic')
ON CONFLICT (name) DO NOTHING;

-- Seed sample pricing rules
DO $$
DECLARE
    zeiss_id UUID;
    essilor_id UUID;
    sv_id UUID;
    bc_id UUID;
BEGIN
    SELECT id INTO zeiss_id FROM companies WHERE name = 'ZEISS' LIMIT 1;
    SELECT id INTO essilor_id FROM companies WHERE name = 'Essilor' LIMIT 1;
    SELECT id INTO sv_id FROM lens_types WHERE name = 'Single Vision' LIMIT 1;
    SELECT id INTO bc_id FROM lens_types WHERE name = 'Blue Cut' LIMIT 1;

    IF zeiss_id IS NOT NULL AND sv_id IS NOT NULL THEN
        INSERT INTO pricing_rules (company_id, lens_type_id, min_range, max_range, price) VALUES
        (zeiss_id, sv_id, 0.00, 2.00, 200),
        (zeiss_id, sv_id, 2.25, 4.00, 300),
        (zeiss_id, sv_id, 4.25, 6.00, 450);
    END IF;

    IF zeiss_id IS NOT NULL AND bc_id IS NOT NULL THEN
        INSERT INTO pricing_rules (company_id, lens_type_id, min_range, max_range, price) VALUES
        (zeiss_id, bc_id, 0.00, 2.00, 350),
        (zeiss_id, bc_id, 2.25, 4.00, 480);
    END IF;

    IF essilor_id IS NOT NULL AND sv_id IS NOT NULL THEN
        INSERT INTO pricing_rules (company_id, lens_type_id, min_range, max_range, price) VALUES
        (essilor_id, sv_id, 0.00, 2.00, 180),
        (essilor_id, sv_id, 2.25, 4.00, 280);
    END IF;
END $$;
