import { spawn } from 'child_process';
import os from 'os';

// ── frps ──────────────────────────────────────────────
const bin = os.platform() === 'win32' ? './frps/frps.exe' : './frps/frps';
const frps = spawn(bin, ['-c', './frps/frps.toml'], { stdio: 'inherit' });
frps.on('exit', (code) => {
    console.error(`[frps] saiu com código ${code}`);
    process.exit(code);
});

// ── servidor de versionamento ─────────────────────────
import('./version/servidorVersaoArquivos.js')
    .then(() => console.log('[version] servidor iniciado'))
    .catch((err) => { console.error('[version] erro:', err); process.exit(1); });

// ── servidor de comunicação (WebSocket) ───────────────
import('./communication/servidorComunicacao.js')
    .then(() => console.log('[communication] servidor iniciado'))
    .catch((err) => { console.error('[communication] erro:', err); process.exit(1); });