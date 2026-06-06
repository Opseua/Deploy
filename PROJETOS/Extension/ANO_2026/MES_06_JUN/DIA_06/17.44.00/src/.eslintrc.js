// D:\ARQUIVOS\PROJETOS\Extension\src\configs-base.js

// ************** VARIÁVEIS NÃO DECLARADAS [globais] **************
let arrGlobal = [
    // FUNÇÃO NATIVAS
    'console', 'setTimeout', 'setInterval', 'clearTimeout', 'AbortController', 'TextEncoder', 'fetch', 'prompt', 'document', 'XPathResult', 'Blob', 'URL', 'DOMParser', 'atob', 'btoa',
    'alert', 'MutationObserver', 'Event', 'clearInterval', 'KeyboardEvent', 'getComputedStyle', 'alertConsole', 'currentFile', 'NodeFilter', 'Node', 'MouseEvent', 'window', 'navigator',
    'XmlService', 'Utilities', 'TextDecoder', 'CryptoJS', 'socketManager', 'Readable', 'crypto',

    // VARIÁVEIS GLOBAIS
    'eng', 'engType', 'engName', 'letter', 'infGlobal', 'gORem', 'gOAdd', 'csf', 'gW', 'legacy', 'platforms', 'ori', 'des',
    'portStopwatch', 'firstFileCall', 'thisIgnore', 'xxx', 'isModeIncognito',

    // VARIÁVEIS DO SISTEMA
    'fileExtension', 'fileProjetos', 'fileWindows',

    // ### BIBLIOTECAS / NATIVO → CHROME
    'chrome',

    // ### BIBLIOTECAS / NATIVO → NODE
    '_WebSocketServer', '_WebSocket', '_fs', '_path', '_cheerio', '_clipboardy', '_http', '_exec', '_google', '_createHash', '_puppeteer', '_net', '_getFolderSize', 'process',
    'Buffer', '_parse', '_stackTrace', '_auth', '_sheets', '_clipboard', '_createRequire', '_axios', '_createWriteStream', '_getVideoDurationInSeconds', '_https', '_m3u8Parser', '_URL',
    '_createServer', '_createInterface', '_zlib', '_execFile', '_spawn', '_Readable', '_Server', '_io', '_socketStream', '_ioClient', 'io', 'self',

    // GLOBAL OBJECT
    'cs', 'gO', 'gOList',

    // FUNÇÕES
    'clearConsole', 'getTypeof', 'codeStop', 'rateLimiter', 'randomNumber', 'randomId', 'awaitTimeout', 'startupTime', 'importFun', 'importLibs', 'replaceVars', 'stringGet', 'fDirname',
    'fJoin', 'paramsObj', 'sleepRun', 'sleepDynamic', 'setRetRun', 'formatNumber', 'formatText',

    // ### BIBLIOTECAS / NATIVO → GOOGLE 
    'UrlFetchApp', 'Browser',

    // funções globais → [Extension]
    'api', 'chat', 'chromeActions', 'client', 'clipboard', 'commandLine', 'configStorage', 'dateHour', 'devFun', 'file', 'getPath', 'googleSheets', 'googleTranslate',
    'log', 'logConsole', 'messageSend', 'messageReceived', 'notification', 'objFilter', 'regex', 'regexE', 'tabActions', 'GPT4js', 'listenerAcionar', 'listenerMonitorar',
    'chromeActionsNew', 'taskInfTryRating', 'zachey01___gpt4free_js', 'background', 'commands', 'tryRatingComplete',
    'clientInputChrome', 'restartCode', 'indicationCheck', 'scheduleRun', 'z_backup', 'z_testElementAction', 'z_testElementActionV2', 'getPathNew', 'googleSheetsNew', 'base64',
    'taskInfReduceTryRating', 'clientsPrepare', 'clientsConnect', 'enviarMensagem', '_crypto', 'clientConnect', 'resourceImport',

    // funções globais → [ExtensionV3]
    'readFile', 'getCrc32', 'encryptDecrypt', 'reduceString', 'resourcePrepare', 'serverRun',

    // funções globais → [Sniffer]
    'ewoq', 'tryRating', 'performTask', 'correiosServer', 'targetAlert',

    // funções globais → [WebScraper]
    'apiCnpj', 'apiNire', 'awaitLoad', 'browsers', 'buttonElement', 'checkPage', 'cookiesGetSet', 'getTextElement', 'input', 'navigate', 'sendData', 'clientSearch', 'clientGetData',
    'clientInput', 'maquinaInput', 'screenshot', 'elementAction', 'elementActionV2', 'runElementAction', 'runElementActionV2', 'newAccounts', 'moveLeadsMaquinas', 'extractContentPageForAi',
    'tableHtmlToJson',

    // funções globais → [Connection]
    'html', 'logsDel', 'messageAction', 'performanceDev', 'roomParams', 'socketServerRun', 'socketClientRun',

    // funções globais → [IPTV]
    'parseM3u', 'chunksOrder', 'redeCanais', 'chunksGet', 'chunkFix', 'processChunk',
],

    // ************** VARIÁVEIS NÃO USADAS **************
    arrUnused = [
        // 'inf[A-Z0-9].+?', 'ret[A-Z0-9].+?',  // outros
        'dev1', 'dev2', 'dev3', 'dev4', 'lin', 'browser', 'tipo', 'element', 'cookies', '_stackTrace', 'nomeList', 'param1', 'param2', 'ret', 'res', 'host', 'room', 'teste', 'big', 'write',
        'msg', 'sendNtfy', 'e', 'ee', 'index', 'idx', 'value', 'index1', 'value1', 'index2', 'value2', 'index3', 'value3', 'stdout', '_',
    ],

    arrGlobalObj = {}; for (let variavel of arrGlobal) { arrGlobalObj[variavel] = 'writable'; }
export let jsConfig = [
    {
        // PASTAS OU ARQUIVOS IGNORADOS
        'ignores': [
            // '**/resources/chats/**', '**/*lipboard.js', // TODA A PASTA | PARTE DO NOME DO ARQUIVO
            '**/scripts/libs/**',
        ],
        // VARIÁVEIS GLOBAIS
        'languageOptions': { 'globals': arrGlobalObj, },

        'plugins': {
            'custom': {
                'rules': {

                    'regraA': {
                        'meta': { 'messages': { 'x': `VARIÁVEL GLOBAL '{{name}}'`, }, }, create(context) {
                            let globalSet = new Set(arrGlobal.filter(v => !['a', 'thisIgnore', 'xxx',].includes(v)));
                            let reportIfGlobal = (node, varName) => { if (globalSet.has(varName)) { context.report({ node, 'messageId': 'x', 'data': { 'name': varName, }, }); } };
                            return {
                                AssignmentExpression(node) { if (node.left.type === 'Identifier') { reportIfGlobal(node, node.left.name); } },
                                VariableDeclarator(node) { if (node.id.type === 'Identifier') { reportIfGlobal(node, node.id.name); } },
                            };
                        },
                    },

                    'regraB': {
                        'meta': { 'messages': { 'x': `NÃO USAR 'const'`, }, 'fixable': 'code', }, create(context) {
                            return {
                                VariableDeclaration(node) {
                                    if (node.kind === 'const') { context.report({ node, 'messageId': 'x', fix(fixer) { let start = node.range[0]; return fixer.replaceTextRange([start, start + 5,], 'let '); }, }); }
                                },
                            };
                        },
                    },

                },
            },
        },

        'rules': {

            // ATIVAR REGRAS PERSONALIZADAS
            'custom/regraA': 'error', 'custom/regraB': 'error',

            // ##################################################################################################################################################################

            // ********************* [CORREÇÃO AUTOMÁTICA: NÃO] ********************* 

            // [OK] === e !==    EM VEZ DE    == e !=
            'eqeqeq': 'error',

            // [OK] VARIÁVEIS NÃO USADAS E 'catchErr'
            'no-unused-vars': ['error', { 'varsIgnorePattern': `^(${arrUnused.join('|')})$`, 'argsIgnorePattern': '_', 'caughtErrors': 'none', },],

            // VARIÁVEL NÃO DEFINIDA
            'no-undef': 'error',

            // ERRO DE FUNÇÃO NO MEIO DO CÓDIGO
            'no-inner-declarations': 'off',

            // ESCAPE DO REGEX
            'no-useless-escape': 'off',

            // OBJETO VAZIO → { }
            'no-empty': 'off',

            // ESPAÇO NO REGEX
            'no-regex-spaces': 'off',

            // DIVISÃO DE COLUNAS NO REGEX
            'no-control-regex': 'off',

            // CÓDIGO APÓS O RETURN
            'no-unreachable': 'off', // off | error

            // 'true' NO WHILE
            'no-constant-condition': 'off',

            // CHAVES DUPLICADAS → { 'bar': "baz", 'bar': "qux" }
            'no-dupe-keys': 'error',

            // IF DESNECESSÁRIO
            'no-self-compare': 'error',

            // IMPORT DUPLICADO
            'no-duplicate-imports': 'error',

            // 'return' OBRIGATÓRIO NA FUNÇÃO
            // 'consistent-return': 'error',

            // VARIÁVEIS EM camelCase E NÃO snack_case
            // 'camelcase': ['error', { 'properties': 'always', },], // (IGNORAR [POR NO TOPO])   /* eslint-disable camelcase */

            // GARANTIR USO DE 'let' E NÃO 'const' (IGNORAR [POR NO TOPO])   /* eslint-disable no-restricted-syntax */
            'no-restricted-syntax': ['error', { 'selector': `VariableDeclaration[kind='const']`, 'message': `NÃO USAR 'const'`, },],

            // LINHAS MUITO LONGAS (IGNORAR [POR NO TOPO])   /* eslint-disable max-len */
            'max-len': ['error', {
                'code': 230, // TAMANHO (1920 x 1080: 222 | 1600 x 900: 230)
                'tabWidth': 4,
                //'ignoreStrings': true, // IGNORAR STRING
                'ignoreRegExpLiterals': true, // IGNORAR REGEX
                'ignoreUrls': true, // IGNORAR URL
                'ignoreTrailingComments': true,// IGNORAR COMENTÁRIO (//)
                'ignoreComments': true, // IGNORAR COMENTÁRIO (/* ALGO AQUI */ )
                'ignoreTemplateLiterals': true, // IGNORAR CRASE
            },],

            // ********************* [CORREÇÃO AUTOMÁTICA: SIM] ********************* 

            // PONTO E VÍRGULA NO FINAL
            'semi': 'error',

            // VÍRGULA NO FINAL
            'comma-dangle': ['error', { 'objects': 'always', 'arrays': 'always', 'imports': 'never', 'exports': 'never', 'functions': 'never', },],

            // 'return' DESNECESSÁRIO
            'no-useless-return': 'error',

            // REDUNDÂNCIA → let casa = true; let nova = casa ? true : false
            'no-unneeded-ternary': ['error',],

            // 'if' DESNECESSÁRIO
            'no-lonely-if': 'error',

            // REUTILIZAR VARIÁVEIS COM O MESMO NOME DA CHAVE     let key = { 'a': 'b', }; let keyNew = { 'key': key, };  →  let key = { 'a': 'b', }; let keyNew = { key, };
            'object-shorthand': 'error',

            // IF ELSE SEM CHAVES if (foo) foo++  →  if (foo) { foo++; }
            'curly': 'error',

            // ';' DESNECESSÁRIO
            'no-extra-semi': 'error',

            // CHAVES E VALORES COM ASPAS SIMPLES
            'quotes': ['error', 'single', {
                'allowTemplateLiterals': true, // IGNORAR ENTRE CRASE → let variavel = { 'chave': `NOME ${pessoa} IDADE: 1`}
                'avoidEscape': true,           // IGNORAR QUANDO INCLUIR ASPAS SIMPLES → let variavel = { 'chave': "O NOME 'ONU' É UMA SIGLA" }
            },],

            // CHAVES E VALORES COM ASPAS SIMPLES
            'quote-props': ['error', 'always',],

            // ##################################################################################################################################################################
        },
    },
];


