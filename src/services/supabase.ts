import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Company, LensType, PricingRule, Customer, Order, AppData } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here' &&
  !supabaseUrl.includes('localhost')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

// ----------------------------------------------------------------------
// Central Database Operations Service (Supabase as Single Source of Truth)
// ----------------------------------------------------------------------
export const dbService = {
  /**
   * Fetches all real data from central Supabase database.
   * Never falls back to mock/demo business arrays.
   */
  async fetchAllData(): Promise<AppData> {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('تعذر الاتصال بقاعدة البيانات: يرجى إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY');
    }

    try {
      const [
        { data: companies, error: compErr },
        { data: lensTypes, error: ltErr },
        { data: pricingRules, error: prErr },
        { data: customers, error: custErr },
        { data: orders, error: ordErr },
      ] = await Promise.all([
        supabase.from('companies').select('*').order('name'),
        supabase.from('lens_types').select('*').order('name'),
        supabase.from('pricing_rules').select('*').order('min_range'),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
      ]);

      if (compErr || ltErr || prErr || custErr || ordErr) {
        const errorDetails = compErr?.message || ltErr?.message || prErr?.message || custErr?.message || ordErr?.message;
        console.error('Supabase query error:', errorDetails);
        throw new Error('تعذر الاتصال بقاعدة البيانات: ' + errorDetails);
      }

      return {
        companies: (companies || []).map((c) => ({
          id: c.id,
          name: c.name,
          created_at: c.created_at,
          createdAt: c.created_at,
        })),
        lensTypes: (lensTypes || []).map((lt) => ({
          id: lt.id,
          name: lt.name,
          created_at: lt.created_at,
          createdAt: lt.created_at,
        })),
        pricingRules: (pricingRules || []).map((pr) => ({
          id: pr.id,
          companyId: pr.company_id,
          company_id: pr.company_id,
          lensTypeId: pr.lens_type_id,
          lens_type_id: pr.lens_type_id,
          minRange: Number(pr.min_range),
          min_range: Number(pr.min_range),
          maxRange: Number(pr.max_range),
          max_range: Number(pr.max_range),
          price: Number(pr.price),
          created_at: pr.created_at,
          createdAt: pr.created_at,
        })),
        customers: (customers || []).map((cu) => ({
          id: cu.id,
          name: cu.name,
          phone: cu.phone || undefined,
          created_at: cu.created_at,
          createdAt: cu.created_at,
        })),
        orders: (orders || []).map((o) => ({
          id: o.id,
          customerId: o.customer_id,
          customer_id: o.customer_id,
          customerName: o.customer_name,
          customer_name: o.customer_name,
          phone: o.phone || undefined,
          companyId: o.company_id,
          company_id: o.company_id,
          companyName: o.company_name,
          company_name: o.company_name,
          lensTypeId: o.lens_type_id,
          lens_type_id: o.lens_type_id,
          lensTypeName: o.lens_type_name,
          lens_type_name: o.lens_type_name,
          orderedEye: o.ordered_eye,
          ordered_eye: o.ordered_eye,
          rightSph: o.right_sph !== null && o.right_sph !== undefined ? Number(o.right_sph) : null,
          right_sph: o.right_sph !== null && o.right_sph !== undefined ? Number(o.right_sph) : null,
          rightCyl: o.right_cyl !== null && o.right_cyl !== undefined ? Number(o.right_cyl) : null,
          right_cyl: o.right_cyl !== null && o.right_cyl !== undefined ? Number(o.right_cyl) : null,
          leftSph: o.left_sph !== null && o.left_sph !== undefined ? Number(o.left_sph) : null,
          left_sph: o.left_sph !== null && o.left_sph !== undefined ? Number(o.left_sph) : null,
          leftCyl: o.left_cyl !== null && o.left_cyl !== undefined ? Number(o.left_cyl) : null,
          left_cyl: o.left_cyl !== null && o.left_cyl !== undefined ? Number(o.left_cyl) : null,
          price: Number(o.price),
          created_at: o.created_at,
          createdAt: o.created_at,
        })),
      };
    } catch (err: any) {
      console.error('Supabase fetchAllData error:', err);
      throw new Error(err.message || 'تعذر الاتصال بقاعدة البيانات');
    }
  },

  // ---------------- Companies ----------------
  async addCompany(name: string): Promise<Company> {
    const trimmed = name.trim();
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('تعذر الاتصال بقاعدة البيانات: يرجى التحقق من إعدادات Supabase');
    }

    const { data, error } = await supabase
      .from('companies')
      .insert([{ name: trimmed }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      name: data.name,
      created_at: data.created_at,
      createdAt: data.created_at,
    };
  },

  async deleteCompany(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('تعذر الاتصال بقاعدة البيانات: يرجى التحقق من إعدادات Supabase');
    }

    const { error } = await supabase.from('companies').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // ---------------- Lens Types ----------------
  async addLensType(name: string): Promise<LensType> {
    const trimmed = name.trim();
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('تعذر الاتصال بقاعدة البيانات: يرجى التحقق من إعدادات Supabase');
    }

    const { data, error } = await supabase
      .from('lens_types')
      .insert([{ name: trimmed }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      name: data.name,
      created_at: data.created_at,
      createdAt: data.created_at,
    };
  },

  async deleteLensType(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('تعذر الاتصال بقاعدة البيانات: يرجى التحقق من إعدادات Supabase');
    }

    const { error } = await supabase.from('lens_types').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // ---------------- Pricing Rules ----------------
  async addPricingRule(
    companyId: string,
    lensTypeId: string,
    minRange: number,
    maxRange: number,
    price: number
  ): Promise<PricingRule> {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('تعذر الاتصال بقاعدة البيانات: يرجى التحقق من إعدادات Supabase');
    }

    const { data, error } = await supabase
      .from('pricing_rules')
      .insert([
        {
          company_id: companyId,
          lens_type_id: lensTypeId,
          min_range: minRange,
          max_range: maxRange,
          price: price,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      companyId: data.company_id,
      company_id: data.company_id,
      lensTypeId: data.lens_type_id,
      lens_type_id: data.lens_type_id,
      minRange: Number(data.min_range),
      min_range: Number(data.min_range),
      maxRange: Number(data.max_range),
      max_range: Number(data.max_range),
      price: Number(data.price),
      created_at: data.created_at,
      createdAt: data.created_at,
    };
  },

  async deletePricingRule(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('تعذر الاتصال بقاعدة البيانات: يرجى التحقق من إعدادات Supabase');
    }

    const { error } = await supabase.from('pricing_rules').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // ---------------- Customers ----------------
  async addCustomer(name: string, phone?: string): Promise<Customer> {
    const cleanName = name.trim();
    const cleanPhone = (phone || '').trim();

    if (!supabase || !isSupabaseConfigured) {
      throw new Error('تعذر الاتصال بقاعدة البيانات: يرجى التحقق من إعدادات Supabase');
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([{ name: cleanName, phone: cleanPhone || null }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      name: data.name,
      phone: data.phone || undefined,
      created_at: data.created_at,
      createdAt: data.created_at,
    };
  },

  async deleteCustomer(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('تعذر الاتصال بقاعدة البيانات: يرجى التحقق من إعدادات Supabase');
    }

    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  // ---------------- Orders ----------------
  async createOrder(orderData: {
    customerId?: string;
    customerName: string;
    phone?: string;
    companyId?: string;
    companyName: string;
    lensTypeId?: string;
    lensTypeName: string;
    orderedEye: 'both' | 'right' | 'left';
    rightSph?: number | null;
    rightCyl?: number | null;
    leftSph?: number | null;
    leftCyl?: number | null;
    price: number;
  }): Promise<Order> {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('تعذر الاتصال بقاعدة البيانات: يرجى التحقق من إعدادات Supabase');
    }

    // Resolve customer ID
    let resolvedCustomerId = orderData.customerId;
    if (!resolvedCustomerId && orderData.customerName) {
      const { data: newC } = await supabase
        .from('customers')
        .insert([{ name: orderData.customerName, phone: orderData.phone || null }])
        .select()
        .single();
      if (newC) resolvedCustomerId = newC.id;
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_id: resolvedCustomerId || null,
          customer_name: orderData.customerName,
          phone: orderData.phone || null,
          company_id: orderData.companyId || null,
          lens_type_id: orderData.lensTypeId || null,
          company_name: orderData.companyName,
          lens_type_name: orderData.lensTypeName,
          ordered_eye: orderData.orderedEye,
          right_sph: orderData.rightSph !== undefined ? orderData.rightSph : null,
          right_cyl: orderData.rightCyl !== undefined ? orderData.rightCyl : null,
          left_sph: orderData.leftSph !== undefined ? orderData.leftSph : null,
          left_cyl: orderData.leftCyl !== undefined ? orderData.leftCyl : null,
          price: orderData.price,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return {
      id: data.id,
      customerId: data.customer_id,
      customer_id: data.customer_id,
      customerName: data.customer_name,
      customer_name: data.customer_name,
      phone: data.phone || undefined,
      companyId: data.company_id,
      company_id: data.company_id,
      companyName: data.company_name,
      company_name: data.company_name,
      lensTypeId: data.lens_type_id,
      lens_type_id: data.lens_type_id,
      lensTypeName: data.lens_type_name,
      lens_type_name: data.lens_type_name,
      orderedEye: data.ordered_eye,
      ordered_eye: data.ordered_eye,
      rightSph: data.right_sph !== null && data.right_sph !== undefined ? Number(data.right_sph) : null,
      right_sph: data.right_sph !== null && data.right_sph !== undefined ? Number(data.right_sph) : null,
      rightCyl: data.right_cyl !== null && data.right_cyl !== undefined ? Number(data.right_cyl) : null,
      right_cyl: data.right_cyl !== null && data.right_cyl !== undefined ? Number(data.right_cyl) : null,
      leftSph: data.left_sph !== null && data.left_sph !== undefined ? Number(data.left_sph) : null,
      left_sph: data.left_sph !== null && data.left_sph !== undefined ? Number(data.left_sph) : null,
      leftCyl: data.left_cyl !== null && data.left_cyl !== undefined ? Number(data.left_cyl) : null,
      left_cyl: data.left_cyl !== null && data.left_cyl !== undefined ? Number(data.left_cyl) : null,
      price: Number(data.price),
      created_at: data.created_at,
      createdAt: data.created_at,
    };
  },

  async deleteOrder(id: string): Promise<void> {
    if (!supabase || !isSupabaseConfigured) {
      throw new Error('تعذر الاتصال بقاعدة البيانات: يرجى التحقق من إعدادات Supabase');
    }

    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
