; *** COMO USAR ***
; → FECHAR MANUALMENTE
; fileMsg.ahk "AAA\\n\\nBBB"
; → FECHAR AUTOMATICAMENTE APÓS 2500 MILISSEGUNDOS
; fileMsg.ahk "AAA\\n\\nBBB" 2500
; → FECHAR AUTOMATICAMENTE APÓS 2500 MILISSEGUNDOS E NÃO MOSTRAR NA BARRA DE TAREFAS
; fileMsg.ahk "AAA\\n\\nBBB" 2500 HIDE

#NoEnv
; #SingleInstance Force
#NoTrayIcon ; NÃO MOSTRAR ÍCONE NA BANDEJA DO SISTEMA

parQtd := A_Args.Length()
msg := (parQtd = 0) ? "[" . A_ScriptDir . "\" . A_ScriptName . "]`n`nNENHUM PARAMETRO PASSADO" : A_Args[1]
StringReplace, msg, msg, \\n, `n, All

if (parQtd >= 2) {
    tempo := A_Args[2]
    if A_Args[2] is number
        SetTimer, FecharMsgBox, -%tempo%
}

; MSG: MOSTRAR
if ((Format("{:L}", A_Args[3]) = "hide")) {
    ; APARECE NA BARRA DE TAREFAS: [NÃO]
    Gui, +HwndGuiHwnd +LastFound +AlwaysOnTop +ToolWindow
    Gui, Show, Hide
    DllCall("MessageBox", "uint", GuiHwnd, "str", msg, "str", A_ScriptName, "uint", 0x40)
    ExitApp
} else {
    ; APARECE NA BARRA DE TAREFAS: [SIM]
    MsgBox, 0, %A_ScriptName%, %msg%
    ExitApp ;
}
return

; MSG: FECHAR (SE NECESSÁRIO)
FecharMsgBox:
    DetectHiddenWindows, On
    IfWinExist, ahk_class #32770
    {
        ControlClick, Button1, ahk_class #32770
        Sleep, 100
        ExitApp
    }
return


