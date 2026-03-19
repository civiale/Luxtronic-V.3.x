# ioBroker.luxtronik2ws

## Alpha Innotec / Luxtronik 2.1 WebSocket Adapter

[![GitHub](https://img.shields.io/badge/GitHub-alessandrocivi/Luxtronic--V.3.x-blue)](https://github.com/alessandrocivi/Luxtronic-V.3.x)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firmware](https://img.shields.io/badge/Firmware-v3.81%2B-green)](https://github.com/alessandrocivi/Luxtronic-V.3.x)
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

Dieser neue Adapter wurde von Grund auf neu entwickelt und unterstützt das **neue WebSocket-Protokoll** der Luxtronik 2.1 Steuerung ab Firmware V3.81. Er wurde speziell mit Firmware **V3.92.2** getestet und funktioniert zuverlässig.

---

## Unterstützte Geräte

Alle Wärmepumpen mit **Luxtronik 2.1 Steuerung** und Firmware **V3.81 oder neuer**:

- Alpha Innotec (alle Modelle mit Luxtronik 2.1)
- Novelan (baugleich mit Alpha Innotec)
- Siemens Wärmepumpen mit Luxtronik 2.1
- Alle OEM-Varianten der Luxtronik 2.1 Steuerung

**Getestete Firmware:** V3.81, V3.90, V3.91, V3.92.2

> ⚠️ **Für ältere Geräte mit Firmware < V3.81** bitte den ursprünglichen Adapter von [UncleSamSwiss](https://github.com/UncleSamSwiss/ioBroker.luxtronik2) verwenden.

---

## Features

- ✅ Vollständige WebSocket-Unterstützung mit `Lux_WS` Subprotokoll
- ✅ Automatische Erkennung aller verfügbaren Datenpunkte via Navigation-API
- ✅ Dynamische Erstellung aller ioBroker States — keine manuelle Konfiguration nötig
- ✅ Automatisches Polling aller Werte (konfigurierbar, Standard 30 Sekunden)
- ✅ Automatischer Reconnect bei Verbindungsabbruch
- ✅ Korrekte Einheiten (°C, kWh, kW, h, %)
- ✅ Konfigurierbar via ioBroker Admin UI
- ✅ Verbindungsstatus-Anzeige in ioBroker
- ✅ Kompatibel mit ioBroker MQTT Adapter für Loxone Integration

---

## Installation

### Option 1 — via ioBroker Admin (empfohlen)

1. ioBroker Admin öffnen → **Adapter**
2. Klick auf das **GitHub-Symbol** (Eigene URL)
3. URL eingeben:
   ```
   https://github.com/alessandrocivi/Luxtronic-V.3.x
   ```
4. **Installieren** klicken
5. Instanz anlegen und konfigurieren

### Option 2 — Manuell via Docker

```bash
# In den ioBroker Container einloggen
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

# ioBroker neu starten
iobroker restart
```

---

## Konfiguration

Nach der Installation die Instanz in ioBroker Admin konfigurieren:

| Parameter | Standard | Beschreibung |
|---|---|---|
| **IP Adresse** | 192.168.1.100 | IP-Adresse der Wärmepumpe im lokalen Netzwerk |
| **Port** | 8214 | WebSocket Port (Standard bei allen Luxtronik 2.1) |
| **Passwort** | 999999 | Luxtronik Benutzer-Passwort (Standard: 999999) |
| **Abfrageintervall** | 30s | Wie oft alle Werte abgefragt werden (Sekunden) |
| **Reconnect Intervall** | 60s | Wartezeit bei Verbindungsabbruch (Sekunden) |

---

## Datenpunkte

Der Adapter erstellt **automatisch alle verfügbaren Datenpunkte** basierend auf der Navigation der Wärmepumpe. Die Datenpunkte variieren je nach Wärmepumpenmodell und Firmware-Version.

Typische Datenpunkte:

| Pfad | Beschreibung | Einheit |
|---|---|---|
| `info.connection` | Verbindungsstatus | boolean |
| `temperaturen.aussentemperatur` | Aussentemperatur | °C |
| `temperaturen.vorlauftemperatur` | Vorlauftemperatur Heizkreis | °C |
| `temperaturen.ruecklauftemperatur` | Rücklauftemperatur Heizkreis | °C |
| `temperaturen.warmwasser_ist` | Warmwasser Isttemperatur | °C |
| `temperaturen.warmwasser_soll` | Warmwasser Solltemperatur | °C |
| `temperaturen.heissgas` | Heissgastemperatur | °C |
| `eingaenge.aussentemperatur` | Aussentemperatur (Sensor) | °C |
| `ausgaenge.heizungsumwaelzpumpe` | Heizungsumwälzpumpe | boolean |
| `ausgaenge.brauchwasserpumpe` | Brauchwasserpumpe | boolean |
| `betriebsstunden.verdichter` | Betriebsstunden Verdichter | h |
| `betriebsstunden.heizung` | Betriebsstunden Heizung | h |
| `betriebsstunden.warmwasser` | Betriebsstunden Warmwasser | h |
| `anlagenstatus.betriebsstatus` | Aktueller Betriebsstatus | - |
| `energiemonitor.waermemenge` | Erzeugte Wärmemenge gesamt | kWh |
| `energiemonitor.leistungsaufnahme` | Aktuelle Leistungsaufnahme | kW |

---

## Integration mit Loxone

Dieser Adapter wurde ursprünglich entwickelt um eine zuverlässige **Loxone Smart Home Integration** zu ermöglichen. Zusammen mit dem ioBroker MQTT Adapter können alle Wärmepumpen-Daten an einen Loxone Miniserver übertragen werden.

### Loxone via MQTT einrichten

1. ioBroker **MQTT Adapter** installieren (Server/Broker Modus, Port 1883)
2. MQTT Adapter konfigurieren: alle `luxtronik2ws.*` States publizieren
3. In **Loxone Config**: MQTT Client hinzufügen
   - Broker IP: IP des ioBroker Servers
   - Port: 1883
4. Virtuelle Eingänge anlegen mit den gewünschten Topics, z.B.:
   ```
   luxtronik2ws/0/temperaturen/aussentemperatur
   ```

---

## WebSocket Protokoll (Technische Details)

Die Luxtronik 2.1 verwendet WebSocket mit dem Subprotokoll `Lux_WS` auf Port 8214.

**Kommunikationsablauf:**
1. Verbinden mit `ws://IP:8214` und Subprotokoll `Lux_WS`
2. Senden: `LOGIN;999999`
3. Empfangen: Navigation JSON mit allen Bereichen und dynamischen IDs (z.B. `0xc724f8`)
4. Senden: `GET;0xc724f8` für jeden Bereich
5. Empfangen: JSON mit allen Werten des Bereichs inkl. Name, Wert und Einheit

> ⚠️ **Wichtig:** Die IDs in der Navigation sind **dynamisch** und können sich nach einem Firmware-Update oder Neustart ändern. Der Adapter liest die IDs bei jedem Verbindungsaufbau neu aus — daher ist keine manuelle Konfiguration der Register nötig.

**Beispiel Navigation-Antwort:**
```json
{
  "type": "Navigation",
  "items": [
    {
      "id": "0xc6ab88",
      "name": "Informationen",
      "items": [
        {"id": "0xc724f8", "name": "Temperaturen"},
        {"id": "0x11e82d8", "name": "Eingänge"}
      ]
    }
  ]
}
```

**Beispiel Daten-Antwort:**
```json
{
  "items": [
    {"name": "Aussentemperatur", "value": 8.5, "unit": "°C"},
    {"name": "Vorlauftemperatur", "value": 35.2, "unit": "°C"}
  ]
}
```

---

## Sicherheitshinweis

> ⚠️ Die Wärmepumpe sollte **niemals direkt aus dem Internet erreichbar** sein! Nur im lokalen Netzwerk verwenden. Kein Port-Forwarding im Router einrichten.

> 🔒 In der Firmware V3.92 wurde eine bekannte Sicherheitslücke (CVE-2024-22894) behoben — ein hardcodiertes Root-SSH-Passwort. Bitte immer auf aktueller Firmware bleiben.

---

## Changelog

### 0.1.0 (2026-03)
- Erstveröffentlichung
- WebSocket Verbindung mit `Lux_WS` Protokoll
- Automatische Navigation und Datenpunkt-Erstellung
- Automatisches Polling alle 30 Sekunden (konfigurierbar)
- Automatischer Reconnect bei Verbindungsabbruch
- Getestet mit Alpha Innotec Firmware V3.92.2

---

## Mitwirken

Pull Requests und Issues sind herzlich willkommen!

1. Fork erstellen
2. Feature Branch anlegen (`git checkout -b feature/mein-feature`)
3. Änderungen committen (`git commit -m 'Feature hinzugefügt'`)
4. Branch pushen (`git push origin feature/mein-feature`)
5. Pull Request erstellen

---

## Lizenz

MIT License — siehe [LICENSE](LICENSE) Datei.

---

## Danksagung

- [UncleSamSwiss](https://github.com/UncleSamSwiss/ioBroker.luxtronik2) für den ursprünglichen Adapter der als Inspiration diente
- Alpha Innotec Community für das Reverse Engineering des `Lux_WS` Protokolls
- ioBroker Community für die hervorragende Plattform
