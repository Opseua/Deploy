import { createSocket as _createSocket } from 'dgram';

let PUBLIC_IP = process.env.SERVER_IP;
let PRIMARY_PORT = 3478; let ALT_PORT = 3479;

let BINDING_REQUEST = 0x0001; let BINDING_RESPONSE = 0x0101; let ATTR_MAPPED_ADDRESS = 0x0001; let ATTR_XOR_MAPPED_ADDRESS = 0x0020; let ATTR_OTHER_ADDRESS = 0x802c;
let ATTR_SOFTWARE = 0x8022; let MAGIC_COOKIE = 0x2112A442; let SOFTWARE_STR = Buffer.from('frpc-stun-node');

function parseIP(str) { return str.split('.').map(Number); }

function buildBindingResponse(transactionId, clientIP, clientPort, otherPort) {
  let ipBytes = parseIP(clientIP); let serverIPBytes = parseIP(PUBLIC_IP); let attrs = [];

  // XOR-MAPPED-ADDRESS
  let xorPort = clientPort ^ (MAGIC_COOKIE >>> 16);
  let xorIP = [
    ipBytes[0] ^ ((MAGIC_COOKIE >>> 24) & 0xff), ipBytes[1] ^ ((MAGIC_COOKIE >>> 16) & 0xff), ipBytes[2] ^ ((MAGIC_COOKIE >>> 8) & 0xff), ipBytes[3] ^ ((MAGIC_COOKIE) & 0xff),
  ];
  let xma = Buffer.alloc(8); xma.writeUInt8(0, 0); xma.writeUInt8(0x01, 1); xma.writeUInt16BE(xorPort, 2); xma.writeUInt8(xorIP[0], 4); xma.writeUInt8(xorIP[1], 5);
  xma.writeUInt8(xorIP[2], 6); xma.writeUInt8(xorIP[3], 7); attrs.push({ 'type': ATTR_XOR_MAPPED_ADDRESS, 'value': xma, });

  // MAPPED-ADDRESS
  let ma = Buffer.alloc(8); ma.writeUInt8(0, 0); ma.writeUInt8(0x01, 1);
  ma.writeUInt16BE(clientPort, 2); ma.writeUInt8(ipBytes[0], 4); ma.writeUInt8(ipBytes[1], 5); ma.writeUInt8(ipBytes[2], 6); ma.writeUInt8(ipBytes[3], 7);
  attrs.push({ 'type': ATTR_MAPPED_ADDRESS, 'value': ma, });

  // OTHER-ADDRESS — mesmo IP, porta alternativa
  let oa = Buffer.alloc(8); oa.writeUInt8(0, 0); oa.writeUInt8(0x01, 1); oa.writeUInt16BE(otherPort, 2);
  oa.writeUInt8(serverIPBytes[0], 4); oa.writeUInt8(serverIPBytes[1], 5); oa.writeUInt8(serverIPBytes[2], 6); oa.writeUInt8(serverIPBytes[3], 7);
  attrs.push({ 'type': ATTR_OTHER_ADDRESS, 'value': oa, }); attrs.push({ 'type': ATTR_SOFTWARE, 'value': SOFTWARE_STR, });

  let attrLen = 0; for (let a of attrs) { attrLen += 4 + Math.ceil(a.value.length / 4) * 4; }
  let msg = Buffer.alloc(20 + attrLen); msg.writeUInt16BE(BINDING_RESPONSE, 0); msg.writeUInt16BE(attrLen, 2); msg.writeUInt32BE(MAGIC_COOKIE, 4); transactionId.copy(msg, 8, 0, 12);

  let offset = 20;
  for (let a of attrs) {
    let padded = Math.ceil(a.value.length / 4) * 4; msg.writeUInt16BE(a.type, offset); msg.writeUInt16BE(a.value.length, offset + 2); a.value.copy(msg, offset + 4); offset += 4 + padded;
  }
  return msg;
}

function createSocket(listenPort, otherPort) {
  let sock = _createSocket('udp4');
  sock.on('error', (err) => console.error(`[${listenPort}] Error:`, err.message));
  sock.on('message', (msg, rinfo) => {
    if (msg.length < 20) { return; } if (msg.readUInt32BE(4) !== MAGIC_COOKIE) { return; } if (msg.readUInt16BE(0) !== BINDING_REQUEST) { return; }
    let txId = msg.slice(8, 20); let res = buildBindingResponse(txId, rinfo.address, rinfo.port, otherPort); sock.send(res, 0, res.length, rinfo.port, rinfo.address);
    // console.log(`[${listenPort}] ${rinfo.address}:${rinfo.port} → other ${PUBLIC_IP}:${otherPort}`);
  });
  sock.bind(listenPort, process.env.FLY_APP_NAME ? 'fly-global-services' : '0.0.0.0', () => { });
}

createSocket(PRIMARY_PORT, ALT_PORT); createSocket(ALT_PORT, PRIMARY_PORT);
console.log(`STUN server | IP: ${PUBLIC_IP} | Ports: ${PRIMARY_PORT} / ${ALT_PORT}`);


