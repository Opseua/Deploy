// testClient.js — rode com: node testClient.js SALA_X
import { wsconnect } from '@nats-io/nats-core'; await import('./client.js'); await import('./message.js');
let room = 'SALA_TESTE', nc;

await globalThis.clientV2.connect({ wsconnect, 'servers': `ws://127.0.0.1:8888`, 'label': 'CLI', room, 'onConnect': (c) => { nc = c; }, });

// escuta mensagens novas da sala
globalThis.messageV2.received({
    nc, room, 'onMessage': (data) => {
        console.log(`📩 nova mensagem:`, data.message);
        if (!(data.maxAwait > 0)) {
            // MENSAGEM NOVA [PRECISA DE RESPOSTA: NÃO]
            // VOU FAZER ALGO AQUI DEPOIS
        } else {
            // MENSAGEM NOVA [PRECISA DE RESPOSTA: SIM]
            globalThis.messageV2.send({ nc, room, 'idMessage': data.idMessage, 'message': `A resposta é 2!`, });
            console.log(`↩️  respondido`);
        }
    },
});

// manda uma mensagem nova a cada 5s, esperando resposta por até 10s
if (process.argv[2] === '1') {
    setTimeout(async () => {
        let result = await globalThis.messageV2.send({ nc, room, 'maxAwait': 10, 'message': `Quanto é 1+1?`, });
        console.log(`📤 resultado do envio:`, result);
    }, (5 * (1000)));

    setTimeout(async () => {
        let result = await globalThis.messageV2.send({ nc, room, 'maxAwaitAAA': 10, 'message': `Bom dia!`, });
        console.log(`📤 resultado do envio:`, result);
    }, (7 * (1000)));
}






let clientOk;

async function clientRun() {

    // FAZER A CONEXÃO DO CLIENTE NA(s) SALA(s)
    clientOk = clientCreate({
        'servers': [
            { 'label': 'LOC', 'room': 'CLIENT_A', },
            { 'label': 'WEB', 'room': 'CLIENT_A', 'host': '149.248.196.87', },
            { 'label': 'DIR', 'room': 'CLIENT_A', 'host': 'opseua.ddns.net', },
            { 'label': 'P2P', 'room': 'CLIENT_A', 'port': '4888', },
        ],
    });
    await clientOk.connection(); clientOk.messageReceived = messageReceived;

    async function messageReceived({ obj, }) {
        let { label, identification, maxAwait, message, } = obj.data;
        console.log(`⬇️ [${label}] (${identification})`, message);

        if (!(maxAwait > 0)) {
            // MENSAGEM RECEBIDA: PRECISA DE RESPOSTA [NÃO]

        } else {
            // MENSAGEM RECEBIDA: PRECISA DE RESPOSTA [SIM]
            if (!isChrome) { return; }
            let result = await messageSend({
                obj,
                'message': 'A resposta é 2! OK',
                'x': 'x',
            });
            console.log('⬆️', result);
        }
    }

    if (!isChrome) {
        setTimeout(async () => {
            let result = await messageSend({
                'label': 'FAST',
                'destination': 'CHROME',
                // 'destination': 'POSTMAN',
                'maxAwait': 5,
                'message': 'Quanto é 1+1? OK',
                'x': 'xx',
            });
            console.log('💬', result);
        }, 3000);
    }

}
clientRun();