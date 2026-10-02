export type OrderedEye = 'both' | 'right' | 'left';
export type AppSection = 'calculator' | 'customers' | 'companies' | 'lensTypes' | 'pricingRules';

export interface Company {
  id: string;
  name: string;
  created_at?: string;
  createdAt?: string;
}

export interface LensType {
  id: string;
  name: string;
  created_at?: string;
  createdAt?: string;
}

export interface PricingRule {
  id: string;
  company_id?: string;
  companyId?: string;
  lens_type_id?: string;
  lensTypeId?: string;
  min_range?: number;
  minRange: number;
  max_range?: number;
  maxRange: number;
  price: number;
  created_at?: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  created_at?: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  customer_id?: string;
  customerId?: string;
  customer_name?: string;
  customerName: string;
  phone?: string;
  company_id?: string;
  companyId?: string;
  lens_type_id?: string;
  lensTypeId?: string;
  company_name?: string;
  companyName: string;
  lens_type_name?: string;
  lensTypeName: string;
  ordered_eye?: OrderedEye;
  orderedEye: OrderedEye;
  right_sph?: number | null;
  rightSph?: number | null;
  right_cyl?: number | null;
  rightCyl?: number | null;
  left_sph?: number | null;
  leftSph?: number | null;
  left_cyl?: number | null;
  leftCyl?: number | null;
  price: number;
  created_at?: string;
  createdAt?: string;
}

export interface PrescriptionInputState {
  rightSph: string;
  rightCyl: string;
  leftSph: string;
  leftCyl: string;
}

export interface CalculationResult {
  found: boolean;
  price: number | null;
  maxAbsValue: number;
  matchedRule: PricingRule | null;
  companyName: string;
  lensTypeName: string;
  orderedEye: OrderedEye;
  message?: string;
  calculationDetails?: {
    rightSph?: number;
    rightCyl?: number;
    leftSph?: number;
    leftCyl?: number;
    maxAbsValue: number;
    appliedRange: string;
  };
}

export interface AppData {
  companies: Company[];
  lensTypes: LensType[];
  pricingRules: PricingRule[];
  customers: Customer[];
  orders: Order[];
}
