import { AUTH_CONFIG } from '@/config/auth.config';

/**
 * Build the ActionCable WebSocket URL for the current environment.
 * Uses NEXT_PUBLIC_CABLE_URL when set, otherwise derives from the API base URL.
 */
export function getActionCableUrl(token: string): string {
  const explicit = process.env.NEXT_PUBLIC_CABLE_URL?.replace(/\/$/, '');
  if (explicit) {
    const separator = explicit.includes('?') ? '&' : '?';
    return `${explicit}${separator}token=${encodeURIComponent(token)}`;
  }

  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || AUTH_CONFIG.API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const protocol = apiBase.startsWith('https') ? 'wss' : 'ws';
  const cableBase = apiBase.replace(/^https?/, protocol);
  return `${cableBase}/cable?token=${encodeURIComponent(token)}`;
}
