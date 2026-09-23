/* eslint-disable custom/regraA */

// clientRun.js
await import('./clientV2.js');

async function clientRun() {

    // NATS: CONECTAR
    let client = await clientCreate({
        'identification': process.env.PROMPT ? `NODE_CMD` : `NODE_PWS`, 'servers': [
            { 'label': 'LOC', }, // { 'label': 'WEB', 'host': '149.248.223.192', },
        ],
    }); globalThis['client'] = client; client.messageReceived = messageReceived; await new Promise(r => setTimeout(r, 500)); console.log('');

    // NATS: MONITORAR MENSAGENS RECEBIDAS
    async function messageReceived({ obj, objMsg, }) {
        let { label, maxAwait, identification, destination, message, } = objMsg; console.log(`___RECEBIDA___ [${label}] <${maxAwait}> (EM: ${identification} | DE: ${destination}) |`, message, '\n'); message = undefined;

        // PROCESSAR MENSAGEM
        message = '1 + 1 = 2!';

        // ---------------------------------------------------------- ENVIAR RESPOSTA (SE NECESSÁRIO) ----------------------------------------------------------
        if (maxAwait > 0 && message !== undefined) {
            let retMessageSend = await messageSend({ obj, message, }); console.log('___FIM__get___', retMessageSend, '\n');
        }
    }

    // ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
    if (!isChrome && process.env.PROMPT) {
        // await new Promise(r => setTimeout(r, 100)); await new Promise(r => setTimeout(r, 3000));
        // let result = await messageSend({
        //     // 'label': 'WEB',
        //     'maxAwait': 5,
        //     'destination': 'NODE_PWS',
        //     'message': 'Quanto é 1 + 1?',
        // }); console.log('___FIM_send___', result, '\n');
    }
    // ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️

}

globalThis['clientRun'] = clientRun;

if (!isChrome) {
    clientRun();
}


