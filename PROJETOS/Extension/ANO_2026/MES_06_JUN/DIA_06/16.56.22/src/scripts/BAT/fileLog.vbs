rem COMO USAR
rem %fileLog% "ISSO SERA ESCRITO"

rem BIBLIOTECA NECESSARIA
Set objFSO = CreateObject("Scripting.FileSystemObject")

If WScript.Arguments.Count = 0 Then
	rem NENHUM PARAMENTRO PASSADO
	MsgBox ( Replace(  "[" & objFSO.GetParentFolderName(WScript.ScriptFullName) & "\" & objFSO.GetFileName(WScript.ScriptFullName) & "]\\n\\nNENHUM PARAMETRO PASSADO"  , "\\n" , Chr(13) ) )
Else
	rem PARAMENTROS PASSADOS
    rem  DEFININDO A DATA E HORA ATUAL
    dataAtual = Now
	horaAmPm = ""
    dia = Right("00" & Day(dataAtual), 2)
    mes = Right("00" & Month(dataAtual), 2)
    ano = Year(dataAtual)
    hora = Right("00" & Hour(dataAtual), 2)
    minuto = Right("00" & Minute(dataAtual), 2)
    segundo = Right("00" & Second(dataAtual), 2)
    milissegundo = Right("000" & Round((Timer - Int(Timer)) * 1000), 3)
	monNam = UCase(Left(MonthName(Month(dataAtual)), 3))
	
	rem #####################################################################
	rem CONVERTER PARA O FORMATO '12 HORAS' (SE NECESSARIO)
	Function HoraPadrao12(hora)
		If hora < 13 Then
			horaAmPm = " AM"
		Else
			horaAmPm = " PM"
			hora = hora - 12
		End If
		HoraPadrao12 = hora
	End Function
	rem hora = HoraPadrao12(hora)
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
	
	hora = Right("00" & hora, 2)
	completaData = "z_ANO_" & ano & "-MES_" & mes & "_" & monNam & "-DIA_" & dia
    completaHora = hora & ":" & minuto & ":" & segundo & "." & milissegundo & horaAmPm

	pathArquivo = CreateObject("WScript.Shell").ExpandEnvironmentStrings("%fileWindows%") & "\BAT\z_logs\" & completaData & ".txt"
	
	rem GERAR A LINHA DE TEXTO
    strLine = completaHora & " - " & Wscript.Arguments.Item(0)
	
	rem ESCREVER NO ARQUIVO
	escreverNoArquivo pathArquivo, strLine, True
End If

rem ENCERRAR SCRIPT
Wscript.Quit


