rem COMO USAR
rem %fileMsg% "AAA\\n\\nBBB"

If WScript.Arguments.Count = 0 Then
	rem NENHUM PARAMENTRO PASSADO | IDENTIFICAR O ARQUIVO E A LOCALIZACAO COMPLETA
	Set objFSO = CreateObject("Scripting.FileSystemObject")
	arquivo = objFSO.GetFileName(WScript.ScriptFullName)
	localizacao = objFSO.GetParentFolderName(WScript.ScriptFullName)
	MsgBox ( Replace(  "[" & localizacao & "\" & arquivo & "]\\n\\nNENHUM PARAMETRO PASSADO"  , "\\n" , Chr(13) ) )
Else
	rem PARAMENTROS PASSADOS | MOSTRAR POPUP
	MsgBox ( Replace(  Wscript.Arguments.Item(0)  , "\\n" , Chr(13) ) )
End If

rem ENCERRAR SCRIPT
Wscript.Quit


