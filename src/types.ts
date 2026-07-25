export type CapsuleColor = 'purple' | 'blue' | 'green' | 'amber';

export interface Capsule {
  id: string;
  content: string;
  color: CapsuleColor;
  createdAt: string; // ISO string
  updatedAt?: number; // Timestamp in ms
  dateStr: string;   // YYYY-MM-DD
  spaceCode: string;
  isFavorite?: boolean;
  tags?: string[];
}

export interface ColorTheme {
  id: CapsuleColor;
  name: string;
  subName: string;
  accentHex: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
  glowClass: string;
  bgGradient: string;
  dotBg: string;
}

export type SortOrder = 'newest' | 'oldest' | 'random';

export interface AuthUser {
  username: string;
  spaceCode: string;
  token?: string;
  createdAt?: string;
}
