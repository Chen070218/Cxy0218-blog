/**
 * A small ID helper for everything that stores records in localStorage.
 *
 * `crypto.randomUUID()` is only available in a secure context (HTTPS or
 * localhost). The local package is often opened over plain HTTP on the LAN
 * (`http://192.168.x.x:4322`) or through a phone hotspot, where it is missing
 * and used to throw "crypto.randomUUID is not a function".
 *
 * `crypto.getRandomValues` works in insecure contexts, so it is used to build
 * a UUID-v4-shaped string; a timestamp fallback covers very old browsers.
 */
export function makeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
