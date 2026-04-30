# Material-Buchen-App – MVP Implementierungsplan

## 1. Produktkonzept

**LagerPro** – Die Lager- & Material-App für Elektrobetriebe.

Ein mobiles Tool, mit dem Chef und Monteure auf der Baustelle und im Lager in Sekunden Material buchen, Bestände prüfen und Nachbestellungen erkennen. Kein ERP-Monster, sondern ein schlankes Werkzeug, das sofort hilft.

**Kernversprechen:**
- ⚡ Material buchen in unter 10 Sekunden
- 📦 Bestände immer im Blick – auch auf der Baustelle
- 🔔 Nachbestellungen erkennen, bevor Material fehlt
- 🏗️ Material pro Baustelle nachvollziehen

**Design-Prinzip:** Handwerker-tauglich = große Touch-Targets, wenige Klicks, offline-fähige Architektur, deutsche Sprache.

---

## 2. Tech-Stack mit Begründung

| Schicht | Technologie | Begründung |
|---------|-------------|------------|
| **Frontend** | **React 19 + Vite** | Schneller als Next.js für eine Client-App. Kein SSR nötig – die App läuft komplett im Browser. Vite = sofortiger Dev-Server, Hot-Reload. |
| **Routing** | **React Router v7** | Standard für SPAs, einfach und bewährt. |
| **State** | **React Context + useReducer** | Ausreichend für MVP. Kein Redux-Overhead nötig. |
| **Styling** | **Vanilla CSS + CSS Custom Properties** | Volle Kontrolle, kein Framework-Lock-in. CSS Variables für konsistentes Design-System. |
| **Datenpersistenz MVP** | **localStorage + JSON** | Sofort nutzbar, kein Backend-Setup nötig. Funktioniert offline. |
| **Datenpersistenz Phase 2** | **Supabase (PostgreSQL + Auth + Realtime)** | Multi-User, Cloud-Sync, Auth – alles aus einer Hand. |
| **Icons** | **Lucide React** | Modern, lightweight, konsistente Icon-Bibliothek. |
| **PWA** | **Vite PWA Plugin** | Service Worker + Manifest für Installation auf Homescreen. |

### Warum Vite statt Next.js?

- **Kein Server nötig** – Die App ist client-side. Next.js bringt SSR-Overhead, den wir nicht brauchen.
- **Einfacher Deployment** – Static Hosting (Netlify, Vercel, eigener Server) reicht.
- **Schnellere Entwicklung** – Vite startet in <500ms vs. Next.js mehrere Sekunden.
- **Supabase-Migration** – Wenn wir Phase 2 mit Supabase bauen, bleibt das Frontend identisch. Nur die Data-Layer-Schicht wird getauscht.

### Architektur für spätere Erweiterungen

```
┌─────────────────────────────────────┐
│           React Frontend            │
│  (Components, Pages, Hooks)         │
├─────────────────────────────────────┤
│        Data Service Layer           │  ← Abstraktionsschicht
│   (getAll, create, update, delete)  │
├──────────┬──────────────────────────┤
│ localStorage │  Supabase Client     │  ← austauschbar
│   (MVP)      │  (Phase 2)           │
└──────────┴──────────────────────────┘
```

Die **Data Service Layer** abstrahiert den Zugriff. Im MVP nutzt sie `localStorage`. In Phase 2 wird nur diese Schicht auf Supabase-Calls umgestellt – kein Refactoring der UI nötig.

---

## 3. Datenmodell / Tabellenstruktur

### users
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primary Key |
| name | string | Anzeigename |
| email | string | Login-Email |
| role | enum | `admin`, `monteur` |
| active | boolean | Benutzer aktiv |
| created_at | timestamp | Erstelldatum |

> **MVP-Annahme:** Im MVP gibt es einen Default-User. Multi-User kommt mit Supabase in Phase 2.

### categories
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primary Key |
| name | string | z.B. "Leitungsschutzschalter", "Kabel" |
| color | string | Farbe für UI-Badge |

### suppliers
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primary Key |
| name | string | z.B. "Rexel", "Sonepar" |
| contact_email | string | Bestellkontakt |
| contact_phone | string | Telefon |
| notes | string | Anmerkungen |

### materials
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primary Key |
| article_number | string | Artikelnummer (eindeutig) |
| name | string | Artikelname |
| category_id | UUID | FK → categories |
| description | string | Beschreibung |
| unit | enum | `stueck`, `meter`, `rolle`, `karton`, `set`, `paar` |
| current_stock | number | Aktueller Gesamtbestand |
| reserved_stock | number | Reserviert für Baustellen |
| min_stock | number | Mindestbestand (Warnschwelle) |
| reorder_quantity | number | Standard-Nachbestellmenge |
| storage_location | string | Lagerort z.B. "Regal A3" |
| supplier_id | UUID | FK → suppliers |
| purchase_price | number | Einkaufspreis in € |
| packaging_unit | string | VPE z.B. "10er Pack" |
| active | boolean | Aktiv/Inaktiv |
| created_at | timestamp | Erstelldatum |
| updated_at | timestamp | Letzte Änderung |

**Berechnung:**
- `available_stock` = `current_stock` − `reserved_stock`
- `needs_reorder` = `current_stock` ≤ `min_stock`

### projects (Baustellen/Aufträge)
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primary Key |
| name | string | Auftragsname |
| customer | string | Kundenname |
| address | string | Adresse |
| status | enum | `geplant`, `aktiv`, `pausiert`, `abgeschlossen` |
| planned_date | date | Geplanter Termin |
| notes | string | Notizen |
| created_at | timestamp | Erstelldatum |

### stock_movements (Lagerbewegungen)
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primary Key |
| material_id | UUID | FK → materials |
| project_id | UUID | FK → projects (optional) |
| user_id | UUID | FK → users |
| type | enum | `eingang`, `entnahme`, `rueckgabe`, `korrektur`, `reservierung`, `reservierung_aufloesen` |
| quantity | number | Menge (immer positiv) |
| note | string | Notiz |
| created_at | timestamp | Buchungszeitpunkt |

### project_material_reservations
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| id | UUID | Primary Key |
| project_id | UUID | FK → projects |
| material_id | UUID | FK → materials |
| reserved_quantity | number | Reservierte Menge |
| consumed_quantity | number | Bereits verbrauchte Menge |
| created_at | timestamp | Erstelldatum |

### reorder_suggestions (berechnet, nicht manuell gepflegt)
| Feld | Typ | Beschreibung |
|------|-----|-------------|
| material_id | UUID | FK → materials |
| current_stock | number | Snapshot |
| min_stock | number | Snapshot |
| suggested_quantity | number | Empfohlene Bestellmenge |
| supplier_name | string | Lieferant |
| status | enum | `offen`, `bestellt`, `erledigt` |

> Diese Tabelle wird dynamisch aus `materials` berechnet. Im MVP ist es eine berechnete View, keine separate Tabelle.

---

## 4. User-Flows

### Flow 1: Schnelle Entnahme (Hauptanwendungsfall)
```
Dashboard → "Buchen" FAB-Button → Material suchen/auswählen
→ Baustelle auswählen (optional) → Menge eingeben → "Buchen" → Fertig ✓
```
**Ziel:** < 10 Sekunden, 4 Taps

### Flow 2: Wareneingang
```
Dashboard → "Buchen" → Typ "Wareneingang" → Material suchen
→ Menge eingeben → "Buchen" → Bestand wird erhöht ✓
```

### Flow 3: Bestand prüfen
```
Dashboard → "Material" → Suchfeld → Artikel antippen → Detail mit Bestand, Reservierungen, letzte Bewegungen
```

### Flow 4: Nachbestellliste prüfen
```
Dashboard → "Nachbestellen" Badge (rot wenn Artikel kritisch) → Liste mit allen Artikeln unter Mindestbestand → Optional als bestellt markieren
```

### Flow 5: Baustelle anlegen & Material zuordnen
```
Dashboard → "Baustellen" → "+" → Name, Kunde, Adresse → Speichern
→ Baustelle öffnen → "Material reservieren" → Artikel + Menge → Speichern
```

---

## 5. Seitenübersicht

| Seite | Route | Beschreibung |
|-------|-------|-------------|
| **Dashboard** | `/` | Übersicht: KPIs, kritische Artikel, letzte Bewegungen |
| **Schnellbuchung** | `/buchen` | 3-Schritt-Buchung: Material → Baustelle → Menge |
| **Materialübersicht** | `/material` | Liste aller Artikel mit Suche, Filter, Bestandsampel |
| **Material-Detail** | `/material/:id` | Detailansicht mit Bestand, Bewegungshistorie |
| **Material anlegen/bearbeiten** | `/material/:id/edit` | Formular für Artikeldaten |
| **Baustellen** | `/baustellen` | Liste aller Baustellen mit Status-Filter |
| **Baustelle-Detail** | `/baustellen/:id` | Detail mit zugeordnetem Material, Reservierungen |
| **Nachbestellliste** | `/nachbestellen` | Alle Artikel unter Mindestbestand |
| **Lagerbewegungen** | `/bewegungen` | Journal aller Buchungen mit Filter |
| **Einstellungen** | `/einstellungen` | Kategorien, Lieferanten, Lagerorte verwalten |

### Navigation

Mobile Bottom-Navigation mit 5 Tabs:
```
[ 🏠 Home ] [ 📦 Material ] [ ⚡ Buchen ] [ 🏗️ Baustellen ] [ ⚙️ Mehr ]
```

Der **Buchen-Button** ist zentral und hervorgehoben (Primary Action).

---

## 6. MVP-Funktionsumfang

### ✅ Im MVP enthalten

| Feature | Beschreibung |
|---------|-------------|
| Dashboard | KPIs, kritische Artikel, letzte Buchungen |
| Materialstamm | CRUD für Artikel mit allen Feldern |
| Lagerbewegungen | Alle 6 Buchungsarten |
| Schnellbuchung | 3-Schritt-Flow für Entnahme/Eingang |
| Baustellen | CRUD für Projekte, Material zuordnen |
| Bestandsübersicht | Verfügbar, reserviert, gesamt, Warnungen |
| Nachbestellliste | Automatisch berechnet aus Mindestbestand |
| Suche & Filter | Volltextsuche, Kategorie-Filter |
| Seed-Daten | 30+ typische Elektro-Artikel vorinstalliert |
| Responsive Design | Mobile-first, auch am Desktop nutzbar |
| Offline-fähig | localStorage, kein Internet nötig |
| Deutsche Sprache | Komplett deutsch |

### ❌ Nicht im MVP

| Feature | Phase |
|---------|-------|
| Multi-User / Auth | Phase 2 (Supabase) |
| Cloud-Sync | Phase 2 (Supabase) |
| Barcode-Scanner | Phase 2 |
| KI-Sprachbuchung | Phase 2/3 |
| Materialschätzung | Phase 3 |
| Bestellvorschläge | Phase 3 |
| Lieferanten-API | Phase 3 |
| Lexoffice-Integration | Phase 3 |
| WhatsApp-Benachrichtigungen | Phase 3 |
| PWA Installation | Phase 2 (Service Worker) |

---

## 7. Proposed Changes – Dateistruktur

### Projektstruktur

```
c:\Projekte\Material-buchen-app\
├── index.html
├── package.json
├── vite.config.js
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── main.jsx                    # App Entry Point
│   ├── App.jsx                     # Router + Layout
│   ├── index.css                   # Globale Styles + Design System
│   ├── data/
│   │   ├── seedData.js             # Seed-Daten (Elektro-Artikel)
│   │   └── constants.js            # Enums, Buchungsarten etc.
│   ├── services/
│   │   └── dataService.js          # Abstraktionsschicht (localStorage)
│   ├── hooks/
│   │   ├── useStore.js             # Globaler State Context
│   │   └── useSearch.js            # Suchlogik
│   ├── components/
│   │   ├── Layout.jsx              # Shell + Bottom Nav
│   │   ├── BottomNav.jsx           # Mobile Navigation
│   │   ├── SearchBar.jsx           # Suchleiste
│   │   ├── MaterialCard.jsx        # Material-Listenelement
│   │   ├── StockBadge.jsx          # Bestands-Ampel (grün/gelb/rot)
│   │   ├── BookingModal.jsx        # Schnellbuchung Overlay
│   │   ├── KpiCard.jsx             # Dashboard KPI-Kachel
│   │   ├── MovementRow.jsx         # Lagerbewegung Listeneintrag
│   │   ├── ProjectCard.jsx         # Baustelle Listenelement
│   │   ├── FilterBar.jsx           # Kategorie-/Lieferant-Filter
│   │   ├── EmptyState.jsx          # Leere Listen-Ansicht
│   │   └── ConfirmDialog.jsx       # Bestätigungsdialog
│   └── pages/
│       ├── Dashboard.jsx           # Startseite mit KPIs
│       ├── QuickBooking.jsx        # Schnellbuchungs-Seite
│       ├── MaterialList.jsx        # Materialübersicht
│       ├── MaterialDetail.jsx      # Material-Detailseite
│       ├── MaterialForm.jsx        # Material anlegen/bearbeiten
│       ├── ProjectList.jsx         # Baustellen-Übersicht
│       ├── ProjectDetail.jsx       # Baustelle mit Material
│       ├── ProjectForm.jsx         # Baustelle anlegen/bearbeiten
│       ├── ReorderList.jsx         # Nachbestellliste
│       ├── MovementLog.jsx         # Lagerbewegungen Journal
│       └── Settings.jsx            # Einstellungen
```

### Dateien im Detail

#### [NEW] `package.json`
Projektkonfiguration mit Dependencies: react, react-dom, react-router-dom, lucide-react, uuid, vite.

#### [NEW] `vite.config.js`
Vite-Konfiguration mit React Plugin.

#### [NEW] `index.html`
HTML-Einstiegspunkt mit Meta-Tags für Mobile.

#### [NEW] `src/index.css`
Komplettes Design-System: CSS Custom Properties, Typografie, Utility-Klassen, Komponenten-Styles. Dunkelblau/Orange-Farbschema für professionellen Handwerker-Look.

#### [NEW] `src/data/seedData.js`
30+ typische Elektro-Artikel: FI-Schalter, LS-Schalter, NYM-Kabel, Dosen, Klemmen, etc. Plus Kategorien, Lieferanten, Beispiel-Baustellen.

#### [NEW] `src/data/constants.js`
Enums für Buchungsarten, Einheiten, Projektstatus.

#### [NEW] `src/services/dataService.js`
CRUD-Operationen über localStorage. Abstrahiert den Datenzugriff, damit in Phase 2 nur diese Datei gegen Supabase-Calls getauscht wird.

#### [NEW] `src/hooks/useStore.js`
React Context für globalen State. Verwaltet Materials, Projects, Movements.

#### [NEW] Alle Components und Pages
React-Komponenten für die UI (siehe Dateistruktur oben).

---

## 8. Design-Entscheidungen

### Farbschema
- **Primary:** `#1B2A4A` (Dunkelblau) – Professionell, vertrauenswürdig
- **Accent:** `#F59E0B` (Amber/Orange) – Handwerk, Energie, Aufmerksamkeit
- **Success:** `#10B981` – Bestand OK
- **Warning:** `#F59E0B` – Bestand knapp
- **Danger:** `#EF4444` – Unter Mindestbestand
- **Background:** `#F8FAFC` – Helles, cleanes Grau

### Touch-Targets
- Minimum **48px** Höhe für alle interaktiven Elemente
- Buttons: **56px** Höhe auf Mobile
- FAB (Floating Action Button): **64px** Durchmesser

### Typografie
- **Font:** Inter (Google Fonts) – modern, gut lesbar auch klein
- **Größen:** 14px Base, 18px Überschriften, 24px Seitentitel

---

## 9. Offene Fragen / User Review

> [!IMPORTANT]
> **Datenpersistenz im MVP:** Ich schlage vor, für den MVP nur localStorage zu nutzen (Daten nur lokal im Browser). Das bedeutet: **kein Login, keine Cloud, keine Sync zwischen Geräten**. Dafür ist die App sofort ohne Setup nutzbar. Supabase (Cloud + Auth) kommt in Phase 2. Ist das okay?

> [!IMPORTANT]  
> **App-Name:** Ich verwende „LagerPro" als Arbeitstitel. Hast du einen anderen Namen im Kopf?

> [!NOTE]
> **Annahme:** Im MVP gibt es einen Default-User „Chef". Multi-User mit Login kommt mit Supabase in Phase 2.

---

## 10. Phasenplanung

### Phase 1 – MVP (jetzt)
- Komplette App mit localStorage
- Alle 7 MVP-Features
- Seed-Daten mit Elektro-Artikeln
- Responsive Mobile-First Design
- Sofort lokal nutzbar

### Phase 2 – Cloud & Multi-User
- Supabase Backend (PostgreSQL)
- Benutzer-Authentifizierung (Email + Passwort)
- Rollen: Admin (Chef) / Monteur
- Cloud-Sync zwischen Geräten
- PWA mit Service Worker (Offline + Install)
- Barcode-Scanner (Web API)
- KI-Sprachbuchung (Web Speech API + GPT)

### Phase 3 – Integrationen & KI
- Materialschätzung pro Auftragstyp
- Intelligente Bestellvorschläge
- Lexoffice-Anbindung
- Lieferanten-API (Rexel, Sonepar)
- n8n Workflow-Automatisierung
- WhatsApp/Telegram-Benachrichtigungen
- Export (PDF, Excel)

---

## 11. Verifikationsplan

### Automatisch
- App startet fehlerfrei mit `npm run dev`
- Alle Seiten sind über Navigation erreichbar
- CRUD-Operationen für Material, Baustellen funktionieren
- Buchungen aktualisieren Bestände korrekt
- Nachbestellliste zeigt Artikel unter Mindestbestand
- Responsive Layout auf 375px (iPhone) getestet

### Manuell (Browser-Test)
- Kompletter Buchungs-Flow durchspielen
- Material anlegen, Bestand buchen, Nachbestellliste prüfen
- Mobile Navigation testen
- Seed-Daten inspizieren

---

## 12. Lokaler Start

```bash
cd c:\Projekte\Material-buchen-app
npm install
npm run dev
```

Die App öffnet sich unter `http://localhost:5173`.
