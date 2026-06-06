@chcp 65001 & @echo off & setlocal enabledelayedexpansion
set "local=%~dp0" & set "local=!local:~0,-1!" & set "letra=!local:~0,1!" & set "arquivo=%~n0" & set "argString=%*" & set "arg1=%~1" & set "arg2=%~2" & set "arg3=%~3" & set "arg4=%~4" & set "arg5=%~5" & set "arg6=%~6"

rem AVISO PARA USAR O ATALHO COM PARAMENTROS
if "!arg1!" == "" ( !3_BACKGROUND! /NOCONSOLE "cmd.exe /c !fileMsg! "[!local!\!arquivo!.bat]\\n\\nNENHUM PARAMETRO PASSADO"" & exit /b )
rem NET SESSION > nul 2>&1 & if !errorlevel! neq 0 ( set "adm=NAO" ) else ( set "adm=SIM" )
rem echo WScript.Echo(new Date().getTime()); > !temp!\time.js & for /f "delims=" %%a in ('cscript //nologo !temp!\time.js') do set "tNow=%%a" & set "tNow=!tNow:~0,-3!" & set "dia=!DATE:~0,2!" & set "mes=!DATE:~3,2!"
rem ********************************************************************************************************************************************************

rem VARIAVEIS 
set "ret2=AAA" & set "actionRun=ERR" & set "executed=EXIT" & set "project=!arg1!" & set "serverFile=!arg2!" & set "action=!arg3!" & set "mode=!arg4!" & set "old=!arg5!" & set "engine=!arg6!"
if "!mode!" == "RESTART_STOP" ( goto CODE_EXIT )
if not "!mode!" == "LEGACY" ( set "restartOnStop=RESTART" ) else ( set "restartOnStop=RESTART_STOP" )

rem DEFINIR programExe E programExePath
if "!engine!" == "node" ( set "fpA=js" ) else ( if "!engine!" == "python" ( set "fpA=py" ) )
set "programExe=!engine!-!project!-!serverFile!" & set "serverFile=!fileProjetos!\!project!\src\!serverFile!.!fpA!" & set "programExePath=!fileWindows!\PORTABLE-!engine!\!programExe!.exe"

rem CHECAR SE O programExe EXISTE
if not exist "!programExePath!" ( !3_BACKGROUND! /NOCONSOLE "cmd.exe /c !fileMsg! "[!local!\!arquivo!.bat]\\n\\nPROGRAM EXE NAO EXISTE\\n'!programExePath!'"" & exit /b )

rem DEFINIR SE ESTA RODANDO
if "!old!" == "" ( !3_BACKGROUND! /NOCONSOLE "cmd.exe /c !fileMsg! "[!local!\!arquivo!.bat]\\n\\nTRUE ou FALSE NAO INFORMADO"" & exit /b )

rem rem DEFINIR ACAO → RODANDO [NAO] | RODANDO [SIM]
if "!old!" == "FALSE" ( if not "!action!" == "!action:TOGGLE=!" ( set "actionRun=ON" ) else ( if not "!action!" == "!action:ON=!" ( set "actionRun=ON" ) ) )
if "!old!" == "TRUE" ( if not "!action!" == "!action:TOGGLE=!" ( set "actionRun=OFF" ) else ( if not "!action!" == "!action:OFF=!" ( set "actionRun=OFF" ) ) )

rem ACTION → NAO DEFINIDA (ENCERRAR)
if "!actionRun!" == "!actionRun:O=!" ( goto CODE_EXIT )

rem CHECAR A ULTIMA EXECUCAO (NAO SUBIR O 'findstr'!!!)
!fileLastRun! "!mode!-!action!" "!programExe!"
findstr /m "SIM" "!fileWindows!\BAT\z_logs\logTime-!programExe!.txt" > nul
if %errorlevel%==0 ( goto CODE_CONTINUE )
set "executed=NAO"

rem SAIR DO CODIGO SE DER ALGUM ERRO
:CODE_EXIT
!fileLog! "[PROCESS] = [exe: !executed! - old: !old! - call: !mode! - act: !action! - run: !actionRun!] # !programExe!" & exit /b
:CODE_CONTINUE

rem ### → ACAO | PARAR [FORCADO] PILHA DE PROCESSOS (NAO SUBIR O 'taskkill'!!!)
if "!actionRun!" == "OFF" (
	if "!sistemaTipo!" == "OUTROS" ( set "admName=Administrador" ) else ( set "admName=Administrator" )
	taskkill /F /FI "WINDOWTITLE eq !admName!:  !programExe!-CMD" /T
)

rem ### → ACAO | INICIAR
if "!actionRun!" == "ON" (
	rem ALTERAR LOCAL DO TERMINAL
	cd /d !fileProjetos!\!project!

	rem → "(project) WebScraper" "(serverFile) serverC6_New2" "(restartOnStop) RESTART/RESTART_STOP" "(mode) KEEP" "(ret) TRUE" "(engine) python"
	set "comm0=!fileExtension!\src\scripts\BAT\process.bat "!arg1!" "!arg2!" "!arg3!" "!restartOnStop!" "!arg5!" "!arg6!"" & set "comm1=cmd.exe /c title !programExe!-CMD"
	set "comm2=!programExePath! !serverFile!" & set "comm3=!3_BACKGROUND! /NOCONSOLE /DELAY=" & set "comm4=!programExe!-WIND"
	if not "!action!" == "!action:HIDE=!" (
		rem [HIDE] OBRIGATORIO O '/RUNAS'!!!
		!3_BACKGROUND! /NOCONSOLE /RUNAS "!comm1!& !comm2! & !comm3!2 "cmd.exe /c echo a" & call !comm0!"
	) else (
		rem [VIEW] OBRIGATORIO O '/RUNAS'!!! | JANELA DO LOG POSICIONAR
		!3_BACKGROUND! /NOCONSOLE /RUNAS "!comm1!& start "!comm4!" /WAIT !comm2! & !comm3!2 "cmd.exe /c echo a" & call !comm0!" "!comm3!4 "cmd.exe /c !fileSetSize! !comm4! "!action!" EXATO"
	)
)

rem LOG E RETORNAR O RESULTADO
!fileLog! "[PROCESS] = [exe: SIM - old: !old! - call: !mode! - act: !action! - run: !actionRun!] # !programExe!"

rem BAT2 - DEFINIR O VALOR E RETORNAR (USAR '%' NAS VARIAVEIS!!!)
endlocal & set "ret2=%old%" & setlocal enabledelayedexpansion & exit /b


