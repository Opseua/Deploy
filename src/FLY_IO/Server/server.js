// src/FLY_IO/Server/server.js

import http from 'http';

// COMPARTILHADO
await import('../../src/resources/@functions.js');

// LÓGICA DO SERVIDOR
await import('../../src/scripts/server.js');

// FUNÇÕES
await import('../../src/resources/apiV2.js');

let PORT = 5555;
let server = http.createServer(async (req, res) => {
    try {
        let { status, headers, body, } = await globalThis.serverHandle({
            'method': req.method,
            'getBody': async () => { let chunks = []; for await (let c of req) { chunks.push(c); } return JSON.parse(Buffer.concat(chunks).toString('utf-8')); },
        });
        res.writeHead(status, headers); res.end(body);
    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json', }); res.end(JSON.stringify({ 'ret': false, 'msg': `SERVER: ERRO | ${e}`, }));
    }
});
server.listen(PORT, () => { console.log(`SERVER HTTP RODANDO NA PORTA ${PORT}`); });










// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function clearConsole() { if ((typeof chrome !== 'undefined')) { console.clear(); } else { let p = process.stdout; p.write('\u001b[2J\u001b[0;0H'); p.write('\x1Bc'); } } let msgQtd = 0;
let runCleCon = console.log; console.log = (...a) => { runCleCon.apply(console, a); msgQtd++; if (msgQtd >= (30 * 1)) { clearConsole(); msgQtd = 0; console.log('CONSOLE LIMPO!\n'); } }; clearConsole();
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


import fs from 'node:fs';
import crypto from 'node:crypto';

let PORTA = 7777;
let IMG_PATH = 'D:/Downloads/Google Chrome/Bing_Daily-SamuiThailand.jpg';

let img = null;
try { img = fs.readFileSync(IMG_PATH); } catch (e) { console.log(`AVISO: imagem não encontrada em '${IMG_PATH}' (${e.code}). Rotas req_raw/res_raw ficarão limitadas.`); }
let sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
let imgSha = img ? sha(img) : null;

function hora() {
    let d = new Date(); let p = (n, l = 2) => String(n).padStart(l, '0');
    return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
}

function lerBody(req) {
    return new Promise((resolve) => {
        let chunks = [], fim = () => resolve(Buffer.concat(chunks));
        req.on('data', (c) => chunks.push(c)); req.on('end', fim); req.on('error', fim);
        req.on('close', () => { if (!req.complete) { fim(); } }); // CLIENTE FECHOU NO MEIO DO UPLOAD
    });
}

let serverHttp = http.createServer(async (req, res) => {
    let url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let partes = url.pathname.split('/').filter(Boolean);
    let rota = partes[0] || '';
    let reqRaw = rota === 'req_raw';
    let resRaw = rota === 'res_raw';
    let finalizado = false;
    let bodyLog = null; // TEXTO DO BODY DA REQUISIÇÃO (APENAS SE NÃO FOR RAW)
    let timers = []; // TIMERS DAS ROTAS delay (CANCELADOS NO ABORT)

    // clearConsole();

    // LOG (linha principal + headers em uma linha)
    function log(code) {
        if (finalizado) { return; } finalizado = true;
        console.log(`${hora()} - [${req.method}] (${code}) <REQ BODY RAW: ${reqRaw ? 'SIM' : 'NÃO'}> <RES BODY RAW: ${resRaw ? 'SIM' : 'NÃO'}> [${req.url}]`);
        if (!reqRaw && !resRaw) { console.log(`*** BODY:\n${bodyLog === null ? '(não lido)' : bodyLog === '' ? '(vazio)' : bodyLog}`); }
    }

    // ABORT: cliente fechou a conexão antes de terminarmos
    res.on('close', () => {
        if (res.writableFinished) { return; }
        timers.forEach(clearTimeout);
        let fase = res.headersSent ? 'DURANTE O ENVIO DO BODY' : 'ANTES DE RECEBER QUALQUER RESPOSTA';
        console.log(`\x1b[31m${hora()} - CLIENTE ABORTOU (${fase}) [${req.method}] [${req.url}]\x1b[0m`); log('ABORT');
    });
    res.on('finish', () => log(res.statusCode));

    let enviar = (code, obj) => {
        let txt = JSON.stringify(obj, null, 2);
        res.writeHead(code, { 'Content-Type': 'application/json', }); res.end(txt);
    };

    try {
        // /status/:code
        if (rota === 'status') {
            let code = parseInt(partes[1], 10) || 200;
            return enviar(code, { rota, code, });
        }

        // /delay/connect/:s -> espera antes de mandar qualquer coisa
        if (rota === 'delay' && partes[1] === 'connect') {
            let s = parseFloat(partes[2]) || 1;
            return timers.push(setTimeout(() => { if (!res.destroyed) { enviar(200, { 'rota': 'delay/connect', 'segundos': s, }); } }, s * 1000));
        }

        // /delay/response/:s -> headers na hora, body depois
        if (rota === 'delay' && partes[1] === 'response') {
            let s = parseFloat(partes[2]) || 1;
            res.writeHead(200, { 'Content-Type': 'text/plain', }); res.flushHeaders(); res.write('inicio...');
            return timers.push(setTimeout(() => { if (!res.destroyed) { res.end(' fim'); } }, s * 1000));
        }

        // /redirect/:n
        if (rota === 'redirect') {
            let n = parseInt(partes[1], 10) || 1;
            let destino = n > 1 ? `/redirect/${n - 1}` : '/echo';
            res.writeHead(302, { 'Location': destino, }); return res.end();
        }

        // /res_raw -> devolve imagem
        if (resRaw) {
            if (!img) { return enviar(500, { 'erro': 'imagem não carregada no servidor', }); }
            res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Content-Length': img.length, 'X-Image-Sha256': imgSha, }); return res.end(img);
        }

        // demais rotas leem o body
        let body = await lerBody(req);
        bodyLog = body.toString();

        // /req_raw -> valida imagem recebida
        if (reqRaw) {
            fs.writeFileSync('body_server.jpg', body);
            return enviar(200, {
                rota, 'recebidoBytes': body.length, 'sha256': sha(body),
                'esperadoBytes': img ? img.length : null, 'identico': img ? body.equals(img) : null,
                'contentType': req.headers['content-type'] || null,
            });
        }

        // /json_valido, /json_invalido, /texto
        if (rota === 'json_valido') { return enviar(200, { 'ok': true, 'valor': 123, }); }
        if (rota === 'json_invalido') { res.writeHead(200, { 'Content-Type': 'application/json', }); return res.end('{ isto nao e json valido'); }
        if (rota === 'texto') { res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', }); return res.end('texto puro'); }

        // /headers
        if (rota === 'headers') { return enviar(200, { 'headers': req.headers, }); }

        // /echo (padrão)
        let ct = req.headers['content-type'] || '';
        let parsed = null;
        if (ct.includes('application/json')) { try { parsed = JSON.parse(body.toString()); } catch { parsed = 'JSON INVÁLIDO'; } }
        else if (ct.includes('x-www-form-urlencoded')) { parsed = Object.fromEntries(new URLSearchParams(body.toString())); }
        return enviar(200, {
            'rota': rota || 'echo', 'method': req.method, 'url': req.url, 'query': Object.fromEntries(url.searchParams),
            'headers': req.headers, 'bodyBytes': body.length, 'bodyTexto': body.toString(), 'bodyParsed': parsed,
        });
    } catch (e) {
        enviar(500, { 'erro': `${e}`, });
    }
});

serverHttp.listen(PORTA, () => console.log(`Servidor de teste em http://localhost:${PORTA}`));


