// Push Notifications + Badge API Service
// =========================================

const STORAGE_KEY = 'lagerpro_last_notification_date';
const PERMISSION_KEY = 'lagerpro_notifications_enabled';

/**
 * Fragt den Browser um Erlaubnis für Push-Benachrichtigungen.
 * @returns {Promise<'granted' | 'denied' | 'default'>}
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[Notifications] Browser unterstützt keine Notifications');
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    // Speichere aktiviert-Status, falls granted
    if (permission === 'granted') {
      localStorage.setItem(PERMISSION_KEY, 'true');
    }
    return permission;
  } catch (err) {
    console.error('[Notifications] Fehler beim Anfordern:', err);
    return 'denied';
  }
}

/**
 * Sendet eine Browser-Notification, falls erlaubt.
 * @param {string} title - Titel der Notification
 * @param {NotificationOptions} [options] - Optionen (body, icon, tag, …)
 * @returns {Notification | null}
 */
export function sendNotification(title, options = {}) {
  if (!('Notification' in window)) {
    console.warn('[Notifications] Nicht unterstützt');
    return null;
  }
  if (Notification.permission !== 'granted') {
    console.warn('[Notifications] Permission nicht erteilt');
    return null;
  }

  // Standard-Optionen
  const defaultOptions = {
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: 'lagerpro-critical',
    requireInteraction: false,
    ...options,
  };

  try {
    const notification = new Notification(title, defaultOptions);
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return notification;
  } catch (err) {
    console.error('[Notifications] Fehler beim Senden:', err);
    return null;
  }
}

/**
 * Setzt das App-Badge auf die angegebene Anzahl (Badging API).
 * @param {number} count - Anzahl für das Badge (0 = Badge entfernen)
 */
export async function updateBadge(count) {
  if (!('setAppBadge' in navigator)) {
    // Badging API nicht verfügbar → stilles Ignorieren
    return;
  }
  try {
    if (count > 0) {
      await navigator.setAppBadge(count);
    } else {
      await navigator.clearAppBadge();
    }
  } catch (err) {
    console.warn('[Badge] Fehler beim Setzen:', err);
  }
}

/**
 * Prüft, ob heute bereits eine Notification gesendet wurde.
 * @returns {boolean}
 */
export function wasNotifiedToday() {
  const lastDate = localStorage.getItem(STORAGE_KEY);
  if (!lastDate) return false;
  return lastDate === new Date().toDateString();
}

/**
 * Markiert, dass heute eine Notification gesendet wurde.
 */
export function markNotifiedToday() {
  localStorage.setItem(STORAGE_KEY, new Date().toDateString());
}

/**
 * Löscht das "heute benachrichtigt"-Flag (z.B. bei Reset).
 */
export function clearNotificationDate() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Liest den gespeicherten Aktivierungs-Status aus localStorage.
 * @returns {boolean}
 */
export function getNotificationsEnabled() {
  return localStorage.getItem(PERMISSION_KEY) === 'true';
}

/**
 * Setzt den Aktivierungs-Status in localStorage.
 * @param {boolean} enabled
 */
export function setNotificationsEnabled(enabled) {
  localStorage.setItem(PERMISSION_KEY, enabled ? 'true' : 'false');
}

/**
 * Aktueller Permission-Status als lesbarer String.
 * @returns {string}
 */
export function getPermissionStatus() {
  if (!('Notification' in window)) return 'Nicht unterstützt';
  const map = {
    granted: 'Erlaubt ✅',
    denied: 'Verweigert ❌',
    default: 'Noch nicht gefragt ⏳',
  };
  return map[Notification.permission] || Notification.permission;
}
