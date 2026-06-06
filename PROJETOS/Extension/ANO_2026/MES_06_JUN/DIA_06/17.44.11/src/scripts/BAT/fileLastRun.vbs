rem RESOLVER ERRO DO ARQUIVO CORROMPIDO E CRIAR OUTRO
On Error Resume Next

rem COMO USAR
rem %fileLastRun% "CMD_TOGGLE" "nodeSniffer_server"

rem BIBLIOTECA NECESSARIA
Set objFSO = CreateObject("Scripting.FileSystemObject")

If WScript.Arguments.Count <= 1 Then
	arquivo = objFSO.GetFileName(WScript.ScriptFullName)
	localizacao = objFSO.GetParentFolderName(WScript.ScriptFullName)

    If WScript.Arguments.Count = 0 Then
		rem NENHUM PARAMENTRO PASSADO
		MsgBox ( Replace(  "[" & localizacao & "\" & arquivo & "]\\n\\nNENHUM PARAMETRO PASSADO"  , "\\n" , Chr(13)) )
    Else
		rem PARAMENTROS INVALIDOS
		MsgBox ( Replace(  "[" & localizacao & "\" & arquivo & "]\\n\\nPARAMETROS INVALIDOS. Exemplo:\\n" & arquivo & " " & "'MANUAL/RESTART' 'NOME_DO_PROCESSO'"  , "\\n" , Chr(13) ) )
    End If
Else
    rem DEFINIR VARIAVEIS
    Dim fsoFile, timeManual, timeReboot, rebootQtd, dif, allow, obs, strLine: runType = WScript.Arguments.Item(0): timeNow = DateDiff("s", #1/1/1970 00:00:00 AM#, Now())

    rem VERIFICAR SE O ARQUIVO EXISTE
    pathArquivo = CreateObject("WScript.Shell").ExpandEnvironmentStrings("%fileWindows%") & "\BAT\z_logs\logTime-" & WScript.Arguments.Item(1) & ".txt"
    If Not objFSO.FileExists(pathArquivo) Then
	    rem ARQUIVO EXISTE: [NAO] → DEFINIR VALORES PADROES
        timeManual = timeNow: timeReboot = timeNow: rebootQtd = 0: allow = "SIM": obs = "NUNCA_EXECUTADO"
    Else
	    rem ARQUIVO EXISTE: [SIM] → LER OS DADOS
        Set fsoFile = objFSO.OpenTextFile(pathArquivo, 1): conteudoArquivo = fsoFile.ReadAll: fsoFile.Close
        pars = Split(conteudoArquivo, "@"): timeManual = pars(3): timeReboot = pars(5): rebootQtd = pars(7)

		rem CALCULAR A DIFERENCA DE TEMPO E DETERMINAR A PERMISSAO
		If InStr(runType, "RESTART") Then
			dif = timeNow - timeReboot
			If dif > 29 Then
				allow = "SIM": obs = "RESTART_ANTIGO": timeReboot = timeNow: rebootQtd = 1
			ElseIf rebootQtd > 2 Then
				allow = "NAO": obs = "MUITOS_RESTARTS"
			Else
				allow = "SIM": obs = "POUCOS_RESTARTS": timeReboot = timeNow: rebootQtd = rebootQtd + 1
			End If
		Else
			dif = timeNow - timeManual: rebootQtd = 0
			If InStr(runType, "TOGGLE") Then
				If dif > 6 Then
					allow = "SIM": obs = "EXECUTAR": timeManual = timeNow
				Else
					allow = "NAO": obs = "MUITO_RECENTE"
				End If
			Else
					allow = "SIM": obs = "EXECUTAR_FORCADO": timeManual = timeNow
			End If
		End If
    End If
	
	rem #####################################################################
	Function escreverNoArquivo(pathArquivo, conteudoArquivo, add)
		Dim attempt, fsoFile
		rem DESATIVAR AVISO DE ERROS
		On Error GoTo 0
		For attempt = 1 To 50
			rem DESATIVAR AVISO DE ERROS TEMPORARIOS
			On Error Resume Next
			If Not objFSO.FileExists(pathArquivo) Or Not add Then
				rem ARQUIVO EXISTE: [NAO] | 'add' False LIMPAR CONTEUDO ANTIGO
				Set fsoFile = objFSO.CreateTextFile(pathArquivo, True)
			Else
				rem ARQUIVO EXISTE: [SIM] | 'add' True ADICIONAR NO ARQUIVO
				Set fsoFile = objFSO.OpenTextFile(pathArquivo, 8)
			End If
			rem ESCREVER NO ARQUIVO E FECHAR
			fsoFile.WriteLine(conteudoArquivo): fsoFile.Close
			If Err.Number = 0 Then
				rem ERRO [NAO] → SAIR DO LOOP
				Exit For
			Else
				rem ERRO [SIM] → LIMPAR ERRO ATUAL. ESPERAR x MILISSEGUNDOS E VOLTAR PARA O LOOP (ESPERAR NO MAXIMO 5 SEGUNDOS)
				Err.Clear: WScript.Sleep(100)
			End If
		Next
	End Function
	rem #####################################################################

    rem GERAR A LINHA DE TEXTO
    strLine = "atual@" & timeNow & "@manual@" & timeManual & "@reboot@" & timeReboot & "@reboot_qtd@" & rebootQtd & "@diferenca@" & dif & "@permitido@" & allow & "@obs@" & obs

	rem ESCREVER NO ARQUIVO
	escreverNoArquivo pathArquivo, strLine, False
End If

rem ENCERRAR SCRIPT
Wscript.Quit


