import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Company, LensType, PricingRule, Customer, Order, AppData } from '../types';
import { initialData } from '../data/defaultData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Fallback cache key when running locally without Supabase env vars
const LOCAL_STORAGE_KEY = 'nour_optics_supabase_fallback_v2';

function getLocalData(): AppData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        companies: Array.isArray(parsed.companies) ? parsed.companies : initialData.companies,
        lensTypes: Array.isArray(parsed.lensTypes) ? parsed.lensTypes : initialData.lensTypes,
        pricingRules: Array.isArray(parsed.pricingRules) ? parsed.pricingRules : initialData.pricingRules,
        customers: Array.isArray(parsed.customers) ? parsed.customers : [],
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      };
    }
  } catch (e) {
    console.error('Failed to read local fallback data', e);
  }
  return {
    ...initialData,
    customers: [
      { id: 'cust_1', name: 'أحمد محمود', phone: '01012345678', created_at: new Date().toISOString() },
      { id: 'cust_2', name: 'سارة علي', phone: '01198765432', created_at: new Date().toISOString() },
    ],
    orders: [
      {
        id: 'ord_1',
        customer_id: 'cust_1',
        customer_name: 'أحمد محمود',
        phone: '01012345678',
        company_name: 'ZEISS',
        lens_type_name: 'Blue Cut',
        ordered_eye: 'both',
        right_sph: -1.5,
        right_cyl: -0.5,
        left_sph: 2.0,
        left_cyl: -1.0,
        price: 350,
        created_at: new Date().toISOString(),
        customerName: 'أحمد محمود',
        companyName: 'ZEISS',
        lensTypeName: 'Blue Cut',
        orderedEye: 'both',
        rightSph: -1.5,
        rightCyl: -0.5,
        leftSph: 2.0,
        leftCyl: -1.0,
      },
    ],
  };
}

function saveLocalData(data: AppData) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save local fallback data', e);
  }
}

// ----------------------------------------------------------------------
// Database Operations Service
// ----------------------------------------------------------------------
export const dbService = {
  async fetchAllData(): Promise<AppData> {
    if (supabase) {
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
          console.error('Supabase query error, falling back', compErr || ltErr || prErr || custErr || ordErr);
        } else {
          return {
            companies: (companies || []).map((c) => ({ ...c, id: c.id, name: c.name })),
            lensTypes: (lensTypes || []).map((lt) => ({ ...lt, id: lt.id, name: lt.name })),
            pricingRules: (pricingRules || []).map((pr) => ({
              ...pr,
              minRange: Number(pr.min_range),
              maxRange: Number(pr.max_range),
              price: Number(pr.price),
              companyId: pr.company_id,
              lensTypeId: pr.lens_type_id,
            })),
            customers: (customers || []).map((cu) => ({ ...cu, id: cu.id, name: cu.name, phone: cu.phone })),
            orders: (orders || []).map((o) => ({
              ...o,
              id: o.id,
              customerName: o.customer_name,
              companyName: o.company_name,
              lensTypeName: o.lens_type_name,
              orderedEye: o.ordered_eye,
              rightSph: o.right_sph,
              rightCyl: o.right_cyl,
              leftSph: o.left_sph,
              leftCyl: o.left_cyl,
              price: Number(o.price),
            })),
          };
        }
      } catch (err) {
        console.error('Supabase fetchAllData exception', err);
      }
    }
    return getLocalData();
  },

  // ---------------- Companies ----------------
  async addCompany(name: string): Promise<Company> {
    const trimmed = name.trim();
    if (supabase) {
      const { data, error } = await supabase
        .from('companies')
        .insert([{ name: trimmed }])
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    const local = getLocalData();
    const newComp: Company = {
      id: 'comp_' + Date.now().toString(36),
      name: trimmed,
      created_at: new Date().toISOString(),
    };
    local.companies.push(newComp);
    saveLocalData(local);
    return newComp;
  },

  async deleteCompany(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('companies').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const local = getLocalData();
    local.companies = local.companies.filter((c) => c.id !== id);
    local.pricingRules = local.pricingRules.filter((r) => (r.company_id || r.companyId) !== id);
    saveLocalData(local);
  },

  // ---------------- Lens Types ----------------
  async addLensType(name: string): Promise<LensType> {
    const trimmed = name.trim();
    if (supabase) {
      const { data, error } = await supabase
        .from('lens_types')
        .insert([{ name: trimmed }])
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    const local = getLocalData();
    const newType: LensType = {
      id: 'type_' + Date.now().toString(36),
      name: trimmed,
      created_at: new Date().toISOString(),
    };
    local.lensTypes.push(newType);
    saveLocalData(local);
    return newType;
  },

  async deleteLensType(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('lens_types').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const local = getLocalData();
    local.lensTypes = local.lensTypes.filter((t) => t.id !== id);
    local.pricingRules = local.pricingRules.filter((r) => (r.lens_type_id || r.lensTypeId) !== id);
    saveLocalData(local);
  },

  // ---------------- Pricing Rules ----------------
  async addPricingRule(
    companyId: string,
    lensTypeId: string,
    minRange: number,
    maxRange: number,
    price: number
  ): Promise<PricingRule> {
    if (supabase) {
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
        ...data,
        minRange: Number(data.min_range),
        maxRange: Number(data.max_range),
        price: Number(data.price),
        companyId: data.company_id,
        lensTypeId: data.lens_type_id,
      };
    }

    const local = getLocalData();
    const newRule: PricingRule = {
      id: 'rule_' + Date.now().toString(36),
      company_id: companyId,
      companyId: companyId,
      lens_type_id: lensTypeId,
      lensTypeId: lensTypeId,
      min_range: minRange,
      minRange: minRange,
      max_range: maxRange,
      maxRange: maxRange,
      price: price,
      created_at: new Date().toISOString(),
    };
    local.pricingRules.push(newRule);
    saveLocalData(local);
    return newRule;
  },

  async deletePricingRule(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('pricing_rules').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const local = getLocalData();
    local.pricingRules = local.pricingRules.filter((r) => r.id !== id);
    saveLocalData(local);
  },

  // ---------------- Customers ----------------
  async addCustomer(name: string, phone?: string): Promise<Customer> {
    const cleanName = name.trim();
    const cleanPhone = (phone || '').trim();

    if (supabase) {
      const { data, error } = await supabase
        .from('customers')
        .insert([{ name: cleanName, phone: cleanPhone }])
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    }

    const local = getLocalData();
    const newCust: Customer = {
      id: 'cust_' + Date.now().toString(36),
      name: cleanName,
      phone: cleanPhone,
      created_at: new Date().toISOString(),
    };
    local.customers.unshift(newCust);
    saveLocalData(local);
    return newCust;
  },

  async deleteCustomer(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const local = getLocalData();
    local.customers = local.customers.filter((c) => c.id !== id);
    local.orders = local.orders.filter((o) => (o.customer_id || o.customerId) !== id);
    saveLocalData(local);
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
    if (supabase) {
      // If customer doesn't exist, create customer first
      let resolvedCustomerId = orderData.customerId;
      if (!resolvedCustomerId && orderData.customerName) {
        const { data: newC } = await supabase
          .from('customers')
          .insert([{ name: orderData.customerName, phone: orderData.phone || '' }])
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
            right_sph: orderData.rightSph ?? null,
            right_cyl: orderData.rightCyl ?? null,
            left_sph: orderData.leftSph ?? null,
            left_cyl: orderData.leftCyl ?? null,
            price: orderData.price,
          },
        ])
        .select()
        .single();

      if (error) throw new Error(error.message);
      return {
        ...data,
        customerName: data.customer_name,
        companyName: data.company_name,
        lensTypeName: data.lens_type_name,
        orderedEye: data.ordered_eye,
        rightSph: data.right_sph ?? null,
        rightCyl: data.right_cyl ?? null,
        leftSph: data.left_sph ?? null,
        leftCyl: data.left_cyl ?? null,
        price: Number(data.price),
      };
    }

    const local = getLocalData();
    let cId = orderData.customerId;
    if (!cId && orderData.customerName) {
      const existing = local.customers.find(
        (c) => c.name.toLowerCase() === orderData.customerName.toLowerCase()
      );
      if (existing) {
        cId = existing.id;
      } else {
        const newCust: Customer = {
          id: 'cust_' + Date.now().toString(36),
          name: orderData.customerName,
          phone: orderData.phone || undefined,
          created_at: new Date().toISOString(),
        };
        local.customers.unshift(newCust);
        cId = newCust.id;
      }
    }

    const newOrder: Order = {
      id: 'ord_' + Date.now().toString(36),
      customer_id: cId,
      customerId: cId,
      customer_name: orderData.customerName,
      customerName: orderData.customerName,
      phone: orderData.phone,
      company_id: orderData.companyId,
      companyId: orderData.companyId,
      company_name: orderData.companyName,
      companyName: orderData.companyName,
      lens_type_id: orderData.lensTypeId,
      lensTypeId: orderData.lensTypeId,
      lens_type_name: orderData.lensTypeName,
      lensTypeName: orderData.lensTypeName,
      ordered_eye: orderData.orderedEye,
      orderedEye: orderData.orderedEye,
      right_sph: orderData.rightSph ?? null,
      rightSph: orderData.rightSph ?? null,
      right_cyl: orderData.rightCyl ?? null,
      rightCyl: orderData.rightCyl ?? null,
      left_sph: orderData.leftSph ?? null,
      leftSph: orderData.leftSph ?? null,
      left_cyl: orderData.leftCyl ?? null,
      leftCyl: orderData.leftCyl ?? null,
      price: orderData.price,
      created_at: new Date().toISOString(),
    };

    local.orders.unshift(newOrder);
    saveLocalData(local);
    return newOrder;
  },

  async deleteOrder(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }

    const local = getLocalData();
    local.orders = local.orders.filter((o) => o.id !== id);
    saveLocalData(local);
  },
};
