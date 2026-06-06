// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
function clearConsole() { if ((typeof chrome !== 'undefined')) { console.clear(); } else { let p = process.stdout; p.write('\u001b[2J\u001b[0;0H'); p.write('\x1Bc'); } } let msgQtd = 0;
let runCleCon = console.log; console.log = (...a) => { runCleCon.apply(console, a); msgQtd++; if (msgQtd >= (30 * 1)) { clearConsole(); msgQtd = 0; console.log('CONSOLE LIMPO!\n'); } }; clearConsole();
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

let isChrome = typeof chrome !== 'undefined'; let pathLib = isChrome ? './scripts/libs/blowfish.js' : '../../Extension/src/scripts/libs/blowfish.mjs'; await import(pathLib);

// function encryptDecrypt(a, b, c) {
//     try {
//         let bf = new Blowfish(a, Blowfish.MODE.ECB, Blowfish.PADDING.NULL); if (c) {
//             let t = new TextEncoder().encode(b), blockSize = 8, padLen = blockSize - (t.length % blockSize), padded = new Uint8Array(t.length + padLen);
//             padded.set(t); return Array.from(new Uint8Array(bf.encode(padded.buffer))).map(byte => byte.toString(16).padStart(2, '0').toUpperCase()).join('');
//         } else {
//             let m = b.trim().match(/.{1,2}/g); if (!m) { return null; } let bytes = new Uint8Array(m.map(byte => parseInt(byte, 16))); let decrypted = new TextDecoder('utf-8')
//                 .decode(bf.decode(bytes, Blowfish.TYPE.UINT8_ARRAY)).replace(/\0+$/, ''); if (/[\x00-\x08\x0B\x0C\x0E-\x1F\uFFFD]/.test(decrypted)) { return false; } return decrypted;
//         }
//     } catch { return null; }
// };

// let password = '123', content

// content = `{ "x": "33167980" }`;
// content = encryptDecrypt(password, content, true);
// console.log(`ENCRIPTADO`); console.log(content);

// console.log('\n');

// content = encryptDecrypt(password, content, false);
// console.log(`DECRIPTADO`);
// console.log(content);

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@



import http from 'http'; import fs from 'fs/promises'; import path from 'path'; let port = 4321;
let deployFolder = process.env.fileProjetos?.replaceAll('\\', '/') || 'D:/ARQUIVOS/PROJETOS';

let server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.url === '/favicon.ico' || req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    if (req.method === 'GET') {
        let filePath, varName;
        try {
            let urlObj = new URL(req.url, `http://127.0.0.1:${port}`); varName = urlObj.searchParams.get('varName'); let urlPath = decodeURIComponent(urlObj.pathname);
            filePath = path.join(deployFolder, urlPath).replaceAll('\\', '/'); let parts = filePath.split('.'), fileType = parts.pop().toLowerCase();
            let fileBuffer = await fs.readFile(filePath); let content;

            if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp3', 'wav',].includes(fileType)) {
                let prefix = (fileType === 'mp3' || fileType === 'wav') ? 'audio' : 'image';
                content = `data:${prefix}/${fileType};base64,${fileBuffer.toString('base64')}`;
            } else {
                content = fileBuffer.toString('utf-8');
            }

            res.writeHead(200, { 'Content-Type': 'application/json', }); res.end(JSON.stringify({ 'data': content, })); console.log(`✅ ${filePath} ${varName || ''}`);

        } catch (err) {
            err = err?.message?.includes(`no such file or directory`) ? `NÃO ENCONTRADO` : err?.message; console.error(`❌ ${filePath} ${varName ? `${varName} ` : ''}${err}`);
            res.writeHead(500, { 'Content-Type': 'application/json', }); res.end(JSON.stringify({ 'msg': err, }));
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'application/json', }); res.end(JSON.stringify({ 'msg': `MÉTODO NÃO AUTORIZADO`, }));
    }
});

server.listen(port, '127.0.0.1', () => {
    console.log(`🚀 Servidor de recursos rodando em http://127.0.0.1:${port}`);
});










// import http from 'http'; import fs from 'fs/promises'; let port = 4321;

// let server = http.createServer(async (req, res) => {
//     res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//     if (req.url === '/favicon.ico' || req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
//     if (req.method === 'POST' && req.url === '/resources') {
//         let body = ''; req.on('data', chunk => { body += chunk.toString(); });
//         req.on('end', async () => {
//             let filePath, varName;
//             try {
//                 let content, bodyOk = JSON.parse(body); let { fileType, } = bodyOk; filePath = bodyOk.filePath; filePath = filePath.replace('!fileProjetos!', process.env.fileProjetos).replaceAll('\\', '/');
//                 varName = bodyOk.varName; let fileBuffer = await fs.readFile(filePath);

//                 if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'mp3', 'wav',].includes(fileType)) {
//                     let prefix = (fileType === 'mp3' || fileType === 'wav') ? 'audio' : 'image';
//                     content = `data:${prefix}/${fileType};base64,${fileBuffer.toString('base64')}`;
//                 } else {
//                     content = fileBuffer.toString('utf-8');
//                 }

//                 res.writeHead(200, { 'Content-Type': 'application/json', }); res.end(JSON.stringify({ 'data': content, }));
//                 console.log(`✅ ${filePath} ${varName || ''}`);

//             } catch (err) {
//                 err = err?.message?.includes(`no such file or directory`) ? `NÃO ENCONTRADO` : err?.message; console.error(`❌ ${filePath} ${varName ? `${varName} ` : ''}${err}`);
//                 res.writeHead(500, { 'Content-Type': 'application/json', }); res.end(JSON.stringify({ 'msg': err, }));
//             }
//         });
//     } else {
//         res.writeHead(500, { 'Content-Type': 'application/json', }); res.end(JSON.stringify({ 'msg': `MÉTODO NÃO AUTORIZADO`, }));
//     }
// });

// server.listen(port, '127.0.0.1', () => {
//     console.log(`🚀 Servidor de recursos rodando em http://127.0.0.1:${port}/resources`);
// });
