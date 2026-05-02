// ── Sprachbuchung-Komponente ───────────────────────────
// Web Speech API für Hands-free Materialentnahme
import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, X, Check, AlertCircle, Zap } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { UNIT_LABELS } from '../data/constants';
import { v4 as uuid } from 'uuid';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

/**
 * Parst gesprochenen Text und versucht Material + Menge zu erkennen.
 * Beispiele:
 *   "5 LS Schalter B16" → { quantity: 5, materialQuery: "LS Schalter B16" }
 *   "zehn NYM 3x1,5"   → { quantity: 10, materialQuery: "NYM 3x1,5" }
 *   "Kabel 5 Meter"     → { quantity: 5, materialQuery: "Kabel" }
 */
function parseVoiceInput(text) {
  const wordNumbers = {
    'eins': 1, 'ein': 1, 'eine': 1, 'zwei': 2, 'drei': 3, 'vier': 4,
    'fünf': 5, 'sechs': 6, 'sieben': 7, 'acht': 8, 'neun': 9, 'zehn': 10,
    'elf': 11, 'zwölf': 12, 'fünfzehn': 15, 'zwanzig': 20, 'dreißig': 30,
    'vierzig': 40, 'fünfzig': 50, 'hundert': 100,
  };

  const cleaned = text.trim().toLowerCase();
  let quantity = null;
  let materialQuery = cleaned;

  // Zahl am Anfang: "5 LS Schalter"
  const numberFirst = cleaned.match(/^(\d+)\s+(.+)/);
  if (numberFirst) {
    quantity = parseInt(numberFirst[1]);
    materialQuery = numberFirst[2];
  }

  // Zahlwort am Anfang: "zehn Kabelkanal"
  if (!quantity) {
    for (const [word, num] of Object.entries(wordNumbers)) {
      if (cleaned.startsWith(word + ' ')) {
        quantity = num;
        materialQuery = cleaned.slice(word.length).trim();
        break;
      }
    }
  }

  // Zahl am Ende: "Kabelkanal 10"
  if (!quantity) {
    const numberLast = cleaned.match(/(.+)\s+(\d+)$/);
    if (numberLast) {
      quantity = parseInt(numberLast[2]);
      materialQuery = numberLast[1];
    }
  }

  // "Stück/Meter" am Ende entfernen
  materialQuery = materialQuery.replace(/\s+(stück|meter|rollen?|packung|set)$/i, '').trim();

  return { quantity: quantity || 1, materialQuery };
}

/**
 * Findet das beste Material-Match für einen Query-String.
 * Fuzzy-Matching: Alle Wörter im Query müssen irgendwo im Material vorkommen.
 */
function findBestMatch(query, materials) {
  const q = query.toLowerCase();
  const words = q.split(/\s+/).filter(w => w.length > 1);

  // Exakter Name-Match
  const exactName = materials.find(m =>
    m.name.toLowerCase() === q
  );
  if (exactName) return { match: exactName, confidence: 1.0 };

  // Exakter Artikelnr./Herstellernr. Match
  const exactId = materials.find(m =>
    m.article_number?.toLowerCase() === q ||
    m.manufacturer_number?.toLowerCase() === q
  );
  if (exactId) return { match: exactId, confidence: 1.0 };

  // Fuzzy: Alle Wörter müssen im Namen oder Beschreibung vorkommen
  const scored = materials
    .filter(m => m.active)
    .map(m => {
      const haystack = [
        m.name, m.article_number, m.manufacturer_number, m.description
      ].filter(Boolean).join(' ').toLowerCase();

      const matchedWords = words.filter(w => haystack.includes(w));
      const score = matchedWords.length / words.length;
      return { material: m, score };
    })
    .filter(s => s.score > 0.4)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return { match: scored[0].material, confidence: scored[0].score };
  }

  return { match: null, confidence: 0 };
}

export default function VoiceBooking({ onClose, onComplete }) {
  const { materials, addMovement, editMaterial, getProjectName } = useStore();
  const [phase, setPhase] = useState('idle'); // idle, listening, parsed, confirming, done, error
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const isSupported = !!SpeechRecognition;

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Spracherkennung wird von diesem Browser nicht unterstützt. Bitte Chrome oder Edge verwenden.');
      setPhase('error');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setPhase('listening');
      setTranscript('');
      setInterimTranscript('');
      setError(null);
    };

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) setTranscript(final);
      setInterimTranscript(interim);
    };

    recognition.onend = () => {
      // Wurde was erkannt?
      setPhase(prev => {
        if (prev === 'listening') return 'parsed';
        return prev;
      });
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        setError('Keine Sprache erkannt. Bitte nochmal versuchen.');
      } else if (event.error === 'not-allowed') {
        setError('Mikrofon-Zugriff verweigert. Bitte in den Browser-Einstellungen erlauben.');
      } else {
        setError(`Fehler: ${event.error}`);
      }
      setPhase('error');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Wenn final transcript da ist → parsen
  useEffect(() => {
    if (phase === 'parsed' && transcript) {
      const parsed = parseVoiceInput(transcript);
      const matchResult = findBestMatch(parsed.materialQuery, materials);
      setParsedResult(parsed);
      setMatchResult(matchResult);
      setPhase('confirming');
    }
  }, [phase, transcript, materials]);

  async function handleConfirm() {
    if (!matchResult?.match) return;

    try {
      const material = matchResult.match;
      const quantity = parsedResult.quantity;

      // Buchung erstellen
      const movement = {
        id: uuid(),
        material_id: material.id,
        type: 'entnahme',
        quantity,
        note: `🎤 Sprachbuchung: "${transcript}"`,
        created_at: new Date().toISOString(),
      };

      await addMovement(movement);

      // Bestand aktualisieren
      await editMaterial(material.id, {
        current_stock: Math.max(0, material.current_stock - quantity),
      });

      setPhase('done');
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

      setTimeout(() => {
        if (onComplete) onComplete(movement);
      }, 1500);
    } catch (err) {
      setError('Buchung fehlgeschlagen: ' + err.message);
      setPhase('error');
    }
  }

  function handleRetry() {
    setPhase('idle');
    setTranscript('');
    setInterimTranscript('');
    setParsedResult(null);
    setMatchResult(null);
    setError(null);
  }

  return (
    <div className="scanner-overlay" onClick={(e) => e.target.className === 'scanner-overlay' && onClose()}>
      <div className="scanner-container" style={{ maxWidth: 420, margin: '60px auto', borderRadius: 'var(--radius-2xl)' }}>
        {/* Header */}
        <div className="scanner-header" style={{ background: 'var(--gradient-primary)' }}>
          <div className="scanner-header-title">
            <Mic size={20} />
            <span>Sprachbuchung</span>
          </div>
          <button className="scanner-close" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div style={{ padding: 'var(--space-xl)' }}>
          {/* Phase: Idle */}
          {phase === 'idle' && (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0' }}>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>
                Sage z.B. <strong>„5 LS Schalter B16"</strong> oder <strong>„zehn WAGO Klemmen"</strong>
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={startListening}
                style={{
                  width: 80, height: 80, borderRadius: '50%', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto', fontSize: '28px',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                }}
              >
                <Mic size={32} />
              </button>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-lg)' }}>
                Tippe zum Starten
              </div>
            </div>
          )}

          {/* Phase: Listening */}
          {phase === 'listening' && (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
              <button
                className="btn btn-lg"
                onClick={stopListening}
                style={{
                  width: 80, height: 80, borderRadius: '50%', padding: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto', background: 'var(--color-danger)',
                  color: 'white', border: 'none',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)',
                }}
              >
                <MicOff size={32} />
              </button>
              <div style={{
                fontSize: 'var(--font-size-lg)', fontWeight: 600, marginTop: 'var(--space-xl)',
                color: 'var(--color-text)',
              }}>
                {interimTranscript || 'Höre zu...'}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: 'var(--space-sm)' }}>
                Tippe zum Stoppen
              </div>
              <style>{`
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.08); opacity: 0.9; }
                }
              `}</style>
            </div>
          )}

          {/* Phase: Confirming */}
          {phase === 'confirming' && matchResult && (
            <div>
              {/* Erkannter Text */}
              <div style={{
                background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-md) var(--space-lg)', marginBottom: 'var(--space-lg)',
              }}>
                <div className="text-xs text-tertiary">Erkannt:</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-md)' }}>„{transcript}"</div>
              </div>

              {matchResult.match ? (
                <>
                  {/* Gefundenes Material */}
                  <div style={{
                    border: '2px solid var(--color-primary)', borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)',
                  }}>
                    <div className="text-xs text-tertiary mb-sm">
                      Material {matchResult.confidence >= 0.8 ? '✓' : '(~' + Math.round(matchResult.confidence * 100) + '% sicher)'}
                    </div>
                    <div className="font-bold">{matchResult.match.name}</div>
                    <div style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)' }}>
                      {matchResult.match.manufacturer_number?.trim() || matchResult.match.article_number}
                    </div>
                    {matchResult.match.storage_location && (
                      <div className="text-xs text-tertiary mt-sm">📍 {matchResult.match.storage_location}</div>
                    )}
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)',
                      borderTop: '1px solid var(--color-border)',
                    }}>
                      <span className="text-sm">
                        Entnahme: <strong style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-primary)' }}>
                          {parsedResult.quantity} {UNIT_LABELS[matchResult.match.unit]}
                        </strong>
                      </span>
                      <span className="text-xs text-tertiary">
                        Bestand: {matchResult.match.current_stock}
                      </span>
                    </div>
                  </div>

                  {parsedResult.quantity > matchResult.match.current_stock && (
                    <div style={{
                      background: 'var(--color-warning-bg)', color: 'var(--color-warning)',
                      padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-sm)', fontWeight: 500, marginBottom: 'var(--space-md)',
                    }}>
                      ⚠️ Menge übersteigt Bestand!
                    </div>
                  )}

                  {/* Aktions-Buttons */}
                  <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <button className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={handleRetry}>
                      Nochmal
                    </button>
                    <button className="btn btn-primary btn-lg" style={{ flex: 2 }} onClick={handleConfirm}>
                      <Check size={20} /> Buchen
                    </button>
                  </div>
                </>
              ) : (
                /* Kein Match */
                <div style={{ textAlign: 'center' }}>
                  <AlertCircle size={48} style={{ color: 'var(--color-warning)', marginBottom: 'var(--space-md)' }} />
                  <div className="font-semibold" style={{ marginBottom: 'var(--space-sm)' }}>Kein Material gefunden</div>
                  <div className="text-sm text-secondary mb-lg">
                    Für „{parsedResult?.materialQuery}" wurde kein passendes Material erkannt.
                  </div>
                  <button className="btn btn-primary btn-lg btn-full" onClick={handleRetry}>
                    <Mic size={18} /> Nochmal versuchen
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Phase: Done */}
          {phase === 'done' && (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'var(--color-success-bg)', color: 'var(--color-success)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-lg)',
              }}>
                <Check size={32} />
              </div>
              <div className="font-bold" style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>
                Gebucht! ✓
              </div>
              <div className="text-sm text-secondary">
                {parsedResult?.quantity}× {matchResult?.match?.name}
              </div>
            </div>
          )}

          {/* Phase: Error */}
          {phase === 'error' && (
            <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
              <AlertCircle size={48} style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-md)' }} />
              <div className="text-sm" style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-lg)' }}>
                {error}
              </div>
              <button className="btn btn-primary btn-lg btn-full" onClick={handleRetry}>
                Nochmal versuchen
              </button>
            </div>
          )}

          {/* Browser-Support Info */}
          {!isSupported && phase === 'idle' && (
            <div style={{
              background: 'var(--color-warning-bg)', color: 'var(--color-warning)',
              padding: 'var(--space-md) var(--space-lg)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-lg)',
            }}>
              ⚠️ Dein Browser unterstützt keine Spracherkennung. Bitte Chrome oder Edge verwenden.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
