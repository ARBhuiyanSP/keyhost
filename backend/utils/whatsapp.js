const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');

const SESSION_DIR = path.join(__dirname, '../sessions/whatsapp_auth');
const LOG_FILE = path.join(__dirname, '../whatsapp.log');

let sock = null;
let connectionStatus = 'DISCONNECTED'; // 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
let qrCodeData = null;
let connectedUser = null;
let reconnectTimer = null;

// Logger to file helper
const logToFile = (msg, err = null) => {
  const timestamp = new Date().toISOString();
  const errMsg = err ? ` | Error: ${err.message || err} ${err.stack || ''}` : '';
  const logMessage = `[${timestamp}] ${msg}${errMsg}\n`;
  console.log(msg, err || '');
  try {
    fs.appendFileSync(LOG_FILE, logMessage);
  } catch (e) {
    console.error('Failed to write to whatsapp.log:', e.message);
  }
};

// Initialize connection automatically on startup if credentials exist
const initWhatsAppOnStartup = () => {
  try {
    if (fs.existsSync(SESSION_DIR)) {
      const files = fs.readdirSync(SESSION_DIR);
      if (files.length > 0) {
        logToFile('[WhatsApp] Existing session found. Attempting auto-reconnect...');
        connectWhatsApp().catch(err => {
          logToFile('[WhatsApp] Auto-reconnect failed', err);
        });
      }
    }
  } catch (err) {
    logToFile('[WhatsApp] Error in startup check', err);
  }
};

const connectWhatsApp = async () => {
  // If already connected or currently trying to connect, return immediately
  if (connectionStatus === 'CONNECTED' || connectionStatus === 'CONNECTING') {
    logToFile(`[WhatsApp] connectWhatsApp called but status is already: ${connectionStatus}`);
    return { success: true, status: connectionStatus };
  }

  // Clear any existing reconnect timers
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  // Close any existing socket to avoid conflict
  if (sock) {
    try {
      sock.end();
    } catch (e) {
      logToFile('[WhatsApp] Failed to end old socket:', e);
    }
    sock = null;
  }

  connectionStatus = 'CONNECTING';
  qrCodeData = null;
  logToFile('[WhatsApp] Starting connection process...');

  try {
    // Dynamically fetch latest allowed version to bypass WhatsApp 405 Method Not Allowed error
    let version = [2, 3000, 1015901307]; // standard fallback
    try {
      const fetched = await fetchLatestBaileysVersion();
      version = fetched.version;
      logToFile(`[WhatsApp] Fetched latest version: ${version.join('.')}`);
    } catch (verErr) {
      logToFile('[WhatsApp] Failed to fetch latest version, using default fallback', verErr);
    }

    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ['Keyhost', 'Chrome', '20.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          qrCodeData = await QRCode.toDataURL(qr);
          logToFile('[WhatsApp] New login QR Code generated');
        } catch (qrErr) {
          logToFile('[WhatsApp] QR code generation error', qrErr);
        }
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        logToFile(`[WhatsApp] Connection closed. Reason: ${lastDisconnect?.error?.message || 'Unknown'}. Reconnect: ${shouldReconnect}`);
        
        connectionStatus = 'DISCONNECTED';
        connectedUser = null;
        qrCodeData = null;

        if (shouldReconnect) {
          logToFile('[WhatsApp] Attempting reconnect in 10 seconds...');
          if (reconnectTimer) clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            connectWhatsApp().catch(err => logToFile('[WhatsApp] Reconnect attempt failed', err));
          }, 10000);
        } else {
          logToFile('[WhatsApp] Logged out. Cleaning up session files...');
          cleanupSessionFiles();
        }
      } else if (connection === 'open') {
        connectionStatus = 'CONNECTED';
        qrCodeData = null;
        const user = sock.user;
        connectedUser = user?.id ? user.id.split(':')[0] : 'Connected User';
        logToFile(`[WhatsApp] Connected successfully! Phone: ${connectedUser}`);
      }
    });

    return { success: true };
  } catch (error) {
    connectionStatus = 'DISCONNECTED';
    logToFile('[WhatsApp] Connection initialization error', error);
    throw error;
  }
};


const disconnectWhatsApp = async () => {
  try {
    logToFile('[WhatsApp] Requesting disconnect/logout...');
    if (sock) {
      await sock.logout().catch(err => logToFile('[WhatsApp] Socket logout error (ignoring)', err));
      sock.end();
      sock = null;
    }
    
    connectionStatus = 'DISCONNECTED';
    connectedUser = null;
    qrCodeData = null;
    
    cleanupSessionFiles();
    logToFile('[WhatsApp] Disconnected successfully');
    return { success: true };
  } catch (error) {
    logToFile('[WhatsApp] Disconnect error', error);
    cleanupSessionFiles(); 
    return { success: false, error: error.message };
  }
};

const cleanupSessionFiles = () => {
  try {
    if (fs.existsSync(SESSION_DIR)) {
      logToFile('[WhatsApp] Cleaning up session auth directory...');
      fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    }
  } catch (err) {
    logToFile('[WhatsApp] Directory cleanup failed', err);
  }
};

const getStatus = () => {
  return {
    status: connectionStatus,
    qr: qrCodeData,
    phone: connectedUser
  };
};

const sendWhatsAppMessage = async (to, message) => {
  try {
    if (connectionStatus !== 'CONNECTED' || !sock) {
      logToFile(`[WhatsApp] Attempted to send message to ${to}, but WhatsApp is not connected. Status: ${connectionStatus}`);
      return { success: false, error: 'WhatsApp is not connected' };
    }

    // Clean phone number: keep only digits
    let cleanPhone = String(to).replace(/\D/g, '');
    
    // Auto-prefix Bangladesh country code if omitted (popular local helper)
    if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
      cleanPhone = '88' + cleanPhone;
    }

    const jid = `${cleanPhone}@s.whatsapp.net`;
    logToFile(`[WhatsApp] Outgoing message payload to: ${jid}`);
    
    const response = await sock.sendMessage(jid, { text: message });
    logToFile(`[WhatsApp] Message successfully sent to: ${cleanPhone}`);
    return { success: true, response };
  } catch (error) {
    logToFile(`[WhatsApp] Failed to send message to ${to}`, error);
    return { success: false, error: error.message };
  }
};

// Run auto-init on startup
initWhatsAppOnStartup();

module.exports = {
  connectWhatsApp,
  disconnectWhatsApp,
  getStatus,
  sendWhatsAppMessage
};
