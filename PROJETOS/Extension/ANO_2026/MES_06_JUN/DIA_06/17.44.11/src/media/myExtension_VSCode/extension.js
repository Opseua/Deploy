let vscode = require('vscode');

let replaceAspas = require('./replaceAspas');
let replaceAcentos = require('./replaceAcentos');

function activate(context) {

    let c1 = vscode.commands.registerCommand('vscode_extension.replaceAspas', replaceAspas);
    let c2 = vscode.commands.registerCommand('vscode_extension.replaceAcentos', replaceAcentos);

    context.subscriptions.push(c1, c2, c3);
}

module.exports = { activate, };
