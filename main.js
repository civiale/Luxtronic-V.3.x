'use strict';

const utils = require('@iobroker/adapter-core');
const WebSocket = require('ws');

class Luxtronik2WS extends utils.Adapter {

    constructor(options) {
        super({ ...options, name: 'luxtronik2ws' });
        this.ws = null;
        this.navIds = [];
        this.pollTimer = null;
        this.reconnectTimer = null;
        this.isConnected = false;
        this.isReady = false;
        this.createdObjects = new Set();

        this.on('ready', this.onReady.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    // ─── Start ────────────────────────────────────────────────────────────────

    async onReady() {
        this.log.info(`Luxtronik2WS Adapter gestartet`);
        this.log.info(`Verbinde mit ${this.config.host}:${this.config.port}`);
        await this.setStateAsync('info.connection', false, true);
        this.connect();
    }

    // ─── WebSocket Verbindung ─────────────────────────────────────────────────

    connect() {
        const url = `ws://${this.config.host}:${this.config.port}`;

        try {
            this.ws = new WebSocket(url, 'Lux_WS');
        } catch (e) {
            this.log.error(`WebSocket Fehler beim Erstellen: ${e.message}`);
            this.scheduleReconnect();
            return;
        }

        this.ws.on('open', () => {
            this.log.info(`✅ Verbunden mit ${url}`);
            this.isConnected = true;
            this.setStateAsync('info.connection', true, true);
            // Login senden
            this.send(`LOGIN;${this.config.password}`);
        });

        this.ws.on('message', (data) => {
            this.handleMessage(data.toString());
        });

        this.ws.on('close', () => {
            this.log.warn(`🔌 Verbindung getrennt`);
            this.isConnected = false;
            this.isReady = false;
            this.setStateAsync('info.connection', false, true);
            this.clearTimers();
            this.scheduleReconnect();
        });

        this.ws.on('error', (err) => {
            this.log.error(`WebSocket Fehler: ${err.message}`);
        });
    }

    send(msg) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(msg);
            this.log.debug(`📤 Gesendet: ${msg}`);
        } else {
            this.log.warn(`⚠️ Senden nicht möglich - nicht verbunden`);
        }
    }

    scheduleReconnect() {
        const interval = (this.config.reconnectInterval || 60) * 1000;
        this.log.info(`🔄 Reconnect in ${this.config.reconnectInterval || 60} Sekunden...`);
        this.reconnectTimer = setTimeout(() => {
            this.connect();
        }, interval);
    }

    clearTimers() {
        if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
        if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    }

    // ─── Nachricht verarbeiten ────────────────────────────────────────────────

    handleMessage(raw) {
        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            this.log.debug(`Nicht-JSON Antwort: ${raw.substring(0, 100)}`);
            return;
        }

        // Navigation empfangen → IDs extrahieren & alle Bereiche abrufen
        if (data.type === 'Navigation' && data.items) {
            this.log.info(`📂 Navigation empfangen`);
            this.navIds = [];
            this.extractNavIds(data.items);
            this.log.info(`📋 ${this.navIds.length} Bereiche gefunden`);
            this.isReady = true;

            // Sofort alle Daten abrufen
            this.pollAll();

            // Polling starten
            const interval = (this.config.pollInterval || 30) * 1000;
            this.pollTimer = setInterval(() => this.pollAll(), interval);
            return;
        }

        // Datenwerte empfangen → States setzen
        if (data.items && Array.isArray(data.items)) {
            this.processItems(data.items, data.name || 'unknown');
        }
    }

    extractNavIds(sections) {
        const recurse = (items) => {
            for (const item of items) {
                if (item.id && item.name) {
                    this.navIds.push({ id: item.id, name: item.name });
                }
                if (item.items && item.items.length > 0) {
                    recurse(item.items);
                }
            }
        };
        for (const section of sections) {
            if (section.items) recurse(section.items);
        }
    }

    pollAll() {
        if (!this.isReady || !this.isConnected) return;
        this.log.debug(`🔄 Polling ${this.navIds.length} Bereiche...`);
        for (const entry of this.navIds) {
            this.send(`GET;${entry.id}`);
        }
    }

    // ─── States verarbeiten ───────────────────────────────────────────────────

    async processItems(items, sectionName) {
        for (const item of items) {
            if (item.value === undefined || item.value === null) continue;
            if (!item.name) continue;

            const stateId = this.buildStateId(sectionName, item.name);
            const value = this.parseValue(item.value);
            const unit = item.unit || '';
            const role = this.guessRole(item.name, unit);
            const type = typeof value;

            // Objekt erstellen falls noch nicht vorhanden
            if (!this.createdObjects.has(stateId)) {
                await this.setObjectNotExistsAsync(stateId, {
                    type: 'state',
                    common: {
                        name: item.name,
                        type: type,
                        role: role,
                        unit: unit,
                        read: true,
                        write: item.readOnly === false ? true : false,
                    },
                    native: { luxId: item.id || '' }
                });
                this.createdObjects.add(stateId);
            }

            // State setzen
            await this.setStateAsync(stateId, { val: value, ack: true });
            this.log.debug(`📊 ${stateId} = ${value} ${unit}`);
        }
    }

    buildStateId(section, name) {
        const clean = (s) => s
            .toLowerCase()
            .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        return `${clean(section)}.${clean(name)}`;
    }

    parseValue(raw) {
        if (typeof raw === 'number') return raw;
        if (typeof raw === 'boolean') return raw;
        const num = parseFloat(raw);
        if (!isNaN(num) && String(num) === String(raw)) return num;
        if (raw === 'true') return true;
        if (raw === 'false') return false;
        return raw;
    }

    guessRole(name, unit) {
        const n = name.toLowerCase();
        if (unit === '°C' || n.includes('temperatur')) return 'value.temperature';
        if (unit === 'kWh' || n.includes('energie')) return 'value.energy';
        if (unit === 'kW' || unit === 'W' || n.includes('leistung')) return 'value.power';
        if (unit === 'h' || n.includes('stunden')) return 'value';
        if (unit === '%') return 'value.battery';
        if (typeof this.parseValue(name) === 'boolean') return 'indicator';
        return 'value';
    }

    // ─── Stop ─────────────────────────────────────────────────────────────────

    onUnload(callback) {
        try {
            this.clearTimers();
            if (this.ws) {
                this.ws.terminate();
                this.ws = null;
            }
            this.log.info('Adapter gestoppt');
            callback();
        } catch (e) {
            callback();
        }
    }
}

// Adapter starten
if (require.main !== module) {
    module.exports = (options) => new Luxtronik2WS(options);
} else {
    new Luxtronik2WS();
}
