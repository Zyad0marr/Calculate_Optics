# نور للبصريات (Nour Optics)

نظام ويب احترافي ومتجاوب لإدارة وحساب أسعار عدسات النظارات الطبية وسجل العملاء والطلبات. مصمم للعمل كـ Single Page Application (SPA) جاهزة للنشر المباشر على Vercel مع قاعدة بيانات Supabase.

---

## 1. تثبيت الحزم (Installation)

```bash
npm install
```

---

## 2. إنشاء مشروع Supabase

1. توجه إلى [Supabase](https://supabase.com) وسجّل الدخول.
2. اضغط على **"New Project"**.
3. اختر اسم المشروع (مثلاً: `nour-optics`) وكلمة مرور قوية لقاعدة البيانات.
4. انتظر دقيقة حتى يكتمل إنشاء المشروع.

---

## 3. إنشاء جداول قاعدة البيانات (Create Database Tables)

1. من لوحة تحكم مشروعك في Supabase، اضغط على **"SQL Editor"** من القائمة الجانبية.
2. اضغط على **"New query"**.
3. افتح ملف `supabase/schema.sql` الموجود في هذا المشروع وانسخ محتواه بالكامل.
4. الصق الاستعلام في محرّر SQL في Supabase واضغط على **"Run"**.
5. سيتم إنشاء الجداول الخمسة التالية فوراً مع تفعيل سياسات الأمان وتعبئة البيانات النموذجية:
   - `companies` (الشركات)
   - `lens_types` (أنواع العدسات)
   - `pricing_rules` (قواعد التسعير)
   - `customers` (العملاء)
   - `orders` (الطلبات والمقاسات)

---

## 4. متغيرات البيئة المحلية (Local Environment Variables)

أنشئ ملفاً باسم `.env` في المجلد الرئيسي للتطبيق وأضف بيانات الاعتماد الخاصة بمشروع Supabase (يمكنك العثور عليها في Supabase تحت **Project Settings -> API**):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 5. التشغيل محلياً (Run Locally)

```bash
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

---

## 6. البناء للإنتاج (Build for Production)

```bash
npm run build
```

سيتم إنشاء ملفات الإنتاج المجمعة والمحسنة داخل مجلد `dist`.

---

## 7. النشر على Vercel (Deploy to Vercel)

1. ارفع المشروع إلى حسابك على **GitHub**.
2. توجّه إلى [Vercel](https://vercel.com) واضغط على **"Add New" -> "Project"**.
3. اختر المستودع الخاص بالمشروع من GitHub.
4. في شاشة الإعدادات في Vercel:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. اضغط على قسم **"Environment Variables"** وأضف المتغيرين التاليين (انظر البند 8).
6. اضغط على **"Deploy"**.

---

## 8. متغيرات بيئة Vercel المطلوبة (Vercel Environment Variables)

أضف هذين المتغيرين في لوحة تحكم Vercel تحت **Settings -> Environment Variables**:

| اسم المتغير | الوصف | مثال |
|---|---|---|
| `VITE_SUPABASE_URL` | رابط مشروع Supabase | `https://xyzproject.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | المفتاح العام المجهول (anon public key) | `eyJhbGciOiJIUzI1NiIsIn...` |

---

## 9. بيانات تسجيل الدخول الافتراضية

- **اسم المستخدم (Username)**: `nour` (أحرف إنجليزية صغيرة)
- **كلمة المرور (Password)**: `nour` (أحرف إنجليزية صغيرة)

*بيانات تسجيل الدخول لا تظهر في أي مكان على واجهة المستخدم، وتتطلب إدخالاً يدوياً.*
