import os from 'os';
import { spawn } from 'child_process';
import { chmodSync, existsSync } from 'fs';

const engName = os.platform()?.startsWith("win") ? 'WINDOWS' : 'LINUX';

// ── Inicia um executável ──────────────────────────────
function startBin({ label, win, linux, args = [] }) {
    const bin = engName === 'WINDOWS' ? win : linux;
    if (engName === 'LINUX' && existsSync(linux)) chmodSync(linux, 0o755);
    const proc = spawn(bin, args, { stdio: 'inherit' });
    proc.on('exit', (code) => {
        console.error(`[${label}] saiu com código ${code}`);
        process.exit(code);
    });
    console.log(`[${label}] iniciado`);
    return proc;
}

// ── Importa um script JS ──────────────────────────────
async function startScript({ label, path }) {
    try {
        await import(path);
        console.log(`[${label}] iniciado`);
    } catch (err) {
        console.error(`[${label}] erro:`, err);
        process.exit(1);
    }
}

// ########################### EXECUTÁVEIS
startBin({
    'label': 'frps',
    'win': './frps/frps.exe',
    'linux': './frps/frps',
    'args': ['-c', './frps/frps.toml'],
});

startBin({
    'label': 'nats',
    'win': './communication/nats-server.exe',
    'linux': './communication/nats-server',
    'args': ['-c', './communication/nats-server.conf'],
});

// ########################### SCRIPTS
startScript({ 'label': 'version', 'path': './version/servidorVersaoArquivos.js' });
startScript({ 'label': 'communication', 'path': './communication/servidorComunicacao.js' });