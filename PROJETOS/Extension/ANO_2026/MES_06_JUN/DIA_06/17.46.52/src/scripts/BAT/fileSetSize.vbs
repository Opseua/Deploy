rem COMO USAR
rem %fileSetSize% "stem Inform" "890 50 600 400" (BUSCANDO POR PARTE DO NOME) [PARAMENTROS: 3]
rem %fileSetSize% "System Informer" "890 50 600 400" "EXATO" (BUSCANDO PELO NOME EXATO) [PARAMENTROS: 4]

rem ARGUMENTOS QTD | BIBLIOTECA NECESSARIA
argsQtd = WScript.Arguments.Count: Set objFSO = CreateObject("Scripting.FileSystemObject")

If argsQtd <= 1 Then
	arquivo = objFSO.GetFileName(WScript.ScriptFullName): localizacao = objFSO.GetParentFolderName(WScript.ScriptFullName)
	If argsQtd = 0 Then
		rem NENHUM PARAMENTRO PASSADO
		MsgBox ( Replace(  "[" & localizacao & "\" & arquivo & "]\\n\\nNENHUM PARAMETRO PASSADO"  , "\\n" , Chr(13)) )
	Else
		rem PARAMETROS INVALIDOS
		MsgBox ( Replace(  "[" & localizacao & "\" & arquivo & "]\\n\\nPARAMETROS INVALIDOS. Exemplo:\\n" & arquivo & " " & "'TITULO_DA_JANELA' '15 65 500 300'"  , "\\n", Chr(13) ) )
	End If
Else
	rem POSICIONAMENTOS
	windowResize = WScript.Arguments.Item(1)
	If InStr(objFSO.GetParentFolderName(WScript.ScriptFullName), "D:\") Then
		rem OPSEUA
		If InStr(windowResize, "WINTP1_") Then
			windowResize = "15 65 480 300"
		ElseIf InStr(windowResize, "WINTP2_") Then
			windowResize = "15 380 480 300"
		ElseIf InStr(windowResize, "WINTP3_") Then
			windowResize = "15 695 480 300"
		ElseIf InStr(windowResize, "WINTP4_") Then
			windowResize = "490 65 480 300"
		ElseIf InStr(windowResize, "WINTP5_") Then
			windowResize = "490 380 480 300"
		ElseIf InStr(windowResize, "WINTP6_") Then
			windowResize = "490 695 480 300"
		ElseIf InStr(windowResize, "WINTP7_") Then
			windowResize = "965 65 480 300"
		ElseIf InStr(windowResize, "WINTP8_") Then
			windowResize = "965 380 480 300"
		ElseIf InStr(windowResize, "WINTP9_") Then
			windowResize = "965 695 480 300"
		ElseIf InStr(windowResize, "WINTP10_") Then
			windowResize = "1440 65 480 300"
		ElseIf InStr(windowResize, "WINTP11_") Then
			windowResize = "1440 380 480 300"
		ElseIf InStr(windowResize, "WINTP12_") Then
			windowResize = "1440 695 480 300"
		End If
	Else
		rem SERVIDORES
		If InStr(windowResize, "WINTP1_") Then
			windowResize = "15 50 410 300"
		ElseIf InStr(windowResize, "WINTP2_") Then
			windowResize = "15 350 410 300"
		ElseIf InStr(windowResize, "WINTP3_") Then
			windowResize = "15 650 410 300"
		ElseIf InStr(windowResize, "WINTP4_") Then
			windowResize = "420 50 410 300"
		ElseIf InStr(windowResize, "WINTP5_") Then
			windowResize = "420 350 410 300"
		ElseIf InStr(windowResize, "WINTP6_") Then
			windowResize = "420 650 410 300"
		ElseIf InStr(windowResize, "WINTP7_") Then
			windowResize = "825 50 410 300"
		ElseIf InStr(windowResize, "WINTP8_") Then
			windowResize = "825 350 410 300"
		ElseIf InStr(windowResize, "WINTP9_") Then
			windowResize = "825 650 410 300"
		ElseIf InStr(windowResize, "WINTP10_") Then
			windowResize = "1230 50 410 300"
		ElseIf InStr(windowResize, "WINTP11_") Then
			windowResize = "1230 350 410 300"
		ElseIf InStr(windowResize, "WINTP12_") Then
			windowResize = "1230 650 410 300"
		End If
	End If
	
	rem BIBLIOTECAS VBS | (BUSCANDO POR PARTE DO NOME) | (BUSCANDO PELO NOME EXATO)
	Set Shell = CreateObject("Shell.Application"): Set WshShell = CreateObject("WScript.Shell"): nircmd = WshShell.ExpandEnvironmentStrings("%nircmd%"): If argsQtd = 2 Then: nirPar = "ititle": Else: nirPar = "title": End If

	rem POSICIONAR JANELA | ESPERAR POSICIONAMENTO SER CONCLUIDO
	comm = "win setsize" & " " & nirPar & " " & """" & WScript.Arguments.Item(0) & """" & " " & windowResize: Shell.ShellExecute nircmd, comm, , "runas", 0: WScript.Sleep 1000
	
	rem ESPERAR E ATIVAR JANELA (PARA O CHROME NAO FICAR NA FRENTE)
	Shell.ShellExecute "cmd", "/c" & " " & nircmd & " " & "win min ititle" & " " & "-WIND" & " " & "&" & " " & nircmd & " " & "win normal ititle" & " " & "-WIND", , "runas", 0
End If

rem ENCERRAR SCRIPT
Wscript.Quit


