import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Persistent database path (in serverless/Vercel /tmp or persistent /data)
const isVercel = process.env.VERCEL === '1';
const DATA_DIR = isVercel ? '/tmp/nour-optics-data' : path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial fallback seed
const initialSeed = {
  companies: [
    { id: 'comp_zeiss', name: 'ZEISS', createdAt: new Date().toISOString() },
    { id: 'comp_essilor', name: 'Essilor', createdAt: new Date().toISOString() },
    { id: 'comp_hoya', name: 'Hoya', createdAt: new Date().toISOString() },
  ],
  lensTypes: [
    { id: 'type_single_vision', name: 'Single Vision', createdAt: new Date().toISOString() },
    { id: 'type_blue_cut', name: 'Blue Cut', createdAt: new Date().toISOString() },
    { id: 'type_photochromic', name: 'Photochromic', createdAt: new Date().toISOString() },
  ],
  pricingRules: [
    { id: 'rule_1', companyId: 'comp_zeiss', lensTypeId: 'type_single_vision', minRange: 0.0, maxRange: 2.0, price: 200, createdAt: new Date().toISOString() },
    { id: 'rule_2', companyId: 'comp_zeiss', lensTypeId: 'type_single_vision', minRange: 2.25, maxRange: 4.0, price: 300, createdAt: new Date().toISOString() },
    { id: 'rule_3', companyId: 'comp_zeiss', lensTypeId: 'type_single_vision', minRange: 4.25, maxRange: 6.0, price: 450, createdAt: new Date().toISOString() },
    { id: 'rule_4', companyId: 'comp_zeiss', lensTypeId: 'type_single_vision', minRange: 6.25, maxRange: 8.0, price: 650, createdAt: new Date().toISOString() },
    { id: 'rule_5', companyId: 'comp_zeiss', lensTypeId: 'type_blue_cut', minRange: 0.0, maxRange: 2.0, price: 350, createdAt: new Date().toISOString() },
    { id: 'rule_6', companyId: 'comp_zeiss', lensTypeId: 'type_blue_cut', minRange: 2.25, maxRange: 4.0, price: 480, createdAt: new Date().toISOString() },
    { id: 'rule_7', companyId: 'comp_zeiss', lensTypeId: 'type_blue_cut', minRange: 4.25, maxRange: 6.0, price: 650, createdAt: new Date().toISOString() },
    { id: 'rule_8', companyId: 'comp_zeiss', lensTypeId: 'type_photochromic', minRange: 0.0, maxRange: 2.0, price: 550, createdAt: new Date().toISOString() },
    { id: 'rule_9', companyId: 'comp_zeiss', lensTypeId: 'type_photochromic', minRange: 2.25, maxRange: 4.0, price: 750, createdAt: new Date().toISOString() },
    { id: 'rule_10', companyId: 'comp_essilor', lensTypeId: 'type_single_vision', minRange: 0.0, maxRange: 2.0, price: 180, createdAt: new Date().toISOString() },
    { id: 'rule_11', companyId: 'comp_essilor', lensTypeId: 'type_single_vision', minRange: 2.25, maxRange: 4.0, price: 280, createdAt: new Date().toISOString() },
    { id: 'rule_12', companyId: 'comp_essilor', lensTypeId: 'type_single_vision', minRange: 4.25, maxRange: 6.0, price: 420, createdAt: new Date().toISOString() },
    { id: 'rule_13', companyId: 'comp_essilor', lensTypeId: 'type_blue_cut', minRange: 0.0, maxRange: 2.0, price: 320, createdAt: new Date().toISOString() },
    { id: 'rule_14', companyId: 'comp_essilor', lensTypeId: 'type_blue_cut', minRange: 2.25, maxRange: 4.0, price: 450, createdAt: new Date().toISOString() },
    { id: 'rule_15', companyId: 'comp_hoya', lensTypeId: 'type_single_vision', minRange: 0.0, maxRange: 2.0, price: 190, createdAt: new Date().toISOString() },
    { id: 'rule_16', companyId: 'comp_hoya', lensTypeId: 'type_single_vision', minRange: 2.25, maxRange: 4.0, price: 290, createdAt: new Date().toISOString() },
  ],
};

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSeed, null, 2), 'utf-8');
      return initialSeed;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      companies: Array.isArray(parsed.companies) ? parsed.companies : [],
      lensTypes: Array.isArray(parsed.lensTypes) ? parsed.lensTypes : [],
      pricingRules: Array.isArray(parsed.pricingRules) ? parsed.pricingRules : [],
    };
  } catch (err) {
    console.error('Error reading db:', err);
    return initialSeed;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db:', err);
    return false;
  }
}

// Ensure database file is initialized on start
readDb();

/* ==========================================================================
   AUTHENTICATION API
   ========================================================================== */
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const trimmedUser = (username || '').toString().trim();
  const trimmedPass = (password || '').toString().trim();

  // Strict check: username 'nour' and password 'nour' (lowercase English) or 'نور'
  const isUserValid = trimmedUser.toLowerCase() === 'nour' || trimmedUser === 'نور';
  const isPassValid = trimmedPass === 'nour' || trimmedPass === 'نور';

  if (isUserValid && isPassValid) {
    const token = 'nour_token_' + Buffer.from('nour:' + Date.now()).toString('base64');
    return res.json({
      success: true,
      token,
      user: { name: 'nour', role: 'admin' },
    });
  }

  return res.status(401).json({
    success: false,
    message: 'اسم المستخدم أو كلمة المرور غير صحيحة',
  });
});

/* ==========================================================================
   DATA & MANAGEMENT API
   ========================================================================== */
// Get full dataset
app.get('/api/data', (_req: Request, res: Response) => {
  const data = readDb();
  res.json({ success: true, data });
});

// Add Company
app.post('/api/companies', (req: Request, res: Response) => {
  const { name } = req.body;
  const cleanName = (name || '').toString().trim();
  if (!cleanName) {
    return res.status(400).json({ success: false, message: 'اسم الشركة مطلوب' });
  }

  const db = readDb();
  const exists = db.companies.some((c: any) => c.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: 'هذه الشركة مضافة بالفعل' });
  }

  const newCompany = {
    id: 'comp_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: cleanName,
    createdAt: new Date().toISOString(),
  };

  db.companies.push(newCompany);
  writeDb(db);
  res.status(201).json({ success: true, company: newCompany });
});

// Delete Company
app.delete('/api/companies/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();

  db.companies = db.companies.filter((c: any) => c.id !== id);
  db.pricingRules = db.pricingRules.filter((r: any) => r.companyId !== id);

  writeDb(db);
  res.json({ success: true, message: 'تم حذف الشركة بنجاح' });
});

// Add Lens Type
app.post('/api/lens-types', (req: Request, res: Response) => {
  const { name } = req.body;
  const cleanName = (name || '').toString().trim();
  if (!cleanName) {
    return res.status(400).json({ success: false, message: 'اسم نوع العدسة مطلوب' });
  }

  const db = readDb();
  const exists = db.lensTypes.some((lt: any) => lt.name.toLowerCase() === cleanName.toLowerCase());
  if (exists) {
    return res.status(400).json({ success: false, message: 'هذا النوع مضاف بالفعل' });
  }

  const newLensType = {
    id: 'type_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: cleanName,
    createdAt: new Date().toISOString(),
  };

  db.lensTypes.push(newLensType);
  writeDb(db);
  res.status(201).json({ success: true, lensType: newLensType });
});

// Delete Lens Type
app.delete('/api/lens-types/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();

  db.lensTypes = db.lensTypes.filter((lt: any) => lt.id !== id);
  db.pricingRules = db.pricingRules.filter((r: any) => r.lensTypeId !== id);

  writeDb(db);
  res.json({ success: true, message: 'تم حذف نوع العدسة بنجاح' });
});

// Add Pricing Rule
app.post('/api/pricing-rules', (req: Request, res: Response) => {
  const { companyId, lensTypeId, minRange, maxRange, price } = req.body;

  if (!companyId || !lensTypeId) {
    return res.status(400).json({ success: false, message: 'يجب اختيار الشركة ونوع العدسة' });
  }

  const numMin = parseFloat(minRange);
  const numMax = parseFloat(maxRange);
  const numPrice = parseFloat(price);

  if (isNaN(numMin) || isNaN(numMax) || isNaN(numPrice)) {
    return res.status(400).json({ success: false, message: 'يرجى إدخال قيم صحيحة للنطاق والسعر' });
  }

  if (numMin > numMax) {
    return res.status(400).json({ success: false, message: 'بداية النطاق يجب أن تكون أصغر من أو تساوي نهايته' });
  }

  const db = readDb();
  const newRule = {
    id: 'rule_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    companyId,
    lensTypeId,
    minRange: numMin,
    maxRange: numMax,
    price: numPrice,
    createdAt: new Date().toISOString(),
  };

  db.pricingRules.push(newRule);
  writeDb(db);
  res.status(201).json({ success: true, rule: newRule });
});

// Delete Pricing Rule
app.delete('/api/pricing-rules/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = readDb();

  db.pricingRules = db.pricingRules.filter((r: any) => r.id !== id);
  writeDb(db);
  res.json({ success: true, message: 'تم حذف قاعدة التسعير بنجاح' });
});

// Reset data to initial seed
app.post('/api/reset-data', (_req: Request, res: Response) => {
  writeDb(initialSeed);
  res.json({ success: true, data: initialSeed, message: 'تمت استعادة البيانات الافتراضية' });
});

/* ==========================================================================
   Vite Middleware / Static Serving (Local / Dev)
   ========================================================================== */
async function start() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  } else if (!isVercel) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  if (!isVercel) {
    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Nour Optics server running on http://0.0.0.0:${PORT}`);
    });
  }
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});

export default app;
