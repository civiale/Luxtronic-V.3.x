# ioBroker.luxtronik2ws

## Alpha Innotec / Luxtronik 2.1 WebSocket Adapter

Verbindet ioBroker mit Alpha Innotec Wärmepumpen (Luxtronik 2.1 Steuerung) via WebSocket.

**Unterstützte Firmware:** v3.81 und neuer (getestet mit v3.92.2)

[![GitHub](https://img.shields.io/badge/GitHub-alessandrocivi/Luxtronic--V.3.x-blue)](https://github.com/alessandrocivi/Luxtronic-V.3.x)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Installation

### Option 1 — Manuell via Docker (empfohlen)

```bash
# In den ioBroker Container einloggen
docker exec -it iobroker bash

# Adapter Verzeichnis erstellen
cd /opt/iobroker/node_modules
mkdir iobroker.luxtronik2ws
cd iobroker.luxtronik2ws

# Dateien kopieren (alle Dateien aus dem ZIP hierher)
# Dann npm install ausführen:
npm install

# Adapter bei ioBroker registrieren
cd /opt/iobroker
iobroker add luxtronik2ws
```

### Option 2 — via URL in ioBroker Admin
Admin → Adapter → Eigene URL → GitHub URL eintragen

---

## Konfiguration

| Parameter | Standard | Beschreibung |
|---|---|---|
| IP Adresse | 192.168.1.67 | IP der Wärmepumpe |
| Port | 8214 | WebSocket Port |
| Passwort | 999999 | Luxtronik Passwort |
| Abfrageintervall | 30s | Wie oft Daten abgefragt werden |
| Reconnect Intervall | 60s | Wartezeit bei Verbindungsabbruch |

---

## Datenpunkte

Der Adapter erstellt automatisch alle verfügbaren Datenpunkte basierend auf der Navigation der Wärmepumpe. Typische Datenpunkte:

| Pfad | Beschreibung | Einheit |
|---|---|---|
| `temperaturen.aussentemperatur` | Aussentemperatur | °C |
| `temperaturen.vorlauftemperatur` | Vorlauftemperatur | °C |
| `temperaturen.ruecklauftemperatur` | Rücklauftemperatur | °C |
| `temperaturen.warmwasser_ist` | Warmwasser Isttemperatur | °C |
| `temperaturen.warmwasser_soll` | Warmwasser Solltemperatur | °C |
| `betriebsstunden.verdichter` | Betriebsstunden Verdichter | h |
| `anlagenstatus.betriebsstatus` | Aktueller Betriebsstatus | - |
| `energiemonitor.waermemenge` | Erzeugte Wärmemenge | kWh |
| `info.connection` | Verbindungsstatus | - |

---

## Protokoll

Die Luxtronik 2.1 verwendet WebSocket mit dem Subprotokoll `Lux_WS`.

Kommunikation:
1. Verbinden mit `ws://IP:8214` und Subprotokoll `Lux_WS`
2. Senden: `LOGIN;999999`
3. Empfangen: Navigation JSON mit allen Bereichen und IDs
4. Senden: `GET;0xXXXXXX` für jeden Bereich
5. Empfangen: JSON mit allen Werten des Bereichs

---

## Changelog

### 0.1.0 (2026-03)
- Erstveröffentlichung
- WebSocket Verbindung mit Lux_WS Protokoll
- Automatische Navigation und Datenpunkt-Erstellung
- Automatisches Polling und Reconnect
