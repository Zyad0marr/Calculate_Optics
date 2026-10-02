import { AppData, Company, LensType, PricingRule } from '../types';
import { initialData } from '../data/defaultData';

const AUTH_STORAGE_KEY = 'nour_optics_auth_session';
const DATA_STORAGE_KEY = 'nour_optics_db_cache';

export interface UserSession {
  username: string;
  token: string;
  loggedInAt: number;
}

// -------------------------------------------------------------
// Authentication Service
// -------------------------------------------------------------
export const authService = {
  getCurrentSession(): UserSession | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed && (parsed.username === 'nour' || parsed.username === 'نور') && parsed.token) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  async login(username: string, password: string): Promise<{ success: boolean; message?: string }> {
    const trimmedUser = (username || '').trim();
    const trimmedPass = (password || '').trim();

    // Try server endpoint first
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password: trimmedPass }),
      });

      if (response.ok) {
        const data = await response.json();
        const session: UserSession = {
          username: 'nour',
          token: data.token || 'session_token_' + Date.now(),
          loggedInAt: Date.now(),
        };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
        return { success: true };
      }
    } catch {
      // In case server is offline or static deploy fallback
    }

    // Direct credential verification: Username: nour, Password: nour (lowercase English)
    const isUserValid = trimmedUser.toLowerCase() === 'nour' || trimmedUser === 'نور';
    const isPassValid = trimmedPass === 'nour' || trimmedPass === 'نور';

    if (isUserValid && isPassValid) {
      const session: UserSession = {
        username: 'nour',
        token: 'session_token_' + Date.now(),
        loggedInAt: Date.now(),
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return { success: true };
    }

    return {
      success: false,
      message: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    };
  },

  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  },
};

// -------------------------------------------------------------
// Data Storage Service (Server First with Local Fallback)
// -------------------------------------------------------------
export const dataService = {
  getLocalCache(): AppData {
    try {
      const cached = localStorage.getItem(DATA_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed.companies) && Array.isArray(parsed.lensTypes)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading local cache', e);
    }
    return initialData;
  },

  saveLocalCache(data: AppData): void {
    try {
      localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving local cache', e);
    }
  },

  async fetchData(): Promise<AppData> {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          this.saveLocalCache(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn('API fetch failed, falling back to persistent local storage', err);
    }
    return this.getLocalCache();
  },

  async addCompany(name: string): Promise<Company> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('اسم الشركة مطلوب');

    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.company) {
          const current = this.getLocalCache();
          current.companies.push(json.company);
          this.saveLocalCache(current);
          return json.company;
        }
      }
    } catch {
      // Fallback
    }

    const current = this.getLocalCache();
    const newComp: Company = {
      id: 'comp_' + Date.now().toString(36),
      name: trimmed,
      createdAt: new Date().toISOString(),
    };
    current.companies.push(newComp);
    this.saveLocalCache(current);
    return newComp;
  },

  async deleteCompany(id: string): Promise<void> {
    try {
      await fetch(`/api/companies/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }

    const current = this.getLocalCache();
    current.companies = current.companies.filter((c) => c.id !== id);
    current.pricingRules = current.pricingRules.filter((r) => r.companyId !== id);
    this.saveLocalCache(current);
  },

  async addLensType(name: string): Promise<LensType> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('اسم نوع العدسة مطلوب');

    try {
      const res = await fetch('/api/lens-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.lensType) {
          const current = this.getLocalCache();
          current.lensTypes.push(json.lensType);
          this.saveLocalCache(current);
          return json.lensType;
        }
      }
    } catch {
      // Fallback
    }

    const current = this.getLocalCache();
    const newType: LensType = {
      id: 'type_' + Date.now().toString(36),
      name: trimmed,
      createdAt: new Date().toISOString(),
    };
    current.lensTypes.push(newType);
    this.saveLocalCache(current);
    return newType;
  },

  async deleteLensType(id: string): Promise<void> {
    try {
      await fetch(`/api/lens-types/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }

    const current = this.getLocalCache();
    current.lensTypes = current.lensTypes.filter((t) => t.id !== id);
    current.pricingRules = current.pricingRules.filter((r) => r.lensTypeId !== id);
    this.saveLocalCache(current);
  },

  async addPricingRule(
    companyId: string,
    lensTypeId: string,
    minRange: number,
    maxRange: number,
    price: number
  ): Promise<PricingRule> {
    try {
      const res = await fetch('/api/pricing-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, lensTypeId, minRange, maxRange, price }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.rule) {
          const current = this.getLocalCache();
          current.pricingRules.push(json.rule);
          this.saveLocalCache(current);
          return json.rule;
        }
      }
    } catch {
      // Fallback
    }

    const current = this.getLocalCache();
    const newRule: PricingRule = {
      id: 'rule_' + Date.now().toString(36),
      companyId,
      lensTypeId,
      minRange,
      maxRange,
      price,
      createdAt: new Date().toISOString(),
    };
    current.pricingRules.push(newRule);
    this.saveLocalCache(current);
    return newRule;
  },

  async deletePricingRule(id: string): Promise<void> {
    try {
      await fetch(`/api/pricing-rules/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }

    const current = this.getLocalCache();
    current.pricingRules = current.pricingRules.filter((r) => r.id !== id);
    this.saveLocalCache(current);
  },

  async resetToDefault(): Promise<AppData> {
    try {
      await fetch('/api/reset-data', { method: 'POST' });
    } catch {
      // Fallback
    }
    this.saveLocalCache(initialData);
    return initialData;
  },
};
