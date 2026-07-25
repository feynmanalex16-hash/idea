/**
 * Calculates human-readable time interval between past date and now.
 * Examples: "今天刚记下", "1 天前的闪念", "32 天前的闪念", "12 小时前"
 */
export function getTimeIntervalLabel(createdAt: string): { days: number; label: string } {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  
  if (isNaN(createdDate.getTime()) || diffMs < 0) {
    return { days: 0, label: '今天刚记下' };
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 5) {
    return { days: 0, label: '刚刚记下' };
  } else if (diffMinutes < 60) {
    return { days: 0, label: `${diffMinutes} 分钟前的闪念` };
  } else if (diffHours < 24 && now.getDate() === createdDate.getDate()) {
    return { days: 0, label: `今天 ${diffHours} 小时前的闪念` };
  } else if (diffDays === 0) {
    return { days: 0, label: '今天刚记下' };
  } else if (diffDays === 1) {
    return { days: 1, label: '昨天记下的闪念' };
  } else if (diffDays < 30) {
    return { days: diffDays, label: `${diffDays} 天前的闪念` };
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return { days: diffDays, label: `约 ${months} 个月前的闪念 (${diffDays} 天)` };
  } else {
    const years = (diffDays / 365).toFixed(1);
    return { days: diffDays, label: `约 ${years} 年前的闪念 (${diffDays} 天)` };
  }
}

/**
 * Formats ISO date to YYYY-MM-DD
 */
export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString.split('T')[0] || isoString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return isoString;
  }
}

/**
 * Formats ISO date to detailed string YYYY-MM-DD HH:mm
 */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  } catch {
    return isoString;
  }
}
