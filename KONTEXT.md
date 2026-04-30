# 🏗️ LagerPro – Kompletter Projektkontext für KI-Übergabe

> **Letzte Aktualisierung:** 30.04.2026
> **Projektordner:** `c:\Projekte\Material-buchen-app\`
> **Live-URL:** Auf Vercel deployed (lagerpro)
> **Lokaler Start:** `npm run dev` → http://localhost:5173/

---

## 1. Was ist LagerPro?

**LagerPro** ist eine mobile-first Progressive Web App (PWA) für Elektrobetriebe zur Material- und Lagerverwaltung.

**Zielgruppe:** Chef und Monteure eines Elektrobetriebs
**Einsatzort:** Auf der Baustelle und im Lager

### Kernversprechen
- ⚡ Material buchen in unter 10 Sekunden
- 📦 Bestände immer im Blick – auch auf der Baustelle
- 🔔 Nachbestellungen erkennen, bevor Material fehlt
- 🏗️ Material pro Baustelle nachvollziehen

### Design-Prinzip
Handwerker-tauglich = große Touch-Targets (min. 48px), wenige Klicks, offline-fähig, komplett deutsche Sprache.

---

## 2. Tech-Stack

| Schicht | Technologie | Version |
|---------|-------------|---------|
| **Frontend** | React + Vite | React 19, Vite 6 |
| **Routing** | React Router | v7 |
| **State** | React Context + useReducer | – |
| **Styling** | Vanilla CSS + CSS Custom Properties | – |
| **Icons** | Lucide React | v0.468 |
| **PWA** | Vite PWA Plugin | v1.2 |
| **Backend/DB** | Supabase (PostgreSQL + Auth + Realtime) | v2.103 |
| **Deployment** | Vercel | Static Hosting |
| **ID-Generierung** | uuid | v11 |

### Warum diese Entscheidungen?
- **Vite statt Next.js** – Kein SSR nötig, reine Client-App, schnellerer Dev-Server
- **Vanilla CSS statt Tailwind** – Volle Kontrolle, kein Framework-Lock-in
- **Supabase statt Firebase** – PostgreSQL, einfache Auth, Realtime-Subscriptions
- **localStorage als Fallback** – App funktioniert auch ohne Internet

---

## 3. Architektur

```
┌─────────────────────────────────────┐
│           React Frontend            │
│  (Components, Pages, Hooks)         │
├─────────────────────────────────────┤
│        Data Service Layer           │  ← Abstraktionsschicht
│   (getAll, create, update, delete)  │
├──────────┬──────────────────────────┤
│ localStorage │  Supabase Client     │  ← austauschbar
│ (Fallback)   │  (Primary)           │
└──────────┴──────────────────────────┘
```

**Wichtig:** Es gibt ZWEI Data-Service-Implementierungen:
- `src/services/dataService.js` – localStorage-Version (Offline/Fallback)
- `src/services/supabaseDataService.js` – Supabase-Version (Cloud/Primary)
- `src/services/supabase.js` – Supabase-Client-Initialisierung
- `src/services/sonepar.js` – Sonepar-Deeplinks für Lieferantensuche

Der `useStore.jsx` Hook entscheidet, welcher Service genutzt wird. Die App hat einen Toggle zwischen "Lokal" und "Cloud"-Modus auf der "Mehr"-Seite (Settings).

---

## 4. Dateistruktur

```
Material-buchen-app/
├── index.html                    # HTML-Einstiegspunkt
├── package.json                  # Dependencies
├── vite.config.js                # Vite + PWA-Konfiguration
├── .env                          # Supabase Keys (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
├── implementation_plan.md        # Ursprünglicher MVP-Plan (dieses Dokument ersetzt ihn als Kontext)
├── supabase/
│   └── schema.sql                # Datenbank-Schema für Supabase
├── public/
│   └── icons/                    # PWA-Icons (72px bis 512px)
├── dist/                         # Build-Output (Vercel)
└── src/
    ├── main.jsx                  # App Entry Point
    ├── App.jsx                   # Router + Layout mit allen Routes
    ├── index.css                 # Komplettes Design-System (~36KB)
    ├── data/
    │   ├── seedData.js           # 30+ Elektro-Artikel (Seed-Daten)
    │   └── constants.js          # Enums: Buchungsarten, Einheiten, Status
    ├── services/
    │   ├── dataService.js        # CRUD über localStorage (Fallback)
    │   ├── supabaseDataService.js # CRUD über Supabase (Primary)
    │   ├── supabase.js           # Supabase Client Init
    │   └── sonepar.js            # Sonepar-Deeplinks
    ├── hooks/
    │   └── useStore.jsx          # Globaler State (Context + useReducer)
    ├── components/               # 12 UI-Komponenten
    │   ├── Layout.jsx            # Shell mit Header + Outlet
    │   ├── BottomNav.jsx         # Mobile Bottom-Navigation (5 Tabs)
    │   ├── SearchBar.jsx         # Suchleiste
    │   ├── FilterBar.jsx         # Kategorie-Filter
    │   ├── MaterialCard.jsx      # Material-Listenelement
    │   ├── StockBadge.jsx        # Bestands-Ampel (grün/gelb/rot)
    │   ├── KpiCard.jsx           # Dashboard KPI-Kachel
    │   ├── MovementRow.jsx       # Lagerbewegung Listeneintrag
    │   ├── ProjectCard.jsx       # Baustelle Listenelement
    │   ├── EmptyState.jsx        # Leere Listen-Ansicht
    │   ├── ConfirmDialog.jsx     # Bestätigungsdialog
    │   └── Toast.jsx             # Feedback-Toast-Nachricht
    └── pages/                    # 11 Seiten
        ├── Dashboard.jsx         # Startseite: KPIs, kritische Artikel, letzte Buchungen
        ├── QuickBooking.jsx      # 3-Schritt Schnellbuchung (Material→Baustelle→Menge)
        ├── MaterialList.jsx      # Materialübersicht mit Suche + Filter
        ├── MaterialDetail.jsx    # Detail: Bestand, Historie, Sonepar-Link
        ├── MaterialForm.jsx      # Material anlegen/bearbeiten
        ├── ProjectList.jsx       # Baustellen-Übersicht
        ├── ProjectDetail.jsx     # Baustelle mit zugeordnetem Material
        ├── ProjectForm.jsx       # Baustelle anlegen/bearbeiten
        ├── ReorderList.jsx       # Nachbestellliste (gruppiert nach Lieferant)
        ├── MovementLog.jsx       # Lagerbewegungen-Journal
        └── Settings.jsx          # Einstellungen, Cloud/Lokal-Toggle, Daten-Reset
```

---

## 5. Datenbank-Schema (Supabase / PostgreSQL)

5 Tabellen, alle mit TEXT-IDs (UUIDs als Strings):

### categories
`id` (PK), `name`, `color`, `created_at`

### suppliers
`id` (PK), `name`, `contact_email`, `contact_phone`, `notes`, `created_at`

### materials
`id` (PK), `article_number`, `manufacturer_number`, `name`, `category_id` (FK→categories), `description`, `unit`, `current_stock`, `reserved_stock`, `min_stock`, `reorder_quantity`, `storage_location`, `supplier_id` (FK→suppliers), `purchase_price`, `packaging_unit`, `active`, `created_at`, `updated_at`

**Berechnete Werte:**
- `available_stock` = `current_stock` − `reserved_stock`
- `needs_reorder` = `current_stock` ≤ `min_stock`

### projects (Baustellen)
`id` (PK), `name`, `customer`, `address`, `status` (geplant/aktiv/pausiert/abgeschlossen), `planned_date`, `notes`, `created_at`

### movements (Lagerbewegungen)
`id` (PK), `material_id` (FK→materials), `project_id` (FK→projects), `user_id`, `type` (eingang/entnahme/rueckgabe/korrektur/reservierung/reservierung_aufloesen), `quantity`, `note`, `created_at`

**RLS:** Aktiviert, aber aktuell "allow all" Policies (kein Auth im MVP).

Das vollständige Schema steht in: `supabase/schema.sql`

---

## 6. Routes / Navigation

| Route | Seite | Beschreibung |
|-------|-------|-------------|
| `/` | Dashboard | KPIs, kritische Artikel, letzte Bewegungen |
| `/buchen` | QuickBooking | 3-Schritt-Buchung: Typ→Material→Menge |
| `/material` | MaterialList | Alle Artikel mit Suche + Filter |
| `/material/:id` | MaterialDetail | Detailansicht + Buchungshistorie |
| `/material/:id/edit` | MaterialForm | Artikel bearbeiten |
| `/baustellen` | ProjectList | Alle Baustellen mit Status-Filter |
| `/baustellen/:id` | ProjectDetail | Detail mit Material-Reservierungen |
| `/baustellen/:id/edit` | ProjectForm | Baustelle bearbeiten |
| `/nachbestellen` | ReorderList | Artikel unter Mindestbestand |
| `/bewegungen` | MovementLog | Journal aller Buchungen |
| `/mehr` | Settings | Einstellungen, Info, Reset |

**Bottom-Navigation:** 5 Tabs: Home | Material | ⚡ Buchen | Baustellen | Mehr

---

## 7. Design-System

### Farbschema
- **Primary:** `#1B2A4A` (Dunkelblau)
- **Accent:** `#F59E0B` (Amber/Orange)
- **Success:** `#10B981` (Grün – Bestand OK)
- **Warning:** `#F59E0B` (Gelb – Bestand knapp)
- **Danger:** `#EF4444` (Rot – unter Mindestbestand)
- **Background:** `#F8FAFC` (Helles Grau)

### Typografie
- **Font:** Inter (Google Fonts)
- **Base:** 14px, Überschriften 18px, Seitentitel 24px

### Touch-Targets
- Interaktive Elemente: min. 48px
- Buttons: 56px auf Mobile
- FAB: 64px Durchmesser

Alles ist in `src/index.css` als CSS Custom Properties definiert.

---

## 8. Aktueller Projektstatus

### ✅ Phase 1 – MVP (FERTIG)
Alle Kernfeatures funktionieren:
- Dashboard mit KPIs
- Materialstamm (CRUD)
- 30+ Elektro-Seed-Daten
- 6 Buchungsarten
- Schnellbuchung (3-Schritt-Flow)
- Baustellen-Verwaltung
- Nachbestellliste
- Bestandsampel
- Lagerbewegungen-Journal
- Suche & Filter
- Responsive Mobile-First
- localStorage-Persistenz
- Komplett deutsch

### ✅ Phase 1.5 – Sonepar-Integration (TEILWEISE FERTIG)
- ✅ Sonepar-Suchlink pro Material
- ✅ Sonepar-Button auf Nachbestellliste + Detail-Seite
- ✅ Herstellernummern-Feld + Seed-Daten (Hager, ABB, WAGO)
- ❌ "Alle bei Sonepar öffnen" – Batch-Button (TODO)
- ❌ Sonepar API/OCI-Anbindung (braucht Vertrag mit Sonepar)

### ✅ Phase 2 – Cloud & PWA (TEILWEISE FERTIG)
- ✅ Supabase Backend eingerichtet
- ✅ Supabase Data-Service implementiert
- ✅ Cloud/Lokal-Toggle in Settings
- ✅ PWA-Manifest + Service Worker
- ✅ Vercel-Deployment
- ✅ App-Icons generiert
- ❌ Benutzer-Authentifizierung (Login)
- ❌ Rollen-System (Admin/Monteur)
- ❌ Barcode-Scanner
- ❌ KI-Sprachbuchung
- ❌ Push-Benachrichtigungen

### ❌ Phase 3 – Integrationen & KI (GEPLANT)
- Materialschätzung pro Auftragstyp
- Intelligente Bestellvorschläge
- Lexoffice-Integration
- Lieferanten-APIs (Sonepar/Rexel)
- n8n Workflow-Automatisierung
- WhatsApp/Telegram-Bot
- Export (PDF, Excel)
- Foto-Dokumentation (Lieferscheine → automatischer Wareneingang)

---

## 9. Bekannte Probleme & Hinweise

1. **Sonepar-URLs:** URL-basierte Suche funktioniert nur mit Produktnamen, NICHT mit Herstellernummern. Herstellernummern funktionieren nur in der Suchleiste innerhalb des eingeloggten Shops.

2. **RLS-Policies:** Aktuell "allow all" – muss bei Auth-Implementierung auf echte Policies umgestellt werden.

3. **IDs:** Alle Tabellen nutzen TEXT-IDs (UUID-Strings), NICHT native PostgreSQL UUIDs. Das war nötig wegen Kompatibilität mit den localStorage-Seed-Daten.

4. **Mobile Layout:** Wurde für iPhone optimiert (Safe-Area-Insets, Bottom-Nav-Padding). Es gab mehrere Iterations-Runden für mobile Viewport-Fixes.

5. **Env-Variablen:** Die `.env`-Datei enthält `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`. Diese müssen auch in Vercel als Environment Variables konfiguriert sein.

---

## 10. Nächste sinnvolle Schritte

Priorisiert nach Nutzen:

1. **Auth implementieren** – Supabase Auth mit Email/Passwort, damit mehrere Monteure die App nutzen können
2. **Rollen-System** – Admin (Chef) sieht alles, Monteur kann nur buchen
3. **Barcode-Scanner** – Web Camera API, Artikel per Kamera scannen
4. **"Alle bei Sonepar öffnen"** – Batch-Funktion auf der Nachbestellseite
5. **Push-Benachrichtigungen** – Warnung wenn Material knapp wird
6. **KI-Sprachbuchung** – "3x LS-Schalter B16 für Baustelle Müller" → automatisch buchen

---

## 11. Wichtige Befehle

```bash
# Lokal starten
npm run dev          # → http://localhost:5173/

# Produktions-Build
npm run build        # → dist/

# Build testen
npm run preview      # → http://localhost:4173/
```

---

## 12. Anweisungen für die KI

- **Sprache:** Die App ist komplett auf Deutsch. Alle UI-Texte, Labels, Fehlermeldungen auf Deutsch.
- **Mobile-First:** Jede Änderung muss auf 375px (iPhone SE) gut aussehen. Touch-Targets min. 48px.
- **Bestehende Architektur beibehalten:** Data-Service-Layer nicht umgehen. Neue Features über den bestehenden `useStore` Hook und die Service-Layer einbinden.
- **CSS:** Vanilla CSS mit Custom Properties in `index.css`. Keine CSS-Frameworks einführen.
- **Styling-Konsistenz:** Farbschema und Design-Tokens aus den CSS Custom Properties nutzen, nicht hardcoden.
- **PWA:** Änderungen müssen PWA-kompatibel bleiben (Offline-Fähigkeit beachten).
