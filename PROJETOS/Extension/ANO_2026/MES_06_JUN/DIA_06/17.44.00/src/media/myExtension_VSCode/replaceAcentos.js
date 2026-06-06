let vscode = require('vscode');

async function replaceAcentos() {

    let editor = vscode.window.activeTextEditor;
    if (!editor) { return; }

    let sel = editor.selection;
    if (sel.isEmpty) {
        vscode.window.showInformationMessage('Selecione o texto que quer normalizar.');
        return;
    }

    let doc = editor.document;
    let texto = doc.getText(sel);

    let t = texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    await editor.edit(edit => {
        edit.replace(sel, t);
    });
}

module.exports = replaceAcentos;
