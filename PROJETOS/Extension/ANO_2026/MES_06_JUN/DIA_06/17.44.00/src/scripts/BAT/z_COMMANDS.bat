@chcp 65001 & @echo off & setlocal enabledelayedexpansion
set "local=%~dp0" & set "local=!local:~0,-1!" & set "letra=!local:~0,1!" & set "arquivo=%~n0" & set "argString=%*" & set "arg1=%~1"

rem AVISO PARA USAR O ATALHO COM PARAMENTROS
if "!arg1!" == "" ( !3_BACKGROUND! /NOCONSOLE "cmd.exe /c !fileMsg! "[!local!\!arquivo!.bat]\\n\\nNENHUM PARAMETRO PASSADO"" & exit )
rem NET SESSION > nul 2>&1 & if !errorlevel! neq 0 ( set "adm=NAO" ) else ( set "adm=SIM" )
rem echo WScript.Echo(new Date().getTime()); > !temp!\time.js & for /f "delims=" %%a in ('cscript //nologo !temp!\time.js') do set "tNow=%%a" & set "tNow=!tNow:~0,-3!" & set "dia=!DATE:~0,2!" & set "mes=!DATE:~3,2!"
rem ********************************************************************************************************************************************************

rem CHECAR A ULTIMA EXECUCAO (NAO SUBIR O 'findstr'!!!)
!fileLastRun! "TOGGLE" "z_COMMANDS"
findstr /m "SIM" "!fileWindows!\BAT\z_logs\logTime-z_COMMANDS.txt" > nul
if not %errorlevel%==0 ( exit )

rem REGISTRAR GATILHO
!fileLog! "[COMMANDS] = [### INICIOU ###] (P: !arg1!)"

rem ****************************** IDENTIFICAR O DEVMASTER PELO CONFIG (NAO SUBIR!!!) ***************************************************************
set "devMaster=#" & set "search=    master: " & set "replace=" & set contador=0
for /f "usebackq delims=" %%a in ("!fileExtension!\src\master.json") do ( 
	set "conteudo=%%a"
	set "conteudo=!conteudo:"=!"
	if not "!conteudo!" == "!conteudo:master:=!" ( set "devMaster=!conteudo!" & goto DEVMASTER_ENCONTRADO )
)
!3_BACKGROUND! /NOCONSOLE "cmd.exe /c !fileMsg! "[!local!\!arquivo!.bat]\\nDEVMASTER NAO ENCONTRADO!"" & exit
:DEVMASTER_ENCONTRADO
set "result=!devMaster:%search%=%replace%!" & set "result=!result:,=%replace%!" & set "devMaster=!result!"
rem ********************************************************************************************************************************************************

rem PROJETOS
set "action=!arg1!" & set "atalho=ON_VIEW" & set "projectsNonDefault=;" & set "toOff=;" & set "toOn=;"

set "projectsAws=node-Connection-server"
set "projectsEstrelar=node-Connection-server;node-WebScraper-serverC6;node-WebScraper-serverC6_New2"
set "projectsEstrelarMarcos=node-Connection-server"
set "projectsEstrelarThayna=node-Connection-server"
set "projectsOpseua=node-Connection-server" & set "projectsNonDefaultOpseua=node-Sniffer-server"

if "!devMaster!" == "AWS" ( set "projects=!projectsAws!" & goto PROJETOS_ENCONTRADO )
if "!devMaster!" == "ESTRELAR" ( set "projects=!projectsEstrelar!" & goto PROJETOS_ENCONTRADO )
if "!devMaster!" == "ESTRELAR_MARCOS" ( set "projects=!projectsEstrelarMarcos!" & set "atalho=ON_HIDE" & goto PROJETOS_ENCONTRADO )
if "!devMaster!" == "ESTRELAR_THAYNA" ( set "projects=!projectsEstrelarThayna!" & set "atalho=ON_HIDE" & goto PROJETOS_ENCONTRADO )
if "!devMaster!" == "OPSEUA" ( set "projectsNonDefault=!projectsNonDefaultOpseua!" & set "projects=!projectsOpseua!;!projectsNonDefault!" & set "atalho=ON_HIDE" & goto PROJETOS_ENCONTRADO )

!3_BACKGROUND! /NOCONSOLE "cmd.exe /c !fileMsg! "[!local!\!arquivo!.bat]\\nNENHUM PROJETO PARA ESSE PC!"" & exit
:PROJETOS_ENCONTRADO

rem ********************************************************************************************************************************************************

rem REMOVER DUPLICATAS (SEPARADOS POR ';') [PYTHON] | REMOVER CARACTERES DESNECESSARIOS '#;' E ';#' [NAO APAGAR!!!]
set "varOk=#;"
for %%a in ("%projects:;=";"%") do (
	if not "%%a" == """" (
		set "is_duplicate="
		if not "!varOk!" == "!varOk:;%%~a;=!" ( set "is_duplicate=1" ) 
		if not defined is_duplicate ( set "varOk=!varOk!%%~a;" )
	) 
)
set "varOk=!varOk:#;=!" & set "varOk=!varOk!#" & set "varOk=!varOk:;#=!" & set "projects=!varOk!"

rem INTERAR SOBRE OS PROJETOS
for %%p in ("%projects:;=";"%") do (
    if not "%%~p"=="" (
        rem VERIFICAR SE ESTA EM EXECUCAO
		tasklist /fi "ImageName eq %%~p.exe" /fo csv 2> nul | find /I "%%~p.exe" > nul
		if "!errorlevel!" == "0" ( set "estado=ON" ) else ( set "estado=OFF" )
        rem RODANDO: SIM
        if "!estado!"=="ON" (
            set "toOff=!toOff!%%~p;"
            if not "!action!"=="!action:_REST=!" ( set "toOn=!toOn!%%~p;" )			
        )
        rem RODANDO: NAO
        if "!estado!"=="OFF" ( if not "!action!"=="!action:_RESTART_=!" ( if "!projectsNonDefault!"=="!projectsNonDefault:%%~p=!" ( set "toOn=!toOn!%%~p;" ) ) )
    )
)

rem TESTES (NAO APAGAR!!!)
rem echo .>!letra!:\AAA.txt & echo OFF: !toOff!>>!letra!:\AAA.txt & echo ON: !toOn!>>!letra!:\AAA.txt

REM INVERTER PROJETOS
if "!toOff!"=="!toOff:-=!" ( goto PULAR-ON_OFF )
:EXTRAIR_TOKEN-SIM
for /F "tokens=1* delims=;" %%a in ("!toOff!") do (
    if "%%a" neq "" ( set /a contador+=1 & set "token!contador!=%%a" )
    set "toOff=%%b"
)
if defined toOff if not "!toOff!"=="" goto EXTRAIR_TOKEN-SIM

rem ON → OFF
for /L %%i in (!contador!,-1,1) do (
	for /f "tokens=1,2,3 delims=-" %%x in ("!token%%i!") do (
		rem echo . "!fileProjetos!\%%~y\src\z_OUTROS\%%~z.ahk" "OFF" "TRUE">>!letra!:\AAA.txt
		"!fileProjetos!\%%~y\src\z_OUTROS\%%~z.ahk" "OFF" "TRUE" & ping -n 4 -w 1000 127.0.0.1 > nul
	)
)
:PULAR-ON_OFF

rem OFF → ON
if "!toOn!"=="!toOn:-=!" ( goto PULAR-OFF_ON )
for %%p in ("%toOn:;=";"%") do (
	for /f "tokens=1,2,3 delims=-" %%a in ("%%~p") do (
		rem echo . "!fileProjetos!\%%b\src\z_OUTROS\%%c.ahk" "!atalho!" "FALSE">>!letra!:\AAA.txt
		"!fileProjetos!\%%b\src\z_OUTROS\%%c.ahk" "!atalho!" "FALSE" & ping -n 4 -w 1000 127.0.0.1 > nul
	)
)
:PULAR-OFF_ON

rem ---------------------------------------------- ABRIR PROGRAMAS E POSICIONAR SE NECESSARIO --------------------------------------------------------------------

if "!devMaster!" == "OPSEUA" ( goto END_CMD )
if "!devMaster!" == "ESTRELAR_MARCOS" ( goto END_CMD )
if "!devMaster!" == "ESTRELAR_THAYNA" ( goto END_CMD )

if not "!arg1!" == "!arg1:_REST=!" (
	set "c1=!nircmd! win normal ititle" & set "c2=!nircmd! win setsize ititle" & set "c3=!nircmd! win min ititle" & set mes=!DATE:~3,2!
	if "!devMaster!" == "AWS" ( set "res1=-7 543 1050 447" & set "res2=585 50 695 400" & set "res3=585 480 695 500" ) else ( set "res1=-2 564 1050 447" & set "res2=970 80 695 400" & set "res3=970 500 695 500" )
	if "!mes!"=="01" set monNam=JAN&if "!mes!"=="02" set monNam=FEV&if "!mes!"=="03" set monNam=MAR&if "!mes!"=="04" set monNam=ABR&if "!mes!"=="05" set monNam=MAI&if "!mes!"=="06" set monNam=JUN&if "!mes!"=="07" set monNam=JUL&if "!mes!"=="08" set monNam=AGO&if "!mes!"=="09" set monNam=SET&if "!mes!"=="10" set monNam=OUT&if "!mes!"=="11" set monNam=NOV&if "!mes!"=="12" set monNam=DEZ
	!3_BACKGROUND! /NOCONSOLE "!fileWindows!\PORTABLE-Notepad++\notepad++.exe !fileWindows!\BAT\z_logs\z_ANO_!DATE:~6,4!-MES_!mes!_!monNam!-DIA_!DATE:~0,2!.txt -monitor" & ping -n 4 -w 1000 127.0.0.1 > nul
	tasklist /fi "ImageName eq SystemInformer.exe" /fo csv 2> nul | find /I "SystemInformer.exe" > nul
	if not "!errorlevel!" == "0" ( !3_BACKGROUND! /NOCONSOLE "explorer" & !3_BACKGROUND! /NOCONSOLE "cmd.exe /c "!fileWindows!\PORTABLE-System_Informer\SystemInformer.ahk"" & ping -n 4 -w 1000 127.0.0.1 > nul )
	!3_BACKGROUND! /NOCONSOLE "cmd.exe /c !c1! "- Notepad+" & !c2! "- Notepad++" !res1! & !c2! "System Informer" !res2! & !c2! "This PC" !res3! & !c3! "- Notepad+" & !c1! "- Notepad+" & !c3! "-WIND" & !c1! "-WIND""
)
:END_CMD

!fileLog! "[COMMANDS] = [*** FIM ***]"


