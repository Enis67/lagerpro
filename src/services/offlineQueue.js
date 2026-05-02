// Offline Queue Service – puffert Bewegungen in localStorage
// und synchronisiert sie automatisch wenn die Verbindung wiederhergestellt ist

import { createMovement as createCloudMovement } from './supabaseDataService.js';

const STORAGE_KEY = 'lagerpro_offline_queue';

/**
 * Fügt eine Aktion zur Offline-Queue hinzu.
 * @param {object} action – Die Bewegung (movement) die gepuffert werden soll
 */
export function queueAction(action) {
  const queue = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  queue.push({
    ...action,
    _queuedAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

/**
 * Gibt alle gepufferten Aktionen zurück.
 */
export function getQueue() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

/**
 * Anzahl der gepufferten Aktionen.
 */
export function getQueueLength() {
  return getQueue().length;
}

/**
 * Leert die Queue komplett.
 */
export function clearQueue() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Verarbeitet alle gepufferten Aktionen und sendet sie an die Cloud.
 * Bei Fehlern bleiben die Aktionen in der Queue.
 * @returns {{processed: number, failed: number}} Ergebnis der Verarbeitung
 */
export async function processQueue() {
  const queue = getQueue();
  if (queue.length === 0) {
    return { processed: 0, failed: 0 };
  }

  console.log(`[OfflineQueue] Verarbeite ${queue.length} gepufferte Aktionen...`);

  const remaining = [];
  let processed = 0;
  let failed = 0;

  for (const action of queue) {
    try {
      await createCloudMovement(action);
      processed++;
    } catch (err) {
      console.error('[OfflineQueue] Fehler beim Senden:', err);
      remaining.push(action);
      failed++;
    }
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

  if (processed > 0) {
    console.log(`[OfflineQueue] ${processed} Aktionen synchronisiert ✓`);
  }
  if (failed > 0) {
    console.warn(`[OfflineQueue] ${failed} Aktionen fehlgeschlagen – bleiben in Queue`);
  }

  return { processed, failed };
}
