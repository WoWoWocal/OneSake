# Projektauftrag (Diplomarbeit) – OPTCG Web‑Simulation mit Tools & Progression

**Projektname (Arbeitstitel):** OneSake  
**Projektart:** Diplomarbeit / Softwareprojekt (Web/PWA)  
**Zielgruppe:** Spieler*innen des One Piece Trading Card Game (OPTCG), die Decks bauen, Matches online spielen und Entscheidungen (Mulligan/Start-Hand) verbessern möchten.

---

## 1. Ausgangslage und Motivation

In der OPTCG‑Community existieren bereits browserbasierte Tools (z. B. Project Raftel). Aus Nutzerrückmeldungen ergibt sich jedoch **Verbesserungspotenzial in der mobilen Fullscreen‑Nutzung** (Übersicht, Touch‑Bedienung, Panel‑Overload). Zusätzlich wünschen sich Spieler*innen **Entscheidungsunterstützung** (Mulligan/Starting Hands) und eine **Motivation durch Progression**.

Dieses Projekt realisiert daher eine **mobile‑optimierte** OPTCG‑Plattform im Browser, die
1) eine **PvP‑Spielsimulation** (Player vs. Player) bietet,  
2) **Deckbuilding** integriert,  
3) **Mulligan‑Trainer & Wahrscheinlichkeitsrechner** bereitstellt, und  
4) eine **persistente Progression** (Berries/Cosmetics) mit Accounts ermöglicht.

---

## 2. Projektziel

### 2.1 Hauptziel
Entwicklung einer **browserbasierten OPTCG‑PvP‑Simulation** mit **server‑autoritativer, deterministischer Spielengine**, bei der Spieler*innen **nur Entscheidungen (“Choices”) treffen**, während der Server Regeln automatisch ausführt (z. B. Draw/Don/Attack‑Auflösung).

### 2.2 Neben-/Erweiterungsziele
- **Mobile‑First UX:** Klare, touchfreundliche Bedienung im Fullscreen‑Modus (Hand‑Drawer, Choice‑Sheets, Card‑Inspect).
- **Tools (offline‑fähig):**
  - Mulligan‑Trainer (Hands ziehen, Keep/Mull, Statistik)
  - Wahrscheinlichkeitsrechner für Start‑/Frühhände (Monte‑Carlo, optional Hypergeometrie)
- **Progression:** Siege → **Berries** → **Cosmetics** (Alt Arts/Card Skins, Kartenhüllen, Hintergründe, Profilbilder).
- **Persistenz am Account:** Decks, Berry‑Stand, freigeschaltete/ausgewählte Cosmetics werden gespeichert.
- **Match‑Log + Chat:** Ingame‑Chat plus **automatischer Spielverlauf** (Action‑Log) wie bei OPTCGSim.

**Erfolgskriterium (Abnahme):** Zwei Nutzer*innen können im Browser ein Match spielen (PvP), Entscheidungen treffen, Chat/Log nutzen, danach Berries erhalten, Cosmetics kaufen/ausrüsten, und ihre Progression/Decks sind nach erneutem Login wieder verfügbar.

---

## 3. Projektumfang (Scope)

### 3.1 In Scope (wird umgesetzt)
1) **PvP‑Simulation (Core Loop / Vertical Slice)**
   - Lobby / Matchmaking (Private Rooms + Invite Code)
   - Startphase: Deck laden, Shuffle, Draw, Mulligan (1×)
   - Turn‑Loop (vereinfachtes Regel‑Subset, server‑autoritativer Ablauf)
   - Choice‑System: Server erzeugt Choice‑Prompts, Client sendet Choice‑Antworten
   - Win/Loss‑Ermittlung

2) **Deckbuilder**
   - Suche/Filter, Deckliste, Validierung (Deckgröße, max. Copies)
   - Speichern/duplizieren/umbenennen/löschen
   - **Export (OPTCGSim‑Importstring):** Copy/Share

3) **Tools**
   - **Wahrscheinlichkeit:** Start‑Hand / bis Turn 2 (going first/second‑Presets), Monte‑Carlo (Web Worker)
   - **Mulligan‑Trainer:** Keep/Mull nach Kriterien (Presets + Custom), Session‑Stats

4) **Progression & Cosmetics**
   - Berries als In‑Game‑Währung (serverseitig vergeben)
   - Shop‑Katalog (server)
   - Purchase/Eqip‑Flow, Ownership & Loadout gespeichert

5) **Ingame‑Chat & Spielverlauf (Timeline)**
   - Chat zwischen Spieler*innen
   - Action‑Log (server‑generiert): Draw/Don/Play/Attack/Counter/Trigger usw.
   - Gemeinsame Timeline mit Filter (All/Chat/Actions)

6) **Accounts + Guests**
   - Guest Play möglich
   - Account zur Persistenz (Decks, Cosmetics, Berries)
   - Optionaler Upgrade‑Flow Guest → Account

### 3.2 Out of Scope (bewusst nicht im MVP)
- Vollständige Kartenabdeckung (alle Sets/alle Effekte)
- Ranked/MMR, Turniere, Ladder
- Trading/Marketplace
- Vollwertiges Replay‑System (Event‑Sourcing wird vorbereitet, aber nicht zwingend umgesetzt)
- Umfangreiche Moderationstools für Chat (nur Basis‑Spam‑Schutz im MVP)

---

## 4. Qualitätsanforderungen / Nicht‑funktionale Anforderungen

### 4.1 Mobile‑UX (Schwerpunkt)
- Bedienung im Fullscreen: **Hand als Drawer**, Choices als **Bottom Sheet**, Card‑Inspect als Modal
- Touch Targets ≥ 44px, Safe‑Area Insets (Notch)
- Responsives Layout: Mobile Single‑Pane, Desktop Multi‑Pane

### 4.2 Performance
- Kartenliste virtualisiert / lazy loading
- Simulationen (Monte‑Carlo) im **Web Worker**
- WebSocket‑Kommunikation effizient (Diff/Snapshots)

### 4.3 Sicherheit & Fairness
- **Server‑autoritative Regeln**: Clients können nicht “mogeln”
- Validierung aller Aktionen am Server
- Rewards nur bei “echten Matches” (Minimal‑Anti‑Abuse: Mindestdauer/-züge)

### 4.4 Datenschutz
- Speicherung nur notwendiger Daten (Account, Decks, Cosmetics, Match‑Stats optional)
- Klare Trennung: Gastdaten lokal/temporär; Accountdaten serverseitig

---

## 5. Fachliches Konzept (Kurz)

### 5.1 Choice‑Driven Game Engine
- Client sendet nur **Choices** (z. B. Auswahl einer Karte/Attack‑Ziel)
- Server:
  - prüft Legalität
  - wendet Regeln an
  - erzeugt nächsten Choice‑Prompt oder beendet Phase/Turn
- Determinismus: Shuffle/Random serverseitig oder server‑seeded

### 5.2 Tools
- **Monte‑Carlo Simulation** für flexible Wahrscheinlichkeiten (Gruppen‑Queries, Mulligan, Draw‑by‑Turn)
- Optional Hypergeometrie für exakte Ein‑Gruppen‑Presets

### 5.3 Progression
- Nach Match‑Ende serverseitige Reward‑Berechnung (Win/Loss, Anti‑Abuse)
- Berries Wallet + Cosmetics Ownership + Equipped Loadout

### 5.4 Chat + Action‑Log
- Gemeinsame Timeline:
  - `CHAT_MESSAGE` (Player)
  - `LOG_EVENT` (Server)
- Log‑Events maschinenlesbar + textuell (UI)

---

## 6. Technisches Konzept (Architektur – verständlich)

### 6.1 Komponenten
- **Frontend (Web/PWA):**
  - Deckbuilder, PvP‑UI, Tools, Shop, Profile
  - Web Worker für Simulationen
- **Backend (Game Server + API):**
  - Auth (Guest/Account)
  - Matchmaking/Rooms
  - Game Engine (server‑autoritative State Machine)
  - Persistenz (Decks, Wallet, Cosmetics)
- **Realtime:** WebSocket (Match‑Rooms)

### 6.2 Datenhaltung (Minimal)
- User / Guest
- Decks
- Wallet (Berries)
- Cosmetics (Catalog, Owned, Equipped)
- Match Results (optional)
- Log (Match‑Timeline, optional längerfristig)

---

## 7. Projektphasen & Meilensteine (Diplomarbeitsplan)

### Phase 0 – Setup (Woche 1)
- Projektstruktur, CI, Staging
- UI‑Grundsystem (Modals/Sheets/Drawer)
- Card‑DB‑Grundlage

**Meilenstein:** Klickbarer UI‑Prototyp

### Phase 1 – Deckbuilder (Woche 2–3)
- Deck CRUD + Validierung
- Mobile‑First Filtersheet + Deck Drawer
- OPTCGSim Exportcode (Copy/Share)

**Meilenstein:** Deck bauen & exportieren

### Phase 2 – Tools (Woche 3–4)
- Probability (Monte‑Carlo in Worker; Presets)
- Mulligan‑Trainer (Keep/Mull + Stats)

**Meilenstein:** Tools funktionieren mit echten Decks

### Phase 3 – PvP Vertical Slice (Woche 5–7)
- WebSocket Rooms, Invite‑Match
- Choice‑System + Server‑State Machine
- Minimaler Kartensatz & Effekte
- Chat + Action‑Log (Grundevents)

**Meilenstein:** PvP‑Match spielbar im Browser (mobile & desktop)

### Phase 4 – Progression & Cosmetics (Woche 8–9)
- Accounts + Guests, Persistenz
- Rewards (Berries) nach Match
- Shop (Catalog, Purchase, Equip)
- Cosmetics im Match sichtbar (Avatar/Background; Card Skins optional)

**Meilenstein:** Win → Berries → Cosmetic → im Match sichtbar

### Phase 5 – Qualität & Evaluation (Woche 10–12)
- Mobile Fullscreen UX‑Optimierung
- Performance‑Tuning
- Usability‑Test (Vergleich: bestehende Lösung vs. neue mobile UX)
- Dokumentation, Demo‑Video, Abnahme

**Meilenstein:** Abgabereife Diplomarbeit + stabiler Demo‑Build

---

## 8. Abgrenzung / Risiken / Maßnahmen

### Risiken
- **Regelkomplexität** (OPTCG hat viele Edge‑Cases)
- **Mobile UI Overload** (Board + Hand + Choice + Log)
- **Cheat/Desync** (bei falscher Autorität)
- **Datenpflege** (Card DB Updates)

### Maßnahmen
- **Vertical Slice** + begrenzter Kartensatz für MVP
- Choice‑Driven: weniger UI‑Komplexität als Drag&Drop
- Server‑autoritative Engine + Tests der Rule‑Funktionen
- Tool‑Berechnungen in Worker, UI‑Virtualisierung

---

## 9. Abnahmekriterien (Definition of Done)

1) **PvP‑Match**: Zwei Spieler*innen (Browser) spielen ein Match bis Win/Loss.  
2) **Choices**: Aktionen laufen automatisch; Spieler*innen treffen nur Choices.  
3) **Chat + Spielverlauf**: Ingame‑Chat und servergeneriertes Action‑Log sind sichtbar.  
4) **Deckbuilder**: Decks erstellen/validieren/speichern, Exportcode kopieren.  
5) **Tools**: Probability + Mulligan‑Trainer funktionieren mit gespeicherten Decks.  
6) **Progression**: Match‑Reward → Berries; Shop‑Purchase; Cosmetics ausrüsten; Anzeige im Match.  
7) **Persistenz**: Nach erneutem Login sind Decks, Berries, Cosmetics erhalten.  
8) **Mobile‑UX**: Fullscreen am Handy bleibt bedienbar (Hand‑Drawer, Choice‑Sheet, Card‑Inspect).

---

## 10. Ergebnisartefakte (Diplomarbeit)

- Laufende Web‑Anwendung (Staging/Release)
- Technische Dokumentation (Architektur, Datenmodell, Protokolle)
- Regel-/Choice‑Spezifikation (State Machine + Event/Log‑Katalog)
- UX‑Konzept (Mobile‑First Layout, Wireframes)
- Evaluation (Usability‑Test / Messkriterien, Lessons Learned)
- Quellcode + README + Build/Deploy‑Anleitung

---

## 11. Rollen (optional, anpassbar)
- **Projektleitung / Product:** Scope, Backlog, Abnahme
- **Frontend:** Mobile‑UX, Deckbuilder, Match UI, Tools UI
- **Backend/Game Engine:** State Machine, Choices, WebSockets, Persistenz
- **Data/Content:** Card DB, Groups/Tags für Tools, Cosmetics Catalog
- **QA:** Testfälle (Rules, Sync, Mobile)

---

**Unterschriften (optional):**  
Projektteam: ____________________   Betreuer*in: ____________________   Datum: _______________
