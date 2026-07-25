import { Capsule, CapsuleColor, AuthUser } from '../types';

const SPACE_CODE_KEY = 'inspiration_capsule_space_code';
const RECENT_SPACES_KEY = 'inspiration_capsule_recent_spaces';
const AUTH_USER_KEY = 'inspiration_capsule_auth_user';
const DRAFT_PREFIX = 'inspiration_capsule_draft_';
const LOCAL_CAPSULES_PREFIX = 'inspiration_capsule_data_';

// User Auth Persistence
export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return null;
}

export function saveStoredUser(user: AuthUser) {
  try {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  } catch {
    // Ignore
  }
}

export function clearStoredUser() {
  try {
    localStorage.removeItem(AUTH_USER_KEY);
  } catch {
    // Ignore
  }
}

const LOCAL_USERS_KEY = 'inspiration_capsule_local_users';

// Helper for local users offline database
function getLocalUsersList(): AuthUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return [];
}

function saveLocalUsersList(users: AuthUser[]) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {
    // Ignore
  }
}

export async function registerUser(
  username: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const normalizedUsername = username.trim();
  const lowerName = normalizedUsername.toLowerCase();
  const spaceCode = `user_${lowerName}`;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: normalizedUsername, password }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      const authUser: AuthUser = {
        username: data.user.username,
        spaceCode: data.user.spaceCode,
        token: data.token,
        createdAt: data.user.createdAt,
      };
      saveStoredUser(authUser);
      setStoredSpaceCode(authUser.spaceCode);

      // Backup into local users list as well
      const localUsers = getLocalUsersList();
      if (!localUsers.some(u => u.username.toLowerCase() === lowerName)) {
        localUsers.push(authUser);
        saveLocalUsersList(localUsers);
      }

      return { success: true, user: authUser };
    }
    if (data.error) {
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.warn('Network issue during register, falling back to local user store:', err);
  }

  // Network offline fallback logic: Save account locally
  const localUsers = getLocalUsersList();
  if (localUsers.some(u => u.username.toLowerCase() === lowerName)) {
    return { success: false, error: '该用户名已被注册，请直接登录' };
  }

  const fallbackUser: AuthUser = {
    username: normalizedUsername,
    spaceCode,
    token: `local_token_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  localUsers.push(fallbackUser);
  saveLocalUsersList(localUsers);
  saveStoredUser(fallbackUser);
  setStoredSpaceCode(fallbackUser.spaceCode);

  return { success: true, user: fallbackUser };
}

export async function loginUser(
  username: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const normalizedUsername = username.trim();
  const lowerName = normalizedUsername.toLowerCase();
  const spaceCode = `user_${lowerName}`;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: normalizedUsername, password }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      const authUser: AuthUser = {
        username: data.user.username,
        spaceCode: data.user.spaceCode,
        token: data.token,
        createdAt: data.user.createdAt,
      };
      saveStoredUser(authUser);
      setStoredSpaceCode(authUser.spaceCode);
      return { success: true, user: authUser };
    }
    if (data.error) {
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.warn('Network issue during login, falling back to local user store:', err);
  }

  // Network offline fallback logic
  const localUsers = getLocalUsersList();
  const found = localUsers.find(u => u.username.toLowerCase() === lowerName);
  if (found) {
    saveStoredUser(found);
    setStoredSpaceCode(found.spaceCode);
    return { success: true, user: found };
  }

  // Auto-register offline if new account
  const offlineUser: AuthUser = {
    username: normalizedUsername,
    spaceCode,
    token: `offline_token_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  localUsers.push(offlineUser);
  saveLocalUsersList(localUsers);
  saveStoredUser(offlineUser);
  setStoredSpaceCode(offlineUser.spaceCode);

  return { success: true, user: offlineUser };
}

// Generate a friendly initial Space Code if none exists
export function generateRandomSpaceCode(): string {
  const prefixes = ['capsule', 'spark', 'idea', 'galaxy', 'nexus', 'prism'];
  const randPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `${randPrefix}-${randNum}`;
}

export function getStoredSpaceCode(): string {
  try {
    const code = localStorage.getItem(SPACE_CODE_KEY);
    if (code && code.trim()) {
      return code.trim().toLowerCase();
    }
    const newCode = generateRandomSpaceCode();
    localStorage.setItem(SPACE_CODE_KEY, newCode);
    addRecentSpaceCode(newCode);
    return newCode;
  } catch {
    return 'default';
  }
}

export function setStoredSpaceCode(code: string): string {
  const normalized = code.trim().toLowerCase() || 'default';
  try {
    localStorage.setItem(SPACE_CODE_KEY, normalized);
    addRecentSpaceCode(normalized);
  } catch {
    // Ignore storage errors
  }
  return normalized;
}

export function getRecentSpaceCodes(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SPACES_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch {
    // Ignore
  }
  return [];
}

export function addRecentSpaceCode(code: string) {
  try {
    const current = getRecentSpaceCodes().filter(c => c !== code);
    current.unshift(code);
    const trimmed = current.slice(0, 5);
    localStorage.setItem(RECENT_SPACES_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore
  }
}

// Draft handling
export function getDraft(spaceCode: string): string {
  try {
    return localStorage.getItem(`${DRAFT_PREFIX}${spaceCode}`) || '';
  } catch {
    return '';
  }
}

export function saveDraft(spaceCode: string, text: string) {
  try {
    if (!text) {
      localStorage.removeItem(`${DRAFT_PREFIX}${spaceCode}`);
    } else {
      localStorage.setItem(`${DRAFT_PREFIX}${spaceCode}`, text);
    }
  } catch {
    // Ignore
  }
}

// LocalStorage mirror helpers
function getLocalBackup(spaceCode: string): Capsule[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_CAPSULES_PREFIX}${spaceCode}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore
  }
  return [];
}

function saveLocalBackup(spaceCode: string, capsules: Capsule[]) {
  try {
    localStorage.setItem(`${LOCAL_CAPSULES_PREFIX}${spaceCode}`, JSON.stringify(capsules));
  } catch {
    // Ignore
  }
}

// API Service Functions
export async function fetchCapsules(spaceCode: string): Promise<Capsule[]> {
  try {
    const res = await fetch(`/api/space/${encodeURIComponent(spaceCode)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.capsules)) {
        saveLocalBackup(spaceCode, data.capsules);
        return data.capsules;
      }
    }
  } catch (err) {
    console.warn('Network offline or endpoint unreachable, using local backup', err);
  }
  return getLocalBackup(spaceCode);
}

export async function addCapsule(
  spaceCode: string,
  content: string,
  color: CapsuleColor,
  tags: string[] = []
): Promise<Capsule> {
  const now = new Date();
  const fallbackCapsule: Capsule = {
    id: `cap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    content: content.trim(),
    color,
    createdAt: now.toISOString(),
    dateStr: now.toISOString().split('T')[0],
    spaceCode,
    isFavorite: false,
    tags,
  };

  try {
    const res = await fetch(`/api/space/${encodeURIComponent(spaceCode)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, color, tags }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.capsule) {
        return data.capsule;
      }
    }
  } catch (err) {
    console.warn('Network error when adding capsule, saving locally', err);
  }

  // Fallback local addition
  const localItems = getLocalBackup(spaceCode);
  localItems.unshift(fallbackCapsule);
  saveLocalBackup(spaceCode, localItems);
  return fallbackCapsule;
}

export async function deleteCapsule(spaceCode: string, id: string): Promise<boolean> {
  let success = false;
  try {
    const res = await fetch(`/api/space/${encodeURIComponent(spaceCode)}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      success = true;
    }
  } catch (err) {
    console.warn('Network error on delete', err);
  }

  // Update local backup
  const localItems = getLocalBackup(spaceCode).filter(c => c.id !== id);
  saveLocalBackup(spaceCode, localItems);
  return true;
}

export async function toggleFavorite(spaceCode: string, id: string): Promise<Capsule | null> {
  try {
    const res = await fetch(`/api/space/${encodeURIComponent(spaceCode)}/${encodeURIComponent(id)}/favorite`, {
      method: 'PATCH',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.capsule) {
        return data.capsule;
      }
    }
  } catch (err) {
    console.warn('Network error on toggle favorite', err);
  }

  const localItems = getLocalBackup(spaceCode);
  const found = localItems.find(c => c.id === id);
  if (found) {
    found.isFavorite = !found.isFavorite;
    saveLocalBackup(spaceCode, localItems);
    return found;
  }
  return null;
}
