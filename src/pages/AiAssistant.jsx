import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Mic, MicOff, X, Bot, User, Volume2, VolumeX } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useAuth } from '../hooks/useAuth';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// ── Intent-Erkennung (lokal, keine externe API) ─────────

const INTENTS = [
  {
    keywords: ['bestand', 'habe ich', 'wie viel', 'wie viele', 'anzahl', 'menge', 'verfügbar', 'da', 'lager'],
    type: 'stock_query',
  },
  {
    keywords: ['kritisch', 'nachbestellen', 'mindest', 'unter', 'fehlt', 'warnung', 'rot', 'problem'],
    type: 'critical_query',
  },
  {
    keywords: ['letzte', 'zuletzt', 'buchung', 'bewegung', 'was wurde', 'letzter', 'history'],
    type: 'last_movements',
  },
  {
    keywords: ['inventur', 'zählen', 'inventarisieren', 'zählung'],
    type: 'nav_inventur',
  },
  {
    keywords: ['buchen', 'entnehmen', 'eingang', 'rückgabe', 'korrektur', 'reservierung'],
    type: 'nav_booking',
  },
  {
    keywords: ['material', 'artikel', 'liste', 'übersicht', 'was gibt es'],
    type: 'nav_materials',
  },
  {
    keywords: ['statistik', 'wert', 'kosten', 'teuer', 'billig', 'umsatz'],
    type: 'nav_statistics',
  },
  {
    keywords: ['hallo', 'hi', 'hey', 'guten tag', 'moin', 'servus'],
    type: 'greeting',
  },
  {
    keywords: ['danke', 'tschüss', 'bye', 'ciao', 'auf wiedersehen'],
    type: 'farewell',
  },
  {
    keywords: ['hilfe', 'help', 'was kannst du', 'unterstützung', 'befehle'],
    type: 'help',
  },
];

function detectIntent(text) {
  const lower = text.toLowerCase();
  for (const intent of INTENTS) {
    if (intent.keywords.some(k => lower.includes(k))) {
      return intent.type;
    }
  }
  return 'unknown';
}

function extractMaterialQuery(text) {
  // Versucht Materialnamen aus dem Text zu extrahieren
  const lower = text.toLowerCase();
  const stopwords = ['wie', 'viel', 'habe', 'ich', 'von', 'der', 'die', 'das', 'den', 'im', 'in', 'lager', 'bestand', 'noch', 'ist', 'sind', 'was', 'gibt', 'es'];
  const words = lower.split(/\s+/).filter(w => w.length > 2 && !stopwords.includes(w));
  return words;
}

// ── Antwort-Generator ───────────────────────────────────

function generateResponse(intent, text, store, auth) {
  const { materials, movements, projects, getCriticalCount, getReorderList, getTodaysWithdrawals, getCategoryName, getSupplierName } = store;

  switch (intent) {
    case 'greeting':
      return `Hallo ${auth.userName}! Ich bin dein Lager-Assistent. Frag mich nach Beständen, kritischen Artikeln oder sage mir was du buchen möchtest.`;

    case 'farewell':
      return `Gerne! Bis zum nächsten Mal, ${auth.userName}.`;

    case 'help':
      return `Ich kann dir helfen mit:\n• "Wie viel Kabel habe ich?" – Bestandsabfrage\n• "Was ist kritisch?" – Nachbestellliste\n• "Letzte Buchung?" – Bewegungen\n• "Inventur starten" – Zur Inventur-Seite\n• "Material buchen" – Schnellbuchung\nDu kannst auch sprechen statt tippen.`;

    case 'stock_query': {
      const queries = extractMaterialQuery(text);
      if (queries.length === 0) {
        return `Wir haben aktuell ${materials.filter(m => m.active).length} aktive Materialien im Lager. Sage mir welches Material du suchst.`;
      }
      // Fuzzy-Match
      const matches = materials.filter(m => {
        const searchable = `${m.name} ${m.article_number || ''} ${m.manufacturer_number || ''} ${getCategoryName(m.category_id)}`.toLowerCase();
        return queries.some(q => searchable.includes(q));
      });
      if (matches.length === 0) {
        return `Ich habe kein Material gefunden das zu "${queries.join(' ')}" passt. Wir haben ${materials.filter(m => m.active).length} Artikel im System.`;
      }
      if (matches.length === 1) {
        const m = matches[0];
        const avail = Math.max(0, m.current_stock - m.reserved_stock);
        return `${m.name}: ${avail} ${getUnitLabel(m.unit)} verfügbar (Lager: ${m.current_stock}, reserviert: ${m.reserved_stock}). Lagerort: ${m.storage_location || 'nicht angegeben'}.`;
      }
      return `Ich habe ${matches.length} Treffer gefunden:\n` + matches.slice(0, 5).map(m => {
        const avail = Math.max(0, m.current_stock - m.reserved_stock);
        return `• ${m.name}: ${avail} verfügbar`;
      }).join('\n');
    }

    case 'critical_query': {
      const critical = getReorderList();
      if (critical.length === 0) {
        return `Gute Nachrichten! Keine kritischen Artikel – alles über Mindestbestand.`;
      }
      return `⚠️ ${critical.length} Artikel unter Mindestbestand:\n` + critical.slice(0, 5).map(m => {
        const deficit = m.min_stock - m.current_stock;
        return `• ${m.name}: fehlen ${deficit} ${getUnitLabel(m.unit)} (aktuell: ${m.current_stock})`;
      }).join('\n') + (critical.length > 5 ? `\n... und ${critical.length - 5} weitere.` : '');
    }

    case 'last_movements': {
      const recent = movements.slice(0, 5);
      if (recent.length === 0) return 'Noch keine Buchungen vorhanden.';
      return `Letzte 5 Buchungen:\n` + recent.map(m => {
        const mat = materials.find(x => x.id === m.material_id);
        const typeLabels = { eingang: '➕ Eingang', entnahme: '➖ Entnahme', rueckgabe: '↩️ Rückgabe', korrektur: '✏️ Korrektur', reservierung: '🔖 Reservierung', reservierung_aufloesen: '🔓 Res.-Auflösung' };
        return `• ${typeLabels[m.type] || m.type}: ${m.quantity}× ${mat?.name || 'Unbekannt'}`;
      }).join('\n');
    }

    case 'nav_inventur':
      return `Ich leite dich zur Inventur-Seite weiter. Du kannst dort mehrere Artikel per Barcode scannen.`;

    case 'nav_booking':
      return `Zur Buchungs-Seite. Wähle die Art (Entnahme, Eingang, etc.) und scanne oder suche das Material.`;

    case 'nav_materials':
      return `Zur Material-Übersicht. ${materials.filter(m => m.active).length} aktive Artikel verfügbar.`;

    case 'nav_statistics':
      return `Zur Statistik-Seite. Lagerwert, Trends und Top-Verbraucher.`;

    default:
      return `Das habe ich nicht ganz verstanden. Versuche:\n• "Wie viel habe ich von [Material]?"\n• "Was ist kritisch?"\n• "Letzte Buchung?"\n• "Inventur starten"\nOder tippe /hilfe für alle Befehle.`;
  }
}

function getUnitLabel(unit) {
  const map = { stueck: 'Stück', meter: 'm', rolle: 'Rollen', kiste: 'Kisten', set: 'Sets', liter: 'L', kilogramm: 'kg' };
  return map[unit] || unit;
}

// ── Komponente ────────────────────────────────────────────

export default function AiAssistant() {
  const navigate = useNavigate();
  const store = useStore();
  const auth = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hallo ${auth.userName || 'da'}! Ich bin dein Lager-Assistent. Frag mich nach Beständen, kritischen Artikeln oder was du buchen möchtest.`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // TTS
  const speak = useCallback((text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[•⚠️➕➖↩️✏️🔖🔓]/g, '');
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'de-DE';
    utter.rate = 1.1;
    window.speechSynthesis.speak(utter);
  }, [ttsEnabled]);

  // Spracheingabe
  function startListening() {
    if (!SpeechRecognition) {
      addMessage('assistant', 'Spracherkennung wird in diesem Browser nicht unterstützt. Bitte tippe deine Frage.');
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'de-DE';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      handleUserMessage(text);
    };
    rec.onerror = () => {
      setIsListening(false);
      addMessage('assistant', 'Spracherkennung fehlgeschlagen. Bitte nochmal versuchen oder tippen.');
    };
    recognitionRef.current = rec;
    rec.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function addMessage(role, text) {
    setMessages(prev => [...prev, { role, text, timestamp: Date.now() }]);
  }

  function handleUserMessage(text) {
    addMessage('user', text);
    setIsTyping(true);

    // Kleine Verzögerung für "Natürlichkeit"
    setTimeout(() => {
      const intent = detectIntent(text);
      const response = generateResponse(intent, text, store, auth);
      setIsTyping(false);
      addMessage('assistant', response);
      speak(response);

      // Navigation
      if (intent === 'nav_inventur') setTimeout(() => navigate('/inventur'), 1500);
      if (intent === 'nav_booking') setTimeout(() => navigate('/buchen'), 1500);
      if (intent === 'nav_materials') setTimeout(() => navigate('/material'), 1500);
      if (intent === 'nav_statistics') setTimeout(() => navigate('/statistiken'), 1500);
    }, 600 + Math.random() * 400);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    handleUserMessage(input.trim());
    setInput('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--color-bg)' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--space-md) var(--space-lg)',
        background: 'var(--color-primary)',
        color: 'white',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <Bot size={22} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>Lager-Assistent</div>
            <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8 }}>Frag mich nach Beständen, Buchungen, Statistiken</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: ttsEnabled ? 1 : 0.5 }}
            title={ttsEnabled ? 'Sprachausgabe an' : 'Sprachausgabe aus'}
          >
            {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>
      </header>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
            padding: 'var(--space-md) var(--space-lg)',
            borderRadius: msg.role === 'user' ? 'var(--radius-lg) var(--radius-lg) 2px var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 2px',
            background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-card)',
            color: msg.role === 'user' ? 'white' : 'var(--color-text)',
            fontSize: 'var(--font-size-sm)',
            lineHeight: 1.5,
            whiteSpace: 'pre-line',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 4, opacity: 0.7 }}>
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                {msg.role === 'assistant' ? 'Assistent' : auth.userName}
              </span>
            </div>
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div style={{
            alignSelf: 'flex-start',
            padding: 'var(--space-md) var(--space-lg)',
            borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 2px',
            background: 'var(--color-card)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
          }}>
            <span style={{ display: 'inline-flex', gap: 4 }}>
              <span style={{ animation: 'bounce 1s infinite 0s' }}>.</span>
              <span style={{ animation: 'bounce 1s infinite 0.2s' }}>.</span>
              <span style={{ animation: 'bounce 1s infinite 0.4s' }}>.</span>
            </span>
            <style>{`@keyframes bounce { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: 'var(--space-md) var(--space-lg)',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-card)',
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Frag nach Beständen, Buchungen..."
          style={{ flex: 1, fontSize: 'var(--font-size-md)' }}
          autoFocus
        />
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: isListening ? 'var(--color-danger)' : 'var(--color-primary)',
            color: 'white', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            animation: isListening ? 'pulse 1.5s infinite' : 'none',
          }}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button
          type="submit"
          disabled={!input.trim()}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: input.trim() ? 'var(--color-primary)' : 'var(--color-border)',
            color: 'white', border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
