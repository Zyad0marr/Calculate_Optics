import { supabase, isSupabaseConfigured } from './supabase';

const AUTH_STORAGE_KEY = 'nour_optics_session_v2';

export interface UserSession {
  username: string;
  token: string;
  loggedInAt: number;
}

/**
 * Standard Web Crypto SHA-256 hash generator.
 * Produces 64-character lowercase hex string.
 * Never stores or transmits plaintext passwords.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Default hash of 'nour'
export const DEFAULT_NOUR_HASH = '626f8d387b9f5e135b91b9f67a78377d248b6c4bbfba08b776ec0150937a0751';

export const authService = {
  /**
   * Retrieves the current active user session.
   */
  getCurrentSession(): UserSession | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed && parsed.username && parsed.token) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Checks if user is authenticated.
   */
  isAuthenticated(): boolean {
    return this.getCurrentSession() !== null;
  },

  /**
   * Logs out the user and clears session token.
   */
  logout(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  /**
   * Authenticates against Supabase users table with SHA-256 hash verification.
   */
  async login(usernameInput: string, passwordInput: string): Promise<{ success: boolean; message?: string }> {
    const username = (usernameInput || '').trim().toLowerCase();
    const password = (passwordInput || '').trim();

    if (!username || !password) {
      return { success: false, message: 'يرجى إدخال اسم المستخدم وكلمة المرور' };
    }

    const inputHash = await hashPassword(password);

    // 1. Authenticate against central Supabase database
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('id, username, password_hash')
          .ilike('username', username)
          .maybeSingle();

        if (error) {
          console.warn('Supabase users table lookup:', error.message);
        } else if (user) {
          if (user.password_hash === inputHash) {
            const session: UserSession = {
              username: user.username,
              token: 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2),
              loggedInAt: Date.now(),
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
            return { success: true };
          } else {
            return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
          }
        } else {
          // If table exists but user 'nour' was not seeded yet, seed it automatically
          if (username === 'nour' && inputHash === DEFAULT_NOUR_HASH) {
            try {
              await supabase.from('users').insert([
                { username: 'nour', password_hash: DEFAULT_NOUR_HASH }
              ]);
            } catch (seedErr) {
              console.warn('Auto-seed user error:', seedErr);
            }
            const session: UserSession = {
              username: 'nour',
              token: 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2),
              loggedInAt: Date.now(),
            };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
            return { success: true };
          }
        }
      } catch (err) {
        console.error('Supabase authentication query error:', err);
      }
    }

    // 2. Default fallback if database has not yet been connected/configured
    if (username === 'nour' && inputHash === DEFAULT_NOUR_HASH) {
      const session: UserSession = {
        username: 'nour',
        token: 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2),
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

  /**
   * Changes the user password securely in Supabase.
   * Verifies current password before updating to new hashed password.
   */
  async changePassword(
    currentPasswordInput: string,
    newPasswordInput: string,
    confirmPasswordInput: string
  ): Promise<{ success: boolean; message: string }> {
    const currentPass = (currentPasswordInput || '').trim();
    const newPass = (newPasswordInput || '').trim();
    const confirmPass = (confirmPasswordInput || '').trim();

    if (!currentPass || !newPass || !confirmPass) {
      return { success: false, message: 'يرجى ملء جميع الحقول المطلوبة' };
    }

    if (newPass !== confirmPass) {
      return { success: false, message: 'كلمة المرور الجديدة وتأكيدها غير متطابقين' };
    }

    if (newPass.length < 3) {
      return { success: false, message: 'كلمة المرور الجديدة يجب أن تتكون من 3 أحرف على الأقل' };
    }

    const currentHash = await hashPassword(currentPass);
    const newHash = await hashPassword(newPass);

    const session = this.getCurrentSession();
    const username = (session?.username || 'nour').toLowerCase();

    if (isSupabaseConfigured && supabase) {
      try {
        // Verify current password against Supabase
        const { data: user, error: fetchErr } = await supabase
          .from('users')
          .select('id, username, password_hash')
          .ilike('username', username)
          .maybeSingle();

        if (fetchErr) {
          throw new Error(fetchErr.message);
        }

        if (user) {
          if (user.password_hash !== currentHash) {
            return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
          }

          // Update password hash in Supabase
          const { error: updateErr } = await supabase
            .from('users')
            .update({
              password_hash: newHash,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (updateErr) {
            throw new Error(updateErr.message);
          }

          return { success: true, message: 'تم تغيير كلمة المرور بنجاح في قاعدة البيانات' };
        } else {
          // If user doesn't exist in Supabase yet, verify default password first
          if (currentHash !== DEFAULT_NOUR_HASH) {
            return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
          }

          const { error: insertErr } = await supabase.from('users').insert([
            { username: username, password_hash: newHash }
          ]);

          if (insertErr) throw new Error(insertErr.message);
          return { success: true, message: 'تم تغيير كلمة المرور بنجاح في قاعدة البيانات' };
        }
      } catch (err: any) {
        console.error('Change password error:', err);
        return {
          success: false,
          message: 'تعذر حفظ كلمة المرور الجديدة في قاعدة البيانات: ' + (err.message || 'خطأ في الاتصال'),
        };
      }
    }

    // If Supabase not configured, verify against default
    if (currentHash !== DEFAULT_NOUR_HASH) {
      return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
    }

    return {
      success: true,
      message: 'تم التحقق من كلمة المرور (يرجى ربط Supabase لحفظ التغيير سحابياً)',
    };
  },
};
