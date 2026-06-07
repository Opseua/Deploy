import os from 'os'; import { spawn } from 'child_process'; import { chmodSync, existsSync } from 'fs'; import { Socket } from 'net';

const engName = os.platform()?.startsWith("win") ? 'WINDOWS' : 'LINUX';
const _loadedScripts = new Set();

// ── Inicia um executável ──────────────────────────────
function startBin({ label, win, linux, args = [] }) {
    const bin = engName === 'WINDOWS' ? win : linux; if (engName === 'LINUX' && existsSync(linux)) chmodSync(linux, 0o755); const proc = spawn(bin, args, { stdio: 'inherit' });
    proc.on('exit', (code) => { console.error(`[${label}] saiu com código ${code}`); process.exit(code); }); console.log(`[${label}] iniciado`); return proc;
}

// ── Importa um script JS ──────────────────────────────
async function startScript({ label, path }) {
    try {
        await import(path); _loadedScripts.add(label); console.log(`[${label}] iniciado`);
    } catch (err) {
        console.error(`[${label}] erro:`, err); process.exit(1);
    }
}

// ── Checa se processo está rodando ───────────────────
function isProcessRunning(name) {
    return new Promise((resolve) => {
        const [cmd, args] = engName === 'WINDOWS' ? ['cmd', ['/c', 'tasklist']] : ['sh', ['-c', 'ps aux']]; const proc = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'ignore'] }); let out = '';
        proc.stdout.on('data', (d) => out += d.toString()); proc.on('exit', () => resolve(out.toLowerCase().includes(name.toLowerCase())));
    });
}

// ── Checa se porta está em uso ────────────────────────
function isPortOpen(port) {
    return new Promise((resolve) => {
        const s = new Socket(); s.setTimeout(1000); s.once('connect', () => { s.destroy(); resolve(true); }); s.once('error', () => { s.destroy(); resolve(false); });
        s.once('timeout', () => { s.destroy(); resolve(false); }); s.connect(port, '127.0.0.1');
    });
}

// ── Aguarda tudo e notifica ───────────────────────────
async function waitAndNotify({ executables = [], ports = [], scripts = [] }) {
    console.log('[notify] aguardando serviços...');
    while (true) {
        await new Promise(r => setTimeout(r, 3000)); const execChecks = await Promise.all(executables.map(isProcessRunning)); const portChecks = await Promise.all(ports.map(isPortOpen));
        const scriptChecks = scripts.map(s => _loadedScripts.has(s));
        console.log('[notify]', {
            'executables': Object.fromEntries(executables.map((e, i) => [e, execChecks[i]])),
            'ports': Object.fromEntries(ports.map((p, i) => [p, portChecks[i]])),
            'scripts': Object.fromEntries(scripts.map((s, i) => [s, scriptChecks[i]])),
        });
        if (execChecks.every(Boolean) && portChecks.every(Boolean) && scriptChecks.every(Boolean)) {
            fetch(`https://ntfy.sh/${process.env.NTFY_CHANNEL || 'OPSEUA'}/publish?title=Fly.io&message=Deploy+conclu%C3%ADdo`).catch(() => { }); console.log('[notify] ✅ todos os serviços prontos'); break;
        }
    }
}

// ########################### EXECUTÁVEIS
startBin({ 'label': 'frps', 'win': './frps/frps.exe', 'linux': './frps/frps', 'args': ['-c', './frps/frps.toml'] });
startBin({ 'label': 'nats', 'win': './communication/nats-server.exe', 'linux': './communication/nats-server', 'args': ['-c', './communication/nats-server.conf'] });

// ########################### SCRIPTS
startScript({ 'label': 'version', 'path': './version/servidorVersaoArquivos.js' });
startScript({ 'label': 'communication', 'path': './communication/servidorComunicacao.js' });

// ########################### NOTIFY
waitAndNotify({
    'executables': [
        'nats-server', 'frps'
    ],
    'ports': [
        7500
    ],
    'scripts': [
        'version', 'communication'
    ],
});