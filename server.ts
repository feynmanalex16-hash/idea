import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

interface Capsule {
  id: string;
  content: string;
  color: 'purple' | 'blue' | 'green' | 'amber';
  createdAt: string;
  dateStr: string;
  spaceCode: string;
  isFavorite?: boolean;
  tags?: string[];
}

interface User {
  id: string;
  username: string;
  passwordHash: string;
  spaceCode: string;
  createdAt: string;
}

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'capsules.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

app.use(express.json({ limit: '5mb' }));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to hash password
function hashPassword(pass: string): string {
  return crypto.createHash('sha256').update(`capsule_salt_${pass}`).digest('hex');
}

// In-memory stores initialized from disk
let memoryCapsules: Capsule[] = [];
let memoryUsers: User[] = [];

try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    // Remove default seeded welcome capsules so space starts 100% clean
    memoryCapsules = Array.isArray(parsed)
      ? parsed.filter((c: Capsule) => !c.id.startsWith('welcome-capsule-'))
      : [];
  } else {
    memoryCapsules = [];
    saveCapsulesToDisk();
  }
} catch (err) {
  console.error('Failed to initialize capsules store:', err);
  memoryCapsules = [];
}

try {
  if (fs.existsSync(USERS_FILE)) {
    const rawUsers = fs.readFileSync(USERS_FILE, 'utf-8');
    memoryUsers = JSON.parse(rawUsers);
  }
} catch (err) {
  console.error('Failed to initialize users store:', err);
  memoryUsers = [];
}

function saveCapsulesToDisk() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryCapsules, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save capsules to disk:', err);
  }
}

function saveUsersToDisk() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(memoryUsers, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save users to disk:', err);
  }
}

// REST API Endpoints
// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Authentication Endpoints
// Register
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length < 2) {
    return res.status(400).json({ error: '用户名至少需要 2 个字符' });
  }

  if (!password || typeof password !== 'string' || password.trim().length < 3) {
    return res.status(400).json({ error: '密码至少需要 3 个字符' });
  }

  const normalizedUsername = username.trim();
  const lowerName = normalizedUsername.toLowerCase();

  const existing = memoryUsers.find(u => u.username.toLowerCase() === lowerName);
  if (existing) {
    return res.status(400).json({ error: '该用户名已被注册，请直接登录' });
  }

  const spaceCode = `user_${lowerName}`;
  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: normalizedUsername,
    passwordHash: hashPassword(password.trim()),
    spaceCode,
    createdAt: new Date().toISOString(),
  };

  memoryUsers.push(newUser);
  saveUsersToDisk();

  res.json({
    success: true,
    user: {
      username: newUser.username,
      spaceCode: newUser.spaceCode,
      createdAt: newUser.createdAt,
    },
    token: `token_${newUser.id}_${Date.now()}`,
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }

  const lowerName = username.trim().toLowerCase();
  const passHash = hashPassword(password.trim());

  const user = memoryUsers.find(
    u => u.username.toLowerCase() === lowerName && u.passwordHash === passHash
  );

  if (!user) {
    return res.status(400).json({ error: '用户名或密码不正确' });
  }

  res.json({
    success: true,
    user: {
      username: user.username,
      spaceCode: user.spaceCode,
      createdAt: user.createdAt,
    },
    token: `token_${user.id}_${Date.now()}`,
  });
});

// Get capsules by spaceCode
app.get('/api/space/:spaceCode', (req, res) => {
  const { spaceCode } = req.params;
  const filtered = memoryCapsules.filter(c => c.spaceCode.toLowerCase() === spaceCode.toLowerCase());
  res.json({ success: true, spaceCode, capsules: filtered });
});

// Add new capsule
app.post('/api/space/:spaceCode', (req, res) => {
  const { spaceCode } = req.params;
  const { content, color, tags, isFavorite } = req.body;

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const now = new Date();
  const newCapsule: Capsule = {
    id: `cap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    content: content.trim(),
    color: color || 'purple',
    createdAt: now.toISOString(),
    dateStr: now.toISOString().split('T')[0],
    spaceCode: spaceCode.toLowerCase(),
    isFavorite: !!isFavorite,
    tags: Array.isArray(tags) ? tags : [],
  };

  memoryCapsules.unshift(newCapsule);
  saveCapsulesToDisk();

  res.json({ success: true, capsule: newCapsule });
});

// Delete capsule
app.delete('/api/space/:spaceCode/:id', (req, res) => {
  const { spaceCode, id } = req.params;
  const initialLength = memoryCapsules.length;
  memoryCapsules = memoryCapsules.filter(
    c => !(c.id === id && c.spaceCode.toLowerCase() === spaceCode.toLowerCase())
  );

  if (memoryCapsules.length < initialLength) {
    saveCapsulesToDisk();
    res.json({ success: true, deletedId: id });
  } else {
    res.status(404).json({ error: 'Capsule not found' });
  }
});

// Toggle favorite state
app.patch('/api/space/:spaceCode/:id/favorite', (req, res) => {
  const { spaceCode, id } = req.params;
  const item = memoryCapsules.find(
    c => c.id === id && c.spaceCode.toLowerCase() === spaceCode.toLowerCase()
  );

  if (item) {
    item.isFavorite = !item.isFavorite;
    saveCapsulesToDisk();
    res.json({ success: true, capsule: item });
  } else {
    res.status(404).json({ error: 'Capsule not found' });
  }
});

// Batch sync / merge from client
app.post('/api/space/:spaceCode/sync', (req, res) => {
  const { spaceCode } = req.params;
  const { clientCapsules } = req.body;

  if (!Array.isArray(clientCapsules)) {
    return res.status(400).json({ error: 'Invalid client capsules' });
  }

  const targetCode = spaceCode.toLowerCase();
  
  // Existing ids in server memory for this space
  const serverSpaceItems = memoryCapsules.filter(c => c.spaceCode.toLowerCase() === targetCode);
  const serverIdMap = new Map(serverSpaceItems.map(c => [c.id, c]));

  for (const clientItem of clientCapsules) {
    if (!clientItem.id || !clientItem.content) continue;
    clientItem.spaceCode = targetCode;
    if (!serverIdMap.has(clientItem.id)) {
      memoryCapsules.push(clientItem);
    }
  }

  // Sort descending by createdAt
  memoryCapsules.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  saveCapsulesToDisk();

  const finalSpaceItems = memoryCapsules.filter(c => c.spaceCode.toLowerCase() === targetCode);
  res.json({ success: true, capsules: finalSpaceItems });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
