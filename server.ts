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
  updatedAt?: number;
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
const memorySpaceTimestamps = new Map<string, number>();
const memoryDeletedCapsules: Array<{ id: string; spaceCode: string; deletedAt: number }> = [];

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
  const nowTs = now.getTime();
  const targetCode = spaceCode.toLowerCase();

  const newCapsule: Capsule = {
    id: `cap_${nowTs}_${Math.random().toString(36).substring(2, 7)}`,
    content: content.trim(),
    color: color || 'purple',
    createdAt: now.toISOString(),
    updatedAt: nowTs,
    dateStr: now.toISOString().split('T')[0],
    spaceCode: targetCode,
    isFavorite: !!isFavorite,
    tags: Array.isArray(tags) ? tags : [],
  };

  memoryCapsules.unshift(newCapsule);
  memorySpaceTimestamps.set(targetCode, nowTs);
  saveCapsulesToDisk();

  res.json({ success: true, capsule: newCapsule, serverTimestamp: nowTs });
});

// Delete capsule
app.delete('/api/space/:spaceCode/:id', (req, res) => {
  const { spaceCode, id } = req.params;
  const targetCode = spaceCode.toLowerCase();
  const initialLength = memoryCapsules.length;
  const nowTs = Date.now();

  memoryCapsules = memoryCapsules.filter(
    c => !(c.id === id && c.spaceCode.toLowerCase() === targetCode)
  );

  if (memoryCapsules.length < initialLength) {
    if (!memoryDeletedCapsules.some(d => d.id === id && d.spaceCode === targetCode)) {
      memoryDeletedCapsules.push({ id, spaceCode: targetCode, deletedAt: nowTs });
    }
    memorySpaceTimestamps.set(targetCode, nowTs);
    saveCapsulesToDisk();
    res.json({ success: true, deletedId: id, serverTimestamp: nowTs });
  } else {
    res.status(404).json({ error: 'Capsule not found' });
  }
});

// Toggle favorite state
app.patch('/api/space/:spaceCode/:id/favorite', (req, res) => {
  const { spaceCode, id } = req.params;
  const targetCode = spaceCode.toLowerCase();
  const item = memoryCapsules.find(
    c => c.id === id && c.spaceCode.toLowerCase() === targetCode
  );

  if (item) {
    const nowTs = Date.now();
    item.isFavorite = !item.isFavorite;
    item.updatedAt = nowTs;
    memorySpaceTimestamps.set(targetCode, nowTs);
    saveCapsulesToDisk();
    res.json({ success: true, capsule: item, serverTimestamp: nowTs });
  } else {
    res.status(404).json({ error: 'Capsule not found' });
  }
});

// Differential Batch Sync / Merge
app.post('/api/space/:spaceCode/sync', (req, res) => {
  const { spaceCode } = req.params;
  const { lastSyncTimestamp = 0, clientCapsules = [], deletedIds = [] } = req.body;
  const targetCode = spaceCode.toLowerCase();
  const nowTs = Date.now();

  let hasChangesOnServer = false;

  // 1. Process client deletedIds
  if (Array.isArray(deletedIds) && deletedIds.length > 0) {
    for (const delId of deletedIds) {
      const initLen = memoryCapsules.length;
      memoryCapsules = memoryCapsules.filter(
        c => !(c.id === delId && c.spaceCode.toLowerCase() === targetCode)
      );
      if (memoryCapsules.length < initLen) {
        hasChangesOnServer = true;
      }
      if (!memoryDeletedCapsules.some(d => d.id === delId && d.spaceCode === targetCode)) {
        memoryDeletedCapsules.push({ id: delId, spaceCode: targetCode, deletedAt: nowTs });
      }
    }
  }

  // 2. Process client capsules
  const serverSpaceItems = memoryCapsules.filter(c => c.spaceCode.toLowerCase() === targetCode);
  const serverIdMap = new Map(serverSpaceItems.map(c => [c.id, c]));

  if (Array.isArray(clientCapsules)) {
    for (const clientItem of clientCapsules) {
      if (!clientItem.id || !clientItem.content) continue;
      clientItem.spaceCode = targetCode;
      const clientUpdatedAt = clientItem.updatedAt || new Date(clientItem.createdAt).getTime() || nowTs;

      const existingServerItem = serverIdMap.get(clientItem.id);
      if (!existingServerItem) {
        // Only insert if it hasn't been deleted on server
        const isDeletedOnServer = memoryDeletedCapsules.some(
          d => d.id === clientItem.id && d.spaceCode === targetCode
        );
        if (!isDeletedOnServer) {
          const newCap: Capsule = {
            ...clientItem,
            updatedAt: clientUpdatedAt,
          };
          memoryCapsules.push(newCap);
          serverIdMap.set(clientItem.id, newCap);
          hasChangesOnServer = true;
        }
      } else {
        const serverUpdatedAt = existingServerItem.updatedAt || new Date(existingServerItem.createdAt).getTime() || 0;
        if (clientUpdatedAt > serverUpdatedAt) {
          Object.assign(existingServerItem, clientItem, { updatedAt: clientUpdatedAt });
          hasChangesOnServer = true;
        }
      }
    }
  }

  if (hasChangesOnServer) {
    memorySpaceTimestamps.set(targetCode, nowTs);
    memoryCapsules.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    saveCapsulesToDisk();
  }

  const spaceLastUpdated = memorySpaceTimestamps.get(targetCode) || 0;

  // 3. Fast Differential Path: If client timestamp is current and no changes made
  if (
    lastSyncTimestamp > 0 &&
    spaceLastUpdated > 0 &&
    spaceLastUpdated <= lastSyncTimestamp &&
    !hasChangesOnServer
  ) {
    return res.json({
      success: true,
      hasChanges: false,
      serverTimestamp: spaceLastUpdated || nowTs,
    });
  }

  // Return full/updated space items and tombstones
  const finalSpaceItems = memoryCapsules.filter(c => c.spaceCode.toLowerCase() === targetCode);
  const serverDeletedIds = memoryDeletedCapsules
    .filter(d => d.spaceCode === targetCode && (lastSyncTimestamp === 0 || d.deletedAt > lastSyncTimestamp))
    .map(d => d.id);

  const responseTimestamp = memorySpaceTimestamps.get(targetCode) || nowTs;

  res.json({
    success: true,
    hasChanges: true,
    capsules: finalSpaceItems,
    deletedIds: serverDeletedIds,
    serverTimestamp: responseTimestamp,
  });
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
