# ioBroker.luxtronik2ws

## Alpha Innotec / Luxtronik 2.1 WebSocket Adapter

[![GitHub](https://img.shields.io/badge/GitHub-civiale%2FioBroker.luxtronik2ws-blue)](https://github.com/civiale/iobroker.luxtronik2ws)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firmware](https://img.shields.io/badge/Firmware-v3.81%2B-green)](https://github.com/civiale/iobroker.luxtronik2ws)
[![ioBroker](https://img.shields.io/badge/ioBroker-Adapter-orange)](https://www.iobroker.net)

---

## Warum ein neuer Adapter?

Der bisherige ioBroker Adapter [UncleSamSwiss/ioBroker.luxtronik2](https://github.com/UncleSamSwiss/ioBroker.luxtronik2) war lange Zeit die Standardlösung für die Integration von Alpha Innotec Wärmepumpen in ioBroker. Leider wird dieser Adapter nicht mehr aktiv weiterentwickelt und funktioniert mit neueren Firmware-Versionen der Luxtronik 2.1 Steuerung **nicht mehr**.

### Das Problem mit dem alten Adapter

Ab Firmware **V3.81** hat Alpha Innotec das Kommunikationsprotokoll grundlegend geändert:

- Die alte Luxtronik 2.0 Steuerung kommunizierte über ein einfaches **TCP-Socket-Protokoll** auf Port 8888
- Ab Firmware V3.81 wurde dieses Protokoll durch ein modernes **WebSocket-Interface** auf Port 8214 ersetzt
- Das neue WebSocket-Interface verwendet das Subprotokoll `Lux_WS` und eine JSON-basierte Kommunikation
- Der alte Adapter von UncleSamSwiss unterstützt dieses neue Protokoll nicht — die Verbindung schlägt sofort fehl
- Ab Firmware **V3.92.x** ist die Verbindung über das alte Protokoll vollständig blockiert

### Bekannte Probleme mit dem alten Adapter (UncleSamSwiss)

- Verbindung wird sofort getrennt (`connection closed`)
- Keine Daten werden empfangen
- Fehlermeldung: `WebSocket connection failed`
- Adapter zeigt dauerhaft roten Punkt in ioBroker
- Das Repository wird nicht mehr aktiv gepflegt und erhält keine Updates

### Die Lösung: ioBroker.luxtronik2ws

Dieser neue Adapter wurde von Grund auf neu entwickelt und unterstützt das **neue WebSocket-Protokoll** der Luxtronik 2.1 Steuerung ab Firmware V3.81. Er wurde mit Firmware **V3.92.2** entwickelt und getestet.

---

## Unterstützte Geräte

Alle Wärmepumpen mit **Luxtronik 2.1 Steuerung** und Firmware **V3.81 oder neuer**:

- Alpha Innotec (alle Modelle mit Luxtronik 2.1)
- Novelan (baugleich mit Alpha Innotec)
- Weitere OEM-Varianten der Luxtronik 2.1 Steuerung

**Getestet mit:** Firmware **V3.92.2** (Alpha Innotec)

Der Adapter liest die Struktur der Wärmepumpe bei jedem Start dynamisch aus. Er sollte deshalb auf allen Firmware-Versionen ab V3.81 funktionieren — bestätigt ist bislang aber nur V3.92.2. Rückmeldungen zu anderen Versionen sind willkommen, gern als [Issue](https://github.com/civiale/iobroker.luxtronik2ws/issues).

> ⚠️ **Für ältere Geräte mit Firmware < V3.81** bitte den ursprünglichen Adapter von [UncleSamSwiss](https://github.com/UncleSamSwiss/ioBroker.luxtronik2) verwenden.

---

## Voraussetzungen (Software)

| Komponente | Mindestversion |
|---|---|
| ioBroker js-controller | **≥ 4.0.0** |
| ioBroker Admin | **≥ 6.0.0** |
| Node.js | **≥ 18** |

---

## ⚠️ Voraussetzungen — Netzwerk, Webserver & Fernsteuerung aktivieren

> **Wichtig:** Bevor der Adapter verwendet werden kann, muss die Wärmepumpe zwingend am lokalen Netzwerk (LAN) angeschlossen sein und der **Webserver** sowie die **Fernsteuerung** in der Luxtronik-Steuerung aktiviert sein.

---

### Schritt 1 — LAN-Kabel anschliessen

Die Verbindung zum Netzwerk erfolgt über die linke Buchse an der Unterseite des Bedienteils. Voraussetzung ist, dass im Zuge der elektrischen Anschlussarbeiten ein **geschirmtes Netzwerkkabel (Kategorie 6)** durch das Gerät verlegt worden ist.

- LAN-Kabel (RJ-45, Kat. 6) in die Netzwerkbuchse der Luxtronik-Steuerung stecken
- Anderes Ende in den Router/Switch einstecken

> Quelle: [Alpha Innotec Betriebsanleitung Luxtronik (ManualsLib)](https://www.manualslib.de/manual/593845/Alpha-Innotec-Luxtronik.html?page=32)

---

### Schritt 2 — Webserver aktivieren

Am Bedienfeld der Wärmepumpe:

```
SERVICE → Systemsteuerung → Webserver → Ein
```

Über die linke Buchse an der Unterseite des Bedienteils kann eine Verbindung zu einem Computer oder einem Netzwerk hergestellt werden, um den Heizungs- und Wärmepumpenregler von dort aus steuern zu können.

Detaillierte Schritte:
1. **Dreh-Druck-Knopf** drehen bis `SERVICE` markiert ist → drücken
2. `Systemsteuerung` anwählen → drücken
3. `Webserver` anwählen → drücken
4. Webserver auf **„Ein"** stellen → mit linkem Haken bestätigen

> Quelle: [Alpha Innotec Betriebsanleitung Luxtronik Seite 32](https://www.manualslib.de/manual/593845/Alpha-Innotec-Luxtronik.html?page=32)

---

### Schritt 3 — DHCP Client aktivieren & IP-Adresse herausfinden

Wenn Sie **DHCP Client** aktivieren, bezieht der Luxtronik-Regler automatisch eine IP-Adresse von Ihrem Router/Modem.

```
SERVICE → Systemsteuerung → DHCP Client → Ein
```

> 💡 **So finden Sie die IP-Adresse Ihrer Wärmepumpe:**
> Nach Aktivierung des DHCP Clients zeigt die Steuerung die zugewiesene IP-Adresse direkt am Display an:
> ```
> SERVICE → Systemsteuerung → IP-Adresse
> ```
> Geben Sie im Browser zunächst `http://` und dann die im Bildschirm Ihres Heizungs- und Wärmepumpenreglers unter „IP" erscheinende Nummer ein.

**Beispiel wie eine IP-Adresse aussehen kann** (Ihre individuelle Adresse finden Sie wie oben beschrieben am Display):
```
http://192.168.x.x
```

> 💡 **Tipp:** Im Router eine **feste DHCP-Reservierung** für die MAC-Adresse der Wärmepumpe einrichten, damit die IP-Adresse immer gleich bleibt.

> Quelle: [Alpha Innotec Installationsanleitung alpha web](https://www.alpha-innotec.ch/fileadmin/content/product_management/alpha_web/Anleitung_Elektriker_de.pdf)

---

### Schritt 4 — Fernsteuerung aktivieren

```
SERVICE → Systemsteuerung → Fernsteuerung → Ein
```

Wird die Option „Fernsteuerung" eingeschaltet, kann der Heizungs- und Wärmepumpenregler über einen Computer oder ein Netzwerk gesteuert werden.

> ⚠️ Alle Einstellungen, die die Funktion „Fernwartung" betreffen, dürfen nur durch autorisiertes Servicepersonal vorgenommen werden.

> Quelle: [Alpha Innotec Betriebsanleitung Luxtronik Seite 33](https://www.manualslib.de/manual/593845/Alpha-Innotec-Luxtronik.html?page=33)

---

### Schritt 5 — Verbindung testen

Nach der Aktivierung die Verbindung mit PowerShell testen (Windows):

```powershell
# Ping Test (Beispiel-IP — Ihre IP finden Sie am Display unter SERVICE → Systemsteuerung → IP-Adresse)
ping 192.168.x.x

# Port 8214 Test (WebSocket)
Test-NetConnection -ComputerName 192.168.x.x -Port 8214
```

Erwartetes Ergebnis: `TcpTestSucceeded : True`

Unter Linux oder macOS geht dasselbe mit:

```bash
nc -vz 192.168.x.x 8214
```

---

## Test-Tool — WebSocket Tester (`test/webtest.html`)

Im Ordner `test/` befindet sich eine **webtest.html** mit der die WebSocket-Verbindung zur Wärmepumpe direkt im Browser getestet werden kann — **ohne ioBroker oder Node.js**.

Dieses Test-Tool wurde entwickelt um das neue `Lux_WS` WebSocket-Protokoll zu analysieren und alle verfügbaren Datenpunkte der Wärmepumpe zu entdecken. Es ist die Grundlage für diesen Adapter.

### Was kann man mit dem Test-Tool machen?

- ✅ **Verbindung testen** — prüfen ob Port 8214 erreichbar ist und Login funktioniert
- ✅ **Alle Datenbereiche anzeigen** — Navigation der Wärmepumpe wird automatisch geladen
- ✅ **Einzelne Bereiche abfragen** — per Klick Live-Daten eines Bereichs anzeigen
- ✅ **Live-Werte anzeigen** — Temperaturen, Betriebsstunden, Status in Echtzeit sehen
- ✅ **Dynamische IDs einsehen** — die Hexadezimal-IDs der Luxtronik Navigationsstruktur prüfen
- ✅ **Fehlerdiagnose** — Verbindungsprobleme direkt im Log erkennen

### So verwenden:

1. Datei `test/webtest.html` herunterladen
2. **Doppelklick** auf die Datei — öffnet sich direkt im Browser (Edge oder Chrome)
3. IP-Adresse der Wärmepumpe eingeben (ablesen am Display: `SERVICE → Systemsteuerung → IP-Adresse`)
4. Port `8214` und Passwort `999999` eingeben
5. **„🔌 Verbinden"** klicken

> ⚠️ **Wichtig:** Die Datei muss als **lokale Datei** (`file://`) geöffnet werden — nicht über einen Webserver. Von einer `https://`-Seite aus blockiert der Browser die unverschlüsselte `ws://`-Verbindung als Mixed Content.

### Benutzeroberfläche:

```
┌─────────────────────────────────────────────────────────────┐
│  🔥 Luxtronik WebSocket Tester v2.0                         │
│  ● Verbunden mit 192.168.x.x:8214                           │
├─────────────────────────────────────────────────────────────┤
│  IP: [192.168.x.x] Port: [8214]  PW: [999999]              │
│  [🔌 Verbinden] [✖ Trennen] [🔄 REFRESH] [🗑 Log leeren]  │
├─────────────────────────────────────────────────────────────┤
│  📂 BEREICHE (werden automatisch nach Verbindung geladen)    │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────┐      │
│  │ 🌡️         │ │ 📥         │ │ 📤                 │      │
│  │ Tempera-   │ │ Eingänge   │ │ Ausgänge           │      │
│  │ turen      │ │ 0x11e82d8  │ │ 0x130b868          │      │
│  │ 0xc724f8   │ └────────────┘ └────────────────────┘      │
│  └────────────┘                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────┐      │
│  │ 🕐         │ │ ⚡         │ │ 🏠                 │      │
│  │ Betriebs-  │ │ Leistungs- │ │ Smart Home         │      │
│  │ stunden    │ │ aufnahme   │ │ Interface          │      │
│  └────────────┘ └────────────┘ └────────────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  📋 LOG                                                      │
│  [20:57:24] ✅ Verbunden mit Lux_WS Protokoll!              │
│  [20:57:24] ✅ Navigation geladen — 16 Bereiche verfügbar   │
│  [20:57:46] 📤 GET Temperaturen (0xc724f8)                  │
│  [20:57:46] 📥 Empfangen: {"items":[...]}                   │
├─────────────────────────────────────────────────────────────┤
│  📊 Temperaturen                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │ Aussentemperatur     │  │ Vorlauftemperatur     │        │
│  │      8.5 °C          │  │      35.2 °C          │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

> Die Hexadezimal-IDs im Bild sind Beispiele aus einer konkreten Anlage. Bei Ihnen sehen sie anders aus — sie werden von der Steuerung dynamisch vergeben.

### Häufige Fehlermeldungen:

| Fehlermeldung | Ursache | Lösung |
|---|---|---|
| `Fehler: [object Event]` | Webserver nicht aktiv | Webserver in Luxtronik aktivieren |
| `Insufficient resources` | Browser blockiert `ws://` | Datei lokal öffnen (`file://`) statt über `https://` |
| `Verbindung getrennt` | Falsches Protokoll / Passwort | Protokoll `Lux_WS` und Passwort prüfen |
| `TcpTestSucceeded: False` | Port geschlossen | Netzwerk & Kabel prüfen, Webserver aktivieren |

---

## Features

- ✅ Vollständige WebSocket-Unterstützung mit `Lux_WS` Subprotokoll
- ✅ Automatische Erkennung aller verfügbaren Datenpunkte via Navigation-API
- ✅ Dynamische Erstellung aller ioBroker States — keine manuelle Konfiguration nötig
- ✅ Automatisches Polling aller Werte (konfigurierbar, Standard 30 Sekunden)
- ✅ Automatischer Reconnect bei Verbindungsabbruch
- ✅ Korrekte Einheiten (°C, kWh, kW, h, %)
- ✅ Datenbereiche einzeln zu- und abschaltbar
- ✅ **Eingebauter MQTT-Client** für die Loxone-Integration — kein zusätzlicher MQTT-Adapter nötig
- ✅ Konfigurierbar via ioBroker Admin UI
- ✅ Verbindungsstatus-Anzeige in ioBroker

---

## Installation

### Option 1 — via ioBroker Admin (empfohlen)

1. ioBroker Admin öffnen → **Adapter**
2. Klick auf das **GitHub-Symbol** (Eigene URL)
3. URL eingeben:
   ```
   https://github.com/civiale/iobroker.luxtronik2ws
   ```
4. **Installieren** klicken
5. Instanz anlegen und konfigurieren

### Option 2 — via Kommandozeile

```bash
iobroker url "https://github.com/civiale/iobroker.luxtronik2ws"
```

In einer Docker-Installation davor in den Container wechseln — **Containername anpassen**, er lautet je nach Installation `iobroker`, `buanet-iobroker` oder ähnlich:

```bash
docker exec -it iobroker bash
```

### Option 3 — Manuell

```bash
# In den ioBroker Container einloggen (Containername anpassen)
docker exec -it iobroker bash

# Adapter Verzeichnis erstellen
cd /opt/iobroker/node_modules
mkdir iobroker.luxtronik2ws
cd iobroker.luxtronik2ws

# Alle Dateien aus dem Repository hierher kopieren
# Dann Dependencies installieren:
npm install

# Adapter bei ioBroker registrieren
cd /opt/iobroker
iobroker add luxtronik2ws

# Nur die neue Instanz starten (iobroker restart startet alles neu)
iobroker start luxtronik2ws.0
```

---

## Konfiguration

Die Einstellungen sind im Admin auf vier Reiter verteilt.

### 🔌 Verbindung

| Parameter | Feld | Standard | Beschreibung |
|---|---|---|---|
| **IP Adresse** | `host` | — | IP-Adresse der Wärmepumpe (ablesen am Display: `SERVICE → Systemsteuerung → IP-Adresse`) |
| **Port** | `port` | `8214` | WebSocket Port (Standard bei allen Luxtronik 2.1) |
| **Passwort** | `password` | `999999` | Luxtronik Benutzer-Passwort |
| **Abfrageintervall** | `pollInterval` | `30` | Wie oft alle Werte abgefragt werden (Sekunden) |
| **Reconnect Intervall** | `reconnectInterval` | `60` | Wartezeit bei Verbindungsabbruch (Sekunden) |

### 🏠 Loxone Integration

| Parameter | Feld | Standard | Beschreibung |
|---|---|---|---|
| **Loxone Integration** | `loxoneEnabled` | **aus** | Aktiviert den eingebauten MQTT-Client |
| **MQTT Broker** | `loxoneMqttHost` | — | Adresse des MQTT-Brokers |
| **MQTT Port** | `loxoneMqttPort` | `1883` | Port des Brokers |
| **Benutzer** | `loxoneMqttUser` | — | optional, falls der Broker Anmeldung verlangt |
| **Passwort** | `loxoneMqttPassword` | — | optional |
| **Topic-Basis** | `loxoneMqttTopic` | `waermepumpe` | Präfix aller veröffentlichten Topics |

### 📊 Datenpunkte

Jeder Bereich der Wärmepumpe lässt sich einzeln zu- oder abschalten. Abgeschaltete Bereiche werden nicht abgefragt und erzeugen keine States.

| Bereich | Feld | Standard |
|---|---|---|
| Temperaturen | `fetchTemperaturen` | **ein** |
| Eingänge | `fetchEingaenge` | **ein** |
| Ausgänge | `fetchAusgaenge` | **ein** |
| Betriebsstunden | `fetchBetriebsstunden` | **ein** |
| Anlagenstatus | `fetchAnlagenstatus` | **ein** |
| Energiemonitor | `fetchEnergiemonitor` | **ein** |
| Ablaufzeiten | `fetchAblaufzeiten` | **aus** |
| Fehlerspeicher | `fetchFehlerspeicher` | **aus** |
| Smart Home Interface | `fetchSHI` | **aus** |

> 💡 Die letzten drei Bereiche sind ab Werk **deaktiviert**. Wer Ablaufzeiten, Fehlerspeicher oder das Smart Home Interface braucht, muss sie hier zuerst einschalten.

### ℹ️ Info & Hilfe

Reiter mit Kurzhilfe und Verweisen auf diese Dokumentation.

---

## Datenpunkte

Der Adapter erstellt **automatisch alle verfügbaren Datenpunkte** basierend auf der Navigation der Wärmepumpe. Welche das genau sind und wie sie heissen, hängt von Modell und Firmware ab — die folgende Tabelle ist deshalb eine **Auswahl typischer Beispiele**, keine feste Liste.

| Pfad (Beispiel) | Beschreibung | Einheit |
|---|---|---|
| `temperaturen.aussentemperatur` | Aussentemperatur | °C |
| `temperaturen.vorlauftemperatur` | Vorlauftemperatur Heizkreis | °C |
| `temperaturen.ruecklauftemperatur` | Rücklauftemperatur Heizkreis | °C |
| `temperaturen.warmwasser_ist` | Warmwasser Isttemperatur | °C |
| `temperaturen.warmwasser_soll` | Warmwasser Solltemperatur | °C |
| `temperaturen.heissgas` | Heissgastemperatur | °C |
| `betriebsstunden.verdichter` | Betriebsstunden Verdichter | h |
| `betriebsstunden.heizung` | Betriebsstunden Heizung | h |
| `anlagenstatus.betriebsstatus` | Aktueller Betriebsstatus | — |
| `energiemonitor.waermemenge` | Erzeugte Wärmemenge gesamt | kWh |
| `energiemonitor.leistungsaufnahme` | Aktuelle Leistungsaufnahme | kW |

Zusätzlich legt der Adapter `info.connection` an (Typ `boolean`) — daran lässt sich der Verbindungsstatus in Skripten und Visualisierungen auswerten.

Welche Datenpunkte Ihre Anlage tatsächlich liefert, sehen Sie am schnellsten mit dem [Test-Tool](#test-tool--websocket-tester-testwebtesthtml) oder nach der Installation im Admin unter *Objekte*.

---

## Integration mit Loxone

Der Adapter bringt einen **eigenen MQTT-Client** mit. Ein zusätzlicher ioBroker-MQTT-Adapter zum Veröffentlichen der States ist **nicht** nötig.

Was Sie brauchen, ist ein **MQTT-Broker** im Netzwerk. Möglich sind zum Beispiel Mosquitto, der ioBroker-MQTT-Adapter im Server-/Broker-Modus oder ein Broker auf der Loxone-Seite.

### Einrichtung

1. **Broker bereitstellen** (falls noch keiner läuft), Standardport `1883`
2. Im Adapter den Reiter **🏠 Loxone Integration** öffnen und aktivieren:
   - **MQTT Broker** — Adresse des Brokers
   - **MQTT Port** — `1883`
   - **Benutzer / Passwort** — nur falls der Broker es verlangt
   - **Topic-Basis** — Standard `waermepumpe`
3. Instanz speichern, der Adapter verbindet sich und veröffentlicht die Werte
4. In **Loxone Config**: MQTT Client hinzufügen → Broker-IP und Port `1883` eintragen
5. Virtuelle Eingänge auf die gewünschten Topics anlegen

### Topics

Die Topics setzen sich aus der Topic-Basis, dem Bereichsnamen und dem Namen des Datenpunkts zusammen:

```
waermepumpe/<Bereich>/<Datenpunkt>
```

> 💡 Die genaue Schreibweise der Bereichs- und Datenpunktnamen richtet sich nach dem, was Ihre Wärmepumpe meldet. Am schnellsten sehen Sie die tatsächlichen Topics, indem Sie sich einmal mit einem MQTT-Client (z. B. MQTT Explorer) auf den Broker verbinden und `waermepumpe/#` abonnieren. Diese Topics tragen Sie dann in Loxone ein.

Die Werte werden als **reine Zahlen** veröffentlicht, ohne angehängte Einheit — damit können Loxones virtuelle Eingänge direkt rechnen (siehe Changelog 0.1.1).

---

## WebSocket Protokoll (Technische Details)

**Kommunikationsablauf:**
1. Verbinden mit `ws://IP:8214` und Subprotokoll `Lux_WS`
2. Senden: `LOGIN;999999`
3. Empfangen: Navigation JSON mit allen Bereichen und dynamischen IDs
4. Senden: `GET;0xXXXXXX` für jeden Bereich
5. Empfangen: JSON mit allen Werten

> ⚠️ Die IDs in der Navigation sind **dynamisch** — sie können sich nach Firmware-Updates ändern. Der Adapter liest sie bei jedem Start neu aus.

---

## Dateistruktur

```
iobroker.luxtronik2ws/
├── main.js                  # Hauptprogramm (ioBroker Adapter)
├── package.json             # Node.js Dependencies
├── io-package.json          # ioBroker Metadaten
├── LICENSE                  # MIT Lizenz
├── README.md                # Diese Dokumentation
├── .gitignore
├── admin/
│   ├── jsonConfig.json      # Konfigurationsseite in ioBroker Admin
│   ├── luxtronik.png
│   └── luxtronik.svg
├── test/
│   └── webtest.html         # WebSocket Test-Tool für den Browser
└── .github/
    └── workflows/
        └── ci.yml           # GitHub Actions CI
```

---

## Sicherheitshinweise

> ⚠️ Die Wärmepumpe sollte **niemals direkt aus dem Internet erreichbar** sein. Nur im lokalen Netzwerk verwenden — kein Port-Forwarding einrichten!

> 🔒 **CVE-2024-22894** betrifft die Passwort-Verschlüsselung in der `shadow`-Datei der Steuerung (CWE-326, *Inadequate Encryption Strength*, CVSS 6.8 — Ausnutzung erfordert physischen Zugriff auf das Gerät).
> Behoben ist sie ab Firmware **V3.89.0** — in den anderen Firmware-Linien ab **V2.88.3** bzw. **V4.81.3**. Betroffen sind Alpha Innotec und Novelan Wärmepumpen mit Firmware vor 2.88.3, 3.0.0–3.88.x und 4.0.0–4.81.x.
> Quelle: [NVD — CVE-2024-22894](https://nvd.nist.gov/vuln/detail/CVE-2024-22894)

---

## Changelog

### 0.1.2 (2026-08)
- **Fix:** Werte werden gegen den deklarierten State-Typ konvertiert. Zuvor verglich der Konvertierungsblock den ermittelten Typ mit sich selbst, wodurch die Bedingungen nie zutrafen. Da ein Objekt nur beim ersten Auftreten angelegt wird, fror sein Typ auf dem ersten gesehenen Wert ein — lieferte die Steuerung beim Verbindungsaufbau Text, blieb der Datenpunkt dauerhaft `string` und jeder spätere Zahlenwert wurde vom js-controller abgewiesen (betraf z. B. `eingaenge.hd` und `ausgaenge.hup`).

### 0.1.1 (2026-08)
- **Fix:** MQTT sendet reine Zahlenwerte an Loxone, ohne Einheit als String

### 0.1.0 (2026-03)
- Erstveröffentlichung
- WebSocket Verbindung mit `Lux_WS` Protokoll
- Automatische Navigation und Datenpunkt-Erstellung
- Automatisches Polling (konfigurierbar)
- Automatischer Reconnect bei Verbindungsabbruch
- Getestet mit Alpha Innotec Firmware V3.92.2

---

## Fehlerbehebung

| Symptom | Mögliche Ursache | Prüfen |
|---|---|---|
| Instanz bleibt rot | Webserver oder Fernsteuerung nicht aktiv | Schritte 2 und 4 der Voraussetzungen |
| Verbindung wird sofort getrennt | Falsches Passwort | Standard ist `999999` |
| Keine States werden angelegt | Alle Datenbereiche abgeschaltet | Reiter *📊 Datenpunkte* |
| Ein Bereich fehlt komplett | Bereich ab Werk deaktiviert | `fetchAblaufzeiten`, `fetchFehlerspeicher`, `fetchSHI` |
| Keine Daten in Loxone | Loxone-Integration nicht aktiviert | Reiter *🏠 Loxone Integration*, `loxoneEnabled` |
| Topics in Loxone leer | Topic-Schreibweise abweichend | Mit MQTT Explorer `waermepumpe/#` abonnieren |
| Port 8214 nicht erreichbar | Netzwerk oder Webserver | `Test-NetConnection` bzw. `nc -vz` aus Schritt 5 |

---

## Mitwirken

Pull Requests und Issues sind herzlich willkommen!

1. Fork erstellen
2. Feature Branch: `git checkout -b feature/mein-feature`
3. Commit: `git commit -m 'Feature hinzugefügt'`
4. Push: `git push origin feature/mein-feature`
5. Pull Request erstellen

---

## Lizenz

MIT License — siehe [LICENSE](LICENSE)

---

## Danksagung

- [UncleSamSwiss](https://github.com/UncleSamSwiss/ioBroker.luxtronik2) für den ursprünglichen Adapter als Inspiration
- Alpha Innotec Community für das Reverse Engineering des `Lux_WS` Protokolls
- ioBroker Community für die hervorragende Plattform
