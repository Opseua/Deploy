/* eslint-disable custom/regraA */

import os from 'os'; import { spawn } from 'child_process'; import { chmodSync, existsSync } from 'fs'; import { Socket } from 'net';

let engName = os.platform()?.startsWith('win') ? 'WINDOWS' : 'LINUX'; let _loadedScripts = new Set(), fileWindows; if (engName === 'WINDOWS') { fileWindows = process.env.fileWindows.replaceAll('\\', '/'); }

// ── Inicia um executável ──────────────────────────────
function startBin({ label, win, linux, args = [], }) {
    let bin = engName === 'WINDOWS' ? win : linux; if (engName === 'LINUX' && existsSync(linux)) { chmodSync(linux, 0o755); } let proc = spawn(bin, args, { 'stdio': 'inherit', });
    proc.on('exit', (code) => { console.error(`[${label}] saiu com código ${code}`); process.exit(code); }); console.log(`[${label}] iniciado`); return proc;
}

// ── Importa um script JS ──────────────────────────────
async function startScript({ label, path, }) {
    try { await import(path); _loadedScripts.add(label); console.log(`[${label}] iniciado`); } catch (catchErr) { console.error(`[${label}] erro:`, catchErr.message); process.exit(1); }
}

// ── Checa se processo está rodando ───────────────────
async function isProcessRunning(name) {
    if (engName === 'WINDOWS') {
        return new Promise((resolve) => {
            let proc = spawn('cmd', ['/c', 'tasklist',], { 'stdio': ['ignore', 'pipe', 'ignore',], }); let out = ''; proc.stdout.on('data', (d) => out += d.toString());
            proc.on('exit', () => resolve(out.toLowerCase().includes(name.toLowerCase())));
        });
    } let { readdir, readFile, } = await import('fs/promises'); try {
        let pids = await readdir('/proc');
        for (let pid of pids) { if (!/^\d+$/.test(pid)) { continue; } try { let cmd = await readFile(`/proc/${pid}/cmdline`, 'utf8'); if (cmd.toLowerCase().includes(name.toLowerCase())) { return true; } } catch { } }
    } catch { } return false;
}

// ── Checa se porta está em uso ────────────────────────
function isPortOpen(port) {
    return new Promise((resolve) => {
        let s = new Socket(); s.setTimeout(1000); s.once('connect', () => { s.destroy(); resolve(true); }); s.once('error', () => { s.destroy(); resolve(false); });
        s.once('timeout', () => { s.destroy(); resolve(false); }); s.connect(port, '127.0.0.1');
    });
}

// ── Aguarda tudo e notifica ───────────────────────────
async function waitAndNotify({ executables = [], ports = [], scripts = [], }) {
    console.log('[notify] aguardando serviços...'); while (true) {
        await new Promise(r => setTimeout(r, 3000)); let execChecks = await Promise.all(executables.map(isProcessRunning)); let portChecks = await Promise.all(ports.map(isPortOpen));
        let scriptChecks = scripts.map(s => _loadedScripts.has(s)); console.log('[notify]', JSON.stringify({
            'executables': Object.fromEntries(executables.map((e, i) => [e, execChecks[i],])), 'ports': Object.fromEntries(ports.map((p, i) => [p, portChecks[i],])),
            'scripts': Object.fromEntries(scripts.map((s, i) => [s, scriptChecks[i],])),
        })); if (execChecks.every(Boolean) && portChecks.every(Boolean) && scriptChecks.every(Boolean)) {
            if (engName === 'LINUX') { fetch(`https://ntfy.sh/${process.env.NTFY_CHANNEL}/publish?title=Deploy&message=Conclu%C3%ADdo%20(${engName})`).catch(() => { }); } console.log('[notify] ✅ TUDO PRONTO'); break;
        }
    }
}

// ########################### EXECUTÁVEIS
let syncthingZOutros = `${fileWindows}/PORTABLE-Syncthing/z_OUTROS`, zOutros = './src/z_OUTROS';
startBin({
    'label': 'frps', 'win': `${syncthingZOutros}/PORTABLE-frp/frps.exe`, 'linux': `${zOutros}/PORTABLE-frp/frps_linux_amd64`, 'args': ['-c', `${zOutros}/PORTABLE-frp/frps.toml`,],
});
startBin({
    'label': 'nats', 'win': `${syncthingZOutros}/PORTABLE-NATS/nats-server.exe`, 'linux': `${zOutros}/PORTABLE-NATS/nats-server`, 'args': ['-c', `${zOutros}/PORTABLE-NATS/nats-server.conf`,],
});

// ########################### SCRIPTS
startScript({ 'label': 'Connection', 'path': './Connection/server.js', });

// ########################### NOTIFY
waitAndNotify({
    'executables': [
        'nats-server',
        'frps',
    ],
    // 'ports': [
    //     999
    // ],
    'scripts': [
        'Connection',
    ],
});


