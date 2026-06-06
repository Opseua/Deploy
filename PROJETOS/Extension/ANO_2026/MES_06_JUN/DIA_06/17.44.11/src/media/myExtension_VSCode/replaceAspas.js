let vscode = require('vscode');

async function replaceAspas() {

    let editor = vscode.window.activeTextEditor;
    if (!editor) { return; }

    let sel = editor.selection;
    if (sel.isEmpty) {
        vscode.window.showInformationMessage('Selecione o objeto que quer converter para JSON.');
        return;
    }

    let doc = editor.document;
    let texto = doc.getText(sel);

    let t = texto.replace(/;\s*$/, '').trim();
    t = t.replace(/,(\s*[}\]])/g, '$1');

    t = t.replace(/'([^']*)'/g, (_, inner) => {
        let safe = inner.replace(/"/g, '\\"');
        return '"' + safe + '"';
    });

    try {
        let obj = JSON.parse(t);
        let pretty = JSON.stringify(obj, null, 4);

        await editor.edit(edit => {
            edit.replace(sel, pretty);
        });

        return;
    } catch (err) { }

    let escolha = await vscode.window.showWarningMessage(
        'Não foi possível converter estritamente para JSON. Deseja tentar avaliar o trecho como JavaScript (pode executar código)?',
        'Não', 'Sim - avaliar'
    );

    if (escolha !== 'Sim - avaliar') {
        vscode.window.showErrorMessage('Conversão cancelada. Corrija o objeto ou selecione apenas o literal JSON.');
        return;
    }

    try {
        let fn = new Function('return (' + t + ');');
        let obj = fn();
        let pretty = JSON.stringify(obj, null, 4);

        await editor.edit(edit => {
            edit.replace(sel, pretty);
        });

    } catch (err) {
        vscode.window.showErrorMessage('Ainda não foi possível converter o trecho selecionado: ' + String(err.message));
    }

}

module.exports = replaceAspas;
